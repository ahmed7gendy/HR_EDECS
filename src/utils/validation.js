export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return re.test(password);
};

export const validatePhone = (phone) => {
  const re = /^\+?[\d\s-]{10,}$/;
  return re.test(phone);
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

export const validateLength = (value, min, max) => {
  if (!value) return false;
  const length = value.toString().length;
  return length >= min && length <= max;
};

export const validateDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

export const validateDateRange = (startDate, endDate) => {
  if (!validateDate(startDate) || !validateDate(endDate)) return false;
  return new Date(startDate) <= new Date(endDate);
};

export const validateNumber = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

export const validateFileSize = (file, maxSize) => {
  return file.size <= maxSize;
};

export const validateEmployeeData = (data) => {
  const errors = {};

  if (!validateRequired(data.firstName)) {
    errors.firstName = 'First name is required';
  }

  if (!validateRequired(data.lastName)) {
    errors.lastName = 'Last name is required';
  }

  if (!validateEmail(data.email)) {
    errors.email = 'Invalid email address';
  }

  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = 'Invalid phone number';
  }

  if (!validateRequired(data.department)) {
    errors.department = 'Department is required';
  }

  if (!validateRequired(data.position)) {
    errors.position = 'Position is required';
  }

  return errors;
};

export const validateLeaveRequest = (data) => {
  const errors = {};

  if (!validateRequired(data.type)) {
    errors.type = 'Leave type is required';
  }

  if (!validateDate(data.startDate)) {
    errors.startDate = 'Invalid start date';
  }

  if (!validateDate(data.endDate)) {
    errors.endDate = 'Invalid end date';
  }

  if (!validateDateRange(data.startDate, data.endDate)) {
    errors.dateRange = 'End date must be after start date';
  }

  if (!validateRequired(data.reason)) {
    errors.reason = 'Reason is required';
  }

  return errors;
};

export const validateJobPosting = (data) => {
  const errors = {};

  if (!validateRequired(data.title)) {
    errors.title = 'Job title is required';
  }

  if (!validateRequired(data.department)) {
    errors.department = 'Department is required';
  }

  if (!validateRequired(data.description)) {
    errors.description = 'Job description is required';
  }

  if (!validateRequired(data.requirements)) {
    errors.requirements = 'Job requirements are required';
  }

  if (!validateNumber(data.vacancies, 1, 100)) {
    errors.vacancies = 'Invalid number of vacancies';
  }

  return errors;
};

export const validateProject = (data) => {
  const errors = {};

  if (!validateRequired(data.name)) {
    errors.name = 'Project name is required';
  }

  if (!validateRequired(data.description)) {
    errors.description = 'Project description is required';
  }

  if (!validateRequired(data.department)) {
    errors.department = 'Department is required';
  }

  if (!validateDate(data.startDate)) {
    errors.startDate = 'Invalid start date';
  }

  if (data.endDate && !validateDate(data.endDate)) {
    errors.endDate = 'Invalid end date';
  }

  if (data.endDate && !validateDateRange(data.startDate, data.endDate)) {
    errors.dateRange = 'End date must be after start date';
  }

  return errors;
};

export const validateTraining = (data) => {
  const errors = {};

  if (!validateRequired(data.title)) {
    errors.title = 'Training title is required';
  }

  if (!validateRequired(data.description)) {
    errors.description = 'Training description is required';
  }

  if (!validateDate(data.startDate)) {
    errors.startDate = 'Invalid start date';
  }

  if (!validateDate(data.endDate)) {
    errors.endDate = 'Invalid end date';
  }

  if (!validateDateRange(data.startDate, data.endDate)) {
    errors.dateRange = 'End date must be after start date';
  }

  if (!validateNumber(data.capacity, 1, 100)) {
    errors.capacity = 'Invalid capacity';
  }

  return errors;
};

export const validatePerformanceReview = (data) => {
  const errors = {};

  if (!validateRequired(data.employeeId)) {
    errors.employeeId = 'Employee is required';
  }

  if (!validateRequired(data.reviewerId)) {
    errors.reviewerId = 'Reviewer is required';
  }

  if (!validateDate(data.reviewDate)) {
    errors.reviewDate = 'Invalid review date';
  }

  if (!validateRequired(data.ratings)) {
    errors.ratings = 'Ratings are required';
  }

  if (!validateRequired(data.comments)) {
    errors.comments = 'Comments are required';
  }

  return errors;
}; 