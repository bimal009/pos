import { PaginationQuery } from "../../common/validators/pagination.validators";
import { ilike, or, and, eq, asc, desc, count, isNull } from "drizzle-orm";
import { FastifyInstance } from "fastify";
import { units } from "./units.schema";

export async function getUnits(
  fastify: FastifyInstance,
  query: PaginationQuery,
) {
  const { sort = "asc", page = 1, limit = 20 } = query;
  const search = query.search?.trim();
  console.log(search, "search");
  const offset = (page - 1) * limit;
  const where = and(
    eq(units.isActive, true),
    isNull(units.deletedAt),
    search
      ? or(
          ilike(units.name, `%${search}%`),
          ilike(units.nameNepali, `%${search}%`),
          ilike(units.abbreviation, `%${search}%`),
        )
      : undefined,
  );

  const [rows, [{ total }]] = await Promise.all([
    fastify.db
      .select()
      .from(units)
      .where(where)
      .orderBy(sort === "desc" ? desc(units.name) : asc(units.name))
      .limit(limit)
      .offset(offset),
    fastify.db.select({ total: count() }).from(units).where(where),
  ]);

  return {
    data: rows,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
