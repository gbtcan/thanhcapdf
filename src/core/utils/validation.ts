/**
 * Email validation function
 */
export function isValidEmail(email: string): boolean {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Password strength validation
 * Returns a score from 0 (weakest) to 4 (strongest)
 */
export function getPasswordStrength(password: string): number {
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Complexity checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 0.5;
  if (/[^a-zA-Z0-9]/.test(password)) score += 0.5;
  
  return Math.min(Math.floor(score), 4); // Clamp to 0-4
}

/**
 * Password strength description
 */
export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0: return 'Rất yếu';
    case 1: return 'Yếu';
    case 2: return 'Trung bình';
    case 3: return 'Mạnh';
    case 4: return 'Rất mạnh';
    default: return 'Không xác định';
  }
}

/**
 * URL validation function
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Vietnamese phone number validation
 */
export function isValidVietnamesePhone(phone: string): boolean {
  const re = /^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/;
  return re.test(phone);
}
