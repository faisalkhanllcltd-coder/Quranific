// src/lib/resend-contacts.ts
/**
 * Resend Contacts API Wrapper
 *
 * Grounded in Resend documentation:
 * - Create Contact: https://resend.com/docs/api-reference/contacts/create-contact
 *   Doc lines 80-88, 238-246:
 *   POST https://api.resend.com/contacts
 *   Body: { email, unsubscribed, segments?: [{ id: string }] }
 * - Update Contact: https://resend.com/docs/api-reference/contacts/update-contact
 *   Doc lines 69-72, 274-280:
 *   PATCH https://api.resend.com/contacts/{email}
 *   Body: { unsubscribed: boolean }
 * - Get Contact: https://resend.com/docs/api-reference/contacts/get-contact
 *   Doc lines 49-57, 207-209:
 *   GET https://api.resend.com/contacts/{email}
 * - Audience to Segments Migration: https://resend.com/docs/dashboard/segments/migrating-from-audiences-to-segments
 *   Doc lines 13-17:
 *   "Contacts are now independent of the groups they belong to, and the former Audiences are now called Segments.
 *    A Contact can be in zero, one or multiple Segments... The Audiences API is now deprecated and will be removed in the future."
 */

export interface ResendContact {
  object: 'contact';
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at?: string;
  unsubscribed: boolean;
}

export interface ContactOperationResult {
  success: boolean;
  id?: string;
  mock?: boolean;
}

/**
 * Retrieves a contact by email using GET /contacts/{email}.
 * Returns null if the contact is not found (HTTP 404).
 */
export async function getContact(email: string, apiKey: string): Promise<ResendContact | null> {
  if (!apiKey || apiKey === 're_123456789' || !apiKey.startsWith('re_')) {
    return null;
  }

  const cleanEmail = email.toLowerCase().trim();
  const res = await fetch(`https://api.resend.com/contacts/${encodeURIComponent(cleanEmail)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Resend getContact failed (${res.status}): ${errText}`);
  }

  return (await res.json()) as ResendContact;
}

/**
 * Creates a global contact using POST /contacts.
 * If segmentId is provided (from RESEND_AUDIENCE_ID), attaches it via segments: [{ id }].
 */
export async function addContact(
  email: string,
  apiKey: string,
  segmentId?: string
): Promise<ContactOperationResult> {
  if (!apiKey || apiKey === 're_123456789' || !apiKey.startsWith('re_')) {
    return { success: true, mock: true };
  }

  const cleanEmail = email.toLowerCase().trim();
  const body: Record<string, unknown> = {
    email: cleanEmail,
    unsubscribed: false,
  };

  if (segmentId && segmentId.trim()) {
    body.segments = [{ id: segmentId.trim() }];
  }

  const res = await fetch('https://api.resend.com/contacts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Resend addContact failed (${res.status}): ${errText}`);
  }

  const data = (await res.json().catch(() => ({}))) as { id?: string };
  return { success: true, id: data.id };
}

/**
 * Updates a contact's subscription status using PATCH /contacts/{email}.
 */
export async function setUnsubscribed(
  email: string,
  unsubscribed: boolean,
  apiKey: string
): Promise<ContactOperationResult> {
  if (!apiKey || apiKey === 're_123456789' || !apiKey.startsWith('re_')) {
    return { success: true, mock: true };
  }

  const cleanEmail = email.toLowerCase().trim();
  const res = await fetch(`https://api.resend.com/contacts/${encodeURIComponent(cleanEmail)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      unsubscribed,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Resend setUnsubscribed failed (${res.status}): ${errText}`);
  }

  const data = (await res.json().catch(() => ({}))) as { id?: string };
  return { success: true, id: data.id };
}
