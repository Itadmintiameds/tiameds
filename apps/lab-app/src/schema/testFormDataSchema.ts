// import {z} from 'zod';


// export const testFormDataSchema = z.object({
//   category: z.string().min(2).max(255),
//   name: z.string().min(2).max(255),
//   price: z.number().int().positive(),
// });


import { z } from "zod";

export const testFormDataSchema = z.object({
  category: z.string().min(2).max(255),
  name: z
    .string()
    .min(2)
    .max(255)
    .regex(/^[A-Za-z][A-Za-z0-9 ]*$/, "Name must start with a letter and contain only letters, numbers, and spaces"),
  price: z.number().int().positive(),
});
