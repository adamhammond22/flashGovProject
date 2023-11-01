/* ==================================== documentsController.ts ==================================== */
// Houses all Middleware (Request Handlers) used in document routing 
import { RequestHandler } from "express";
import DocumentModel from "../models/document";
import createHttpError from "http-errors";
import mongoose from "mongoose";

// ============================== All Middleware ============================== //

// ========== Get All Document Middleware ========== //
export const getAllDocuments: RequestHandler = async (req, res, next)=>{

    try {
        const docs = await DocumentModel.find().exec();
        res.status(200).json(docs);        

    } catch (error) {
        next(error);
    }
};


// ========== Get Single Document (by id) ========== //
export const getSingleDocument: RequestHandler = async (req, res, next) => {

    // Get the noteId from the params
    const noteId = req.params.noteId;

    try {

        // Assert noteID is valid
        if(!mongoose.isValidObjectId(noteId)){
            throw createHttpError(400, "Invalid Note ID");
        }

        const doc = await DocumentModel.findById(noteId).exec();

        if(!doc) {
            throw createHttpError(404, "Note not found");
        }

        res.status(200).json(doc);

    } catch (error) {
        next(error);
    }
};
