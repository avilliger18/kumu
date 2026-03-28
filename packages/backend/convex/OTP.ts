import { Email } from "@convex-dev/auth/providers/Email";
import { Resend } from "resend";

export const ResendOTP = Email({
  id: "resend-otp",
  maxAge: 60 * 15,
  async generateVerificationToken() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },
  async sendVerificationRequest({ identifier: email, token }) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from =
      process.env.AUTH_EMAIL_FROM ?? "Kumu <onboarding@resend.dev>";

    const { error } = await resend.emails.send({
      from,
      to: email,
      subject: `Your Kumu sign-in code: ${token}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
          <h2 style="margin:0 0 8px;font-size:24px;color:#0f172a">Your sign-in code</h2>
          <p style="margin:0 0 24px;color:#64748b;font-size:15px">
            Use the code below to sign in to Kumu. It expires in 15 minutes.
          </p>
          <div style="background:#f1f5f9;border-radius:12px;padding:24px;text-align:center;letter-spacing:8px;font-size:36px;font-weight:700;color:#0f172a">
            ${token}
          </div>
          <p style="margin:24px 0 0;color:#94a3b8;font-size:13px">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      throw new Error(`Failed to send OTP email: ${error.message}`);
    }
  },
});
