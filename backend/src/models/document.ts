/* ==================================== documents.ts ==================================== */
// Defines the document schema used in the database
import { InferSchemaType, Schema, model } from "mongoose";

// Create Document Schema for Mongoose
const documentSchema = new Schema({
    title: {type: String, required: true},
    text: {type: String},
    summary: {type: String}
}, {timestamps:true});


/* Create a type alias called Document based on our noteSchema */
type Document = InferSchemaType<typeof documentSchema>;

/* Export our document */
export default model<Document>("Document", documentSchema);