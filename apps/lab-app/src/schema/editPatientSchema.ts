import { z } from "zod";

// const testDiscountSchema = z.object({
//   id: z.number(),
//   discountAmount: z.number(),
//   discountPercent: z.number(),
//   finalPrice: z.number(),
// });

// const billingSchema = z.object({
//   billingId: z.number(),
//   totalAmount: z.number(),
//   paymentStatus: z.string(),
//   paymentMethod: z.string(),
//   paymentDate: z.string(), // You can use z.coerce.date() if you want to parse it to Date
//   discount: z.number(),
//   gstRate: z.number(),
//   gstAmount: z.number(),
//   cgstAmount: z.number(),
//   sgstAmount: z.number(),
//   igstAmount: z.number(),
//   netAmount: z.number(),
//   discountReason: z.string().optional(),
//   discountPercentage: z.number()
// });

// const visitSchema = z.object({
//   visitId: z.number(),
//   visitDate: z.string(),
//   visitType: z.string(),
//   visitStatus: z.string(),
//   visitDescription: z.string(),
//   doctorId: z.string().nullable(),
//   testIds: z.array(z.number()),
//   packageIds: z.array(z.number()),
//   insuranceIds: z.array(z.number()),
//   billing: billingSchema,
//   listofeachtestdiscount: z.array(testDiscountSchema)
// });

// export const EditPatientSchema = z.object({
//   id: z.number(),
//   firstName: z.string().min(2, { message: "Patient name must have at least 2 characters" }).max(50, { message: "Patient name must have at most 50 characters" }),
//   lastName: z.string(),
//   email: z.string(),
//   phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }).max(10, { message: "Phone number must be at most 10 digits" }),
//   address: z.string(),
//   city: z.string().min(2, { message: "City must have at least 2 characters" }).max(50, { message: "City must have at most 50 characters" }),
//   state: z.string(),
//   zip: z.string(),
//   bloodGroup: z.string(),
//   dateOfBirth: z.string(),
//   gender: z.string(),
//   visit: visitSchema
// });
export const EditPatientSchema = z.object({
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
    // doctorId: z.union([
    //   z.string().min(1).transform(Number),  // If it's a string, convert to number
    //   z.number(),                          // If it's already a number
    //   z.null()                             // Explicitly allow null
    // ]).optional().nullable(),
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
      discountReason: z.string().optional()
    }),
  }),
});
