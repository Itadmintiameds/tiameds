import {z} from 'zod';
;

export const packageDataSchema = z.object({
  packageName: z.string().min(3).max(255),
  price: z.number().int().positive(),
  discount: z.number().int().positive(),
  testIds: z.array(z.number()).nonempty(),
});

