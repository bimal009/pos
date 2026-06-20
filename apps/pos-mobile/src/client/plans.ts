import { useQuery } from "@tanstack/react-query";
import { getPlans, getUserPlans } from "../api/plans";
import { Plan } from "@/types/plans";
import { getStoredUserPlan } from "@/lib/plan";

export const useGetPlans = () => {
  return useQuery({
    queryKey: ["plans"],
    queryFn: getPlans,
  });
};

export const useGetUserPlans = () => {
  return useQuery<Plan | null>({
    queryKey: ["user-plan"],
    queryFn: getStoredUserPlan,
    staleTime: 1000 * 60 * 60,
  });
};
