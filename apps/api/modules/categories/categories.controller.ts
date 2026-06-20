import { FastifyReply, FastifyRequest } from "fastify";
import { getAllCategories, getCategoriesByStore } from "./categories.service";
import { sendSuccess, sendError } from "../../utils/response";

export async function getCategories(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const categories = await getAllCategories(request.server);
    return sendSuccess(reply, categories);
  } catch (error) {
    request.log.error(error);
    return sendError(reply, "Failed to fetch categories", error);
  }
}

export async function getStoreCategories(
  request: FastifyRequest<{ Params: { storeId: string } }>,
  reply: FastifyReply,
) {
  try {
    const categories = await getCategoriesByStore(
      request.server,
      request.params.storeId,
    );
    return sendSuccess(reply, categories);
  } catch (error) {
    request.log.error(error);
    return sendError(reply, "Failed to fetch store categories", error);
  }
}
