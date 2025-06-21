import { z } from "zod";

export const memberSchema = z.object({
    username: z.string().min(2, "Username is required"),
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z.string().min(10, "Phone number must be at least 10 characters long").max(10, "Phone number must be at most 15 characters long"),
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    address: z.string().min(2, "Address is required").max(100, "Address must be at most 100 characters long"),
    city: z.string().min(2, "City is required").max(50, "City must be at most 50 characters long"),
    state: z.string().min(2, "State is required").max(50, "State must be at most 50 characters long"),
    zip: z.string().min(5, "Zip code must be at least 5 characters long").max(10, "Zip code must be at most 10 characters long"),
    country: z.string().min(2, "Country is required").max(50, "Country must be at most 50 characters long"),
    roles: z.array(z.string()).nonempty("At least one role is required"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});