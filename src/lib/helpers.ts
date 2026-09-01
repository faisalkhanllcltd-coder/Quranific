// src/utils/helpers.ts
import { SITE } from '../constants/site';

// ==========================================
// 1. FORM DROPDOWN CONSTANTS
// ==========================================
// NOTE: "COURSES" is intentionally removed. We use src/data/courses.ts for the Single Source of Truth.

// ==========================================
// 2. WHATSAPP ENGINE
// ==========================================

export const GENDERS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
];

export const LEVELS = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
];

export const SCHEDULES = [
  { value: 'Morning', label: 'Morning' },
  { value: 'Afternoon', label: 'Afternoon' },
  { value: 'Evening', label: 'Evening' },
  { value: 'Night', label: 'Night' },
];

export const DAYS = [
  { value: '2 Days', label: '2 Days' },
  { value: '3 Days', label: '3 Days' },
  { value: '4 Days', label: '4 Days' },
  { value: '5 Days', label: '5 Days' },
];

export function generateWhatsAppLink(prefilledMessage: string, customNumber?: string): string {
  const targetNumber = customNumber || SITE?.whatsappNumber || '1234567890';
  // Remove spaces, pluses, and dashes from the phone number for a clean URL
  const cleanNumber = targetNumber.replace(/[\s+-]/g, '');
  const encodedMessage = encodeURIComponent(prefilledMessage);

  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}
