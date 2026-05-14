import { createAuthClient } from "better-auth/client";
import {
  inferAdditionalFields,
  phoneNumberClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000",
  basePath: "/api/v1/auth",
  plugins: [
    phoneNumberClient(),
    inferAdditionalFields({
      user: {
        userType: {
          type: "string" as const, // "individual" | "company"
        },
        platformRole: {
          type: "string" as const, // "superadmin" | null
        },
        isOnboarded: {
          type: "boolean" as const,
        },
        plan: {
          type: "string" as const, // "starter" | "pro" | "business"
        },
        phoneNumber: {
          type: "string" as const,
        },
        phoneNumberVerified: {
          type: "boolean" as const,
        },
        image: {
          type: "string" as const,
        },
      },
    }),
  ],
});

export type AuthSession = typeof authClient.$Infer.Session;
export type AuthUser = AuthSession["user"];

export type UserPlan = "starter" | "pro" | "business";
export type UserType = "individual" | "company";
export type PlatformRole = "superadmin" | null;
export type StoreRole = "owner" | "cofounder" | "manager" | "cashier";
