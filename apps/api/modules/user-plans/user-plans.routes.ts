import { FastifyInstance } from "fastify";
import { requireAuth } from "../../hooks/auth.hook";
import { getUserPlans } from "./user-plans.controller";
import {
  commonErrorResponses,
  successResponse,
} from "../../common/schemas/responses";

const userPlanSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    userId: { type: "string" },
    planId: { type: "string" },
    interval: { type: "string", enum: ["monthly", "yearly"] },
    status: {
      type: "string",
      enum: ["active", "expired", "cancelled", "grace_period"],
    },
    startedAt: { type: "string", format: "date-time" },
    expiresAt: { type: "string", format: "date-time" },
    cancelledAt: { type: "string", format: "date-time" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: ["GET"],
    preHandler: requireAuth,
    url: "/",
    schema: {
      tags: ["User Plans"],
      summary: "Get the subscription plans for the authenticated user",
      security: [{ bearerAuth: [] }],
      response: {
        200: successResponse({ type: "array", items: userPlanSchema }),
        ...commonErrorResponses,
      },
    },
    async handler(request, reply) {
      return getUserPlans(request, reply);
    },
  });
}
