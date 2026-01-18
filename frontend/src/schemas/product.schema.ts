import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  brand: z.string().min(1, 'Brand is required').max(100, 'Brand name is too long'),
  volume: z.number().min(1, 'Volume must be greater than 0'),
  fragranceType: z.string().min(1, 'Fragrance type is required'),
  quantity: z.number().min(1, 'Quantity must be greater than 0'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  description: z.string().max(2000, 'Description is too long').optional(),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  brand: z.string().min(1).max(100).optional(),
  volume: z.number().min(1).optional(),
  fragranceType: z.string().min(1).optional(),
  quantity: z.number().min(0).optional(),
  price: z.number().min(0.01).optional(),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
