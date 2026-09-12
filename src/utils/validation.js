// Form validation utility adhering strictly to PRD Section 8

export function validateCertificateForm(name, email) {
  const errors = {};

  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();

  // Name validation
  if (!cleanName || cleanName.length === 0) {
    errors.name = 'Please enter your full name.';
  } else if (cleanName.length < 2) {
    errors.name = 'Full name must be at least 2 characters.';
  } else if (cleanName.length > 100) {
    errors.name = 'Full name must not exceed 100 characters.';
  }

  // Email validation (standard email RFC format)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!cleanEmail || cleanEmail.length === 0) {
    errors.email = 'Please enter a valid email address.';
  } else if (!emailRegex.test(cleanEmail)) {
    errors.email = 'Please enter a valid email address.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    cleanName,
    cleanEmail
  };
}

export function validateCertificateId(certId) {
  if (!certId || typeof certId !== 'string') return false;
  const clean = certId.trim().toUpperCase();
  // Validates formats like BRW-AIRO-0001
  return /^BRW-AIRO-\d{4,}$/.test(clean);
}
