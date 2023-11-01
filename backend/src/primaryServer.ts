/* ==================================== primaryServer.ts ==================================== */
// This will define out express endpoints for our primary server
// This server will serve up documents and summaries to users

import "dotenv/config"; // Import a sanitized environment file. This holds our sensitive info
import express, { NextFunction, Request, Response } from "express"; //Express for hosting a server
import documentsRoutes from "./routes/documentRouter" //import the router for our dummy "notes" endpoints
import morgan from "morgan"; //import our server logger utility
import createHttpError, { isHttpError } from "http-errors";


// ========= Instantiate the express server ========= //
const app = express();

// Hook up the morgan logger for dev logs
app.use(morgan("dev"));

// Setup express so that it accepts json bodies
app.use(express.json());


// ======== Document Endpoint Router ======== //
// Forward anything that goes to "/api/documents", towards our document router
app.use("/api/documents", documentsRoutes);


// ======== Endpoint Missing Middleware ======== //
// This catches any endpoint that was requested, but does not exist
app.use((req: Request, res: Response, next: NextFunction)=> {
    next(createHttpError(404, "Endpoint not found"));
});


// ======== Error Handler Middleware ======== //
// Handle all errors encountered and returning the status
app.use((error: unknown, req: Request, res: Response) => {
    console.error(error); //Throw the error in the server console

    // Default error message and code
    let errorMessage = "An unknown error occurred";
    let statusCode = 500;

    // If we've already determined the error being passed along, use that instead
    if (isHttpError(error)){
        statusCode = error.status;
        errorMessage = error.message;
    }

    // Return error status and json of error message
    res.status(statusCode).json({error: errorMessage});
})

export default app;