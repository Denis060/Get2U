import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { Resend } from "resend";
import { prisma } from "./prisma";
import { env } from "./env";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BACKEND_URL,
  trustedOrigins: [
    "http://localhost:*",
    "http://127.0.0.1:*",
    "https://*.dev.vibecode.run",
    "https://*.vibecode.run",
    "https://*.vibecodeapp.com",
    "https://*.vibecode.dev",
    "https://vibecode.dev",
    "https://*.vercel.app",
    "https://get2uerrand.com",
    "https://www.get2uerrand.com",
    "https://*.loca.lt",
  ],
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        console.log(`[Resend] Dispatching OTP code ${otp} to ${email} (Type: ${type})`);
        
        const resend = new Resend(env.RESEND_API_KEY);
        await resend.emails.send({
          from: "ErrandGo <support@get2uerrand.com>",
          to: email,
          subject: "Your ErrandGo Login Code",
          html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; background-color: #f9f9f9; text-align: center;">
              <h2 style="color: #333;">Welcome to Get2U Errand!</h2>
              <p style="color: #666; font-size: 16px;">Here is your secure login code:</p>
              <div style="margin: 24px 0; background-color: #ffffff; padding: 16px; border-radius: 8px; display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #f97316;">
                ${otp}
              </div>
              <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
            </div>
          `,
        });
      },
    }),
  ],
  advanced: {
    trustedProxyHeaders: true,
    disableCSRFCheck: true,
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      partitioned: true,
    },
  },
});
