import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getCategories, getStoreCategories } from "./categories.controller";
import { requireAuth } from "../../hooks/auth.hook";
import {
  commonErrorResponses,
  successResponse,
} from "../../common/schemas/responses";

const categorySchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    description: { type: "string" },
    icon: { type: "string" },
    isActive: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: "GET",
    preHandler: requireAuth,
    url: "/",
    schema: {
      tags: ["Categories"],
      summary: "List all categories",
      security: [{ bearerAuth: [] }],
      response: {
        200: successResponse({ type: "array", items: categorySchema }),
        ...commonErrorResponses,
      },
    },
    async handler(request, reply) {
      return getCategories(request, reply);
    },
  });

  fastify.route({
    method: "GET",
    preHandler: requireAuth,
    url: "/:storeId",
    schema: {
      tags: ["Categories"],
      summary: "List categories for a store",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        required: ["storeId"],
        properties: {
          storeId: { type: "string", description: "Store ID" },
        },
      },
      response: {
        200: successResponse({ type: "array", items: categorySchema }),
        ...commonErrorResponses,
      },
    },
    async handler(
      request: FastifyRequest<{ Params: { storeId: string } }>,
      reply: FastifyReply,
    ) {
      return getStoreCategories(request, reply);
    },
  });
}
