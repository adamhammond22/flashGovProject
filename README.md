# flashGovProject

### Learning Notes

Typescript:
We always edit our .ts files. We can convert them to js with "npx tsc" which executes the transpiler.
From here we can run "node <file.js>"


## Hierarchy:
We leave .ts in our source
Generated code will go in ./dist as specified by the tsconfig setup

### Backend:
Routes Directory contains endpoint "routes" for each schema
Models Directory contains the logic for each schema

## Packages / Tools:

Nodemon:
Used to auto-restart the node application when file changes are needed
using ts-node to transpile from typescript

Starting from the backend:
"npx nodemon src/primaryServer.ts" or "npm start"
executed nodemon on our typescript server. This will keep the server running & automatically re-compile it upon a saved change.
"npm start" does this, it's a script specified in package.json

ESLint:
Eslint is a very popular formatting tool. It will help us conform to a coding standard, as well as find problems.
There will be an eslint config for each side of the codebase.
Let's say I wanna check all .ts in my local directory:
"npx eslint . --ext .ts" or "npm run lint"
NOTE: I suspect eslint is broken here. The VSCode eslint is producing correct errors, but the lint commands only detect unused variables. They don't even detect undefined variables.

Express:
Used to create endpoints for our servers.
"Middleware" = any piece of code that knows how to handle a request
"Next()" passes the request on to the next piece of middleware

Morgan:
Logging tool for our server

HTTP-errors:
Package for creating easy http errors


### Summarization:
We can either do summarization locally or with an API. I think we can try out both.

## Local:
This method would entail traiining our own model and then using it on the server in order to generate predictions.
There are tutorials to summarize legal documents: "https://www.youtube.com/watch?v=tc87-ZKWm78"

This is a tutorial for using transformers on node.js: https://huggingface.co/docs/transformers.js/tutorials/node 



Pros:
- No rate limits
- Likely comparable speed (compared to free tiers) this needs to be validated though
- Likely better  ov
Cons:
- More time spent fine tuning the model
- Figuring out how to do python to JS, or figuring out how to do this in JS
- Remote server could be very slow running on poor-hardware devices

## Remote:
The huggingface API:
Pros:
- Superior summarizations to any of the other generic local models we've tried
- Decently fast
- Been capable of understanding who is speaking and will write summarizations which summarize one's arguments but don't state them as fact
Cons:
- Rate limited


Transformers.js is a huggingface transformer model package. With this we can simply import pretrained huggingface models and run them on our server.

## Models We've Tried:
 - Bert (Local): very very innaccurate, likely needs finetuning
 - gpt2 (Inference): a bit better, not amazing
 - facebook/bart-large-cnn (Inference): decent AND FAST

## Model Prompt Notes:
- Specifying in the prompt that the model should present the argument they make as an argument rather than as fact was effective.

## Flask Server Setup

Install anaconda for python.

Then create the environment we're using for the server with:
 - conda env create -f environment.yml

Activate the environment using
 - conda activate FlashGov_ML_Server

If theres download issues, try updating the channels
- conda install -c pytorch pytorch torchvision torchaudio OR conda update --all

You can also update packages this way but be careful: this may add packages you dont use!
- update packages: conda env update -f environment.yml

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