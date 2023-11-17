/* ==================================== speechesController.ts ==================================== */
// Houses all Middleware (Request Handlers) used in speech routing 
import { RequestHandler } from "express";
import SpeechModel from "../models/speechModel";
import createHttpError from 'http-errors';
import mongoose from "mongoose";
import {generateSummary, PromptInput} from "../utils/generateSummary";
import {validateDateString} from "../utils/validateDate";
// Use moment to validate dates
const moment = require('moment');




// ============================== All Middleware ============================== //

// ========== Get All Speech Middleware ========== //
// Not in use atm
// export const getAllSpeeches: RequestHandler = async (req, res, next)=>{

//     try {
//         // Find all speechs and return

//         const speeches = await SpeechModel.find().exec();
//         res.status(200).json(speeches);        

//     } catch (error) {
//         next(error);
//     }
// };




// ========== Get Single Speech (by id) ========== //
export const getSingleSpeech: RequestHandler = async (req, res, next) => {

    // Get the noteId from the params
    const speechId = req.params.speechId;

    try {

        // Assert noteID is valid
        if(!mongoose.isValidObjectId(speechId)){
            throw createHttpError(400, "Invalid Speech ID");
        }

        // Find speech
        const doc = await SpeechModel.findById(speechId).exec();

        // If not found, throw appropriate error
        if(!doc) {
            throw createHttpError(404, "Speech not found");
        }

        // If there is no summary, generate one
        if (!doc.summary)
        {
            // Translate our b64 encoded text into a regular string
            let text = atob(doc.text);
            // Create prompt for Algorithm
            const promptInput: PromptInput = {
                documentSpeaker: doc.speaker,
                documentSection: doc.section,
                documentText: text,
              };
            // Generate a summary using our prompt input and get a response
            const GenSummaryRes = await generateSummary(promptInput);

            if(GenSummaryRes.success) {
                // We would save the summary here
            } else {
                throw createHttpError(500, GenSummaryRes.error);
            }
            doc.summary = GenSummaryRes.summary;
        }
        
        res.status(200).json(doc);


    } catch (error) {
        next(error);
    }
};


// ========== Create Speech ========== //

// Interface for interpreting message body
interface CreateSpeechBody {
    title: string,
    text: string,
    date: Date,
    speaker: string,
    section: string, 
    url: string,
    summary?: string,
}

// Request Handler for creating a speech
export const createSpeech: RequestHandler<unknown, unknown, CreateSpeechBody, unknown> = async (req, res, next) => {
    // Pull out all the body fields
    const givenTitle = req.body.title;
    const givenText = req.body.text;
    const givenDate = req.body.date;
    const givenSpeaker = req.body.speaker;
    const givenSection = req.body.section;
    const givenSummary = req.body.summary;
    const givenURL = req.body.url;
    try {
        // Ensure Required fields were provided
        if(!givenTitle) {
            throw createHttpError(400, "Speech must have a title");
        } else if(!givenText) {
            throw createHttpError(400, "Speech must have text");
        } else if(!givenDate) {
            throw createHttpError(400, "Speech must have a date");
        } else if(!givenSpeaker) {
            throw createHttpError(400, "Speech must have a speaker");
        } else if(!givenSection) {
            throw createHttpError(400, "Speech must have a legislative body / section");
        } else if(!givenURL) {
            throw createHttpError(400, "Speech must have a url");
        }
/*
        // Check for invalid date format
        if(! moment(givenDate, 'MM-DD-YYYY', true).isValid()) {
            throw createHttpError(400, "Speech date invalid: Must satisfy MM-DD-YYYY");
        }
*/
        // Create the new Speech
        const newSpeech = await SpeechModel.create({
            title: givenTitle,
            text: givenText,
            date: givenDate,
            speaker: givenSpeaker,
            section: givenSection,
            url: givenURL,
            summary: givenSummary,
        });

        // Return the speech with the proper response
        res.status(201).json(newSpeech);
    
    } catch (error) {
        next(error);
    }
    
};


// ========== Update Speech ========== //

// Interfaces for interpreting message body and params
interface UpdateSpeechBody {
    title: string,
    text: string,
    date: Date,
    speaker: string,
    section: string, 
    url: string,
    summary?: string,
}
interface UpdateSpeechParams {
    speechId: string
}

// Request Handler for updating a speech
export const updateSpeech: RequestHandler<UpdateSpeechParams, unknown, UpdateSpeechBody, unknown> =async (req, res, next) => {

    // Extract params and body fields
    const speechId = req.params.speechId;
    const givenTitle = req.body.title;
    const givenText = req.body.text;
    const givenDate = req.body.date;
    const givenSpeaker = req.body.speaker;
    const givenSection = req.body.section;
    const givenURL = req.body.url;
    const givenSummary = req.body.summary;
    
    try {
        // Ensure Speech Id is valid
        if(!mongoose.isValidObjectId(speechId)){
            throw createHttpError(400, "Invalid Speech ID");
        }

        // Ensure Required fields were provided
        if(!givenTitle) {
            throw createHttpError(400, "Speech must have a title");
        } else if(!givenText) {
            throw createHttpError(400, "Speech must have text");
        } else if(!givenDate) {
            throw createHttpError(400, "Speech must have a date");
        } else if(!givenSpeaker) {
            throw createHttpError(400, "Speech must have a speaker");
        } else if(!givenSection) {
            throw createHttpError(400, "Speech must have a section");
        } else if(!givenURL) {
            throw createHttpError(400, "Speech must have a url");
        }
/*
        if(!validateDateString(givenDate)) {
            throw createHttpError(400, "Speech date invalid: Must satisfy MM-DD-YYYY");
        }
*/

        // Find the speech
        const speech = await SpeechModel.findById(speechId).exec();

        if(!speech) {
            throw createHttpError(404, "Speech not found");
        }
        
        speech.title = givenTitle;
        speech.text = givenText;
        speech.date = givenDate;
        speech.speaker = givenSpeaker;
        speech.section = givenSection;
        speech.summary = givenSummary;
        speech.url = givenURL;

        // Use mongoose save method, and await response
        const updatedSpeech = await speech.save(); 

        res.status(200).json(updatedSpeech);

    } catch (error) {
        next(error);
    }
}


// ========== Delete Speech ========== //
export const deleteSpeech: RequestHandler = async (req, res, next) => {

    // Extract speechId from params
    const speechId = req.params.speechId;

    try {

        // Ensure Speech Id is valid
        if(!mongoose.isValidObjectId(speechId)){
            throw createHttpError(400, "Invalid Speech ID");
        }

        // Find and delete the speech
        const deletedSpeech = await SpeechModel.findByIdAndDelete(speechId).exec();

        if(!deletedSpeech) {
            throw createHttpError(404, "Speech not found");
        }

        // Sendstatus because we don't need to give a json body
        res.sendStatus(204);

    } catch (error) {
        next(error);
    }
}