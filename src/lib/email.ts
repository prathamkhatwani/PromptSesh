import nodemailer from "nodemailer";
import { Resend } from "resend";

export interface SendPasswordResetEmailParams {
  to: string;
  resetUrl: string;
}

/**
 * Sends a transactional Password Reset Email.
 * 
 * Supports:
 * 1. Resend API (via RESEND_API_KEY)
 * 2. SMTP / Gmail / Brevo / Custom SMTP (via SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM)
 * 3. Ethereal Email (Auto test account for local development when credentials are not configured)
 */
export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: SendPasswordResetEmailParams): Promise<{ success: boolean; previewUrl?: string | false; provider: string }> {
  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_FROM || "PromptSesh <security@promptsesh.com>";

  // ──────────────── 1. Resend API Provider ────────────────
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const res = await resend.emails.send({
        from: fromEmail,
        to: [to],
        subject: "Reset your PromptSesh password",
        html: getPasswordResetHtml(resetUrl, to),
      });

      if (res.error) {
        console.error("[EMAIL] Resend error:", res.error);
        throw new Error(res.error.message);
      }

      console.log(`[EMAIL] Password reset sent to ${to} via Resend.`);
      return { success: true, provider: "resend" };
    } catch (err) {
      console.error("[EMAIL] Failed sending via Resend, attempting SMTP fallback:", (err as Error).message);
    }
  }

  // ──────────────── 2. SMTP Provider (Gmail, Brevo, SendGrid, SES, etc.) ────────────────
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: fromEmail,
        to,
        subject: "Reset your PromptSesh password",
        html: getPasswordResetHtml(resetUrl, to),
        text: `Reset your PromptSesh password by visiting this link: ${resetUrl}\n\nThis link will expire in 1 hour. If you didn't request this, please ignore this email.`,
      });

      console.log(`[EMAIL] Password reset sent to ${to} via SMTP (MessageId: ${info.messageId}).`);
      return { success: true, provider: "smtp" };
    } catch (err) {
      console.error("[EMAIL] Failed sending via SMTP:", (err as Error).message);
      throw err;
    }
  }

  // ──────────────── 3. Development Fallback (Nodemailer Ethereal / Console) ────────────────
  try {
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await testTransporter.sendMail({
      from: fromEmail,
      to,
      subject: "Reset your PromptSesh password",
      html: getPasswordResetHtml(resetUrl, to),
      text: `Reset your PromptSesh password: ${resetUrl}`,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[EMAIL][DEV] Email dispatched for ${to}!`);
    console.log(`[EMAIL][DEV] Reset link: ${resetUrl}`);
    if (previewUrl) {
      console.log(`[EMAIL][DEV] Ethereal Web Mail Preview: ${previewUrl}`);
    }

    return { success: true, previewUrl, provider: "ethereal-dev" };
  } catch (err) {
    console.log(`[EMAIL][DEV-FALLBACK] Password reset for ${to}: ${resetUrl}`);
    return { success: true, provider: "console-fallback" };
  }
}

function getPasswordResetHtml(resetUrl: string, userEmail: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your PromptSesh password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #030712; color: #f9fafb; margin: 0; padding: 40px 20px;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="100%" max-width="560px" style="max-width: 560px; background-color: #0b1329; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 36px; text-align: left;" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding-bottom: 24px;">
              <span style="font-size: 22px; font-weight: 800; color: #00f0ff; letter-spacing: -0.5px;">Prompt<span style="color: #ffffff;">Sesh</span></span>
            </td>
          </tr>
          <tr>
            <td style="color: #ffffff; font-size: 20px; font-weight: 700; padding-bottom: 12px;">
              Password Reset Request
            </td>
          </tr>
          <tr>
            <td style="color: #94a3b8; font-size: 14px; line-height: 1.6; padding-bottom: 24px;">
              We received a request to reset the password for your PromptSesh account (<strong style="color: #e2e8f0;">${userEmail}</strong>). Click the button below to set a new password:
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 28px;">
              <a href="${resetUrl}" target="_blank" style="display: inline-block; background-color: #00f0ff; color: #030712; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 10px;">
                Reset Password &rarr;
              </a>
            </td>
          </tr>
          <tr>
            <td style="color: #64748b; font-size: 12px; line-height: 1.5; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px;">
              If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.<br><br>
              This link will expire in <strong>1 hour</strong>.<br><br>
              Button not working? Copy and paste this URL into your browser:<br>
              <a href="${resetUrl}" style="color: #00f0ff; word-break: break-all;">${resetUrl}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
