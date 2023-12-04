from flask import Flask, request, jsonify, abort
import requests
import io
import PyPDF2
import json
import pprint
import argparse
import datetime
import time
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bs4 import BeautifulSoup
import re
import base64
import atexit

class SetEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, set):
            return list(obj)
        return json.JSONEncoder.default(self, obj)

API_KEY = "VKTUleNWTfZhIKxMmTuYSiPt58qMSOIrkgupnXOA"
OFFSET_CACHE_FILE = "OffsetMarkCache"
MEMBERS_CACHE_FILE = "members.json"
uri = "mongodb+srv://abhammon:BSyonQWscrC3hwrT@flashgovcluster0.eyzl9ip.mongodb.net/tool_notes_app?retryWrites=true&w=majority"

global scrapingStartTime
global scrapingEndTime
global lastOffsetMark 
lastOffsetMark = None
global scrapingSessionsCollection

BLOCKED_TITLE_SUBSTRINGS = [
    #"NOTICE OF",
    #"Introductory Statement",
    #"ORDER FOR",
    "RESOLUTIONS SUBMITTED TODAY",
]

BLOCKED_DOC_TYPES = [
    "PRAYER",
    "PLEDGE",
    "ADJOURNMENT",
    "SORDERFOR",
    "SMEASUREDCAL",
    "SWITHDRAWAL",
    "SCLOTURE",
    "SLEGISLATIVE",
    "HTIMELIMIT",
    "HJOURNAL",
    "SCALENDAR",
    "SAMENDMENTTEXT",
    "SAMENDMENTTEXTIND",
    "SSUBMITTED",
    "SSUBMISSION", 
    "HSPECIALORDERSG",
    "HSPECIALORDERS",
    "SRESOLUTION",
    "SEXECCAL",
    "SAUTHORITY",
    #"DDSCMEETINGS", not necessary to be blocked, never has a speaker 
]

def ReadFromPDF():
    r = requests.get("https://www.congress.gov/118/crec/2023/11/15/169/190/CREC-2023-11-15-house.pdf")
    f = io.BytesIO(r.content)

    reader = PyPDF2.PdfReader(f)
    for i in range(len(reader.pages)):
        print("page " + str(i) + ": " + reader.pages[i].extract_text())

def ReadFromHTM(url):
    return requests.get(f"{url}?api_key={API_KEY}").text

def GetAllMembers():
    r = requests.get(f"https://api.congress.gov/v3/member?api_key={API_KEY}")
    print(r.content)

def GetMemberInfo(bioGuideID):
    return requests.get(f"https://api.congress.gov/v3/member/{bioGuideID}?api_key={API_KEY}").content

def test():
    #r = requests.get(f"https://api.govinfo.gov/packages/CREC-2023-11-21/summary?api_key={API_KEY}")
    r = requests.get(f"https://api.govinfo.gov/packages/CREC-2023-04-26/granules/CREC-2023-04-26-pt1-PgH2044/htm?api_key={API_KEY}")
    print(r.content)
    '''
    r = requests.get(f"https://api.govinfo.gov/packages/CREC-2023-11-15/granules/CREC-2023-11-15-pt1-PgH5894-7/pdf?api_key={API_KEY}")
    f = io.BytesIO(r.content)

    reader = PyPDF2.PdfReader(f)
    for i in range(len(reader.pages)):
        print("page " + str(i) + ": " + reader.pages[i].extract_text())
    print(r.content)
    '''

def PerformSearch(offsetMark, querySize):
    query = "collection:(CREC) and mods:congMember:@role:speaking and section:(house or senate)"
    if len(BLOCKED_DOC_TYPES) > 0:
        blockedTypes = ""
        for index, typeStr in enumerate(BLOCKED_DOC_TYPES):
            blockedTypes += typeStr
            if (index != len(BLOCKED_DOC_TYPES) - 1):
                blockedTypes += " or "
        query += f" and -crtype:({blockedTypes})"
        #print(f"blocked types: {blockedTypes}")
    
    if len(BLOCKED_TITLE_SUBSTRINGS) > 0:
        blockedTitles = ""
        for index, blockedStr in enumerate(BLOCKED_TITLE_SUBSTRINGS):
            blockedTitles += f"\"{blockedStr}\""
            if (index != len(BLOCKED_TITLE_SUBSTRINGS) - 1):
                blockedTitles += " or "
        #query += f" and title:-({blockedTitles})"
        #print(f"blocked titles: {blockedTitles}")
    
    jsonObj = {
        "query": query,
        "pageSize": querySize,
        "offsetMark": offsetMark,
        "sorts": [
            {
                "field":"publishdate",
                "sortOrder":"DESC"
            }
        ],
    }
    r = requests.post(f"https://api.govinfo.gov/search?api_key={API_KEY}", json=jsonObj)
    return r

