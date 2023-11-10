/* Global Helper Functions for Frontend */
import { parseISO, format } from 'date-fns';

/* Custom Date Parsing Function */
// ONLY use this one
const parseAndFormatDate = (dateStr:string) => {
    return format(parseISO(dateStr.split('T')[0]), "MMMM d, yyyy");;
}

export {parseAndFormatDate};