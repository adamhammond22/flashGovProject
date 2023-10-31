import "dotenv/config"; // Import the .env file
import mongoose from "mongoose"; //Mongoose for connecting to mongoDB easier
import express from "express"; //Express for hosting a server
import env from "./utils/validateEnv" // Import pre-validated environment variable

const app = express();

/* Dummy first endpoint for a get request */
app.get("/", (req, res)=>{
    res.send("Hello World!");
});

/* Get port from environment var */
const port = env.PORT;
if(!port){

}


/* Conect to the mongo db  */
mongoose.connect(env.MONGO_CONNECTION_STRING!)
    .then(() => {
        console.log("Mongoose Connected");

        /* Start Server */
        app.listen(port, ()=>{
            console.log("Server is running on port: " + port);
        });
    })
    .catch(console.error);

