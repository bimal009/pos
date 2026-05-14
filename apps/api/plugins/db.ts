import fp from "fastify-plugin";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { env } from "../config/env";
import * as schema from "../schema";

const pool = new Pool({ connectionString: env.DATABASE_URL });
export const db = drizzle(pool, { schema });

declare module "fastify" {
  interface FastifyInstance {
    db: typeof db;
  }
}

export default fp(async (fastify) => {
  fastify.decorate("db", db);
});
