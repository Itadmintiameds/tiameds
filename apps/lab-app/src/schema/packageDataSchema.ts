import {z} from 'zod';
;

export const packageDataSchema = z.object({
  packageName: z.string().min(3, { message: "Package name must be at least 3 characters" }).max(255, { message: "Package name must be less than 255 characters" }),
  price: z.number().positive({ message: "Price must be greater than 0" }),
  discount: z.number().min(0, { message: "Discount must be 0 or greater" }).max(100, { message: "Discount cannot exceed 100%" }),
  testIds: z.array(z.number()).min(1, { message: "At least one test must be selected" }),
});

