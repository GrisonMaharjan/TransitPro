/**
 * Calculates fare based on distance in KM
 * @param {number} dist - Distance in Kilometers
 * @returns {number} - Fare in Rs.
 */
const calculateFare = (dist) => {
    if (dist <= 10) return 18;
    if (dist <= 20) return 25;
    if (dist <= 30) return 30;
    if (dist <= 40) return 35;
    return 40;
};

/**
 * Calculates distance between two stops
 * @param {string} stop1 - Origin stop name
 * @param {string} stop2 - Destination stop name
 * @returns {number} - Distance in KM
 */
const getDistance = (stop1, stop2) => {
    // Haversine calculation should ideally happen here or passed from client
    // For now returning mock as the client sends the identified nearest stop
    return 15.5;
};

module.exports = {
    calculateFare,
    getDistance
};
