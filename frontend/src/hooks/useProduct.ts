import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productApi } from '@/lib/api/endpoints';
import { CreateProductInput, UpdateProductInput } from '@/schemas/product.schema';

export const useProducts = (filters?: {
  page?: number;
  limit?: number;
  search?: string;
  brand?: string;
  fragranceType?: string;
  minPrice?: number;
  maxPrice?: number;
  ownerId?: string;
}) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const response = await productApi.getAllProducts(filters);
      return response.data.data;
    },
  });

  return {
    products: data?.products || [],
    pagination: data?.pagination,
    isLoading,
    error,
  };
};

export const useProduct = (id?: string, slug?: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id || slug],
    queryFn: async () => {
      if (id) {
        const response = await productApi.getProductById(id);
        return response.data.data;
      } else if (slug) {
        const response = await productApi.getProductBySlug(slug);
        return response.data.data;
      }
      throw new Error('ID или slug обязателен');
    },
    enabled: !!id || !!slug,
  });

  return {
    product: data,
    isLoading,
    error,
  };
};

export const useOwnerProducts = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['ownerProducts'],
    queryFn: async () => {
      const response = await productApi.getOwnerProducts();
      return response.data.data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['ownerProductsStats'],
    queryFn: async () => {
      const response = await productApi.getOwnerProductsStats();
      return response.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProductInput) => productApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const createWithImageMutation = useMutation({
    mutationFn: ({ data, file }: { data: CreateProductInput; file: File }) =>
      productApi.createProductWithImage(data, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) =>
      productApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
  });

  const updateImageMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      productApi.updateProductImage(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    products: data || [],
    stats,
    isLoading,
    createProduct: createMutation.mutate,
    createProductWithImage: createWithImageMutation.mutate,
    updateProduct: updateMutation.mutate,
    updateProductImage: updateImageMutation.mutate,
    deleteProduct: deleteMutation.mutate,
    isCreating: createMutation.isPending || createWithImageMutation.isPending,
    isUpdating: updateMutation.isPending || updateImageMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};