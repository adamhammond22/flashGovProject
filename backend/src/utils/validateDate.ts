export const validateDateString = (dateStr:string) => {
    return !isNaN(new Date(dateStr) as any);
}