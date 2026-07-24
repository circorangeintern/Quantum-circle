import { randomBytes } from "crypto";

// Use unambiguous characters (no 0, O, I, l, etc.)
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Natively generates a secure unique key mapping characters
 */
function nativeCustomAlphabet(length: number): string {
  const bytes = randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += alphabet[bytes[i] % alphabet.length];
  }
  return result;
}

/**
 * Generates a unique reference code for reports
 * Format: XXXX-XXXX (e.g., "AB3D-KL9M")
 */
export function generateReferenceCode(): string {
  const raw = nativeCustomAlphabet(8);
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
}

/**
 * Validates reference code format
 */
export function isValidReferenceCode(code: string): boolean {
  const cleanCode = code.trim().toUpperCase();
  return /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(cleanCode);
}

/**
 * Normalizes reference code for storage and comparison
 */
export function normalizeReferenceCode(code: string): string {
  return code.trim().toUpperCase();
}

/**
 * Generates a masked reference code for dashboard display
 */
export function maskReferenceCode(code: string): string {
  const cleanCode = normalizeReferenceCode(code);
  const parts = cleanCode.split("-");
  if (parts.length !== 2) return "****-****";
  return `${parts[0].slice(0, 4)}-****`;
}
