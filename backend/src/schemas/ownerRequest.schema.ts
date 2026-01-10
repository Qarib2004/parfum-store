import { z } from 'zod';

const productDetailSchema = z.object({
  name: z.string(),
  brand: z.string(),
  quantity: z.number().min(7, 'Каждый аромат должен быть минимум 7 штук'),
});

export const createOwnerRequestSchema = z.object({
  products: z
    .array(productDetailSchema)
    .min(15, 'It must include at least 15 unique fragrances.')
    .refine(
      (products) => {
        const uniqueProducts = new Set(
          products.map((p) => `${p.name}-${p.brand}`)
        );
        return uniqueProducts.size >= 15;
      },
      {
        message: 'It must include at least 15 unique fragrances.',
      }
    )
    .refine(
      (products) => {
        return products.every((p) => p.quantity >= 7);
      },
      {
        message: 'Each fragrance must have at least 7 units.',
      }
    ),
});

export const reviewOwnerRequestSchema = z.object({
  requestId: z.string().uuid('incorrect  id'),
  status: z.enum(['APPROVED', 'REJECTED']),
  adminComment: z.string().max(500).optional(),
});

export const getOwnerRequestSchema = z.object({
  requestId: z.string().uuid('Некорректный ID заявки'),
});

export type CreateOwnerRequestInput = z.infer<typeof createOwnerRequestSchema>;
export type ReviewOwnerRequestInput = z.infer<typeof reviewOwnerRequestSchema>;
export type GetOwnerRequestInput = z.infer<typeof getOwnerRequestSchema>;