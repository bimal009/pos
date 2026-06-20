import {
  PaginatedApiResponse,
  PaginatedData,
  PaginationQuery,
} from "@/types/response";
import api from "../../axios";
import { Unit } from "@/types/units";

export const getUnits = async (
  query?: PaginationQuery,
): Promise<PaginatedData<Unit> | null> => {
  try {
    const response = await api.get<PaginatedApiResponse<Unit>>(
      "/api/v1/units",
      { params: query },
    );

    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch units:", error);
    return null;
  }
};
