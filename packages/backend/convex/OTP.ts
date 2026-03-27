import { Email } from "@convex-dev/auth/providers/Email";

export const ConsoleOTP = Email({
  id: "console-otp",
  maxAge: 60 * 15, // 15 minutes
  async generateVerificationToken() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },
  async sendVerificationRequest({ identifier: email, token }) {
    console.log(`\n========================================`);
    console.log(`  OTP for ${email}: ${token}`);
    console.log(`========================================\n`);
  },
});
