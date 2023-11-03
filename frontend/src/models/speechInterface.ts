/* ==================================== speechInterface.ts ==================================== */
// This defines our interface for the speech schema in the frontend
export interface Speech{
    _id: string,
    title: string,
    text: string,
    date: string,
    speaker: string,
    section: string,
    summary?: string,
    createdAt: string,
    updatedAt: string
}
