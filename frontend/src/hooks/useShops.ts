import { useQuery } from "@tanstack/react-query";
import { shopApi } from "@/lib/api/endpoints";

export const useShops = (limit: number = 3) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["shops", { limit }],
    queryFn: async () => {
      const response = await shopApi.getAllShops({ limit });
      return response.data.data; 
    },
    staleTime: 1000 * 60 * 5,
  });

  return { shopsData: data, isLoading, error };
};