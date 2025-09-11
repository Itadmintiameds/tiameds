// CSV utility functions for data export

// Interface for amount received data
interface AmountReceivedItem {
  slNo: number;
  receiptNo: string;
  receiptDate: string;
  patientName: string;
  billNo: string;
  billType: string;
  type: string;
  paymentType: string;
  paymentAmount: number;
  billedDate: string;
  totalAmount: number;
  discount: number;
  due: number;
  received: number;
  netReceived: number;
  receivedBy: string;
  refund?: number;
}

// Interface for transaction data
interface Transaction {
  cash_amount?: number;
  card_amount?: number;
  upi_amount?: number;
  refund_amount?: number;
}

// Interface for billing data
interface Billing {
  transactions?: Transaction[];
}

// Interface for visit data
interface Visit {
  billing: Billing;
}

// Interface for patient data
interface PatientData {
  visit: Visit;
}

// Utility function to convert data to CSV format (matching UI exactly)
export const convertToCSV = (data: AmountReceivedItem[], rawApiData: PatientData[]) => {
    if (!data || data.length === 0) return '';

     // CSV headers matching the UI table headers exactly + payment method columns
     const headers = [
         'Sl no.',
         'Receipt no. Receipt Date',
         'Patient name',
         'Bill no/Bill type/type',
         'Payment Type',
         'Billed date',
         'Total amount',
         'Discount',
         'Due',
         'Received',
         'Net received',
         'Received by',
         'Cash',
         'Card',
         'UPI'
     ];

    // Convert data to CSV rows matching UI structure
    const csvRows = data.map((item, index) => {
        const rawData = rawApiData[index];
        const refundAmount = rawData?.visit?.billing?.transactions?.reduce(
            (sum: number, t: Transaction) => sum + (t.refund_amount || 0), 0
        ) || 0;

        // Format multi-line cells exactly as shown in UI
        const receiptNoWithDate = `${item.receiptNo}\n${formatDate(item.receiptDate)}`;
        const billInfo = `${item.billNo}\n${item.billType} / ${item.type}`;
        const paymentTypeWithAmount = `${item.paymentType}\n${formatAmount(item.paymentAmount)}`;
        const dueWithRefund = refundAmount > 0 ? `${formatAmount(item.due)}\nRefund: ${formatAmount(refundAmount)}` : formatAmount(item.due);

         // Get payment method amounts for this row
         const transactions = rawData?.visit?.billing?.transactions || [];
         const cashAmount = transactions.reduce((sum: number, t: Transaction) => sum + (t.cash_amount || 0), 0);
         const cardAmount = transactions.reduce((sum: number, t: Transaction) => sum + (t.card_amount || 0), 0);
         const upiAmount = transactions.reduce((sum: number, t: Transaction) => sum + (t.upi_amount || 0), 0);

         return [
             item.slNo,
             receiptNoWithDate,
             item.patientName,
             billInfo,
             paymentTypeWithAmount,
             formatDate(item.billedDate),
             formatAmount(item.totalAmount),
             formatAmount(item.discount),
             dueWithRefund,
             formatAmount(item.received),
             formatAmount(item.netReceived),
             item.receivedBy,
             formatAmount(cashAmount),
             formatAmount(cardAmount),
             formatAmount(upiAmount)
         ].map(field => `"${field}"`).join(',');
    });

    // Calculate totals exactly as in UI
    const totals = data.reduce((acc, item, index) => {
        const rawData = rawApiData[index];
        const transactions = rawData?.visit?.billing?.transactions || [];

        const cashTotal = transactions.reduce((sum: number, t: Transaction) => sum + (t.cash_amount || 0), 0);
        const cardTotal = transactions.reduce((sum: number, t: Transaction) => sum + (t.card_amount || 0), 0);
        const upiTotal = transactions.reduce((sum: number, t: Transaction) => sum + (t.upi_amount || 0), 0);
        const refundTotal = transactions.reduce((sum: number, t: Transaction) => sum + (t.refund_amount || 0), 0);

        return {
            totalAmount: acc.totalAmount + item.totalAmount,
            discount: acc.discount + item.discount,
            due: acc.due + item.due,
            received: acc.received + item.received,
            netReceived: acc.netReceived + item.netReceived,
            refund: acc.refund + refundTotal,
            cashTotal: acc.cashTotal + cashTotal,
            cardTotal: acc.cardTotal + cardTotal,
            upiTotal: acc.upiTotal + upiTotal
        };
    }, {
        totalAmount: 0,
        discount: 0,
        due: 0,
        received: 0,
        netReceived: 0,
        refund: 0,
        cashTotal: 0,
        cardTotal: 0,
        upiTotal: 0
    });

     // Add totals row matching UI footer
     const totalsRow = [
         'TOTAL:',
         '',
         '',
         '',
         '',
         '',
         formatAmount(totals.totalAmount),
         formatAmount(totals.discount),
         `${formatAmount(totals.due)}\nRefund: ${formatAmount(totals.refund)}`,
         formatAmount(totals.received),
         formatAmount(totals.netReceived),
         '',
         formatAmount(totals.cashTotal),
         formatAmount(totals.cardTotal),
         formatAmount(totals.upiTotal)
     ].map(field => `"${field}"`).join(',');

    // Combine all rows (payment methods now have dedicated columns)
    const allRows = [headers.join(','), ...csvRows, totalsRow];

    return allRows.join('\n');
};

// Function to download CSV file
export const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// Helper function to format amounts - show "0" instead of "0.00"
export const formatAmount = (amount: number): string => {
    return amount === 0 ? "0" : amount.toFixed(2);
};

// Helper function to format dates from yyyy-mm-dd to dd-mm-yyyy
export const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
};

// Generate filename with current date
export const generateCSVFilename = (prefix: string = 'export'): string => {
    const currentDate = new Date().toISOString().split('T')[0];
    return `${prefix}-${currentDate}.csv`;
};
