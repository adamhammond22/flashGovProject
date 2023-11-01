/* ==================================== documentRouter.ts ==================================== */
// This defines all endpoints for "/api/documents" documents endpoint
// This will likely need to be split into a router for the primary server and scraper server, since CRUD endpoints are not all needed for primary

import express from "express";
// Import all request handling functions from the documents controller
import * as DocumentsController from "../controllers/documentsController"

// =========== Instantiate the router =========== //
const router = express.Router();

// =========== All Routes =========== //

router.get("/", DocumentsController.getAllDocuments);

router.get("/:noteId", DocumentsController.getSingleDocument);

export default router;