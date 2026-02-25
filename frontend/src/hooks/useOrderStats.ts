import { useQuery } from "@tanstack/react-query";
import { orderApi } from "@/lib/api/endpoints";

export const useOrderStats = (enabled: boolean = true) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["orderStats"],
    queryFn: async () => {
      const response = await orderApi.getOrderStats();
      return response.data.data;
    },
    enabled,
  });

  return { orderStats: data, isLoading, error };
};