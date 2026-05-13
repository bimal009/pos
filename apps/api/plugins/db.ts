import fp from "fastify-plugin";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { env } from "../config/env";
import * as schema from "../schema";
const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema });

declare module "fastify" {
  interface FastifyInstance {
    db: typeof db;
  }
}

export default fp(async (fastify) => {
  fastify.decorate("db", db);
});
