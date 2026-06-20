import { onboardUserJsonSchema } from "./user.validators";
import { FastifyInstance } from "fastify";
import { requireAuth } from "../../hooks/auth.hook";
import { OnboardUserDto } from "./interfaces";
import { onboardUser } from "./user.controller";
import {
  commonErrorResponses,
  successResponse,
} from "../../common/schemas/responses";

const userSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    email: { type: "string", format: "email" },
    emailVerified: { type: "boolean" },
    phoneNumber: { type: "string" },
    phoneNumberVerified: { type: "boolean" },
    image: { type: "string" },
    userType: { type: "string", enum: ["individual", "company"] },
    platformRole: { type: "string", enum: ["superadmin", "user"] },
    isOnboarded: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

export default async function (fastify: FastifyInstance) {
  fastify.patch<{ Body: OnboardUserDto }>(
    "/onboard",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["Users"],
        summary: "Onboard the authenticated user with profile details",
        security: [{ bearerAuth: [] }],
        body: onboardUserJsonSchema,
        response: {
          200: successResponse(userSchema),
          ...commonErrorResponses,
        },
      },
    },
    onboardUser,
  );
}
