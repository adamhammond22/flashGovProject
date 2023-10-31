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