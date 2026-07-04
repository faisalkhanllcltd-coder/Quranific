// src/lib/schema.ts
import { z } from 'zod';

export const signupSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters').max(100),
  email:    z.string().email('Please enter a valid email address').toLowerCase().trim(),
  whatsapp: z.string()
    .min(7,  'WhatsApp number too short')
    .regex(/^\+?[1-9]\d{6,14}$/, 'Must be a valid international phone number'),
  country:  z.string().min(2, 'Country is required'),
  source:   z.string().default('organic'),
  honeypot: z.string().max(0, 'Bot detected').optional(),
  // B-2 FIX: Changed from .optional() to .min(1, ...) so the Turnstile token is
  // always required. register.ts rejects any submission where this field is absent.
  turnstileToken: z.string().min(1, 'Bot check required — please complete the security check.'),
});

export const completeSchema = z.object({
  course:        z.string().min(1, 'Please select a course'),
  gender:        z.enum(['Male', 'Female'],                                    { required_error: 'Please select student gender' }),
  teacherGender: z.enum(['Male Teacher', 'Female Teacher', 'No Preference'],   { required_error: 'Please select teacher preference' }),
  level:         z.enum(['Beginner', 'Intermediate', 'Advanced'],              { required_error: 'Please select a level' }),
  days:          z.string().min(1, 'Please select days per week'),
  schedule:      z.string().min(1, 'Please select preferred time'),
  // B-4 FIX: sessionToken removed entirely from completeSchema.
  // The JWT session is now delivered as an HttpOnly cookie ('q_session') and read
  // by complete.ts from the request Cookie header — not from the form body.
  // Removing it from the schema means it can never be submitted by a client script,
  // eliminating the URL-based token exposure vector.
});