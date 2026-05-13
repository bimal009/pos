import api from "../../axios";
import { ApiResponse } from "@/types/response";
import { CreateStore, CreateStoreResponse, Store } from "@/types/stores";

export const createStore = async (
  payload: CreateStore,
): Promise<ApiResponse<CreateStoreResponse> | null> => {
  try {
    const response = await api.post<ApiResponse<CreateStoreResponse>>(
      "/api/v1/stores",
      payload,
    );

    return response.data;
  } catch (error) {
    console.error("Failed to create store:", error);
    return null;
  }
};

export type StoresResponse = ApiResponse<Store[]>;

export const getStores = async (): Promise<Store[] | null> => {
  try {
    const response = await api.get<StoresResponse>("/api/v1/stores");

    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch stores:", error);
    return null;
  }
};
