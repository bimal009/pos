import "dotenv/config";
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import dbPlugin from "./plugins/db";
import authRoutes from "./modules/auth/auth.routes";
import "./types/index";
import categoriesRoutes from "./modules/categories/categories.routes";
import storeRoutes from "./modules/stores/store.routes";
import imagesRoutes from "./modules/images/images.routes";
import plansRoutes from "./modules/plans/plans.routes";
import userRoutes from "./modules/user/user.routes";

const app = Fastify({
  logger: true,
  ajv: {
    customOptions: {
      strict: true,
      coerceTypes: false,
      useDefaults: true,
      removeAdditional: false,
      allErrors: true,
    },
  },
});

app.register(fastifyCors, {
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  maxAge: 86400,
});

app.register(dbPlugin);

app.register(authRoutes, { prefix: "/api/v1/auth" });
app.register(userRoutes, { prefix: "/api/v1/user" });
app.register(categoriesRoutes, { prefix: "/api/v1/categories" });
app.register(storeRoutes, { prefix: "/api/v1/stores" });
app.register(imagesRoutes, { prefix: "/api/v1/images" });
app.register(plansRoutes, { prefix: "/api/v1/plans" });

export default app;