def UpdateMembersCache():
    dictToDump = {}
    dictToDump["members"] = {}
    dictToDump["lastNames"] = set([]) # is a set, not a dictionary (we don't want duplicates)
    nextRequest = f"https://api.congress.gov/v3/member?format=json&offset=0&limit=250"
    count = 0
    while (True):
        count += 1
        r = requests.get(f"{nextRequest}&api_key={API_KEY}")
        if (r.status_code != 200 or count > 10): 
            break
        responseJson = r.json()
        print("got response...")
        for member in responseJson["members"]:
            id = member["bioguideId"]
            dictToDump["members"][id] = member
            name = member["name"]
            lastName = name.split(',')[0]
            dictToDump["lastNames"].add(lastName)
        nextRequest = responseJson["pagination"]["next"]

    membersFile = open(MEMBERS_CACHE_FILE, 'w')
    json.dump(dictToDump, membersFile, indent=3, cls=SetEncoder)
    membersFile.close()
    
def GetLocalOffsetMarkFromCache():
    f = open(OFFSET_CACHE_FILE, "r")
    offset = f.read()
    f.close()
    return offset

def GetOffsetMarkFromCache(db):
    col = db["scraperOffsetMark"]
    doc = col.find_one()
    if (doc is None):
        answer = PromptUser("Warning: failed to locate offset mark. Continue? [y/n]", ('y', 'n'), "Input either 'y' or 'n' (y to continue, n to exit program)")
        if (answer == 'n'):
            exit()
        return "*"
    return doc["offsetMark"] # might be wrong 

def WriteToLocalOffsetCache(newOffset):
    f = open(OFFSET_CACHE_FILE, "w")
    f.write(newOffset)
    f.close()

def WriteToOffsetMarkCache(db, newOffset):
    col = db["scraperOffsetMark"]
    newObj = {'offsetMark': newOffset}
    updatedDoc = col.find_one_and_update({}, {'$set': newObj})
    if (updatedDoc is None):
        updatedDoc = col.insert_one(newObj)
    if (updatedDoc is None):
        answer = PromptUser("Warning: failed to update or create offset mark. Continue? [y/n]", ('y', 'n'), "Input either 'y' or 'n' (y to continue, n to exit program)")
        if (answer == 'n'):
            exit()

def PromptUser(prompt, validInputs, improperInputResponse):
    answer = ""
    print(prompt)
    while ((answer := input()) not in (validInputs)):
        print(improperInputResponse)
    return answer

def GetGranuleSummaryResponse(packageId, granuleId):
    return requests.get(f"https://api.govinfo.gov/packages/{packageId}/granules/{granuleId}/summary?api_key={API_KEY}")

