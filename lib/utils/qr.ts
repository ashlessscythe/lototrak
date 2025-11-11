import { nanoid } from "nanoid";

/**
 * Validate QR code format
 * QR code should be alphanumeric and reasonable length (4-16 chars for better readability)
 */
export function isValidQRCode(code: string): boolean {
  return /^[a-zA-Z0-9_-]{4,16}$/.test(code);
}

/**
 * Generate a new QR code
 */
export function generateQRCode(length: number = 14): string {
  return nanoid(length);
}

