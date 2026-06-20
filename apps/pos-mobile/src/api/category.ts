import { CategoryType } from "@/types/category";
import { ApiResponse } from "@/types/response";
import api from "../../axios";
import { StoreCategory } from "@/types/stores";

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

export const getCategoriesByStore = async (
  storeId: string,
): Promise<StoreCategory[] | null> => {
  try {
    const response = await api.get<ApiResponse<StoreCategory[]>>(
      `/api/v1/categories/${storeId}`,
    );

    const body = response.data;
    if (Array.isArray(body)) {
      return body;
    }
    return body.data ?? null;
  } catch (error) {
    console.error("Failed to fetch categories by store:", error);

    return null;
  }
};
