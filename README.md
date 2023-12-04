# flashGovProject

This project serves up government documents: providing filtering, keywords, and summaries.
It's intended to prototype scraping and summarization functionality within their tech stack.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [State Of The Project](#State Of The Project)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

## Getting Started

## Prerequisites
Make sure you have the following installed on your machine:
- Node.js
- npm
- anaconda

## Installation

#### Frontend
- "npm install"
#### Backend
- "npm install"
#### flaskserver
- "conda env create -f environment.yml"
- "conda activate FlashGov_ML_Server"
- "cd your_path_here/flaskserver"



## Usage

#### Frontend
The frontend will show up on your local browser, and lets you interact with the UI of the project.
While in the frontend folder type:
- "npm start"
#### Backend
The backend will begin the primary server, which will interface with the database and frontend to serve up summaries.
While in the backend folder type:
- "npm start"
#### flaskserver
The flask server is intended to locally run a summarization ML model, for the backend to query.
This is optional, because it is not in a finished state.
While in the flaskserver folder in an Anaconda window, type:
- "python app.py"


## State Of The Project
Here we're discussing the state of the project, and what goals we've accomplished, and failed to finish.

### Framework
- Working MongoDB cluster to house our documents
- Reasonably robust server and api
- Functioning frontend

### Flask Server / Local ML Server / Summarization Model
- We query the Local ML server first, and use the Huggingface Inference API as a fallback. 
- Local ML server is reasonably robust, properly receives requests, and dispatches a worker to run th ML model on the document.
- The ML model is not complete, and thus the server will raise a 501 "Not implemented" error, and the Primary Server will default to the other API

### Backend / Primary Server
- Serves up smaller "document info" objects, as well as full documents and summaries upon request
- When serving full documents, it will generate a summary on-the-fly, and save it to the DB after responding to the client
- Primary server queries the Local ML server first, and failing that will query the Huggingface Inference API
- Also allows updating

### Front End / UI
- Displays all documents with speaker names and dates
- Keyword and date filtering is available
- Can examine individual documents, with a summary being displayed first


## API Documentation

### Primary Server:
GET "localhost:5000/api/speeches"
- queries for all document views

GET "localhost:5000/api/speeches/<speech-id>"
- gets entire speech including summary
- will generate a summary if there is not one

<<<<<<< Updated upstream
# Scraper Notes:
- Rather than using congress.gov, we can use govinfo.gov's api, which can allow us to access specific speeches made by congress members. 
- https://api.govinfo.gov/docs/
- The "collections" endpoint will return essentially categories of documents available. We're mostly interested in CREC type
- Using the "collections/{collection}" endpoint we can retrieve info about collections of CREC docs, for example we can collect data about documents                 on a particular day
- Example: https://api.govinfo.gov/collections/CREC/2023-11-21T00 returns several packages.
- Example: "https://api.govinfo.gov/packages/CREC-2023-04-26/granules?pageSize=10&granuleClass=HOUSE&offsetMark=%2A&api_key=VKTUleNWTfZhIKxMmTuYSiPt58qMSOIrkgupnXOA"
returns a list of docs which can be used to access the text
- https://api.govinfo.gov/packages/CREC-2023-04-26/granules/CREC-2023-04-26-pt1-PgH2044/htm retrieves the text from a specific speech made
- Info on searching parameters:
    - https://www.govinfo.gov/help/search-operators
    - https://www.govinfo.gov/features/search-service-overview
    - https://www.govinfo.gov/help/crec
    - https://www.govinfo.gov/help/finding-info
- Helpful api info:
    - https://api.data.gov/docs/developer-manual/
- Notes about document formatting:
    - Official document titles appear to be separated from the top of the document by 5 \n's, followed by a number of spaces (so as to center the title) and then the title itself. 
    - Documents are full of \n's to make them fit in more of a thin column shape.
    - Many documents seem to have several separate speeches by the same individuals in them for some reason. The different speeches seem to be separated by 3 \n's. 
    - Often timestamps are inserted into the documents, usually with 3 \n's, a lot of spaces to center, then something like "{time} xxxx" (where the x's are numbers), followed by \n\n.
- Issues:
    - If speakers have the same last name, they will be referenced as "Mr/Ms. {name} of {state}."  
=======
POST "localhost:5000/api/speeches"
- Will create a speech

PATCH "localhost:5000/api/speeches/<speech-id>"
- Will regenerate and save a speech

DELETE "localhost:5000/api/speeches/<speech-id>"
- Deletes the document

### Flask Server:

GET "localhost:5002/summary"
- generates a summary if possible
- will reject the host if overloaded

## Contributors
Adam Hammond
Harrison Saunders
Jonathan Nguyen
>>>>>>> Stashed changes
