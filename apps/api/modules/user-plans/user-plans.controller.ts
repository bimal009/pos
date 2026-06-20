import { FastifyReply, FastifyRequest } from "fastify";
import { sendSuccess, sendError, sendUnauthorized } from "../../utils/response";
import { getPlan } from "./user-plans.service";

export async function getUserPlans(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const session = request.session;
    if (!session?.user?.id) {
      return sendUnauthorized(reply);
    }
    const plans = await getPlan(request.server, session.user.id);
    return sendSuccess(reply, plans);
  } catch (error) {
    request.log.error(error);
    return sendError(reply, "Failed to fetch categories", error);
  }
}
