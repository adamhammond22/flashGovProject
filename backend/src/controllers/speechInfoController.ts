/* ==================================== speechInfoController.ts ==================================== */
// Houses all Middleware (Request Handlers) used in speech info routing 
// Speech info is a subset of speeches, excluding things we don't need when filtering / displaying info of speeches
// excluding text and summary
import { RequestHandler } from "express";
import SpeechModel from "../models/speechModel";
import createHttpError from "http-errors";
import mongoose from "mongoose";

// ============================== All Middleware ============================== //

// ========== Get All Speech Middleware ========== //
export const getFilteredSpeechInfo: RequestHandler = async (req, res, next)=>{

    try {
        // Read our given request queries into variables
        let givenSpeaker = req.query.speaker;
        let givenStartDate = req.query.startDate;
        let givenEndDate = req.query.endDate;
        
        // Actual Dates used in the query
        let startDate:Date;
        let endDate:Date;

        if (givenStartDate) {
            
            if (!givenEndDate) {
                // If no given end date, set it to the start date
                endDate = new Date(givenStartDate.toString());
            } else {
                // set the end date
                endDate = new Date(givenEndDate.toString());
            }
            // Assure end date is the very end of the day
            endDate.setUTCHours(23, 59, 59, 999);
            // ASet start date and assure it's the very start of the day
            startDate = new Date(givenStartDate.toString());
            startDate.setUTCHours(0,0,0,0);
        }
        
        // Here our our queries given to mongoose
        let mongooseQueries = {};

        // Logic for adding the intended queries
        if(givenSpeaker) {
            const speakerRegex = new RegExp(".*" + givenSpeaker + ".*");
            // Date & Speaker
            if(givenStartDate) {
                mongooseQueries = {
                    "speaker": {$regex : speakerRegex},
                    "date" : { $gte: startDate!, $lte: endDate! }
                }
            } else {
                // Just Speaker
                mongooseQueries = {
                    "speaker":  {$regex : speakerRegex}}
                }
        } else {
            // Date
            if(givenStartDate) {
                mongooseQueries = {
                    "date" : { $gte: startDate!, $lte: endDate! },
                }
            }
        }

        // Find all speeches and return
        // Using "Projection" to filter what fields we return
        const speeches = await SpeechModel.find(mongooseQueries,
            {speaker: 1, date: 1, title: 1, section: 1}).exec();
        res.status(200).json(speeches);        

    } catch (error) {
        next(error);
    }
};
