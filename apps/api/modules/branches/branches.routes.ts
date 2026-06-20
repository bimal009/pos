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
import {
  commonErrorResponses,
  createdResponse,
  successResponse,
} from "../../common/schemas/responses";

const branchSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    storeId: { type: "string" },
    name: { type: "string" },
    phone: { type: "string" },
    address: { type: "string" },
    isMain: { type: "boolean" },
    isActive: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

const storeIdParam = {
  type: "object",
  required: ["storeId"],
  properties: {
    storeId: { type: "string", description: "Store ID" },
  },
};

const idParam = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string", description: "Branch ID" },
  },
};

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Params: { storeId: string } }>(
    "/store/:storeId",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["Branches"],
        summary: "List all branches for a store",
        security: [{ bearerAuth: [] }],
        params: storeIdParam,
        response: {
          200: successResponse({ type: "array", items: branchSchema }),
          ...commonErrorResponses,
        },
      },
    },
    listBranches,
  );

  fastify.post<{ Params: { storeId: string }; Body: CreateBranchBody }>(
    "/store/:storeId",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["Branches"],
        summary: "Create a branch for a store",
        security: [{ bearerAuth: [] }],
        params: storeIdParam,
        body: createBranchJsonSchema,
        response: {
          201: createdResponse(branchSchema),
          ...commonErrorResponses,
        },
      },
    },
    createBranch,
  );

  fastify.get<{ Params: { id: string } }>(
    "/:id",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["Branches"],
        summary: "Get a single branch",
        security: [{ bearerAuth: [] }],
        params: idParam,
        response: {
          200: successResponse(branchSchema),
          ...commonErrorResponses,
        },
      },
    },
    getBranch,
  );

  fastify.patch<{ Params: { id: string }; Body: UpdateBranchBody }>(
    "/:id",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["Branches"],
        summary: "Update a branch",
        security: [{ bearerAuth: [] }],
        params: idParam,
        body: updateBranchJsonSchema,
        response: {
          200: successResponse(branchSchema),
          ...commonErrorResponses,
        },
      },
    },
    patchBranch,
  );

  fastify.delete<{ Params: { id: string } }>(
    "/:id",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["Branches"],
        summary: "Soft-delete a branch",
        security: [{ bearerAuth: [] }],
        params: idParam,
        response: {
          200: successResponse({
            type: "object",
            properties: { id: { type: "string" } },
          }),
          ...commonErrorResponses,
        },
      },
    },
    deleteBranch,
  );
}
