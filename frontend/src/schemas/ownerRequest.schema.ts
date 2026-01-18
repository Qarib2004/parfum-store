import { z } from 'zod';

const productDetailSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand: z.string().min(1, 'Brand is required'),
  quantity: z.number().min(7, 'Each fragrance must have at least 7 items'),
});

export const createOwnerRequestSchema = z.object({
  products: z
    .array(productDetailSchema)
    .min(15, 'At least 15 different fragrances are required')
    .refine(
      (products) => {
        const uniqueProducts = new Set(
          products.map((p) => `${p.name}-${p.brand}`)
        );
        return uniqueProducts.size >= 15;
      },
      {
        message: 'There must be at least 15 unique fragrances',
      }
    )
    .refine(
      (products) => {
        return products.every((p) => p.quantity >= 7);
      },
      {
        message: 'Each fragrance must have a minimum quantity of 7',
      }
    ),
});

export type CreateOwnerRequestInput = z.infer<typeof createOwnerRequestSchema>;
