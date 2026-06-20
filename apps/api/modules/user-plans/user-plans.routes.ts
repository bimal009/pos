import { FastifyInstance } from "fastify";
import { requireAuth } from "../../hooks/auth.hook";
import { getUserPlans } from "./user-plans.controller";

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: ["GET"],
    preHandler: requireAuth,
    url: "/",
    async handler(request, reply) {
      return getUserPlans(request, reply);
    },
  });
}
