import { FastifyReply, FastifyRequest } from "fastify";
import { sendSuccess, sendError } from "../../utils/response";
import { getUnits } from "./units.service";
import { PaginationQuery } from "../../common/validators/pagination.validators";

export async function getUnitsHandler(
  request: FastifyRequest<{ Querystring: PaginationQuery }>,
  reply: FastifyReply,
) {
  try {
    const result = await getUnits(request.server, request.query);
    return sendSuccess(reply, result);
  } catch (error) {
    request.log.error(error);
    return sendError(reply, "Failed to fetch units", error);
  }
}
