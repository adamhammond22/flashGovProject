/* ==================================== speechesRouter.ts ==================================== */
// This defines all endpoints for "/api/speeches" endpoint
// This will likely need to be split into a router for the primary server and scraper server, since CRUD endpoints are not all needed for primary

import express from "express";
// Import all request handling functions from the speeches controller
import * as SpeechesController from "../controllers/speechesController"
import * as SpeechInfoController from "../controllers/speechInfoController"


// =========== Instantiate the router =========== //
const router = express.Router();

// =========== All Routes =========== //

// Get the info of all speeches (excluding summary and text)
router.get("/", SpeechInfoController.getFilteredSpeechInfo);

// Get a specific speech by Id
router.get("/:speechId", SpeechesController.getSingleSpeech);



// ====== These are for admin/ internal use =====//

// Create a speech
router.post("/", SpeechesController.createSpeech);

// Edit a speech
router.patch("/:speechId", SpeechesController.updateSpeech);

// Delete a speech
router.delete("/:speechId", SpeechesController.deleteSpeech);

export default router;