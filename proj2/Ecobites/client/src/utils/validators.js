export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validatePhone = (phone) => {
  const re = /^\d{3}-\d{4}$/;
  return re.test(phone);
};

export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    const value = data[field];
    
    if (rule.required && !value) {
      errors[field] = `${field} is required`;
    }
    
    if (rule.minLength && value.length < rule.minLength) {
      errors[field] = `${field} must be at least ${rule.minLength} characters`;
    }
    
    if (rule.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.message || `Invalid ${field}`;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};