import { ImageKitSign } from "@/types/imagekit";
import { ApiResponse } from "@/types/response";
import api from "../../axios";

export const getImageKitAuthSign = async (): Promise<ImageKitSign | null> => {
  try {
    const response = await api.get<ApiResponse<ImageKitSign>>(
      "/api/v1/images/sign",
    );

    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch ImageKit auth sign:", error);

    return null;
  }
};
