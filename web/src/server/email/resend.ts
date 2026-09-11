import { Resend } from "resend";
import fs from "node:fs";
import path from "node:path";

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

export interface RenderOtpEmailOptions {
  email: string;
  otpCode: string;
  purpose?: "login" | "register";
  logoSrc?: string;
}

let cachedLogoBuffer: Buffer | null = null;

/**
 * Lazily loads and caches the title-light-500.png buffer for inline CID attachment.
 */
function getTitleLogoBuffer(): Buffer | null {
  if (cachedLogoBuffer) return cachedLogoBuffer;
  try {
    const logoPath = path.join(process.cwd(), "public", "images", "title-light-500.png");
    if (fs.existsSync(logoPath)) {
      cachedLogoBuffer = fs.readFileSync(logoPath);
      return cachedLogoBuffer;
    }
  } catch (err) {
    console.warn("[resend] Notice: Could not read title-light-500.png for CID embedding:", err);
  }
  return null;
}

/**
 * Generates an elegant, dark-mode email HTML template matching the Projectio landing page aesthetic
 * with React Bits volumetric Light Rays and the official title logo.
 */
export function renderOtpEmailHtml(options: RenderOtpEmailOptions): string {
  const { email, otpCode, purpose = "login" } = options;
  const logoBuffer = getTitleLogoBuffer();

  const logoSrc =
    options.logoSrc ??
    (logoBuffer
      ? "cid:projectio-title-logo"
      : process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/images/title-light-500.png`
        : "/images/title-light-500.png");

  const actionText =
    purpose === "register" ? "complete your workspace registration" : "sign in to your workspace";
  const actionBadge = purpose === "register" ? "WORKSPACE REGISTRATION" : "ACCOUNT AUTHENTICATION";

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="dark" />
    <meta name="supported-color-schemes" content="dark" />
    <title>${otpCode} is your Projectio verification code</title>
    <!--[if mso]>
    <noscript>
      <xml>
        <o:OfficeDocumentSettings>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    </noscript>
    <![endif]-->
    <style type="text/css">
      :root {
        color-scheme: dark;
        supported-color-schemes: dark;
      }
      body, table, td, a {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      table, td {
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
      img {
        -ms-interpolation-mode: bicubic;
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
      }
      table {
        border-collapse: collapse !important;
      }
      body {
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        background-color: #080C14;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }
      @media only screen and (max-width: 600px) {
        .email-card {
          width: 100% !important;
          max-width: 100% !important;
          border-radius: 0 !important;
          border-left: 0 !important;
          border-right: 0 !important;
        }
        .content-padding {
          padding-left: 20px !important;
          padding-right: 20px !important;
        }
        .code-display {
          font-size: 32px !important;
          letter-spacing: 6px !important;
        }
      }
    </style>
  </head>
  <body style="background-color: #080C14; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; word-spacing: normal;">
    <!-- Hidden Preheader for Inbox Preview -->
    <div style="display: none; font-size: 1px; color: #080C14; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
      Your Projectio verification code is ${otpCode}. Valid for 10 minutes to ${actionText}.
      &#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;
    </div>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #080C14;">
      <tr>
        <td align="center" style="padding: 40px 12px;">
          <!--[if (gte mso 9)|(IE)]>
          <table align="center" border="0" cellspacing="0" cellpadding="0" width="540">
          <tr>
          <td align="center" valign="top" width="540">
          <![endif]-->

          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-card" style="max-width: 540px; background-color: #0F172A; border: 1px solid #1E293B; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 48px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(59, 130, 246, 0.15);">
            
            <!-- REACT BITS LIGHT RAYS HEADER WITH TITLE LOGO -->
            <tr>
              <td align="center" style="background-color: #0A0F1D; background: radial-gradient(ellipse 70% 90px at 50% 0%, rgba(59, 130, 246, 0.42), rgba(30, 58, 138, 0.18) 50%, transparent 80%), #0A0F1D; padding: 0; text-align: center; border-bottom: 1px solid rgba(59, 130, 246, 0.2);">
                
                <!-- Volumetric Light Rays (React Bits Inspired SVG Beams) -->
                <div style="width: 100%; max-width: 540px; margin: 0 auto; overflow: hidden;">
                  <svg width="100%" height="150" viewBox="0 0 540 150" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block; width: 100%; height: auto; margin: 0 auto;">
                    <defs>
                      <!-- Radiant Core Glow at Ray Origin -->
                      <radialGradient id="rayOriginGlow" cx="50%" cy="0%" r="65%">
                        <stop offset="0%" stop-color="#bfdbfe" stop-opacity="0.95" />
                        <stop offset="20%" stop-color="#60a5fa" stop-opacity="0.75" />
                        <stop offset="45%" stop-color="#2563eb" stop-opacity="0.4" />
                        <stop offset="75%" stop-color="#1e3a8a" stop-opacity="0.15" />
                        <stop offset="100%" stop-color="#0a0f1d" stop-opacity="0" />
                      </radialGradient>
                      
                      <!-- Center Intense Volumetric Beam -->
                      <linearGradient id="centerBeam" x1="50%" y1="0%" x2="50%" y2="100%">
                        <stop offset="0%" stop-color="#dbeafe" stop-opacity="0.8" />
                        <stop offset="35%" stop-color="#60a5fa" stop-opacity="0.45" />
                        <stop offset="70%" stop-color="#3b82f6" stop-opacity="0.2" />
                        <stop offset="100%" stop-color="#1d4ed8" stop-opacity="0" />
                      </linearGradient>

                      <!-- Lateral Beams -->
                      <linearGradient id="lateralBeam1" x1="50%" y1="0%" x2="50%" y2="100%">
                        <stop offset="0%" stop-color="#93c5fd" stop-opacity="0.65" />
                        <stop offset="45%" stop-color="#3b82f6" stop-opacity="0.3" />
                        <stop offset="100%" stop-color="#1e40af" stop-opacity="0" />
                      </linearGradient>

                      <!-- Wide Ambient Beams -->
                      <linearGradient id="lateralBeam2" x1="50%" y1="0%" x2="50%" y2="100%">
                        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.5" />
                        <stop offset="55%" stop-color="#0284c7" stop-opacity="0.2" />
                        <stop offset="100%" stop-color="#0369a1" stop-opacity="0" />
                      </linearGradient>

                      <!-- Horizon Accent Hairline -->
                      <linearGradient id="horizonGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#3b82f6" stop-opacity="0" />
                        <stop offset="25%" stop-color="#3b82f6" stop-opacity="0.3" />
                        <stop offset="50%" stop-color="#93c5fd" stop-opacity="0.85" />
                        <stop offset="75%" stop-color="#3b82f6" stop-opacity="0.3" />
                        <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
                      </linearGradient>
                    </defs>

                    <!-- Background Base Tone -->
                    <rect width="540" height="150" fill="#0A0F1D" />

                    <!-- Broad Light Cone Diffusion -->
                    <polygon points="250,0 290,0 520,150 20,150" fill="url(#lateralBeam1)" opacity="0.35" />

                    <!-- Volumetric Fan Beams -->
                    <polygon points="266,0 274,0 292,150 248,150" fill="url(#centerBeam)" opacity="0.9" />
                    <polygon points="267,0 273,0 208,150 176,150" fill="url(#lateralBeam1)" opacity="0.75" />
                    <polygon points="267,0 273,0 364,150 332,150" fill="url(#lateralBeam1)" opacity="0.75" />
                    <polygon points="268,0 272,0 128,150 88,150" fill="url(#lateralBeam2)" opacity="0.6" />
                    <polygon points="268,0 272,0 452,150 412,150" fill="url(#lateralBeam2)" opacity="0.6" />
                    <polygon points="269,0 271,0 48,150 8,150" fill="url(#lateralBeam2)" opacity="0.35" />
                    <polygon points="269,0 271,0 532,150 492,150" fill="url(#lateralBeam2)" opacity="0.35" />

                    <!-- Radiant Bloom Apex -->
                    <ellipse cx="270" cy="0" rx="160" ry="70" fill="url(#rayOriginGlow)" />
                    <ellipse cx="270" cy="0" rx="75" ry="32" fill="#ffffff" opacity="0.35" />

                    <!-- Horizon Accent Line -->
                    <line x1="50" y1="149" x2="490" y2="149" stroke="url(#horizonGlow)" stroke-width="1" />
                  </svg>
                </div>

                <!-- TITLE LOGO & SECURITY PILL (Under Light Rays) -->
                <div style="padding: 12px 20px 24px 20px; text-align: center;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center">
                        <img
                          src="${logoSrc}"
                          alt="Projectio"
                          width="142"
                          height="44"
                          style="display: block; width: 142px; height: auto; max-height: 44px; margin: 0 auto; border: 0; outline: none; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-top: 14px;">
                        <!-- Security Telemetry Pill -->
                        <div style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background-color: rgba(37, 99, 235, 0.15); border: 1px solid rgba(59, 130, 246, 0.35); text-align: center;">
                          <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 600; color: #93c5fd; letter-spacing: 0.6px; text-transform: uppercase;">
                            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #38bdf8; margin-right: 6px; vertical-align: middle;"></span>
                            AUTHENTICATION TELEMETRY · SINGLE-USE
                          </span>
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>

              </td>
            </tr>

            <!-- MAIN BODY CONTENT -->
            <tr>
              <td class="content-padding" style="padding: 32px 36px 36px 36px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center" style="padding-bottom: 8px;">
                      <h1 style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 22px; font-weight: 700; color: #f8fafc; letter-spacing: -0.5px;">
                        Verification Code
                      </h1>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-bottom: 28px;">
                      <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #94a3b8; max-width: 440px;">
                        Please enter the single-use verification code below to ${actionText}. This security credential expires in 10 minutes.
                      </p>
                    </td>
                  </tr>

                  <!-- OTP DISPLAY PANEL (Terminal Telemetry Box) -->
                  <tr>
                    <td align="center" style="padding-bottom: 24px;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 440px; background-color: #070B14; border: 1px solid rgba(59, 130, 246, 0.35); border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06);">
                        <tr>
                          <td align="center" style="padding: 24px 16px;">
                            <div class="code-display" style="font-family: 'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #60a5fa; text-shadow: 0 0 18px rgba(59, 130, 246, 0.45); line-height: 1.2; text-align: center; margin-left: 10px;">
                              ${otpCode}
                            </div>
                            <div style="margin-top: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #64748b; text-align: center;">
                              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #f59e0b; margin-right: 6px; vertical-align: middle;"></span>
                              Expires in <strong style="color: #cbd5e1; font-weight: 600;">10 minutes</strong> · Do not share this code
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- AUDIT METADATA CARD -->
                  <tr>
                    <td align="center" style="padding-bottom: 20px;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0B1120; border: 1px solid #1E293B; border-radius: 8px; padding: 12px 16px;">
                        <tr>
                          <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #64748b; padding: 4px 0;">
                            Target Account:
                          </td>
                          <td align="right" style="font-family: 'SF Mono', Consolas, monospace; font-size: 12px; color: #cbd5e1; padding: 4px 0; font-weight: 500;">
                            ${email}
                          </td>
                        </tr>
                        <tr>
                          <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #64748b; padding: 4px 0;">
                            Action Scope:
                          </td>
                          <td align="right" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #cbd5e1; padding: 4px 0; font-weight: 500;">
                            ${actionBadge}
                          </td>
                        </tr>
                        <tr>
                          <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #64748b; padding: 4px 0;">
                            Security Protocol:
                          </td>
                          <td align="right" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #34d399; padding: 4px 0; font-weight: 500;">
                            Encrypted Authentication Session
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- SECURITY NOTICE -->
                  <tr>
                    <td align="center" style="padding-bottom: 24px;">
                      <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; line-height: 1.5; color: #64748b; text-align: center;">
                        If you did not request this verification code, please ignore this email. No changes will be made to your account without this code.
                      </p>
                    </td>
                  </tr>

                  <!-- DIVIDER -->
                  <tr>
                    <td style="border-top: 1px solid #1E293B; padding-top: 24px;"></td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td align="center">
                      <p style="margin: 0 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #64748b; text-align: center;">
                        Projectio · High-velocity agile project management engineered for precision.
                      </p>
                      
                      <!-- Operational Status Pill (Exact match to LandingFooter) -->
                      <div style="text-align: center; margin-bottom: 12px;">
                        <span style="display: inline-block; padding: 3px 10px; border-radius: 6px; background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #34d399; font-weight: 500;">
                          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #10b981; margin-right: 6px; vertical-align: middle;"></span>
                          All Systems Operational (99.99%)
                        </span>
                      </div>

                      <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #475569; text-align: center;">
                        Projectio Workspace Security • Automated System Dispatch
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>

          </table>

          <!--[if (gte mso 9)|(IE)]>
          </td>
          </tr>
          </table>
          <![endif]-->
        </td>
      </tr>
    </table>
  </body>
</html>`;
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

  const actionText =
    purpose === "register" ? "complete your workspace registration" : "sign in to your workspace";
  const logoBuffer = getTitleLogoBuffer();

  const attachments = logoBuffer
    ? [
        {
          filename: "title-logo.png",
          content: logoBuffer,
          contentType: "image/png",
          contentId: "projectio-title-logo",
        },
      ]
    : undefined;

  const html = renderOtpEmailHtml({
    email,
    otpCode,
    purpose,
    logoSrc: logoBuffer ? "cid:projectio-title-logo" : undefined,
  });

  const text = `Projectio Verification Code: ${otpCode}\n\nUse this single-use code to ${actionText}.\nValid for 10 minutes.\n\nAccount: ${email}\nSecurity: Single-Use Encrypted Session\n\nIf you did not request this verification code, please ignore this email.`;

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `${otpCode} is your Projectio verification code`,
      html,
      text,
      attachments,
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
