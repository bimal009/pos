import { CategoryType } from "@/types/category";
import { ApiResponse } from "@/types/response";
import api from "../../axios";

export const getCategories = async (): Promise<CategoryType[] | null> => {
  try {
    const response =
      await api.get<ApiResponse<CategoryType[]>>("/api/v1/categories");

    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);

    return null;
  }
};
