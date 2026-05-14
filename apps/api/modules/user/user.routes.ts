import { onboardUserJsonSchema } from "./user.validators";
import { FastifyInstance } from "fastify";
import { requireAuth } from "../../hooks/auth.hook";
import { OnboardUserDto } from "./interfaces";
import { onboardUser } from "./user.controller";

export default async function (fastify: FastifyInstance) {
  fastify.patch<{ Body: OnboardUserDto }>(
    "/onboard",
    {
      preHandler: requireAuth,
      schema: { body: onboardUserJsonSchema },
    },
    onboardUser,
  );
}
