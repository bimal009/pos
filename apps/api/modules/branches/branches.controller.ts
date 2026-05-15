import { FastifyReply, FastifyRequest } from "fastify";
import {
  sendBadRequest,
  sendCreated,
  sendError,
  sendNotFound,
  sendSuccess,
  sendUnauthorized,
} from "../../utils/response";
import {
  CreateBranchBody,
  UpdateBranchBody,
} from "./branches.interfaces";
import {
  clearMainBranchForStore,
  getBranchById,
  getBranchesByStoreId,
  getStoreForOwner,
  insertBranch,
  softDeleteBranch,
  updateBranch,
} from "./branches.service";

async function requireOwnedStore(
  request: FastifyRequest<{ Params: { storeId: string } }>,
  reply: FastifyReply,
) {
  const session = request.session;
  if (!session?.user?.id) {
    sendUnauthorized(reply);
    return null;
  }

  const store = await getStoreForOwner(
    request.server,
    request.params.storeId,
    session.user.id,
  );

  if (!store) {
    sendNotFound(reply, "Store not found");
    return null;
  }

  return store;
}

async function requireOwnedBranch(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const session = request.session;
  if (!session?.user?.id) {
    sendUnauthorized(reply);
    return null;
  }

  const branch = await getBranchById(request.server, request.params.id);
  if (!branch?.store) {
    sendNotFound(reply, "Branch not found");
    return null;
  }

  if (branch.store.ownerId !== session.user.id || branch.store.deletedAt) {
    sendNotFound(reply, "Branch not found");
    return null;
  }

  return branch;
}

export async function listBranches(
  request: FastifyRequest<{ Params: { storeId: string } }>,
  reply: FastifyReply,
) {
  try {
    const store = await requireOwnedStore(request, reply);
    if (!store) return;

    const branches = await getBranchesByStoreId(
      request.server,
      store.id,
    );
    return sendSuccess(reply, branches);
  } catch (error) {
    return sendError(reply, "Failed to fetch branches", error);
  }
}

export async function createBranch(
  request: FastifyRequest<{
    Params: { storeId: string };
    Body: CreateBranchBody;
  }>,
  reply: FastifyReply,
) {
  try {
    const store = await requireOwnedStore(request, reply);
    if (!store) return;

    const isMain = request.body.isMain ?? false;
    if (isMain) {
      await clearMainBranchForStore(request.server, store.id);
    }

    const branch = await insertBranch(request.server, {
      storeId: store.id,
      name: request.body.name,
      phone: request.body.phone,
      address: request.body.address,
      isMain,
    });

    return sendCreated(reply, branch);
  } catch (error) {
    return sendError(reply, "Failed to create branch", error);
  }
}

export async function getBranch(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const branch = await requireOwnedBranch(request, reply);
    if (!branch) return;

    const { store: _store, ...branchData } = branch;
    return sendSuccess(reply, branchData);
  } catch (error) {
    return sendError(reply, "Failed to fetch branch", error);
  }
}

export async function patchBranch(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateBranchBody }>,
  reply: FastifyReply,
) {
  try {
    const existing = await requireOwnedBranch(request, reply);
    if (!existing) return;

    if (request.body.isMain === true) {
      await clearMainBranchForStore(
        request.server,
        existing.storeId,
        existing.id,
      );
    }

    const updated = await updateBranch(request.server, existing.id, {
      ...(request.body.name !== undefined && { name: request.body.name }),
      ...(request.body.phone !== undefined && { phone: request.body.phone }),
      ...(request.body.address !== undefined && {
        address: request.body.address,
      }),
      ...(request.body.isMain !== undefined && { isMain: request.body.isMain }),
      ...(request.body.isActive !== undefined && {
        isActive: request.body.isActive,
      }),
    });

    if (!updated) {
      return sendNotFound(reply, "Branch not found");
    }

    return sendSuccess(reply, updated);
  } catch (error) {
    return sendError(reply, "Failed to update branch", error);
  }
}

export async function deleteBranch(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const existing = await requireOwnedBranch(request, reply);
    if (!existing) return;

    if (existing.isMain) {
      return sendBadRequest(reply, "Cannot delete the main branch");
    }

    const deleted = await softDeleteBranch(request.server, existing.id);
    if (!deleted) {
      return sendNotFound(reply, "Branch not found");
    }

    return sendSuccess(reply, { id: deleted.id });
  } catch (error) {
    return sendError(reply, "Failed to delete branch", error);
  }
}
