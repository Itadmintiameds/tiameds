import { z } from 'zod';  

export const purchaseSchema = z.object({

    purchaseDate: z.string().min(1, { message: 'Purchase Date is required' }),

    purchaseBillNo: z
    .string()
    .min(3, { message: "Bill No. should be at least 3 characters long." })
    .max(15, { message: "Bill No. cannot exceed 15 characters." }),

    creditPeriod: z.string().min(1, { message: 'Credit Period is required' }),

    paymentDueDate: z.string().min(1, { message: 'Payment Due Date is required' }),

    supplierSearch: z.string().min(1, { message: 'Supplier is required' }),

    invoiceAmount: z.string().min(1, { message: 'Invoice Amount is required' }),

    itemSearch: z.string().min(1, { message: 'Name of the Item is required' }),

    batchNo: z
    .string()
    .min(3, { message: "Batch No. should be at least 3 characters long." })
    .max(15, { message: "Batch No. cannot exceed 15 characters." }),

    packageQuantity: z.string().min(1, { message: 'Package Quantity is required' }),

    expiryDate: z.string().min(1, { message: 'Expiry Date is required' }),

});