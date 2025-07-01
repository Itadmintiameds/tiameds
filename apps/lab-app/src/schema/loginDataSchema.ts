import { z } from 'zod'

export const loginDataSchema = z.object({
    username: z.string().min(4).max(20 , {message: 'Username must be between 3 and 20 characters'})
    .regex(/^[a-zA-Z0-9]+$/, { message: 'Username must contain only letters and numbers' }),
    password: z.string().min(8, {message: 'Password must be at least 8 characters'}),
})
// export const loginDataSchema = z.object({
//     username: z.string()
//         .min(3, "Username must be at least 3 characters")
//         .max(20, "Username must be at most 20 characters")
//         .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
//     password: z.string()
//         .min(8, "Password must be at least 8 characters")
//         .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
//         .regex(/[a-z]/, "Password must contain at least one lowercase letter")
//         .regex(/[0-9]/, "Password must contain at least one number").optional(),
// })