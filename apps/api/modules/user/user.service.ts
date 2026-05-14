import { FastifyInstance } from "fastify";
import { OnboardUserDto } from "./interfaces";
import { user } from "./user.schema";
import { eq } from "drizzle-orm";
import { userPlans } from "../plans/user-plans.schema";
import { env } from "../../config/env";

export const onboardUserService = async (
  fastify: FastifyInstance,
  data: OnboardUserDto,
  userId: string,
) => {
  return fastify.db.transaction(async (tx) => {
    const [updatedUser] = await tx
      .update(user)
      .set({
        ...data,
        isOnboarded: true,
      })
      .where(eq(user.id, userId))
      .returning();

    await tx.insert(userPlans).values({
      userId,
      planId: env.STARTER_PLAN_ID,
      status: "active",
    });

    return updatedUser.id;
  });
};
