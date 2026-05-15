export const createBranchJsonSchema = {
  type: "object",
  required: ["name"],
  additionalProperties: false,
  properties: {
    name: { type: "string", minLength: 1, maxLength: 100 },
    phone: { type: "string" },
    address: { type: "string" },
    isMain: { type: "boolean" },
  },
} as const;

export const updateBranchJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    name: { type: "string", minLength: 1, maxLength: 100 },
    phone: { type: "string" },
    address: { type: "string" },
    isMain: { type: "boolean" },
    isActive: { type: "boolean" },
  },
} as const;
