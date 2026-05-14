export const createUserJsonSchema = {
  type: "object",
  required: ["name", "email"],
  additionalProperties: false,

  properties: {
    name: {
      type: "string",
      minLength: 1,
      maxLength: 100,
    },

    email: {
      type: "string",
      format: "email",
    },

    phoneNumber: {
      type: "string",
    },

    image: {
      type: "string",
    },

    userType: {
      type: "string",
      enum: ["individual", "company"],
    },

    platformRole: {
      type: "string",
      enum: ["superadmin"],
    },

    isOnboarded: {
      type: "boolean",
    },

    planId: {
      type: "string",
    },
  },
} as const;

export const updateUserJsonSchema = {
  type: "object",
  additionalProperties: false,

  properties: {
    name: {
      type: "string",
      minLength: 1,
      maxLength: 100,
    },

    email: {
      type: "string",
      format: "email",
    },

    phoneNumber: {
      type: "string",
    },

    image: {
      type: "string",
    },

    emailVerified: {
      type: "boolean",
    },

    phoneNumberVerified: {
      type: "boolean",
    },

    userType: {
      type: "string",
      enum: ["individual", "company"],
    },

    platformRole: {
      type: "string",
      enum: ["superadmin", "user"],
    },

    isOnboarded: {
      type: "boolean",
    },

    planId: {
      type: "string",
    },
  },
} as const;

export const onboardUserJsonSchema = {
  type: "object",
  required: ["name"],
  additionalProperties: false,
  properties: {
    name: { type: "string", minLength: 1, maxLength: 100 },
    email: { type: "string", format: "email" },
    image: { type: "string", format: "uri" },
  },
} as const;
