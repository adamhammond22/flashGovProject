/* .../controllers/Notes.ts handles the logic for our endpoints, exported as functions*/
// This lets us reuse functionality for multiple endpoints

import { RequestHandler } from "express";
import NoteModel from "../models/note";

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
}


/* Get one note */
export const getNote: RequestHandler = async (req, res, next) => {
    // Get the noteId from the params
    const noteId = req.params.noteId;
    try {
        // I love mongoose functions, but this one needs a .exec for some reason?
        const note = await NoteModel.findById(noteId).exec();
        res.status(200).json(note);
    } catch (error) {
        next(error);
    }
}

export const createNote: RequestHandler = async (req, res, next) => {
    const title = req.body.title;
    const text=req.body.text;
    
    try {
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
    
}