/* ==================================== app.ts ==================================== */
// This will define out express endpoints for our server

import "dotenv/config"; // Import the .env file
import express from "express"; //Express for hosting a server


const app = express();

/* Dummy first endpoint for a get request */
app.get("/", (req, res)=>{
    res.send("Hello World!");
});


export default app;