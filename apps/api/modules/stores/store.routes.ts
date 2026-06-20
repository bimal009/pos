import { FastifyInstance } from "fastify";
import { requireAuth } from "../../hooks/auth.hook";
import { createStore, getStores } from "./store.controller";
import { CreateStoreBody } from "./store.interfaces";
import { createStoreJsonSchema } from "./store.validators";
import {
  commonErrorResponses,
  createdResponse,
  successResponse,
} from "../../common/schemas/responses";

const storeSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    description: { type: "string" },
    phone: { type: "string" },
    address: { type: "string" },
    logo: { type: "string" },
    isActive: { type: "boolean" },
    ownerId: { type: "string" },
    taxType: { type: "string", enum: ["none", "pan", "vat"] },
    taxNumber: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: CreateStoreBody }>(
    "/",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["Stores"],
        summary: "Create a new store",
        security: [{ bearerAuth: [] }],
        body: createStoreJsonSchema,
        response: {
          201: createdResponse({ type: "string", description: "New store ID" }),
          ...commonErrorResponses,
        },
      },
    },
    createStore,
  );

  fastify.get(
    "/",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["Stores"],
        summary: "List stores for the authenticated user",
        security: [{ bearerAuth: [] }],
        response: {
          200: successResponse({ type: "array", items: storeSchema }),
          ...commonErrorResponses,
        },
      },
    },
    getStores,
  );
}
