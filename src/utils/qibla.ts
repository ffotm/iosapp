// Kaaba coordinates
const KAABA_LAT = 21.4225;
const KAABA_LON = 39.8262;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Great-circle initial bearing from the user's location to the Kaaba,
 * in degrees clockwise from true north (0-360).
 */
export function getQiblaBearing(latitude: number, longitude: number): number {
  const userLat = toRad(latitude);
  const userLon = toRad(longitude);
  const kaabaLat = toRad(KAABA_LAT);
  const kaabaLon = toRad(KAABA_LON);

  const deltaLon = kaabaLon - userLon;

  const y = Math.sin(deltaLon) * Math.cos(kaabaLat);
  const x =
    Math.cos(userLat) * Math.sin(kaabaLat) -
    Math.sin(userLat) * Math.cos(kaabaLat) * Math.cos(deltaLon);

  const bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

/**
 * Great-circle distance to the Kaaba in kilometers (haversine), useful
 * for display ("You are X km from the Kaaba").
 */
export function getDistanceToKaabaKm(latitude: number, longitude: number): number {
  const R = 6371; // Earth radius km
  const dLat = toRad(KAABA_LAT - latitude);
  const dLon = toRad(KAABA_LON - longitude);
  const lat1 = toRad(latitude);
  const lat2 = toRad(KAABA_LAT);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
