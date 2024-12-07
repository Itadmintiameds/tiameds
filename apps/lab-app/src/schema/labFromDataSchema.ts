import { z } from 'zod';

export const labFormDataSchema = z.object({
    name: z.string().min(1, { message: 'Lab Name is required' }),
    address: z.string().min(1, { message: 'Address is required' }),
    city: z.string().min(1, { message: 'City is required' }),
    state: z.string().min(1, { message: 'State is required' }),
    description: z.string().min(1, { message: 'Description is required' }),
    });