import { useQuery } from "@tanstack/react-query";
import { getCategories, getCategoriesByStore } from "../api/category";
export const useGetCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
};

export const useGetCategoriesByStore = (storeId: string) => {
  return useQuery({
    queryKey: ["categories", storeId],
    queryFn: () => getCategoriesByStore(storeId),
    enabled: Boolean(storeId) && storeId !== "[id]",
  });
};
