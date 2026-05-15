import { FastifyInstance } from "fastify";
import { requireAuth } from "../../hooks/auth.hook";
import {
  createBranch,
  deleteBranch,
  getBranch,
  listBranches,
  patchBranch,
} from "./branches.controller";
import { CreateBranchBody, UpdateBranchBody } from "./branches.interfaces";
import {
  createBranchJsonSchema,
  updateBranchJsonSchema,
} from "./branches.validators";

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Params: { storeId: string } }>(
    "/store/:storeId",
    { preHandler: requireAuth },
    listBranches,
  );

  fastify.post<{ Params: { storeId: string }; Body: CreateBranchBody }>(
    "/store/:storeId",
    {
      preHandler: requireAuth,
      schema: { body: createBranchJsonSchema },
    },
    createBranch,
  );

  fastify.get<{ Params: { id: string } }>(
    "/:id",
    { preHandler: requireAuth },
    getBranch,
  );

  fastify.patch<{ Params: { id: string }; Body: UpdateBranchBody }>(
    "/:id",
    {
      preHandler: requireAuth,
      schema: { body: updateBranchJsonSchema },
    },
    patchBranch,
  );

  fastify.delete<{ Params: { id: string } }>(
    "/:id",
    { preHandler: requireAuth },
    deleteBranch,
  );
}
