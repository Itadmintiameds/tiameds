import { z } from "zod";

export const TestReferancePointSchema = z.object({
  id: z.number().optional(),
  category: z.string().min(1, "Category is required"),
  testName: z.string().min(1, "Test name is required"),
  testDescription: z.string().min(1, "Test description is required"),
  units: z.string().min(1, "Units are required"),
  gender: z.string().min(1, "Gender is required"),
  minReferenceRange: z.number().min(0, "Minimum reference range must be 0 or greater"),
  maxReferenceRange: z.number().min(0, "Maximum reference range must be 0 or greater"),
  ageMin: z.number().min(0, "Minimum age must be 0 or greater"),
  ageMax: z.number().min(0, "Maximum age must be 0 or greater").optional(),
  minAgeUnit: z.string().min(1, "Minimum age unit is required"),
  maxAgeUnit: z.string().min(1, "Maximum age unit is required").optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});