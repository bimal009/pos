"use client";

import { useQuery } from "@tanstack/react-query";
import { getSession } from "@/lib/session";

export const useGetSession = () => {
  return useQuery({
    queryKey: ["session"],
    queryFn: getSession,
    staleTime: 1000 * 60 * 5,
  });
};
