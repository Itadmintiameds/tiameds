import { z } from "zod";

const testDiscountSchema = z.object({
  id: z.number(),
  discountAmount: z.number(),
  discountPercent: z.number(),
  finalPrice: z.number(),
});

const billingSchema = z.object({
  billingId: z.number(),
  totalAmount: z.number(),
  paymentStatus: z.string(),
  paymentMethod: z.string(),
  paymentDate: z.string(), // You can use z.coerce.date() if you want to parse it to Date
  discount: z.number(),
  gstRate: z.number(),
  gstAmount: z.number(),
  cgstAmount: z.number(),
  sgstAmount: z.number(),
  igstAmount: z.number(),
  netAmount: z.number(),
  discountReason: z.string(),
  discountPercentage: z.number()
});

const visitSchema = z.object({
  visitId: z.number(),
  visitDate: z.string(),
  visitType: z.string(),
  visitStatus: z.string(),
  visitDescription: z.string(),
  doctorId: z.string().nullable(),
  testIds: z.array(z.number()),
  packageIds: z.array(z.number()),
  insuranceIds: z.array(z.number()),
  billing: billingSchema,
  listofeachtestdiscount: z.array(testDiscountSchema)
});

export const EditPatientSchema = z.object({
  id: z.number(),
  firstName: z.string().min(2, { message: "Patient name must have at least 2 characters" }).max(50, { message: "Patient name must have at most 50 characters" }),
  lastName: z.string(),
  email: z.string(),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }).max(10, { message: "Phone number must be at most 10 digits" }),
  address: z.string(),
  city: z.string().min(2, { message: "City must have at least 2 characters" }).max(50, { message: "City must have at most 50 characters" }),
  state: z.string(),
  zip: z.string(),
  bloodGroup: z.string(),
  dateOfBirth: z.string(),
  gender: z.string(),
  visit: visitSchema
});
