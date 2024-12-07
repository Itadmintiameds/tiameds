import { z } from 'zod';

export const formDataSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  phone: z.string().min(10, { message: 'Phone number should be at least 10 digits' }),
  address: z.string().min(1, { message: 'Address is required' }),
  city: z.string().min(1, { message: 'City is required' }),
  state: z.string().min(1, { message: 'State is required' }),
  zip: z.string().min(1, { message: 'ZIP code is required' }),
  country: z.string().min(1, { message: 'Country is required' }),
  modules: z.array(z.number()).default([1]), // Default is [1]
  verified: z.boolean().default(false), // Default is false
});
