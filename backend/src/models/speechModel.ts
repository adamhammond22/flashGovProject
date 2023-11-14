/* ==================================== speechModel.ts ==================================== */
// Defines the Speech schema used in the database
import { InferSchemaType, Schema, model } from "mongoose";

// Create speeches Schema for Mongoose
const speechSchema = new Schema({
    title: {type: String, required: true},
    text: {type: String, required: true},
    date: {type: Date, required: true},
    speaker: {type: String, required: true},
    section: {type: String, required: true},
    url: {type: String, required: true},
    summary: {type: String}
},
{
    timestamps:true,
    collection: 'speechesCollection'}
);


/* Create a type alias called speech based on our noteSchema */
type Speech = InferSchemaType<typeof speechSchema>;

/* Export our speech */
export default model<Speech>("Speech", speechSchema);