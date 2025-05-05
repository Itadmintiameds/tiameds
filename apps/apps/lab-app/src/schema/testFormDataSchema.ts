import {z} from 'zod';


export const testFormDataSchema = z.object({
  category: z.string().min(3).max(255),
  name: z.string().min(3).max(255),
  price: z.number().int().positive(),
});


