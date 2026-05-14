import { onboardUser } from "@/api/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useOnboardUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: onboardUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
};
