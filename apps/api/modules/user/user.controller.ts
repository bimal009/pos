import { FastifyReply, FastifyRequest } from "fastify";
import { sendCreated, sendError, sendUnauthorized } from "../../utils/response";
import { OnboardUserDto, UpdateUserDto } from "./interfaces";
import { onboardUserService } from "./user.service";

export async function onboardUser(
  request: FastifyRequest<{ Body: OnboardUserDto }>,
  reply: FastifyReply,
) {
  try {
    const session = request.session;
    if (!session?.user?.id) {
      return sendUnauthorized(reply);
    }

    const userId = await onboardUserService(
      request.server,
      request.body,
      session.user.id,
    );

    return sendCreated(reply, { id: userId });
  } catch (error) {
    return sendError(reply, "Failed to onboard user", error);
  }
}
