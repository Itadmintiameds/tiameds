'use client';

import React from 'react';

// Interface for Receipt Summary data
interface ReceiptSummaryData {
  totalSales: number;
  totalDiscount: number;
  netAmount: number;
  cashSales: number;
  creditSales: number;
  due: number;
  excessReceived: number;
  refund: number;
  totalReceipts: number;
  netReceipts: number;
}

// Interface for Mode of Payment data
interface ModeOfPaymentData {
  receiptForCurrentCashBills: {
    cash: number;
    card: number;
    cheque: number;
    imps: number;
    wallet: number;
    total: number;
  };
  receiptForCurrentCreditBills: {
    cash: number;
    card: number;
    cheque: number;
    imps: number;
    wallet: number;
    total: number;
  };
  receiptForPastCashBills: {
    cash: number;
    card: number;
    cheque: number;
    imps: number;
    wallet: number;
    total: number;
  };
  receiptForPastCreditBills: {
    cash: number;
    card: number;
    cheque: number;
    imps: number;
    wallet: number;
    total: number;
  };
  otherReceipt: {
    cash: number;
    card: number;
    cheque: number;
    imps: number;
    wallet: number;
    total: number;
  };
  advanceReceipt: {
    cash: number;
    card: number;
    cheque: number;
    imps: number;
    wallet: number;
    total: number;
  };
  totalReceipt: {
    cash: number;
    card: number;
    cheque: number;
    imps: number;
    wallet: number;
    total: number;
  };
  refund: {
    cash: number;
    card: number;
    cheque: number;
    imps: number;
    wallet: number;
    total: number;
  };
  otherPayments: {
    cash: number;
    card: number;
    cheque: number;
    imps: number;
    wallet: number;
    total: number;
  };
  totalPayment: {
    cash: number;
    card: number;
    cheque: number;
    imps: number;
    wallet: number;
    total: number;
  };
  netAmount: {
    cash: number;
    card: number;
    cheque: number;
    imps: number;
    wallet: number;
    total: number;
  };
}

// Interface for Outsource Test Amount
interface OutsourceTestAmount {
  amount: number;
}

// Props interface
interface ReceiptsSummaryProps {
  receiptSummaryData: ReceiptSummaryData;
  modeOfPaymentData: ModeOfPaymentData;
  outsourceTestAmount: OutsourceTestAmount;
  onPrint?: () => void;
  onExportCSV?: () => void;
}

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return amount.toFixed(1);
};

