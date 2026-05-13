import { FastifyReply } from "fastify";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ✅ 200
export function sendSuccess(
  reply: FastifyReply,
  data: unknown,
  message = "Success",
) {
  return reply.status(200).send({
    success: true,
    message,
    data,
  });
}

export function sendCreated(
  reply: FastifyReply,
  data: unknown,
  message = "Created successfully",
) {
  return reply.status(201).send({
    success: true,
    message,
    data,
  });
}

// ✅ 204
export function sendNoContent(reply: FastifyReply) {
  return reply.status(204).send();
}

// ✅ paginated
export function sendPaginated(
  reply: FastifyReply,
  data: unknown,
  meta: PaginationMeta,
  message = "Success",
) {
  return reply.status(200).send({
    success: true,
    message,
    data,
    meta: {
      page: meta.page,
      limit: meta.limit,
      total: meta.total,
      totalPages: meta.totalPages,
    },
  });
}

export function sendBadRequest(
  reply: FastifyReply,
  message = "Bad request",
  errors?: Record<string, unknown>,
) {
  return reply.status(400).send({
    success: false,
    message,
    ...(errors && { errors }),
  });
}

export function sendUnauthorized(
  reply: FastifyReply,
  message = "Unauthorized",
) {
  return reply.status(401).send({
    success: false,
    message,
  });
}

export function sendForbidden(reply: FastifyReply, message = "Forbidden") {
  return reply.status(403).send({
    success: false,
    message,
  });
}

export function sendNotFound(
  reply: FastifyReply,
  message = "Resource not found",
) {
  return reply.status(404).send({
    success: false,
    message,
  });
}

export function sendConflict(reply: FastifyReply, message = "Conflict") {
  return reply.status(409).send({
    success: false,
    message,
  });
}

export function sendUnprocessable(
  reply: FastifyReply,
  message = "Unprocessable entity",
  errors?: Record<string, unknown>,
) {
  return reply.status(422).send({
    success: false,
    message,
    ...(errors && { errors }),
  });
}

export function sendTooManyRequests(
  reply: FastifyReply,
  message = "Too many requests",
) {
  return reply.status(429).send({
    success: false,
    message,
  });
}

// ❌ 500
export function sendError(
  reply: FastifyReply,
  message = "Internal server error",
  error?: unknown,
) {
  return reply.status(500).send({
    success: false,
    message,
    ...(error instanceof Error && { error: error.message }),
  });
}
