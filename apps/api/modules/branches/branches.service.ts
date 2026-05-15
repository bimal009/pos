import { and, eq, isNull } from "drizzle-orm";
import { FastifyInstance } from "fastify";
import { stores } from "../stores/stores.schema";
import {
  storeBranches,
  NewStoreBranch,
  StoreBranch,
} from "./branches.schema";

export async function getStoreForOwner(
  fastify: FastifyInstance,
  storeId: string,
  ownerId: string,
) {
  return fastify.db.query.stores.findFirst({
    where: (s, { eq: eqCol, and: andCol, isNull: isNullCol }) =>
      andCol(
        eqCol(s.id, storeId),
        eqCol(s.ownerId, ownerId),
        isNullCol(s.deletedAt),
      ),
  });
}

export async function getBranchesByStoreId(
  fastify: FastifyInstance,
  storeId: string,
) {
  return fastify.db.query.storeBranches.findMany({
    where: (b, { eq: eqCol, and: andCol, isNull: isNullCol }) =>
      andCol(eqCol(b.storeId, storeId), isNullCol(b.deletedAt)),
  });
}

export async function getBranchById(fastify: FastifyInstance, branchId: string) {
  return fastify.db.query.storeBranches.findFirst({
    where: (b, { eq: eqCol, and: andCol, isNull: isNullCol }) =>
      andCol(eqCol(b.id, branchId), isNullCol(b.deletedAt)),
    with: { store: true },
  });
}

export async function insertBranch(
  fastify: FastifyInstance,
  data: NewStoreBranch,
) {
  const [branch] = await fastify.db
    .insert(storeBranches)
    .values(data)
    .returning();
  return branch;
}

export async function updateBranch(
  fastify: FastifyInstance,
  branchId: string,
  data: Partial<
    Pick<StoreBranch, "name" | "phone" | "address" | "isMain" | "isActive">
  >,
) {
  const [branch] = await fastify.db
    .update(storeBranches)
    .set(data)
    .where(and(eq(storeBranches.id, branchId), isNull(storeBranches.deletedAt)))
    .returning();
  return branch ?? null;
}

export async function softDeleteBranch(
  fastify: FastifyInstance,
  branchId: string,
) {
  const [branch] = await fastify.db
    .update(storeBranches)
    .set({ deletedAt: new Date(), isActive: false })
    .where(and(eq(storeBranches.id, branchId), isNull(storeBranches.deletedAt)))
    .returning();
  return branch ?? null;
}

export async function clearMainBranchForStore(
  fastify: FastifyInstance,
  storeId: string,
  exceptBranchId?: string,
) {
  const branches = await fastify.db.query.storeBranches.findMany({
    where: (b, { eq: eqCol, and: andCol, isNull: isNullCol }) =>
      andCol(
        eqCol(b.storeId, storeId),
        eqCol(b.isMain, true),
        isNullCol(b.deletedAt),
      ),
  });

  const toClear = exceptBranchId
    ? branches.filter((b) => b.id !== exceptBranchId)
    : branches;

  for (const branch of toClear) {
    await fastify.db
      .update(storeBranches)
      .set({ isMain: false })
      .where(eq(storeBranches.id, branch.id));
  }
}