const ReceiptsSummary: React.FC<ReceiptsSummaryProps> = ({
  receiptSummaryData,
  modeOfPaymentData,
  outsourceTestAmount,

}) => {
  return (
    <div className="space-y-6">
      {/* Receipt Summary Table */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Receipt Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg border border-gray-200">
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Total Sales</td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">₹{formatCurrency(receiptSummaryData.totalSales)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Total Discount</td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">₹{formatCurrency(receiptSummaryData.totalDiscount)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Net Amount</td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">₹{formatCurrency(receiptSummaryData.netAmount)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Cash Sales</td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">₹{formatCurrency(receiptSummaryData.cashSales)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Credit Sales</td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">₹{formatCurrency(receiptSummaryData.creditSales)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Due</td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">₹{formatCurrency(receiptSummaryData.due)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Excess Received</td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">₹{formatCurrency(receiptSummaryData.excessReceived)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Refund</td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">₹{formatCurrency(receiptSummaryData.refund)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Total Receipts</td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">₹{formatCurrency(receiptSummaryData.totalReceipts)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Net Receipts</td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">₹{formatCurrency(receiptSummaryData.netReceipts)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Mode of Payment Table */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode of Payment</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Cash</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Card</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Cheque</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">IMPS</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Receipt Details Section */}
              <tr className="bg-blue-50">
                <td className="px-4 py-3 text-sm font-bold text-gray-900" colSpan={7}>Receipt Details</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 pl-8">Receipt for current cash bills</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForCurrentCashBills.cash)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForCurrentCashBills.card)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForCurrentCashBills.cheque)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForCurrentCashBills.imps)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForCurrentCashBills.wallet)}</td>
                <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForCurrentCashBills.total)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 pl-8">Receipt for current credit bills</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForCurrentCreditBills.cash)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForCurrentCreditBills.card)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForCurrentCreditBills.cheque)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForCurrentCreditBills.imps)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForCurrentCreditBills.wallet)}</td>
                <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForCurrentCreditBills.total)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 pl-8">Receipt for past cash bills</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForPastCashBills.cash)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForPastCashBills.card)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForPastCashBills.cheque)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForPastCashBills.imps)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForPastCashBills.wallet)}</td>
                <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForPastCashBills.total)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 pl-8">Receipt for past credit bills</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForPastCreditBills.cash)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForPastCreditBills.card)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForPastCreditBills.cheque)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForPastCreditBills.imps)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForPastCreditBills.wallet)}</td>
                <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForPastCreditBills.total)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 pl-8">Other Receipts</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.otherReceipt.cash)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.otherReceipt.card)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.otherReceipt.cheque)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.otherReceipt.imps)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.otherReceipt.wallet)}</td>
                <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">₹{formatCurrency(modeOfPaymentData.otherReceipt.total)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 pl-8">Advance Receipt</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.advanceReceipt.cash)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.advanceReceipt.card)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.advanceReceipt.cheque)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.advanceReceipt.imps)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.advanceReceipt.wallet)}</td>
                <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">₹{formatCurrency(modeOfPaymentData.advanceReceipt.total)}</td>
              </tr>
              <tr className="bg-gray-100 font-semibold">
                <td className="px-4 py-3 text-sm font-bold text-gray-900 pl-8">Total Receipt</td>
                <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.totalReceipt.cash)}</td>
                <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.totalReceipt.card)}</td>
                <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.totalReceipt.cheque)}</td>
                <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.totalReceipt.imps)}</td>
                <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.totalReceipt.wallet)}</td>
                <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.totalReceipt.total)}</td>
              </tr>

              {/* Empty row for spacing */}
              <tr>
                <td className="px-4 py-2" colSpan={7}></td>
              </tr>

              {/* Payment Details Section */}
              <tr className="bg-blue-50">
                <td className="px-4 py-3 text-sm font-bold text-gray-900" colSpan={7}>Payment Details</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 pl-8">Refund</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.refund.cash)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.refund.card)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.refund.cheque)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.refund.imps)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.refund.wallet)}</td>
                <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">₹{formatCurrency(modeOfPaymentData.refund.total)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 pl-8">Other Payments</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.otherPayments.cash)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.otherPayments.card)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.otherPayments.cheque)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.otherPayments.imps)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.otherPayments.wallet)}</td>
                <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">₹{formatCurrency(modeOfPaymentData.otherPayments.total)}</td>
              </tr>
              <tr className="bg-gray-100 font-semibold">
                <td className="px-4 py-3 text-sm font-bold text-gray-900 pl-8">Total Payment</td>
                <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.totalPayment.cash)}</td>
                <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.totalPayment.card)}</td>
                <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.totalPayment.cheque)}</td>
                <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.totalPayment.imps)}</td>
                <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.totalPayment.wallet)}</td>
                <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.totalPayment.total)}</td>
              </tr>

              {/* Empty row for spacing */}
              <tr>
                <td className="px-4 py-2" colSpan={7}></td>
              </tr>

              {/* Net Amount Row */}
              <tr className="bg-blue-100 font-bold">
                <td className="px-4 py-3 text-sm font-bold text-gray-900 pl-8">Net Amount</td>
                <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.netAmount.cash)}</td>
                <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.netAmount.card)}</td>
                <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.netAmount.cheque)}</td>
                <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.netAmount.imps)}</td>
                <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.netAmount.wallet)}</td>
                <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.netAmount.total)}</td>
              </tr>

              {/* Empty row for spacing */}
              <tr>
                <td className="px-4 py-2" colSpan={7}></td>
              </tr>

              {/* Outsource Test Amount Row */}
              <tr className="bg-green-50 font-semibold">
                <td className="px-4 py-3 text-sm font-bold text-gray-900 pl-8">Outsource Test Amount</td>
                <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(outsourceTestAmount.amount)}</td>
                <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹0.0</td>
                <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹0.0</td>
                <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹0.0</td>
                <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹0.0</td>
                <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(outsourceTestAmount.amount)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReceiptsSummary;
