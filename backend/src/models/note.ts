// This will contain our node data model
import { InferSchemaType, Schema, model } from "mongoose";

/* Create a "note" schema using mongoose */
const noteSchema = new Schema({
    title: {type: String, required: true},
    text: {type: String},
}, {timestamps:true});
// Mongoose has lots of extra time-saving functionality. For example we can just tell it to add timestamps for us


/* Create a type alias called "Note" based on our noteSchema */
type Note = InferSchemaType<typeof noteSchema>;

export default model<Note>("Note", noteSchema);