import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { verifyPassword } from "~/server/auth/password";
import { generateOtp } from "~/server/auth/otp";
import { sendOtpEmail } from "~/server/email/resend";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      email?: string;
      password?: string;
      username?: string;
      type?: "login" | "register";
    };
    const { email, password, username, type = "login" } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (type === "login") {
      // Find the user
      const user = await db.user.findUnique({
        where: { email: normalizedEmail },
        include: { accounts: true },
      });

      if (!user) {
        return NextResponse.json(
          { error: "No account found with this email" },
          { status: 401 }
        );
      }

      // Check if user has a password set (might be OAuth-only)
      if (!user.password) {
        const providers = user.accounts.map((a) => a.provider);
        const providerName = providers.includes("discord")
          ? "Discord"
          : providers[0] ?? "social login";
        return NextResponse.json(
          {
            error: `User with this email is already signed in with another provider (${providerName}). Please sign in using ${providerName}.`,
          },
          { status: 400 }
        );
      }

      // Verify the provided password
      if (password) {
        const isPasswordValid = verifyPassword(password, user.password);
        if (!isPasswordValid) {
          return NextResponse.json(
            { error: "Invalid email or password" },
            { status: 401 }
          );
        }
      }

      // Generate & send OTP
      const otpCode = await generateOtp(normalizedEmail, "login");
      const emailResult = await sendOtpEmail(normalizedEmail, otpCode, "login");

      return NextResponse.json({
        success: true,
        message: "Verification code sent to your email",
        devCode: emailResult.devMode ? emailResult.code : undefined,
      });
    }

    if (type === "register") {
      // 1. Check if email already exists
      const existingUser = await db.user.findUnique({
        where: { email: normalizedEmail },
        include: { accounts: true },
      });

      if (existingUser) {
        const providers = existingUser.accounts.map((a) => a.provider);
        if (existingUser.password) providers.push("credentials");
        const conflictMsg = providers.length > 0
          ? `User with this email is already signed in with another provider (${providers.join(", ")}).`
          : "An account with this email already exists.";
        return NextResponse.json(
          { error: conflictMsg },
          { status: 409 }
        );
      }

      // 2. Check if username already exists
      if (username && typeof username === "string") {
        const cleanUsername = username.toLowerCase().trim().replace(/^@/, "");
        if (cleanUsername.length < 3) {
          return NextResponse.json(
            { error: "Username must be at least 3 characters" },
            { status: 400 }
          );
        }

        const existingUsername = await db.user.findFirst({
          where: { username: { equals: cleanUsername, mode: "insensitive" } },
        });

        if (existingUsername) {
          return NextResponse.json(
            { error: `Username '@${cleanUsername}' is already taken. Please choose another.` },
            { status: 409 }
          );
        }
      }

      // Generate & send OTP for registration
      const otpCode = await generateOtp(normalizedEmail, "register");
      const emailResult = await sendOtpEmail(normalizedEmail, otpCode, "register");

      return NextResponse.json({
        success: true,
        message: "Verification code sent to your email",
        devCode: emailResult.devMode ? emailResult.code : undefined,
      });
    }

    return NextResponse.json(
      { error: "Invalid authentication type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Failed to process OTP request:", error);
    return NextResponse.json(
      { error: "Failed to send verification code. Please try again." },
      { status: 500 }
    );
  }
}
