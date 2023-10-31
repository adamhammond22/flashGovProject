/* ==================================== app.ts ==================================== */
// This will define out express endpoints for our server

import "dotenv/config"; // Import a sanitized environment file. This holds our sensitive info
import express, { NextFunction, Request, Response } from "express"; //Express for hosting a server
import notesRoutes from "./routes/notes" //import the router for our dummy "notes" endpoints
import morgan from "morgan";


// Instantiate the express server
const app = express();

// Hook up the morgan logger for development purposes
// Gives us much nicer, more consice logs of server activity
app.use(morgan("dev"));

// Setup express so that it accepts json bodies
app.use(express.json());


// Forward anything that goes to "/api/notes", towards our notes router
app.use("/api/notes", notesRoutes);

/* Endpoint Missing Middleware */
// This catches any endpoint that was requested, but does not exist
// It forwards it "next" to the error handler with a more appropriate message
// This must be before the error handler, but after our normal endpoints!
app.use((req: Request, res: Response, next: NextFunction)=> {
    next(Error("Endpoint not found"));
});

/* Error Handler Middleware*/
// This needs to be at the bottom, because it "catches" all the next statements from the errors.
// If this code was first, it would respond with an error for all requests
// Express has a very specific way of making an error handler
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error(error); //Throw the error in the server console
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) errorMessage = error.message;

    // Return error status and json of error message
    res.status(500).json({error: errorMessage});
})

export default app;