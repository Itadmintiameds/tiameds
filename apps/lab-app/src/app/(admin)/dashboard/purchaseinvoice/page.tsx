'use client';

import PurchaseInvoiceSummary, {
  PurchaseInvoiceSummaryData,
} from '../../component/common/PurchaseInvoiceSummary';

const SAMPLE_INVOICE: PurchaseInvoiceSummaryData = {
  supplier: 'ABC Pharma Distributor',
  invoiceNo: 'MLPh/2026-27/00847',
  invoiceDate: '22 Jul 2026',
  grn: 'GRN240087',
  paymentType: 'Credit',
  creditDays: '30 Days',
  dueDate: '21 Aug 2026',
  billTo: {
    name: 'Sai Medical & General Store',
    address: 'Shop No. 7, Shivaji Nagar, Thane West - 400601',
    gstin: '27BCDSA5678G2H3',
    drugLicenseNo: 'MH-THN-789012',
  },
  products: [
    {
      brandName: 'Micro Labs',
      qty: '12',
      free: '5',
      variant: '10x15',
      productName: 'Dolo 650',
      hsn: '3152',
      batch: '323332',
      expiry: '01/28',
      mrp: '25.01',
      value: '5465.55',
      discountPercent: '25',
      gstPercent: '12.00',
      amount: '56662.25',
    },
    {
      brandName: 'Cipla Ltd.',
      qty: '10',
      free: '8',
      variant: '10x15',
      productName: 'Paracetamol',
      hsn: '3131',
      batch: '464664',
      expiry: '01/28',
      mrp: '25.21',
      value: '232.555',
      discountPercent: '30',
      gstPercent: '12.00',
      amount: '64646.25',
    },
    {
      brandName: 'Reddy Labs',
      qty: '18',
      free: '20',
      variant: '10x15',
      productName: 'Crocin Advance',
      hsn: '1333',
      batch: '666653',
      expiry: '01/28',
      mrp: '135.25',
      value: '46464.23',
      discountPercent: '66',
      gstPercent: '12.00',
      amount: '56646.225',
    },
  ],
  taxable: '54,330.40',
  cgstPercent: '6.00',
  cgstAmt: '3,113.72',
  sgstPercent: '6.00',
  sgstAmt: '3544.00',
  exempted: '',
  freeGst: '0.00',
  bank: { name: '', branch: '', accountNo: '', ifsc: '' },
  itemsCount: '26',
  qty: '9469',
  crDbRound: '0.84',
  grossAmt: '54,330.40',
  discountAmt: '0.00',
  taxableAmt: '3,113.72',
  sgstAmt2: '3,115.78',
  cgstAmt2: '3,115.78',
  igstAmt: '3,115.78',
  netPayable: '60,557.00',
  amountInWords: 'Rupees Sixty Thousand Five Hundred Fifty Seven Only',
};

const PurchaseInvoicePage = () => {
  return (
    <PurchaseInvoiceSummary
      data={SAMPLE_INVOICE}
      onBack={() => window.history.back()}
      onSave={() => {}}
    />
  );
};

export default PurchaseInvoicePage;
