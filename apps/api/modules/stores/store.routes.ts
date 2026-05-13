import { FastifyInstance } from "fastify";
import { requireAuth } from "../../hooks/auth.hook";
import { createStore, getStores } from "./store.controller";
import { CreateStoreBody } from "./store.interfaces";
import { createStoreJsonSchema } from "./store.validators";

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: CreateStoreBody }>(
    "/",
    {
      preHandler: requireAuth,
      schema: { body: createStoreJsonSchema },
    },
    createStore,
  );

  fastify.get(
    "/",
    {
      preHandler: requireAuth,
    },
    getStores,
  );
}
