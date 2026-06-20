import { Plan } from "@/types/plans";
import api from "../../axios";
import { ApiResponse } from "@/types/response";

export type PlansResponse = ApiResponse<Plan[]>;

export const getPlans = async (): Promise<Plan[] | null> => {
  try {
    const response = await api.get<PlansResponse>("/api/v1/plans");

    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch plans:", error);
    return null;
  }
};

export const getUserPlans = async (): Promise<Plan | null> => {
  try {
    const response = await api.get<ApiResponse<Plan>>("/api/v1/plans/me");

    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch user plan:", error);
    return null;
  }
};
