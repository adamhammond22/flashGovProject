/* .../controllers/Notes.ts handles the logic for our endpoints, exported as functions*/
// This lets us reuse functionality for multiple endpoints

import { RequestHandler } from "express";
import NoteModel from "../models/note";
import createHttpError from "http-errors";
import mongoose from "mongoose";

// We make the type of the function a "request handler", removing needs for typing each variable
/* get All notes */
export const getNotes: RequestHandler = async (req, res, next)=>{

    try {
        // This is an async function that awaits the promise returned by exec
        // We attempt to find the NoteModel schema in the database
        const notes = await NoteModel.find().exec();
        // Return a Succesful code, as well as the notes found in json form
        res.status(200).json(notes);        

    } catch (error) {
        // Pass error onto the next middleware: i.e our error handler middleware
        next(error);
    }
};


/* Get one note */
export const getNote: RequestHandler = async (req, res, next) => {
    // Get the noteId from the params
    const noteId = req.params.noteId;
    try {

        // Make sure noteId adheres to the type mongoose expects.
        if(!mongoose.isValidObjectId(noteId)){
            throw createHttpError(400, "Invalid Note ID");
        }

        // I love mongoose functions, but this one needs a .exec for some reason?
        const note = await NoteModel.findById(noteId).exec();

        // throw error if note is not found
        if(!note) {
            throw createHttpError(404, "Note not found");
        }

        res.status(200).json(note);
    } catch (error) {
        next(error);
    }
};

/* Get create one node */

// Interfaces are flexible ways to declare the types of the request body
interface CreateNoteBody {
    title: string,
    text?: string,
}

// Request handler is specified with unknown params, but specified inteface.
export const createNote: RequestHandler<unknown, unknown, CreateNoteBody, unknown> = async (req, res, next) => {
    const title = req.body.title;
    const text = req.body.text;
    
    try {
        // If title is undefined, throw an error
        if(!title) {
            throw createHttpError(400, "Note must have a title");
        }

        // Attempt creating the new note entry in the database
        // exec() is not required here for some reason
        const newNote = await NoteModel.create({
            title: title,
            text: text,
        });

        // Respond with 201-resource created, and return the note relation in json
        res.status(201).json(newNote);
    
    } catch (error) {
        // Pass to error handler
        next(error);
    }
    
};

// Interface for our expected update note body
interface UpdateNodeBody {
    title?: string,
    text?: string,
}

// Interface for our expected update note params
// It's not optional because we literally couldn't hit the updateNote endpoint without a nodeId in the request
interface UpdateNodeParams {
    noteId: string
}

// Interfaces are needed because the type declaration is all or nothing. We need to specify the exact type or else it can be ANYTHING
// 2nd is response body, 4th is url params. Both are unneeded and will be left unknown
export const updateNote: RequestHandler<UpdateNodeParams, unknown, UpdateNodeBody, unknown> =async (req, res, next) => {
    const noteId = req.params.noteId;
    const newTitle = req.body.title;
    const newText = req.body.text;
    
    try {

        // Make sure noteId adheres to the type mongoose expects.
        if(!mongoose.isValidObjectId(noteId)){
            throw createHttpError(400, "Invalid Note ID");
        }

        // Check if title was actually passed
        if(!newTitle) {
            throw createHttpError(400, "Updated Note must have a title");
        }

        // Now query for the note id and wait
        const note = await NoteModel.findById(noteId).exec();

        // throw error if note is not found
        if(!note) {
            throw createHttpError(404, "Note not found");
        }
        
        note.title = newTitle;
        note.text = newText;

        // Use mongoose save method, and await response
        const updatedNote = await note.save(); 

        res.status(200).json(updatedNote);

    } catch (error) {
        next(error);
    }
}


// Delete endpoint
export const deleteNode: RequestHandler = async (req, res, next) => {
    // Get the noteId from the params
    const noteId = req.params.noteId;

    try {

        // Make sure noteId adheres to the type mongoose expects.
        if(!mongoose.isValidObjectId(noteId)){
            throw createHttpError(400, "Invalid Note ID");
        }

        // I love mongoose functions, but this one needs a .exec for some reason?
        const note = await NoteModel.findByIdAndDelete(noteId).exec();

        // throw error if note is not found
        if(!note) {
            throw createHttpError(404, "Note not found");
        }

        // Sendstatus because we don't need to give a json body
        res.sendStatus(204);

    } catch (error) {
        next(error);
    }
}