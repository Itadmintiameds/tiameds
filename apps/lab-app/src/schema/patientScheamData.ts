import {z} from 'zod';

export const patientSchema = z.object({
  id: z.number().min(0, { message: "ID cannot be negative" }),
  firstName: z.string().min(2, { message: "First name must have at least 2 characters" }).max(50, { message: "First name must not exceed 50 characters" }),
  lastName: z.string().min(2, { message: "Last name must have at least 2 characters" }).max(50, { message: "Last name must not exceed 50 characters" }),
  email: z.string().email({ message: "Invalid email format" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }).max(15, { message: "Phone number must not exceed 15 digits" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }).max(255, { message: "Address must not exceed 255 characters" }),
  city: z.string().min(2, { message: "City must have at least 2 characters" }).max(50, { message: "City name must not exceed 50 characters" }),
  state: z.string().min(2, { message: "State must have at least 2 characters" }).max(50, { message: "State name must not exceed 50 characters" }),
  zip: z.string().min(5, { message: "Zip code must have at least 5 characters" }).max(10, { message: "Zip code must not exceed 10 characters" }),
  bloodGroup: z.string().min(2, { message: "Blood group must have at least 2 characters" }).max(5, { message: "Blood group name must not exceed 5 characters" }),
  dateOfBirth: z.string().min(10, { message: "Date of birth must be in YYYY-MM-DD format" }).max(10, { message: "Date of birth format is invalid" }),

  visit: z.object({
    visitDate: z.string().min(10, { message: "Visit date must be in YYYY-MM-DD format" }).max(10, { message: "Visit date format is invalid" }),
    visitType: z.string().min(2, { message: "Visit type must have at least 2 characters" }).max(50, { message: "Visit type must not exceed 50 characters" }),
    visitStatus: z.string().min(2, { message: "Visit status must have at least 2 characters" }).max(20, { message: "Visit status must not exceed 20 characters" }),
    visitDescription: z.string().min(5, { message: "Visit description must be at least 5 characters" }).max(255, { message: "Visit description must not exceed 255 characters" }),
    doctorId: z.number().min(0, { message: "Doctor ID cannot be negative" }),

    testIds: z.array(z.number().min(0, { message: "Test ID cannot be negative" })),
    packageIds: z.array(z.number().min(0, { message: "Package ID cannot be negative" })),
    insuranceIds: z.array(z.number().min(0, { message: "Insurance ID cannot be negative" })),

    billing: z.object({
      totalAmount: z.number().min(0, { message: "Total amount cannot be negative" }).max(100000, { message: "Total amount must not exceed 100,000" }),
      paymentStatus: z.string().min(2, { message: "Payment status must have at least 2 characters" }).max(20, { message: "Payment status must not exceed 20 characters" }),
      paymentMethod: z.string().min(2, { message: "Payment method must have at least 2 characters" }).max(20, { message: "Payment method must not exceed 20 characters" }),
      paymentDate: z.string().min(10, { message: "Payment date must be in YYYY-MM-DD format" }).max(10, { message: "Payment date format is invalid" }),
      discount: z.number().min(0, { message: "Discount cannot be negative" }).max(100, { message: "Discount must not exceed 100%" }),
      gstRate: z.number().min(0, { message: "GST rate cannot be negative" }).max(100, { message: "GST rate must not exceed 100%" }),
      gstAmount: z.number().min(0, { message: "GST amount cannot be negative" }),
      cgstAmount: z.number().min(0, { message: "CGST amount cannot be negative" }),
      sgstAmount: z.number().min(0, { message: "SGST amount cannot be negative" }),
      igstAmount: z.number().min(0, { message: "IGST amount cannot be negative" }),
      netAmount: z.number().min(0, { message: "Net amount cannot be negative" }),
    }),
  }),
});
