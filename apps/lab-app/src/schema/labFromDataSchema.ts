import { z } from 'zod';



export const labFormDataSchema = z.object({
    name: z.string().min(3, "Name is required"),
    labType: z.string().min(3, "Lab type is required"),
    description: z.string().optional(),
    address: z.string().min(2, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    labZip: z.string().min(1, "Zip code is required"),
    labCountry: z.string().min(1, "Country is required"),
    labLogo: z.string().optional(),
    labPhone: z.string().min(1, "Phone number is required"),
    labEmail: z.string().email("Invalid email format").optional(),
    directorName: z.string().min(1, "Director's name is required"),
    directorEmail: z.string().email("Invalid email format").optional(),
    directorPhone: z.string().min(1, "Director's phone number is required"),
    directorGovtId: z.string().optional(),
    licenseNumber: z.string().optional(),
    labBusinessRegistration: z.string().optional(),
    labLicense: z.string().optional(),
    taxId: z.string().optional(),
    labCertificate: z.string().optional(),
    labAccreditation: z.string().optional(),
    certificationBody: z.string().optional(),
    dataPrivacyAgreement: z.boolean().refine(val => val === true, {
        message: "Data privacy agreement must be accepted"
    }),
    isActive: z.boolean()
    });