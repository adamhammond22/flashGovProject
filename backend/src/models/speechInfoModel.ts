/* ==================================== speechInfoModel.ts ==================================== */
// Defines the Speech Info schema (a subset of the speechModel)
// This is the information that's shown in the search (excludes summary and text)
import { InferSchemaType, Schema, model } from "mongoose";

// Create speech info Schema for Mongoose
const speechInfoSchema = new Schema({
    title: {type: String, required: true},
    date: {type: Date, required: true},
    speaker: {type: String, required: true},
    section: {type: String, required: true},
},
{
    timestamps:true,
    collection: 'speechesCollection'}
);


/* Create a type alias called speech based on our noteSchema */
type SpeechInfo = InferSchemaType<typeof speechInfoSchema>;

/* Export our speech */
export default model<SpeechInfo>("SpeechInfo", speechInfoSchema);