/* Notes.ts handles all the endpoints for the dummy "notes" schema */
// We will import the logic from the "controllers" folder
// All endpoints will be set to a "router", and this "router" will be exported and used in app.ts

import express from "express";
// Import all request handling functions from the notes controller
import * as NotesController from "../controllers/notes"

// This router interfaces with the server in app.ts
const router = express.Router();

/* Dummy http get endpoint for a get request for all notes */
router.get("/", NotesController.getNotes);

/* Dummy http get endpoint for to get request reguarding 1 note */
// the :noteId will read anything after the slash as the noteId, which we will use to find the note
router.get("/:noteId", NotesController.getNote);

/* Dummy http post endpoint for a get request */
router.post("/", NotesController.createNote);

export default router;