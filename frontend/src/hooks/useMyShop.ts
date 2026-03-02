import { useQuery } from "@tanstack/react-query";
import { shopApi } from "@/lib/api/endpoints";

export const useMyShop = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["myShop"],
    queryFn: async () => {
      const response = await shopApi.getMyShop();
      return response.data.data;
    },
  });

  return { shop: data, isLoading, error };
};

