import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { phoneNumber } from "better-auth/plugins";
import { db } from "./db";
import { env } from "../config/env";
import { session, account, verification } from "../modules/auth/auth.schema";
import { user } from "../modules/user/user.schema";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/api/v1/auth",
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
        returned: true,
      },
      isOnboarded: {
        type: "boolean",
        input: true,
        returned: true,
      },
      plan: {
        type: "string",
        input: false,
        returned: true,
      },
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  advanced: {
    disableCSRFCheck: true,
  },
  rateLimit: {
    window: 60,
    max: 5,
  },

  plugins: [
    phoneNumber({
      sendOTP: ({ phoneNumber, code }) => {
        console.log(`OTP ${code} → ${phoneNumber}`);
      },

      otpLength: 6,
      expiresIn: 300,
      requireVerification: true,
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => `${phoneNumber}@pos.forgefsm.com`,
        getTempName: (phoneNumber) => phoneNumber,
      },
    }),
  ],

  logger: {
    level: "debug",
  },
  trustedOrigins: ["http://localhost:3000", "myapp://"],
});
