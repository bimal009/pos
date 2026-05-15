import { FastifyInstance } from "fastify";
import { getCategories } from "./categories.controller";
import { requireAuth } from "../../hooks/auth.hook";

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: "GET",
    preHandler: requireAuth,
    url: "/",
    async handler(request, reply) {
      return getCategories(request, reply);
    },
  });
}
