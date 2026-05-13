import { FastifyReply, FastifyRequest } from "fastify";
import { sendSuccess } from "../../utils/response";
import { createAuthSign } from "./images.service";

export async function getImageKitAuthSign(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  return sendSuccess(reply, createAuthSign(), "ImageKit auth parameters");
}
