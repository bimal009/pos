import { FastifyInstance } from "fastify";
import { requireAuth } from "../../hooks/auth.hook";
import { getImageKitAuthSign } from "./images.controller";
import {
  commonErrorResponses,
  successResponse,
} from "../../common/schemas/responses";

export default async function (fastify: FastifyInstance) {
  fastify.get("/sign", {
    preHandler: requireAuth,
    schema: {
      tags: ["Images"],
      summary: "Get ImageKit authentication signature for client-side uploads",
      security: [{ bearerAuth: [] }],
      response: {
        200: successResponse({
          type: "object",
          properties: {
            token: { type: "string" },
            expire: { type: "integer" },
            signature: { type: "string" },
          },
        }),
        ...commonErrorResponses,
      },
    },
    handler: getImageKitAuthSign,
  });
}
