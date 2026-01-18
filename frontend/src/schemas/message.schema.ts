import { z } from 'zod';

export const sendMessageSchema = z.object({
  receiverId: z.string().uuid('Invalid receiver ID'),
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message is too long'),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
