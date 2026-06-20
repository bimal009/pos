export const paginationSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    page: {
      type: "integer",
      minimum: 1,
      default: 1,
    },
    limit: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      default: 20,
    },
    sort: {
      type: "string",
      enum: ["asc", "desc"],
      default: "asc",
    },
    sortBy: {
      type: "string",
      minLength: 1,
    },
    search: {
      type: "string",
    },
  },
} as const;

export type PaginationQuery = {
  page?: number;
  limit?: number;
  sort?: "asc" | "desc";
  sortBy?: string;
  search?: string;
};
