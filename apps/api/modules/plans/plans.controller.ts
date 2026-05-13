import { FastifyReply, FastifyRequest } from "fastify";
import { sendSuccess, sendError } from "../../utils/response";
import { getAllPlans } from "./plans.service";

export async function getPlans(request: FastifyRequest, reply: FastifyReply) {
  try {
    const plans = await getAllPlans(request.server);
    return sendSuccess(reply, plans);
  } catch (error) {
    request.log.error(error);
    return sendError(reply, "Failed to fetch categories", error);
  }
}
