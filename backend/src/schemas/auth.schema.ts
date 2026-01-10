import { password } from 'bun'
import {email, z} from 'zod'






export const registerSchema = z.object({
    email:z.string().email('incorrext email'),
    username:z.string().min(3,'Name minimals 3 simbols')
    .max(30),
    password:z.string().min(8)
})


export const loginSchema = z.object({
    email:z.string().email('incoreect email'),
    password:z.string().min(1)
})


export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token nedded'),
  });


  export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;