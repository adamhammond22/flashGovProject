/* ==================================== speechesRouter.ts ==================================== */
// This defines all endpoints for "/api/speeches" endpoint
// This will likely need to be split into a router for the primary server and scraper server, since CRUD endpoints are not all needed for primary

import express from "express";
// Import all request handling functions from the speeches controller
import * as SpeechesController from "../controllers/speechesController"

// =========== Instantiate the router =========== //
const router = express.Router();

// =========== All Routes =========== //

router.get("/", SpeechesController.getAllSpeeches);

router.get("/:speechId", SpeechesController.getSingleSpeech);

router.post("/", SpeechesController.createSpeech);

router.patch("/:speechId", SpeechesController.updateSpeech);

router.delete("/:speechId", SpeechesController.deleteSpeech);

export default router;