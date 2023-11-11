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