import { getImageKitAuthSign } from "@/api/images";
import { useQuery } from "@tanstack/react-query";

export const useGetImageKitAuthSign = () => {
  return useQuery({
    queryKey: ["imagekit-auth-sign"],
    queryFn: getImageKitAuthSign,
  });
};
