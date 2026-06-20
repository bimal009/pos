export const errorSchema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
    message: { type: "string" },
  },
} as const;

export const paginationMetaSchema = {
  type: "object",
  properties: {
    page: { type: "integer" },
    limit: { type: "integer" },
    total: { type: "integer" },
    totalPages: { type: "integer" },
  },
} as const;

export function successResponse(dataSchema: object) {
  return {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: dataSchema,
    },
  };
}

export function createdResponse(dataSchema: object) {
  return {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: dataSchema,
    },
  };
}

export function paginatedResponse(dataSchema: object) {
  return {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: dataSchema,
      meta: paginationMetaSchema,
    },
  };
}

export const commonErrorResponses = {
  400: errorSchema,
  401: errorSchema,
  403: errorSchema,
  404: errorSchema,
  500: errorSchema,
} as const;
