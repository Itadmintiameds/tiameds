import {z} from 'zod';

export const insuranceSchema = z.object({
    name: z.string().min(3).max(255),
    description: z.string().min(3).max(255),
    price: z.number().min(0).max(1000000),
    duration: z.number().min(0).max(100),
    coverageLimit: z.number().min(0).max(1000000),
    coverageType: z.string(),
    status: z.string(),
    provider: z.string(),
});