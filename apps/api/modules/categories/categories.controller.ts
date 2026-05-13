import { FastifyReply, FastifyRequest } from "fastify";
import { getAllCategories } from "./categories.service";
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
