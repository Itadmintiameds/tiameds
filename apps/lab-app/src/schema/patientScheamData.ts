import { z } from 'zod';

export const patientSchema = z.object({
  firstName: z.string().min(2, { message: "First name must have at least 2 characters" }).max(50),
  lastName: z.string().min(2, { message: "Last name must have at least 2 characters" }).max(50),
  email: z.string().email({ message: "Invalid email format" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }).max(15),
  address: z.string().min(5).max(255),
  city: z.string().min(2).max(50),
  state: z.string().min(2).max(50),
  zip: z.string().min(5).max(10),
  bloodGroup: z.string().min(1).max(5),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date of birth must be in YYYY-MM-DD format" }),
  visit: z.object({
    visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Visit date must be in YYYY-MM-DD format" }),
    visitType: z.string().transform((val) => val.toLowerCase()), // Normalize to lowercase
    visitStatus: z.string().transform((val) => val.toLowerCase()), // Normalize to lowercase
    visitDescription: z.string().min(0).max(255).optional(),
    // doctorId: z.string().min(0).optional(),
    doctorId: z.union([z.string().min(0), z.number().min(0)]).optional(),
    testIds: z.array(z.number().min(0)),
    packageIds: z.array(z.number().min(0)),
    // insuranceIds: z.array(z.number().min(0)),
    billing: z.object({
      totalAmount: z.number().min(0).max(100000),
      paymentStatus: z.string().transform((val) => val.toLowerCase()), // Normalize to lowercase
      paymentMethod: z.string().transform((val) => val.toLowerCase()), // Normalize to lowercase
      paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Payment date must be in YYYY-MM-DD format" }),
      discount: z.coerce.number().min(0).max(100), // Coerce string to number
      gstRate: z.coerce.number().min(0).max(100), // Coerce string to number
      gstAmount: z.number().min(0),
      cgstAmount: z.number().min(0),
      sgstAmount: z.number().min(0),
      igstAmount: z.number().min(0),
      netAmount: z.number().min(0),
    }),
  }),
});
