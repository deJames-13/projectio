import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { hashPassword } from "~/server/auth/password";
import { initializeUserWorkspace } from "~/server/db/workspace";

const DEFAULT_AVATARS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBPiBHbzlRcYg-VzCqa9abHJPIL9BG3hsGjYrg1YuEcxLAvZq_28HBmgi_vVLY6LXX7ZLaii2TP2mN0ONbeRSEH2c_Ibxi5ywHFNR7lVUkiKau_ETuEQldb9XY_n-cmgh6J8dkSEkOfWl_rc3FR_aARvAIKhgC0Yn2AH8nQGjbcdI-uqCEYXbZcXPFET1BithmzsIN6cfFU0OX4wNbW_8_sJ44MN0imLRt2A1p_RKkP2z0-H1SMUwtl",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBPRaCZjyTjXGZN-LtF6i2zjJyo-hQurV8V86jZjrUHN4RwX99lEKcgWm-ikVAXt0gdZ3mi-IMADFyW5IrhVTeSAn7iOiN0D2GlhA-8rCRjPMcj4nWuAUreTvBlIlwrx5puRG9lV_LbQqqerNCF1JYYBY5ghI-iNMJJ3cdqfdKtjnVxdGt4tUd0vB3ypV7-djVro8dtUKK2O-6DtmFtRh74aG35viKJ99kn6YsLOaXaYrJUh163mfq-",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAOlcPu714ktL5corKfoeN-BlKIJTulowIOefZ6Jb09k_hJ0fNrKtxZVA3c1zZu-fpGR-PCfqWcWeqDme84PDddi89uFlOBsgUkV-OI6KZ0CDjE7DvvFlE5v-H-4LjoKAzrpfXDJR2ikTdrTAUbUBKR3XJ-9njSvZv8LwlGssSHALCh__Y71OPo8kbtdrl7P8pocQkPINzJAARehFRq1zp0vkhuQJ_RWdPLh5hRhMkrXqK780GkbrOm",
];

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      name?: string;
      username?: string;
      email?: string;
      password?: string;
      otp?: string;
    };
    const { name, username, email, password, otp } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await db.user.findUnique({ 
      where: { email: normalizedEmail },
      include: { accounts: true },
    });

    if (existing) {
      const providers = existing.accounts.map((a) => a.provider);
      if (existing.password) providers.push("credentials");
      const conflictMsg = providers.length > 0
        ? `User with this email is already signed in with another provider (${providers.join(", ")}).`
        : "An account with this email already exists";
      return NextResponse.json({ error: conflictMsg }, { status: 409 });
    }

    // Username validation and conflict prevention
    let cleanUsername = (username ?? "").toLowerCase().trim().replace(/^@/, "");
    if (!cleanUsername) {
      cleanUsername = (name || email.split("@")[0] || "user")
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "")
        .slice(0, 15) || "user";
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

    // Require and verify OTP code
    if (!otp) {
      return NextResponse.json({ error: "Verification code is required" }, { status: 400 });
    }

    const { verifyOtp, generateOtp } = await import("~/server/auth/otp");
    const isOtpValid = await verifyOtp(normalizedEmail, otp, "register");
    if (!isOtpValid) {
      return NextResponse.json(
        { error: "Invalid or expired verification code. Please request a new code." },
        { status: 400 }
      );
    }

    const randomAvatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)]!;
    const hashedPassword = hashPassword(password);

    const user = await db.user.create({
      data: {
        name: name.trim(),
        username: cleanUsername,
        email: normalizedEmail,
        password: hashedPassword,
        emailVerified: new Date(),
        role: "Product Lead",
        avatar: randomAvatar,
      },
    });

    const workspace = await initializeUserWorkspace(db, user);

    // Issue a short-lived login token so client can immediately authenticate
    const loginOtp = await generateOtp(normalizedEmail, "login");

    return NextResponse.json({
      success: true,
      loginOtp,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        workspaceId: workspace.id,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
