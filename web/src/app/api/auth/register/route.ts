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
    const body = (await req.json()) as { name?: string; email?: string; password?: string };
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const randomAvatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)]!;
    const hashedPassword = hashPassword(password);

    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "Product Lead",
        avatar: randomAvatar,
      },
    });

    const workspace = await initializeUserWorkspace(db, user);

    return NextResponse.json({
      success: true,
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
