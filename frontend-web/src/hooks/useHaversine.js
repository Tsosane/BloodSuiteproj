// src/hooks/useHaversine.js
import { useMemo } from 'react';

const useHaversine = () => {
  const toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const filterByRadius = (items, centerLat, centerLon, radiusKm, getLatLon) => {
    return items.filter(item => {
      const { lat, lon } = getLatLon(item);
      if (!lat || !lon) return false;
      const distance = calculateDistance(centerLat, centerLon, lat, lon);
      return distance <= radiusKm;
    }).map(item => ({
      ...item,
      distance: calculateDistance(centerLat, centerLon, 
        getLatLon(item).lat, getLatLon(item).lon),
    })).sort((a, b) => a.distance - b.distance);
  };

  const findNearest = (items, centerLat, centerLon, getLatLon) => {
    if (!items || items.length === 0) return null;
    
    return items.reduce((nearest, current) => {
      const currentDistance = calculateDistance(centerLat, centerLon, 
        getLatLon(current).lat, getLatLon(current).lon);
      const nearestDistance = nearest ? calculateDistance(centerLat, centerLon, 
        getLatLon(nearest).lat, getLatLon(nearest).lon) : Infinity;
      
      return currentDistance < nearestDistance ? current : nearest;
    }, null);
  };

  return {
    calculateDistance,
    filterByRadius,
    findNearest,
  };
};

export default useHaversine;