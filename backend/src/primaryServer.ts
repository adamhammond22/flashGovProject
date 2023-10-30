import express from "express";
const app = express();
const port = 5000;

/* Dummy first endpoint for a get request */
app.get("/", (req, res)=>{
    res.send("Hello World!");
});

/* Start Server */
app.listen(port, ()=>{
    console.log("Server is running on port: " + port);
});