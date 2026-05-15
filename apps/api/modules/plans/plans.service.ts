import { eq } from "drizzle-orm";
import { plans } from "./plans.schema";
import { FastifyInstance } from "fastify";

export async function getAllPlans(fastify: FastifyInstance) {
  return await fastify.db.select().from(plans).where(eq(plans.isActive, true));
}
