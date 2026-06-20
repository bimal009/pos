import { FastifyInstance } from "fastify";
import { categories } from "./categories.schema";
import { eq, inArray } from "drizzle-orm";
import { storeCategories } from "../stores/stores.schema";

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

export async function getCategoriesByStore(
  fastify: FastifyInstance,
  storeId: string,
) {
  return await fastify.db.query.storeCategories.findMany({
    where: eq(storeCategories.storeId, storeId),
    with: {
      category: true,
    },
  });
}
