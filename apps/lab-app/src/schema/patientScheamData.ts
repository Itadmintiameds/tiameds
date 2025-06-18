import { z } from 'zod';

export const patientSchema = z.object({
  firstName: z.string().min(2, { message: "First name must have at least 2 characters" }).min(2).max(50),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }).max(10, { message: "Phone number must be at most 10 digits" }),
  city: z.string().min(2).max(50),
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
      discount: z.coerce.number().min(0),
      gstRate: z.coerce.number().min(0).max(100),
      gstAmount: z.number().min(0),
      cgstAmount: z.number().min(0),
      sgstAmount: z.number().min(0),
      igstAmount: z.number().min(0),
      netAmount: z.number().min(0),
    }),
  }),
});
