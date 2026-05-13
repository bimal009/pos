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
        role: {
          type: "string",
        },
        isOnboarded: {
          type: "boolean",
        },
        plan: {
          type: "string",
        },
      },
    }),
  ],
});

/** Session + user shape from this client (includes `inferAdditionalFields` on user). */
export type AuthSession = typeof authClient.$Infer.Session;
