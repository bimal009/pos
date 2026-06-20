import { FastifyInstance } from "fastify";
import { paginationSchema } from "../../common/validators/pagination.validators";
import { getUnitsHandler } from "./units.controller";

export async function unitsRoutes(fastify: FastifyInstance) {
  fastify.get("/", {
    schema: { querystring: paginationSchema },
    handler: getUnitsHandler,
  });
}
