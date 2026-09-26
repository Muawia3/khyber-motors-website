/**
 * Validates whether a phone number matches standard Pakistani mobile/landline formats.
 * Accepts formats: 03001234567, +923001234567, 923001234567, 0300 1234567, +92-300-1234567, 091-5840900
 * @param {string} phone
 * @returns {boolean}
 */
export function validatePakistaniPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  
  // Remove spaces, dashes, and parentheses for uniform checking
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  
  // Mobile numbers: +923XXXXXXXXX, 923XXXXXXXXX, 03XXXXXXXXX, 3XXXXXXXXX (10-13 chars clean)
  // Landline numbers: +9291XXXXXXX, 091XXXXXXX
  const mobileRegex = /^(\+92|92|0)?3[0-9]{9}$/;
  const landlineRegex = /^(\+92|92|0)?[1-9][0-9]{7,9}$/;

  return mobileRegex.test(cleanPhone) || landlineRegex.test(cleanPhone);
}

/**
 * Validates standard email address syntax.
 * Optional fields return true if blank, but validate if text is entered.
 * @param {string} email
 * @param {boolean} isRequired
 * @returns {boolean}
 */
export function validateEmail(email, isRequired = false) {
  if (!email || typeof email !== 'string' || !email.trim()) {
    return !isRequired;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates if a string value or checked state is non-empty / true.
 * @param {any} value
 * @returns {boolean}
 */
export function validateRequired(value) {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
}
