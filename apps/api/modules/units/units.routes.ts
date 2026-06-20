import { FastifyInstance } from "fastify";
import { paginationSchema } from "../../common/validators/pagination.validators";
import { getUnitsHandler } from "./units.controller";
import {
  commonErrorResponses,
  paginatedResponse,
} from "../../common/schemas/responses";

const unitSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    nameNepali: { type: "string" },
    abbreviation: { type: "string" },
    isActive: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

export async function unitsRoutes(fastify: FastifyInstance) {
  fastify.get("/", {
    schema: {
      tags: ["Units"],
      summary: "List units of measurement",
      querystring: paginationSchema,
      response: {
        200: paginatedResponse({ type: "array", items: unitSchema }),
        ...commonErrorResponses,
      },
    },
    handler: getUnitsHandler,
  });
}
