/* ==================================== startServers.ts ==================================== */
// This facilitates our database interactions
import notesServer from "./noteServer"
import primaryServer from "./primaryServer"
import mongoose from "mongoose"; //Mongoose for connecting to mongoDB easier
import env from "./utils/validateEnv" // Import pre-validated environment variable



/* Get port from environment var */
const port = env.PORT;
const notesPort = 5001

/* Conect to the mongo db  */
mongoose.connect(env.MONGO_CONNECTION_STRING)
    .then(() => {
        console.log("Mongoose Connected");

        /* Start Notes Server */
        primaryServer.listen(port, ()=>{
            console.log("Primary Server is running on port: " + port);
        });

        /* Start Primary Server */
        notesServer.listen(notesPort, ()=>{
            console.log("Notes Server is running on dummy port: " + notesPort);
        });
    })
    .catch(console.error);

