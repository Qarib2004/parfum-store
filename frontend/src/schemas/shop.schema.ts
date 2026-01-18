import { z } from 'zod';

export const createShopSchema = z.object({
  name: z.string().min(1, 'Shop name is required').max(100, 'Shop name is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  address: z.string().max(200, 'Address is too long').optional(),
});

export const updateShopSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  address: z.string().max(200).optional(),
});

export type CreateShopInput = z.infer<typeof createShopSchema>;
export type UpdateShopInput = z.infer<typeof updateShopSchema>;
