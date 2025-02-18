/**
 * Formats an ISO date string into a 'MM-DD-YYYY' format.
 *
 * @param {string} isoDate - The ISO date string to be formatted.
 * @returns {string} - The formatted date string in 'MM-DD-YYYY' format.
 */

export const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
};



/**
 * Formats an ISO date string into a 'HH:MM' time format.
 *
 * @param {string} isoDate - The ISO date string to extract the time from.
 * @returns {string} - The formatted time string in 'HH:MM' format.
 */
export const formatTime = (isoDate) => {
    const date = new Date(isoDate);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};