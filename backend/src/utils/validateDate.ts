const moment = require('moment');

const validateDateString = (dateStr:string) => {
    let splitStr = dateStr.split("T")[0];
    return moment(splitStr, 'MM-DD-YYYY', true).isValid() || moment(splitStr, 'YYYY-MM-DD', true).isValid()
}

export { validateDateString }