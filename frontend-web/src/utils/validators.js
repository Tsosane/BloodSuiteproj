// src/utils/validators.js

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return null;
};

export const validatePhoneNumber = (phone) => {
  if (!phone) return null; // Optional field
  const phoneRegex = /^(\+266|0)\d{8}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return 'Please enter a valid Lesotho phone number (+266 XXXX XXXX)';
  }
  return null;
};

export const validateBloodType = (bloodType) => {
  const validTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  if (!bloodType) return 'Blood type is required';
  if (!validTypes.includes(bloodType)) return 'Please select a valid blood type';
  return null;
};

export const validateDate = (date, fieldName = 'Date') => {
  if (!date) return `${fieldName} is required`;
  const d = new Date(date);
  if (isNaN(d.getTime())) return `Please enter a valid ${fieldName}`;
  return null;
};

export const validateFutureDate = (date, fieldName = 'Date') => {
  const error = validateDate(date, fieldName);
  if (error) return error;
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d < today) return `${fieldName} cannot be in the past`;
  return null;
};

export const validatePastDate = (date, fieldName = 'Date') => {
  const error = validateDate(date, fieldName);
  if (error) return error;
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d > today) return `${fieldName} cannot be in the future`;
  return null;
};

export const validateAge = (dateOfBirth) => {
  const error = validateDate(dateOfBirth, 'Date of birth');
  if (error) return error;
  
  const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
  if (age < 16) return 'Donor must be at least 16 years old';
  if (age > 70) return 'Donor must be under 70 years old';
  return null;
};

export const validateQuantity = (quantity, min = 450, max = 2700) => {
  if (!quantity) return 'Quantity is required';
  const qty = Number(quantity);
  if (isNaN(qty)) return 'Please enter a valid number';
  if (qty < min) return `Quantity must be at least ${min} ml`;
  if (qty > max) return `Quantity cannot exceed ${max} ml`;
  if (qty % 450 !== 0) return 'Quantity must be a multiple of 450 ml';
  return null;
};

export const validateHospitalCode = (code) => {
  if (!code) return 'Hospital code is required';
  const codeRegex = /^LS-BB-\d{3}$/;
  if (!codeRegex.test(code)) return 'Code must be in format: LS-BB-001 to LS-BB-999';
  return null;
};

export const validateEmployeeId = (id, role) => {
  if (!id) return 'Employee ID is required';
  
  if (role === 'blood_bank_manager') {
    const managerRegex = /^BBM-\d{3}$/;
    if (!managerRegex.test(id)) return 'Manager ID must be in format: BBM-001 to BBM-999';
  } else if (role === 'admin') {
    const adminRegex = /^ADMIN-\d{3}$/;
    if (!adminRegex.test(id)) return 'Admin ID must be in format: ADMIN-001 to ADMIN-999';
  }
  
  return null;
};

export const validateLicenseNumber = (license) => {
  if (!license) return 'License number is required';
  if (license.length < 5) return 'License number must be at least 5 characters';
  return null;
};

export const validateForm = (data, rules) => {
  const errors = {};
  for (const [field, rule] of Object.entries(rules)) {
    const error = rule(data[field], data);
    if (error) {
      errors[field] = error;
    }
  }
  return errors;
};