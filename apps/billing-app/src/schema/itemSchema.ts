import { z } from 'zod';  

export const itemSchema = z.object({
    itemName: z
    .string()
    .min(3, { message: "Name should be at least 3 characters long." })
    .max(100, { message: "Name cannot exceed 100 characters." }),

    purchaseUnit: z
    .string()
    .min(1, { message: "Purchase Unit should be at least 1 characters long." })
    .max(5, { message: "Purchase Unit cannot exceed 5 characters." }),

    unitType: z.string().min(1, { message: 'Unit Type is required' }),

    purchasePrice: z
    .string()
    .min(1, { message: "Purchase Price should be at least 1 characters long." })
    .max(6, { message: "Purchase Price cannot exceed 6 characters." }),

    mrpSalePrice: z
    .string()
    .min(1, { message: "MRP should be at least 1 characters long." })
    .max(6, { message: "MRP cannot exceed 6 characters." }),

    purchasePricePerUnit: z
    .string()
    .min(1, { message: "Purchase Price Per Unit should be at least 1 characters long." })
    .max(6, { message: "Purchase Price Per Unit cannot exceed 6 characters." }),


    mrpSalePricePerUnit: z
    .string()
    .min(1, { message: "Purchase Price Per Unit should be at least 1 characters long." })
    .max(6, { message: "Purchase Price Per Unit cannot exceed 6 characters." }),

    gstPercentage: z.string().min(1, { message: 'GST% is required' }),

    hsnNo: z.string().min(1, { message: 'HSN No. is required' }),
});