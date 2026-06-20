import fp from "fastify-plugin";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";

export default fp(async (fastify: FastifyInstance) => {
  await fastify.register(swagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "POS API",
        description: "Point of Sale REST API",
        version: "1.0.0",
      },
      servers: [
        {
          url: process.env.API_URL ?? "http://localhost:8000",
          description: "API server",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            description:
              "better-auth session token obtained from /api/v1/auth/get-session",
          },
        },
      },
      tags: [
        { name: "Auth", description: "Authentication endpoints (better-auth)" },
        { name: "Users", description: "User profile management" },
        { name: "Stores", description: "Store management" },
        { name: "Branches", description: "Branch management" },
        { name: "Categories", description: "Product categories" },
        { name: "Plans", description: "Subscription plans" },
        { name: "User Plans", description: "User subscription management" },
        { name: "Units", description: "Units of measurement" },
        { name: "Images", description: "Image upload utilities" },
      ],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "tag",
      deepLinking: true,
      persistAuthorization: true,
    },
    staticCSP: true,
  });
});
