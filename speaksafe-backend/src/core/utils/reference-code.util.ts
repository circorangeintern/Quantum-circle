import { customAlphabet } from "nanoid";

// Use unambiguous characters (no 0, O, I, l, etc.)
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const nanoid = customAlphabet(alphabet, 8);

/**
 * Generates a unique reference code for reports
 * Format: XXXX-XXXX (e.g., "AB3D-KL9M")
 * Collision probability: ~1 in 2.8 trillion
 */
export function generateReferenceCode(): string {
  const raw = nanoid();
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
 * Example: "AB3D-KL9M" -> "AB3D-****"
 */
export function maskReferenceCode(code: string): string {
  const cleanCode = normalizeReferenceCode(code);
  const parts = cleanCode.split("-");
  if (parts.length !== 2) return "****-****";
  return `${parts[0].slice(0, 4)}-****`;
}
