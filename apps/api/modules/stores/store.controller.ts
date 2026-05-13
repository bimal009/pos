import { FastifyReply, FastifyRequest } from "fastify";
import {
  sendCreated,
  sendError,
  sendUnauthorized,
  sendBadRequest,
  sendSuccess,
} from "../../utils/response";
import { getUserStores, insertStore } from "./store.service";
import { CreateStoreBody } from "./store.interfaces";
import { getCategoriesWithId } from "../categories/categories.service";

export async function createStore(
  request: FastifyRequest<{ Body: CreateStoreBody }>,
  reply: FastifyReply,
) {
  try {
    const session = request.session;
    if (!session?.user?.id) {
      return sendUnauthorized(reply);
    }

    const foundCategories = await getCategoriesWithId(
      request.server,
      request.body.categoriesId,
    );

    if (foundCategories.length !== request.body.categoriesId.length) {
      return sendBadRequest(reply, "One or more category IDs are invalid");
    }

    const store = await insertStore({
      ...request.body,
      ownerId: session.user.id,
    });

    return sendCreated(reply, store.id);
  } catch (error) {
    return sendError(reply, "Failed to create store", error);
  }
}
export async function getStores(request: FastifyRequest, reply: FastifyReply) {
  try {
    const session = request.session;
    if (!session?.user?.id) {
      return sendUnauthorized(reply);
    }

    const stores = await getUserStores(request.server, session.user.id);

    return sendSuccess(reply, stores);
  } catch (error) {
    return sendError(reply, "Failed to fetch stores", error);
  }
}
