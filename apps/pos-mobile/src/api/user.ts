import { ApiResponse } from "@/types/response";
import api from "../../axios";

export const onboardUser = async () => {
  try {
    const response = await api.post<ApiResponse<{ id: string }>>(
      "/api/v1/users/onboard",
    );

    return response.data;
  } catch (error) {
    console.error("Failed to onboard user:", error);

    return null;
  }
};
