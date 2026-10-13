/**
 * Haversine Formula: Calculate distance between two GPS coordinates (in meters)
 * @param {number} lat1 - Latitude point 1
 * @param {number} lon1 - Longitude point 1
 * @param {number} lat2 - Latitude point 2
 * @param {number} lon2 - Longitude point 2
 * @returns {number} Distance in meters
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const φ1 = lat1 * (Math.PI / 180);
  const φ2 = lat2 * (Math.PI / 180);
  const Δφ = (lat2 - lat1) * (Math.PI / 180);
  const Δλ = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}

/**
 * Check if a coordinate is within a geofence radius
 * @param {number} userLat
 * @param {number} userLon
 * @param {number} factoryLat
 * @param {number} factoryLon
 * @param {number} radiusMeters
 * @returns {{ inside: boolean, distance: number }}
 */
export function checkGeofence(userLat, userLon, factoryLat, factoryLon, radiusMeters) {
  const distance = haversineDistance(userLat, userLon, factoryLat, factoryLon);
  return {
    inside: distance <= radiusMeters,
    distance: Math.round(distance),
  };
}

/**
 * Get current GPS position using browser Geolocation API
 * @returns {Promise<GeolocationPosition>}
 */
export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Thiết bị không hỗ trợ GPS. Vui lòng sử dụng trình duyệt hiện đại.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
      ...options,
    });
  });
}

/**
 * Format distance for display
 * @param {number} meters
 * @returns {string}
 */
export function formatDistance(meters) {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(2)}km`;
}

/**
 * Calculate bearing (direction) between two points
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {string} Cardinal direction
 */
export function getBearing(lat1, lon1, lat2, lon2) {
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const y = Math.sin(dLon) * Math.cos(lat2 * (Math.PI / 180));
  const x = Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) -
    Math.sin(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.cos(dLon);
  const brng = Math.atan2(y, x) * (180 / Math.PI);
  const bearing = (brng + 360) % 360;

  const directions = ['Bắc', 'Đông Bắc', 'Đông', 'Đông Nam', 'Nam', 'Tây Nam', 'Tây', 'Tây Bắc'];
  return directions[Math.round(bearing / 45) % 8];
}
