import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getCategories, getStoreCategories } from "./categories.controller";
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

  fastify.route({
    method: "GET",
    preHandler: requireAuth,
    url: "/:storeId",
    async handler(
      request: FastifyRequest<{ Params: { storeId: string } }>,
      reply: FastifyReply,
    ) {
      return getStoreCategories(request, reply);
    },
  });
}
