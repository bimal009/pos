import { ApiResponse } from "@/types/response";
import api from "../../axios";

export type OnboardUser = {
  name: string;
  email?: string;
  image?: string;
};
export const onboardUser = async (data: OnboardUser) => {
  const response = await api.patch<ApiResponse<{ id: string }>>(
    "/api/v1/users/onboard",
    data,
  );
  return response.data;
};
