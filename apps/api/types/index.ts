import { auth } from "../plugins/auth";

declare module "fastify" {
  interface FastifyRequest {
    session: Awaited<ReturnType<typeof auth.api.getSession>>;
  }
}
