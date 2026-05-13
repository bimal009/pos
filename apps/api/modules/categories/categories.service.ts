import { FastifyInstance } from "fastify";
import { categories } from "./categories.schema";
import { inArray } from "drizzle-orm";

export async function getAllCategories(fastify: FastifyInstance) {
  return await fastify.db.select().from(categories);
}

export async function getCategoriesWithId(
  fastify: FastifyInstance,
  categoriesId: string[],
) {
  return await fastify.db
    .select()
    .from(categories)
    .where(inArray(categories.id, categoriesId));
}
