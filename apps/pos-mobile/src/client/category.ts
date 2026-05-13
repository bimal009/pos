import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../api/category";
export const useGetCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
};
