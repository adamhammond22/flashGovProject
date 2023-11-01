/* ==================================== startServers.ts ==================================== */
// This facilitates our database interactions
import notesServer from "./noteServer"
import mongoose from "mongoose"; //Mongoose for connecting to mongoDB easier
import env from "./utils/validateEnv" // Import pre-validated environment variable



/* Get port from environment var */
const port = env.PORT;

/* Conect to the mongo db  */
mongoose.connect(env.MONGO_CONNECTION_STRING)
    .then(() => {
        console.log("Mongoose Connected");

        /* Start Server */
        notesServer.listen(port, ()=>{
            console.log("Server is running on port: " + port);
        });
    })
    .catch(console.error);

