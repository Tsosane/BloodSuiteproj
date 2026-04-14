// src/hooks/useFEFO.js
import { useState, useEffect, useMemo } from 'react';

const useFEFO = (inventory) => {
  const [sortedInventory, setSortedInventory] = useState([]);

  useEffect(() => {
    if (!inventory || inventory.length === 0) {
      setSortedInventory([]);
      return;
    }

    // Sort by expiry date ascending (earliest first)
    const sorted = [...inventory].sort((a, b) => {
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    });

    setSortedInventory(sorted);
  }, [inventory]);

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return { status: 'expired', color: '#9e9e9e', label: 'Expired', severity: 'error' };
    if (daysLeft < 3) return { status: 'critical', color: '#f44336', label: `Expires in ${daysLeft} days`, severity: 'error' };
    if (daysLeft < 7) return { status: 'warning', color: '#ff9800', label: `Expires in ${daysLeft} days`, severity: 'warning' };
    return { status: 'good', color: '#4caf50', label: `${daysLeft} days remaining`, severity: 'success' };
  };

  const getUnitsByExpiry = (daysThreshold) => {
    return sortedInventory.filter(item => {
      const daysLeft = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      return daysLeft <= daysThreshold && daysLeft >= 0;
    });
  };

  const getExpiringSoon = () => getUnitsByExpiry(7);
  const getCriticalExpiry = () => getUnitsByExpiry(3);

  const getAllocateUnits = (bloodType, quantityMl) => {
    const unitsPerDonation = 450;
    const unitsNeeded = Math.ceil(quantityMl / unitsPerDonation);
    
    const availableUnits = sortedInventory.filter(
      item => item.bloodType === bloodType && 
              item.status === 'available' && 
              new Date(item.expiryDate) > new Date()
    );

    const allocated = availableUnits.slice(0, unitsNeeded);
    const remainingNeeded = unitsNeeded - allocated.length;
    
    return {
      allocated,
      remainingNeeded,
      isFullyAllocated: remainingNeeded === 0,
    };
  };

  return {
    sortedInventory,
    getExpiryStatus,
    getExpiringSoon,
    getCriticalExpiry,
    getAllocateUnits,
  };
};

export default useFEFO;