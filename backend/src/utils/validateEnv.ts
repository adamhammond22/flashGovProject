/* This utility will validate the environment variable */

import { cleanEnv } from "envalid"; // We use the envalid package to validate environments
import { port, str } from "envalid/dist/validators";

/* We export the return of the cleanEnv function.
In it, we define the name and type of the environment variables */
export default cleanEnv(process.env, {
    MONGO_CONNECTION_STRING: str(),
    PORT: port(),
})