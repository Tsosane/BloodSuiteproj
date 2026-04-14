// src/utils/haversine.js
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const filterByRadius = (items, centerLat, centerLon, radiusKm, getCoordinates) => {
  return items
    .map(item => {
      const { lat, lon } = getCoordinates(item);
      if (!lat || !lon) return null;
      const distance = haversineDistance(centerLat, centerLon, parseFloat(lat), parseFloat(lon));
      return { ...item, distance };
    })
    .filter(item => item && item.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
};

module.exports = { haversineDistance, filterByRadius };