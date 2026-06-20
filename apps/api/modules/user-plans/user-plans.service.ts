import { and, eq, gte } from "drizzle-orm";
import { FastifyInstance } from "fastify";
import { userPlans } from "./user-plans.schema";

export async function getPlan(fastify: FastifyInstance, userId: string) {
  const now = new Date();

  return await fastify.db
    .select()
    .from(userPlans)
    .where(
      and(
        eq(userPlans.userId, userId),
        eq(userPlans.status, "active"),
        gte(userPlans.expiresAt, now),
      ),
    );
}
