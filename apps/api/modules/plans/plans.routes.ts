import { FastifyInstance } from "fastify";
import { requireAuth } from "../../hooks/auth.hook";
import { getPlans } from "./plans.controller";
import {
  commonErrorResponses,
  successResponse,
} from "../../common/schemas/responses";

const planFeaturesSchema = {
  type: "object",
  properties: {
    maxProducts: { type: "integer" },
    maxStores: { type: "integer" },
    maxStaff: { type: "integer" },
    maxCofounders: { type: "integer" },
    maxBranches: { type: "integer" },
    creditLedger: { type: "boolean" },
    automatedSmsReminders: { type: "boolean" },
    whatsappReminders: { type: "boolean" },
    salesReports: { type: "boolean" },
    plReport: { type: "boolean" },
    vatInvoice: { type: "boolean" },
    productVariants: { type: "boolean" },
    cashDrawer: { type: "boolean" },
    offlineSync: { type: "boolean" },
    customReceiptBranding: { type: "boolean" },
    loyaltyPoints: { type: "boolean" },
    multiStore: { type: "boolean" },
    multiStaff: { type: "boolean" },
    staffSalesReports: { type: "boolean" },
    consolidatedReports: { type: "boolean" },
    prioritySupport: { type: "boolean" },
    exportPdf: { type: "boolean" },
    partiesHandling: { type: "boolean" },
  },
};

const planSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    tier: { type: "string", enum: ["starter", "pro", "business"] },
    description: { type: "string" },
    monthlyPrice: { type: "integer" },
    yearlyPrice: { type: "integer" },
    features: planFeaturesSchema,
    isActive: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: ["GET"],
    preHandler: requireAuth,
    url: "/",
    schema: {
      tags: ["Plans"],
      summary: "List all available subscription plans",
      security: [{ bearerAuth: [] }],
      response: {
        200: successResponse({ type: "array", items: planSchema }),
        ...commonErrorResponses,
      },
    },
    async handler(request, reply) {
      return getPlans(request, reply);
    },
  });
}
