import { getUnits } from "@/api/units";
import { PaginationQuery } from "@/types/response";
import { useQuery } from "@tanstack/react-query";

export const useUnits = (query: PaginationQuery) => {
  return useQuery({
    queryKey: ["units", query],
    queryFn: () => getUnits(query),
  });
};
