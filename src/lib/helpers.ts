// src/utils/helpers.ts
import { SITE } from '../constants/site';

// ==========================================
// 1. FORM DROPDOWN CONSTANTS
// ==========================================
// NOTE: "COURSES" is intentionally removed. We use src/data/courses.ts for the Single Source of Truth.

export const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'Other', name: 'Other', flag: '🌍' }
];

export const GENDERS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' }
];

export const LEVELS = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' }
];

export const SCHEDULES = [
  { value: 'Morning', label: 'Morning' },
  { value: 'Afternoon', label: 'Afternoon' },
  { value: 'Evening', label: 'Evening' },
  { value: 'Night', label: 'Night' }
];

export const DAYS = [
  { value: '2 Days', label: '2 Days' },
  { value: '3 Days', label: '3 Days' },
  { value: '4 Days', label: '4 Days' },
  { value: '5 Days', label: '5 Days' }
];

// ==========================================
// 2. BROWSER SESSION MANAGEMENT
// ==========================================
// The client only manages the storage of the token. 
// It NEVER encodes or decodes the payload. That is the server's job.

export function saveSessionToken(token: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('q_reg', token);
  }
}

export function getSessionToken(urlParam?: string | null): string | null {
  if (typeof window === 'undefined') return null;
  
  // 110% Architecture: Read from URL param FIRST (survives Instagram/FB in-app browsers)
  const token = urlParam || sessionStorage.getItem('q_reg');
  return token || null;
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('q_reg');
  }
}

// ==========================================
// 3. WHATSAPP ENGINE
// ==========================================

export function generateWhatsAppLink(prefilledMessage: string, customNumber?: string): string {
  const targetNumber = customNumber || SITE?.whatsappNumber || '1234567890';
  // Remove spaces, pluses, and dashes from the phone number for a clean URL
  const cleanNumber = targetNumber.replace(/[\s+-]/g, '');
  const encodedMessage = encodeURIComponent(prefilledMessage);
  
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}