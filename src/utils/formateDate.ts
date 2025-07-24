export function formateDate(date: string) {
    const dateObj = new Date(date);
    dateObj.setDate(dateObj.getDate() + 1);
    return dateObj;
}