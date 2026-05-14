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
      userType: {
        type: "string", // "individual" | "company"
        input: true,
        returned: true,
      },
      platformRole: {
        type: "string", // "superadmin" | null
        input: false,
        returned: true,
      },

      // Onboarding & plan
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

      phoneNumber: {
        type: "string",
        input: true,
        returned: true,
      },
      phoneNumberVerified: {
        type: "boolean",
        input: false,
        returned: true,
      },
      image: {
        type: "string",
        input: true,
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
      sendOTP: async ({ phoneNumber, code }) => {
        // TODO: replace with Sparrow SMS in production
        console.log(`OTP ${code} → ${phoneNumber}`);

        // Production:
        // await sparrowSms.send({
        //   to: phoneNumber,
        //   message: `Tapako SME POS verification code: ${code}. 5 minutema expire huncha.`,
        // });
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
    level: env.NODE_ENV === "production" ? "error" : "debug",
  },
  trustedOrigins: [
    "http://localhost:3000", // web dev
    "http://localhost:8081", // expo dev
    "myapp://", // expo deep link
    // env.WEB_APP_URL, // production web
    // env.MOBILE_APP_URL, // production mobile deep link
  ],
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
