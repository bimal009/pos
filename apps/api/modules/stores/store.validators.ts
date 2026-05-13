export const createStoreJsonSchema = {
  type: "object",
  required: ["name", "phone", "address", "categoriesId"],
  additionalProperties: false,
  properties: {
    name: { type: "string", minLength: 1, maxLength: 100 },
    description: { type: "string" },
    phone: { type: "string" },
    address: { type: "string" },
    logo: { type: "string" },
    categoriesId: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
    },
    taxType: { type: "string", enum: ["none", "pan", "vat"] },
    taxNumber: { type: "string", minLength: 9, maxLength: 9 },
  },
} as const;

export const updateStoreJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    name: { type: "string", minLength: 1, maxLength: 100 },
    description: { type: "string" },
    phone: { type: "string" },
    address: { type: "string" },
    logo: { type: "string" },
    categoriesId: {
      type: "array",
      items: { type: "string" },
    },
    isActive: { type: "boolean" },
    taxType: { type: "string", enum: ["none", "pan", "vat"] },
    taxNumber: { type: "string", minLength: 9, maxLength: 9 },
  },
} as const;
