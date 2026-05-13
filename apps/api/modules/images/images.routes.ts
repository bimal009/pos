import { FastifyInstance } from "fastify";
import { requireAuth } from "../../hooks/auth.hook";
import { getImageKitAuthSign } from "./images.controller";

export default async function (fastify: FastifyInstance) {
  fastify.get("/sign", { preHandler: requireAuth }, getImageKitAuthSign);
}
