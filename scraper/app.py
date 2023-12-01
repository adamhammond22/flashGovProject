from flask import Flask, request, jsonify, abort
import requests
import io
import PyPDF2
import json

class SetEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, set):
            return list(obj)
        return json.JSONEncoder.default(self, obj)

API_KEY = "VKTUleNWTfZhIKxMmTuYSiPt58qMSOIrkgupnXOA"
OFFSET_CACHE_FILE = "OffsetMarkCache"
MEMBERS_CACHE_FILE = "members.json"

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

app = Flask(__name__)

@app.route('/summary')
def request_congressional_record():
    return "Example Response"

def read_from_pdf():
    r = requests.get("https://www.congress.gov/118/crec/2023/11/15/169/190/CREC-2023-11-15-house.pdf")
    f = io.BytesIO(r.content)

    reader = PyPDF2.PdfReader(f)
    for i in range(len(reader.pages)):
        print("page " + str(i) + ": " + reader.pages[i].extract_text())

def read_from_htm(url):
    return requests.get(f"{url}?api_key={API_KEY}").content

def get_all_members():
    r = requests.get(f"https://api.congress.gov/v3/member?api_key={API_KEY}")
    print(r.content)

def get_member_info(bioGuideID):
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

def PerformSearch():
    offsetMark = GetOffsetMarkFromCache()
    if (offsetMark is None or offsetMark == ""):
        offsetMark = "*"
    '''
    f = open(MEMBERS_CACHE_FILE, 'r')
    lastNamesList = json.load(f)["lastNames"]
    f.close()
    membersQuery = ""
    isFirst = True
    for name in lastNamesList:
        if isFirst:
            membersQuery = name
        else:
            membersQuery += f" or {name}"
        isFirst = False
    print(f"members query: {membersQuery}")
    '''
    query = "collection:(CREC) and mods:congMember:@role:speaking and section:(house or senate)"
    if len(BLOCKED_DOC_TYPES) > 0:
        blockedTypes = ""
        for index, typeStr in enumerate(BLOCKED_DOC_TYPES):
            blockedTypes += typeStr
            if (index != len(BLOCKED_DOC_TYPES) - 1):
                blockedTypes += " or "
        query += f" and -crtype:({blockedTypes})"
        print(f"blocked types: {blockedTypes}")
    
    if len(BLOCKED_TITLE_SUBSTRINGS) > 0:
        blockedTitles = ""
        for index, blockedStr in enumerate(BLOCKED_TITLE_SUBSTRINGS):
            blockedTitles += f"\"{blockedStr}\""
            if (index != len(BLOCKED_TITLE_SUBSTRINGS) - 1):
                blockedTitles += " or "
        #query += f" and title:-({blockedTitles})"
        print(f"blocked titles: {blockedTitles}")
    
    print(f"query: {query}")
    jsonObj = {
        "query": query,
            #f"collection:(CREC) and mods:congMember:@role:speaking and section:(house or senate) and -crtype:({blockedTypes}) and -title:({blockedTitles})",
        "pageSize": 30,
        "offsetMark": offsetMark,
        "sorts": [
            {
                "field":"publishdate",
                "sortOrder":"DESC"
            }
        ],
    }
    r = requests.post(f"https://api.govinfo.gov/search?api_key={API_KEY}", json=jsonObj)
    if (r.status_code != 200):
        print(f"failed, error: {r.status_code}")
        return
    data = r.json()
    results = data["results"]

    if (len(results) > 0):
        for result in results:
            print(f"result: {result}\n")
        WriteToOffsetCache(data["offsetMark"])
        pass
        #text = read_from_htm(results[0]["download"]["txtLink"])
        #print(f"text: {text}")    
    else:
        print("no results")


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
    
def GetOffsetMarkFromCache():
    f = open(OFFSET_CACHE_FILE, "r")
    offset = f.read()
    f.close()
    return offset

def WriteToOffsetCache(newOffset):
    f = open(OFFSET_CACHE_FILE, "w")
    f.write(newOffset)
    f.close()

if __name__=="__main__":
    #app.run()
    #r = requests.get()
    #get_all_members()
    #print(get_member_info("S001222"))
    #test()
    #read_from_pdf()
    #UpdateMembersCache()
    PerformSearch()
