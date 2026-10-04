/**
 * Calculates the great-circle distance between two points on the Earth's surface using the Haversine formula.
 * @param {number} lat1 - Latitude of origin in degrees
 * @param {number} lon1 - Longitude of origin in degrees
 * @param {number} lat2 - Latitude of destination in degrees
 * @param {number} lon2 - Longitude of destination in degrees
 * @returns {number} Distance in kilometers (rounded to 2 decimal places)
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const EARTH_RADIUS_KM = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return Math.round(distance * 100) / 100;
}
