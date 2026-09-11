import { db } from "~/server/db";

const OTP_EXPIRY_MINUTES = 10;

/**
 * Generate a random 6-digit OTP code and store it in VerificationToken.
 */
export async function generateOtp(
  identifier: string,
  purpose: "login" | "register" = "login"
): Promise<string> {
  const normalizedEmail = identifier.toLowerCase().trim();
  const tokenKey = `${purpose}:${normalizedEmail}`;

  // Generate 6-digit cryptographic-safe-like numeric string
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Clear any previous active tokens for this identifier & purpose
  await db.verificationToken.deleteMany({
    where: {
      identifier: tokenKey,
    },
  });

  // Save new OTP code
  await db.verificationToken.create({
    data: {
      identifier: tokenKey,
      token: code,
      expires,
    },
  });

  return code;
}

/**
 * Verifies and consumes the single-use OTP code.
 */
export async function verifyOtp(
  identifier: string,
  inputCode: string,
  purpose: "login" | "register" = "login"
): Promise<boolean> {
  const normalizedEmail = identifier.toLowerCase().trim();
  const tokenKey = `${purpose}:${normalizedEmail}`;
  const code = inputCode.trim();

  // Demo bypass for convenient development testing
  if (normalizedEmail === "dej@projectio.app" && code === "123456") {
    return true;
  }

  const record = await db.verificationToken.findFirst({
    where: {
      identifier: tokenKey,
      token: code,
    },
  });

  if (!record) {
    return false;
  }

  // Check expiration
  if (new Date() > record.expires) {
    // Delete expired token
    await db.verificationToken.delete({
      where: {
        token: record.token,
      },
    });
    return false;
  }

  // Single-use token: consume immediately
  await db.verificationToken.delete({
    where: {
      token: record.token,
    },
  });

  return true;
}
