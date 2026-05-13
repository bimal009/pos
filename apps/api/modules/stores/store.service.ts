import { FastifyInstance } from "fastify";
import { db } from "../../plugins/db";
import { stores, storeCategories, NewStore } from "./stores.schema";
import { eq } from "drizzle-orm";

export async function insertStore(
  data: NewStore & { categoriesId?: string[] },
) {
  const { categoriesId, ...storeData } = data;

  const [store] = await db.insert(stores).values(storeData).returning();

  if (categoriesId && categoriesId.length > 0) {
    await db.insert(storeCategories).values(
      categoriesId.map((categoryId) => ({
        storeId: store.id,
        categoryId,
      })),
    );
  }

  return store;
}

export async function getUserStores(fastify: FastifyInstance, ownerId: string) {
  return fastify.db.query.stores.findMany({
    where: (stores, { eq, and, isNull }) =>
      and(eq(stores.ownerId, ownerId), isNull(stores.deletedAt)),
    with: {
      categories: {
        with: {
          category: true,
        },
      },
      branches: true,
    },
  });
}
