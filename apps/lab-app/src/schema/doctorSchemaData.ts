import { z } from 'zod';

export const doctorSchema = z.object({
  id: z.number().optional(),
  
  name: z
    .string()
    .min(3, { message: "Name should be at least 3 characters long." })
    .max(100, { message: "Name cannot exceed 100 characters." }),

  email: z
    .string()
    .email({ message: "Invalid email format." })
    .min(5, { message: "Email is required." })
    .max(255, { message: "Email is too long." }),

  speciality: z
    .string()
    .min(3, { message: "Speciality should be at least 3 characters long." })
    .max(100, { message: "Speciality cannot exceed 100 characters." }),

  qualification: z
    .string()
    .min(3, { message: "Qualification should be at least 3 characters long." })
    .max(100, { message: "Qualification cannot exceed 100 characters." }),

  hospitalAffiliation: z
    .string()
    .min(3, { message: "Hospital affiliation should be at least 3 characters long." })
    .max(150, { message: "Hospital affiliation cannot exceed 150 characters." }),

  licenseNumber: z
    .string()
    .min(5, { message: "License number should be at least 5 characters long." })
    .max(50, { message: "License number cannot exceed 50 characters." }),

  phone: z
    .number()
    .min(1000000000, { message: "Phone number should be at least 10 digits long." })
    .max(9999999999, { message: "Phone number cannot exceed 10 digits." }),

  address: z
    .string()
    .min(5, { message: "Address should be at least 5 characters long." })
    .max(300, { message: "Address cannot exceed 300 characters." }),

  city: z
    .string()
    .min(3, { message: "City should be at least 3 characters long." })
    .max(100, { message: "City cannot exceed 100 characters." }),

  state: z
    .string()
    .min(3, { message: "State should be at least 3 characters long." })
    .max(100, { message: "State cannot exceed 100 characters." }),

  country: z
    .string()
    .min(3, { message: "Country should be at least 3 characters long." })
    .max(100, { message: "Country cannot exceed 100 characters." }),
});
