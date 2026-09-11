import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.EMAIL_FROM ?? "Projectio <onboarding@resend.dev>";

export interface SendOtpResult {
  success: boolean;
  messageId?: string;
  error?: string;
  devMode?: boolean;
  code?: string;
}

/**
 * Sends a 6-digit verification code to the recipient via Resend.
 * In development or when RESEND_API_KEY is not configured, it safely logs
 * the OTP to the console so authentication is never blocked during testing.
 */
export async function sendOtpEmail(
  email: string,
  otpCode: string,
  purpose: "login" | "register" = "login"
): Promise<SendOtpResult> {
  const isDev = process.env.NODE_ENV !== "production" || !resend;

  if (isDev) {
    console.log(`
┌──────────────────────────────────────────────────────────┐
│ 📧 [PROJECTIO AUTH EMAIL SERVICE]                        │
│ To:      ${email.padEnd(46)}│
│ Purpose: ${purpose.toUpperCase().padEnd(46)}│
│ OTP:     ${otpCode.padEnd(46)}│
│ Expires: 10 minutes                                      │
└──────────────────────────────────────────────────────────┘
`);
  }

  if (!resend) {
    // If Resend API key is not provided yet, treat as dev fallback
    return {
      success: true,
      devMode: true,
      code: otpCode,
    };
  }

  const actionText = purpose === "register" ? "complete your registration" : "sign in to your workspace";

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `${otpCode} is your Projectio verification code`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verification Code</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px; color: #0f172a;">
            <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 36px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);">
              <div style="display: flex; align-items: center; margin-bottom: 24px;">
                <div style="width: 36px; height: 36px; background-color: #2563eb; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; color: #ffffff; font-weight: bold; font-size: 18px; text-align: center; line-height: 36px;">
                  P
                </div>
                <span style="font-size: 18px; font-weight: 700; margin-left: 10px; color: #0f172a; vertical-align: middle;">Projectio</span>
              </div>
              
              <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">Verification Code</h1>
              <p style="font-size: 14px; color: #475569; line-height: 1.5; margin: 0 0 24px 0;">
                Please use the following single-use verification code to ${actionText}:
              </p>
              
              <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1e293b; display: inline-block;">
                  ${otpCode}
                </span>
              </div>
              
              <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0 0 24px 0;">
                This code will expire in <strong>10 minutes</strong>. If you did not request this code, please ignore this email or reach out to support.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                Projectio Workspace Security • Automated notification
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend delivery error:", error);
      return {
        success: false,
        error: error.message,
        devMode: isDev,
        code: isDev ? otpCode : undefined,
      };
    }

    return {
      success: true,
      messageId: data?.id,
      devMode: isDev,
      code: isDev ? otpCode : undefined,
    };
  } catch (err: unknown) {
    console.error("Error sending OTP email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to dispatch email",
      devMode: isDev,
      code: isDev ? otpCode : undefined,
    };
  }
}
