import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStore } from "../api/store";
import { useQuery } from "@tanstack/react-query";
import { getStores } from "../api/store";

export const useCreateStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStore,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["stores"],
      });
    },
  });
};

export const useGetStores = () => {
  return useQuery({
    queryKey: ["stores"],
    queryFn: getStores,
  });
};
