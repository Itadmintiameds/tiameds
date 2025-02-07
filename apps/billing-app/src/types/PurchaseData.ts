
export interface PurchaseItem {
    itemId: number;
    batchNo: string;
    packageQuantity: number;
    expiryDate: string;
    purchasePrice: number;
    mrpSalePrice: number;
    gstPercentage: number;
    gstAmount: number;
    discount: number;
    amount: number;
  }
  
  export interface PurchaseData {
    purchaseDate: Date;
    purchaseBillNo: string;
    creditPeriod: number;
    paymentDueDate: Date;
    supplierId: number;
    invoiceAmount: number;
    totalAmount: number;
    totalGst: number;
    totalDiscount: number;
    grandTotal: number;
  
    stockItemDtos: PurchaseItem[]; // Array to handle the one-to-many mapping
  }
  