def main():
    argParser = argparse.ArgumentParser(prog="app.py", description="Pulls relevant speeches from Congress.gov using the GovInfo api and inserts them into the database.")
    argParser.add_argument("continueNewestSession", type=bool, nargs='?')
    #argParser.add_argument("continueUntilFail", type=bool, nargs='?')
    argParser.add_argument("numDocsToAdd", type=int, nargs='?')
    
    args = vars(argParser.parse_args())
    numDocs = args["numDocsToAdd"]
    continueNewestSession = args["continueNewestSession"]
    #continueUntilFail = args["continueUntilFail"]

    client = MongoClient(uri, server_api=ServerApi('1'))

    try:
        client.admin.command('ping')
        print("Successfully connected to MongoDB")
    except Exception as e:
        print(e)

    db = client.tool_notes_app
    speeches = db.speechesCollection

    global scrapingStartTime
    global scrapingSessionsCollection
    scrapingSessionsCollection = db.scrapingSessions
    scrapingStartTime = datetime.datetime.now()
    offsetMark = None
    if (continueNewestSession):
        lastSession = scrapingSessionsCollection.find_one(sort=[("_id", -1)])
        if (lastSession is not None):
            offsetMark = lastSession["offsetMark"]
            print("Continuing from last session...")
    
    if offsetMark is None:
        offsetMark = "*"

    remainingDocsToScrape = numDocs
    docsToScrape = remainingDocsToScrape
    rateLimitSleepTime = 60
    while (remainingDocsToScrape > 0):
        response = PerformSearch(offsetMark, docsToScrape)
        
        status_code = response.status_code
        rateLimitRemaining = response.headers["X-RateLimit-Remaining"]
        if (status_code != 200):
            print(f"Encountered error on search: {status_code}")
            match status_code:
                case 429:
                    print("Exceeding rate limit, going to sleep.")
                    #docsToScrape = rateLimitRemaining
                    time.sleep(rateLimitSleepTime)
                    rateLimitSleepTime *= 2
                    continue
                case 403:
                    print("API key either missing, disabled, unauthorized, or unverified")
                case 404:   
                    print("API could not be found")
            return
        
        rateLimitSleepTime = 60
        data = response.json()
        results = data["results"]
        numResults = len(results)
        if (numResults == 0):
            print("Found no results for query, exiting")
            exit()
        
        limit = response.headers["X-RateLimit-Limit"]
        print(f"Found {numResults} results...remaining rate limit: {rateLimitRemaining}, rate limit: {limit}")
        moveToOffsetMark = False

        for result in results:
            packageId = result["packageId"]
            granuleId = result["granuleId"]
            existingDocWithId = speeches.find_one({"granuleId": granuleId})
            #print(f"result: {result}\n")
            if (existingDocWithId is not None):
                title = result["title"]
                print(f"Entry already exists ({title})")
                moveToOffsetMark = True
                break
                
            summary = GetGranuleSummaryResponse(packageId, granuleId).json()
            text = ReadFromHTM(summary["download"]["txtLink"])

            membersList = summary.get("members", None)
            if (membersList is None):
                print(f"Warning: Document is missing members list: {granuleId}")
                continue

            if (len(membersList) > 1):
                continue
            speaker = membersList[0]["memberName"]
            speakerLastName = speaker.split(',')[0]
            
            mainText = text.split("\n\n\n\n\n")[1]
            speechSections = mainText.split("\n\n\n")
            
            independentSpeeches = {}

            currentSpeechText = ""
            currentSpeechTitle = ""
            sectionIndex = 0
            for section in speechSections:
                #print(f"section:<{section}>")
                #print("\nSECTION START\n")
                subsectionIndex = 0
                for subsection in section.split("\n\n"):
                    skipSection = False
                    isTimeText = re.search("{time}", subsection) 
                    if (isTimeText):
                        skipSection = True 
                    elif (subsectionIndex == 0):
                        skipSection = True
                        if (sectionIndex != 0): # must be the start of a new speech (but we don't make a new enty if its the start of the first o)
                            currentSpeechText.strip()
                            independentSpeeches[currentSpeechTitle] = currentSpeechText
                            currentSpeechText = ""
                        currentSpeechTitle = subsection.strip().title()
                    elif (re.search("\[\[(Page[^[\]]*)\]\]", subsection) or re.search("_{2,}", subsection)):
                        skipSection = True
                    
                    #print(f"subsection: {subsection}")
                    if (not skipSection):
                        if (subsectionIndex == 1):
                            speakerSubStr = f"{speakerLastName.upper()}."
                            currentSpeechText += subsection[subsection.find(speakerSubStr) + len(speakerSubStr) + 1:]
                        else:
                            currentSpeechText += subsection
                    subsectionIndex += 1
                sectionIndex += 1
            
            section = summary["granuleClass"].title()
            url = summary["detailsLink"]

            for (title, speechText) in independentSpeeches.items():
                #print(f"\n\nspeech title: {title}, speech: {speechText}")
                if (title == ""):
                    continue
                speechData = {
                    "granuleId": granuleId,
                    "title": title,
                    "text": base64.b64encode(speechText.encode("ascii")).decode("ascii"),
                    "date": datetime.datetime.strptime(summary["dateIssued"], "%Y-%m-%d"),
                    "speaker": speaker,
                    "section": section,
                    "url": url,
                    "summary": "",
                    "createdAt": datetime.datetime.now(tz=datetime.timezone.utc),
                    "updatedAt": datetime.datetime.now(tz=datetime.timezone.utc),
                }
                speeches.insert_one(speechData)
            remainingDocsToScrape -= 1
        
        resultOffsetMark = data["offsetMark"]
        offsetMark = resultOffsetMark
        global lastOffsetMark
        lastOffsetMark = resultOffsetMark

        '''
        if (moveToOffsetMark):
            GetOffsetMarkFromCache(db)
        else:
            resultOffsetMark = data["offsetMark"]
            offsetMark = resultOffsetMark
        '''
        docsToScrape = remainingDocsToScrape

        #WriteToOffsetMarkCache()
        #text = read_from_htm(results[0]["download"]["txtLink"])
        #print(f"text: {text}")    
    
def SaveScrapingSessionToDB():
    print("Attempting to save")
    if (lastOffsetMark is None): 
        return
    scrapingSessionsCollection.insert_one({
        "start": scrapingStartTime,
        "end": scrapingEndTime,
        "offsetMark": lastOffsetMark
    })
    print("Saved session to database.")

@atexit.register
def OnExit():
    global scrapingEndTime
    scrapingEndTime = datetime.datetime.now()
    SaveScrapingSessionToDB()

if __name__=="__main__":
    main()
