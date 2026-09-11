import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Hash a plain text password using cryptographic scrypt with salt.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a plain text password against a stored salt:hash string.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, originalHash] = storedHash.split(":");
    if (!salt || !originalHash) return false;

    const originalBuffer = Buffer.from(originalHash, "hex");
    const testBuffer = scryptSync(password, salt, 64);

    return timingSafeEqual(originalBuffer, testBuffer);
  } catch {
    return false;
  }
}
