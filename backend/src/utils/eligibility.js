// src/utils/eligibility.js
const calculateEligibility = (lastDonationDate) => {
  if (!lastDonationDate) {
    return { isEligible: true, nextEligibleDate: null, daysRemaining: 0 };
  }

  const today = new Date();
  const lastDonation = new Date(lastDonationDate);
  const daysSinceDonation = Math.floor((today - lastDonation) / (1000 * 60 * 60 * 24));

  if (daysSinceDonation >= 56) {
    return { isEligible: true, nextEligibleDate: null, daysRemaining: 0 };
  } else {
    const nextEligible = new Date(lastDonation);
    nextEligible.setDate(lastDonation.getDate() + 56);
    return {
      isEligible: false,
      nextEligibleDate: nextEligible.toISOString().split('T')[0],
      daysRemaining: 56 - daysSinceDonation,
    };
  }
};

module.exports = { calculateEligibility };