'use client';

import React from 'react';


// Interface for Bill Count data
interface BillCountData {
  totalBills: number;
  cashBills: number;
  creditBills: number;
}

// Interface for Amount Billed data
interface AmountBilledData {
  totalSales: number;
  discount: number;
  netSales: number;
  cashBills: number;
  creditBills: number;
  totalWriteOff: number;
}

// Interface for Bill Due Amount data
interface BillDueAmountData {
  totalBillDue: number;
  cashBillDue: number;
  creditBillDue: number;
  excessReceived: number;
}

// Interface for Receipts data
interface ReceiptsData {
  totalReceipts: number;
  totalPayments: number;
  netReceipts: number;
}

// Interface for Mode of Payment data
interface ModeOfPaymentData {
  // Receipt Details
  receiptForCurrentBills: {
    cash: number;
    card: number;
    cheque: number;
    imps: number;
    wallet: number;
    total: number;
  };
  receiptForPastBills: {
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
  // Payment Details
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
  // Net Amount
  netAmount: {
    cash: number;
    card: number;
    cheque: number;
    imps: number;
    wallet: number;
    total: number;
  };
}

// Interface for Outsourced Lab Tests
interface OutsourcedLabTest {
  labTest: string;
  count: number;
  amount: number;
}

// Interface for Bill Details
interface BillDetail {
  slNo: number;
  billNo: string;
  billName: string;
  regLabNo: string;
  refCenter: string;
  billedAt: string;
  type: string;
  amount: number;
  discount: number;
  netAmount: number;
  refund: number;
  writeoff: number;
  received: number;
  advance: number;
  due: number;
}

// Interface for Bill Details Totals
interface BillDetailsTotals {
  amount: number;
  discount: number;
  netAmount: number;
  refund: number;
  writeoff: number;
  received: number;
  advance: number;
  due: number;
}

// Main interface for the component props
interface DayClosingSummaryProps {
  labName?: string;
  dateRange?: string;
  billCountData?: BillCountData;
  amountBilledData?: AmountBilledData;
  billDueAmountData?: BillDueAmountData;
  receiptsData?: ReceiptsData;
  modeOfPaymentData?: ModeOfPaymentData;
  outsourcedLabTests?: OutsourcedLabTest[];
  currentBillDetails?: BillDetail[];
  pastBillDetails?: BillDetail[];
  currentBillTotals?: BillDetailsTotals;
  pastBillTotals?: BillDetailsTotals;
  onPrint?: () => void;
  onExportCSV?: () => void;
}

const DayClosingSummary: React.FC<DayClosingSummaryProps> = ({

  billCountData = {
    totalBills: 0,
    cashBills: 0,
    creditBills: 0
  },
  amountBilledData = {
    totalSales: 0,
    discount: 0,
    netSales: 0,
    cashBills: 0.0,
    creditBills: 0.0,
    totalWriteOff: 0
  },
  billDueAmountData = {
    totalBillDue: 0.0,
    cashBillDue: 0.0,
    creditBillDue: 0.0,
    excessReceived: 0.0
  },
  receiptsData = {
    totalReceipts: 100.0,
    totalPayments: 100.0,
    netReceipts: 0.0
  },
  modeOfPaymentData = {
    receiptForCurrentBills: {
      cash: 0,
      card: 0,
      cheque: 0,
      imps: 0,
      wallet: 0,
      total: 0
    },
    receiptForPastBills: {
      cash: 0,
      card: 0,
      cheque: 0,
      imps: 0,
      wallet: 0,
      total: 0
    },
    otherReceipt: {
      cash: 0,
      card: 0,
      cheque: 0,
      imps: 0,
      wallet: 0,
      total: 0
    },
    advanceReceipt: {
      cash: 0,
      card: 0,
      cheque: 0,
      imps: 0,
      wallet: 0,
      total: 0
    },
    totalReceipt: {
      cash: 0,
      card: 0,
      cheque: 0,
      imps: 0,
      wallet: 0,
      total: 0
    },
    refund: {
      cash: 0,
      card: 0,
      cheque: 0,
      imps: 0,
      wallet: 0,
      total: 0
    },
    otherPayments: {
      cash: 0,
      card: 0,
      cheque: 0,
      imps: 0,
      wallet: 0,
      total: 0
    },
    totalPayment: {
      cash: 0,
      card: 0,
      cheque: 0,
      imps: 0,
      wallet: 0,
      total: 0
    },
    netAmount: {
      cash: 0,
      card: 0,
      cheque: 0,
      imps: 0,
      wallet: 0,
      total: 0
    }
  },
  outsourcedLabTests = [],
  currentBillDetails = [],
  pastBillDetails = [],
  currentBillTotals = {
    amount: 0,
    discount: 0,
    netAmount: 0,
    refund: 0,
    writeoff: 0,
    received: 0,
    advance: 0,
    due: 0
  },
  pastBillTotals = {
    amount: 0,
    discount: 0,
    netAmount: 0,
    refund: 0,
    writeoff: 0,
    received: 0,
    advance: 0,
    due: 0
  },

}) => {
  const formatCurrency = (amount: number): string => {
    return amount === 0 ? "0" : amount.toFixed(2);
  };



  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Content */}
      <div className="p-6 space-y-8">
        {/* Bill Count Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill Count</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Bills</p>
                <p className="text-2xl font-bold text-gray-900">{billCountData.totalBills}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Cash Bills</p>
                <p className="text-2xl font-bold text-gray-900">{billCountData.cashBills}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Credit Bills</p>
                <p className="text-2xl font-bold text-gray-900">{billCountData.creditBills}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Amount Billed Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Amount Billed</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">₹{formatCurrency(amountBilledData.totalSales)}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Discount</p>
                <p className="text-2xl font-bold text-gray-900">₹{formatCurrency(amountBilledData.discount)}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Net Sales</p>
                <p className="text-2xl font-bold text-gray-900">₹{formatCurrency(amountBilledData.netSales)}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Cash Bills</p>
                <p className="text-2xl font-bold text-gray-900">₹{formatCurrency(amountBilledData.cashBills)}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Credit Bills</p>
                <p className="text-2xl font-bold text-gray-900">₹{formatCurrency(amountBilledData.creditBills)}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Write off</p>
                <p className="text-2xl font-bold text-gray-900">₹{formatCurrency(amountBilledData.totalWriteOff)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bill Due Amount Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill Due Amount</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Bill Due</p>
                <p className="text-2xl font-bold text-gray-900">₹{formatCurrency(billDueAmountData.totalBillDue)}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Cash Bill Due</p>
                <p className="text-2xl font-bold text-gray-900">₹{formatCurrency(billDueAmountData.cashBillDue)}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Credit Bill Due</p>
                <p className="text-2xl font-bold text-gray-900">₹{formatCurrency(billDueAmountData.creditBillDue)}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Excess Received</p>
                <p className="text-2xl font-bold text-gray-900">₹{formatCurrency(billDueAmountData.excessReceived)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Receipts Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Receipts</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Receipts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Payments</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Receipts</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{formatCurrency(receiptsData.totalReceipts)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{formatCurrency(receiptsData.totalPayments)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{formatCurrency(receiptsData.netReceipts)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Mode of Payment Section */}
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
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 pl-8">Receipt for Current bills</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForCurrentBills.cash)}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForCurrentBills.card)}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForCurrentBills.cheque)}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForCurrentBills.imps)}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForCurrentBills.wallet)}</td>
                  <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForCurrentBills.total)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 pl-8">Receipt for Past bills</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForPastBills.cash)}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForPastBills.card)}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForPastBills.cheque)}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForPastBills.imps)}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForPastBills.wallet)}</td>
                  <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">₹{formatCurrency(modeOfPaymentData.receiptForPastBills.total)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 pl-8">Other Receipt</td>
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

                {/* Net Amount Section */}
                <tr className="bg-blue-100 font-bold">
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 pl-8">Net Amount</td>
                  <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.netAmount.cash)}</td>
                  <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.netAmount.card)}</td>
                  <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.netAmount.cheque)}</td>
                  <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.netAmount.imps)}</td>
                  <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.netAmount.wallet)}</td>
                  <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.netAmount.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Outsourced Lab Tests Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Outsourced Lab Tests</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lab tests</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {outsourcedLabTests.length > 0 ? (
                  outsourcedLabTests.map((test, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">{test.labTest}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">{test.count}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">₹{formatCurrency(test.amount)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">No outsourced lab tests data available</td>
                  </tr>
                )}
                {outsourcedLabTests.length > 0 && (
                  <tr className="bg-gray-100 font-semibold">
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">Total</td>
                    <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">
                      {outsourcedLabTests.reduce((sum, test) => sum + test.count, 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">
                      ₹{formatCurrency(outsourcedLabTests.reduce((sum, test) => sum + test.amount, 0))}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Current Bill Details Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Bill Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sl no.</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill No.</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill name</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg/Lab no</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref.center / Referred by</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billed at</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Net Amount</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Refund</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Writeoff</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Advance</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentBillDetails.length > 0 ? (
                  currentBillDetails.map((bill, index) => (
                    <tr key={index}>
                      <td className="px-2 py-3 text-sm text-gray-900">{bill.slNo}</td>
                      <td className="px-2 py-3 text-sm text-gray-900">{bill.billNo}</td>
                      <td className="px-2 py-3 text-sm text-gray-900">{bill.billName}</td>
                      <td className="px-2 py-3 text-sm text-gray-900">{bill.regLabNo}</td>
                      <td className="px-2 py-3 text-sm text-gray-900">{bill.refCenter}</td>
                      <td className="px-2 py-3 text-sm text-gray-900">{bill.billedAt}</td>
                      <td className="px-2 py-3 text-sm text-center text-gray-900">{bill.type}</td>
                      <td className="px-2 py-3 text-sm text-center text-gray-900">₹{formatCurrency(bill.amount)}</td>
                      <td className="px-2 py-3 text-sm text-center text-gray-900">₹{formatCurrency(bill.discount)}</td>
                      <td className="px-2 py-3 text-sm text-center text-gray-900">₹{formatCurrency(bill.netAmount)}</td>
                      <td className="px-2 py-3 text-sm text-center text-gray-900">₹{formatCurrency(bill.refund)}</td>
                      <td className="px-2 py-3 text-sm text-center text-gray-900">₹{formatCurrency(bill.writeoff)}</td>
                      <td className="px-2 py-3 text-sm text-center text-gray-900">₹{formatCurrency(bill.received)}</td>
                      <td className="px-2 py-3 text-sm text-center text-gray-900">₹{formatCurrency(bill.advance)}</td>
                      <td className="px-2 py-3 text-sm text-center text-gray-900">₹{formatCurrency(bill.due)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={15} className="px-4 py-8 text-center text-gray-500">No current bill details available</td>
                  </tr>
                )}
                {currentBillDetails.length > 0 && (
                  <tr className="bg-gray-100 font-semibold">
                    <td className="px-2 py-3 text-sm font-bold text-gray-900" colSpan={7}>Total</td>
                    <td className="px-2 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(currentBillTotals.amount)}</td>
                    <td className="px-2 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(currentBillTotals.discount)}</td>
                    <td className="px-2 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(currentBillTotals.netAmount)}</td>
                    <td className="px-2 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(currentBillTotals.refund)}</td>
                    <td className="px-2 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(currentBillTotals.writeoff)}</td>
                    <td className="px-2 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(currentBillTotals.received)}</td>
                    <td className="px-2 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(currentBillTotals.advance)}</td>
                    <td className="px-2 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(currentBillTotals.due)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Past Bill Details Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Past Bill Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sl no.</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill No.</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill name</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg/Lab no</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref.center / Referred by</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billed at</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Net Amount</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Refund</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Writeoff</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Advance</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pastBillDetails.length > 0 ? (
                  pastBillDetails.map((bill, index) => (
                    <tr key={index}>
                      <td className="px-2 py-3 text-sm text-gray-900">{bill.slNo}</td>
                      <td className="px-2 py-3 text-sm text-gray-900">{bill.billNo}</td>
                      <td className="px-2 py-3 text-sm text-gray-900">{bill.billName}</td>
                      <td className="px-2 py-3 text-sm text-gray-900">{bill.regLabNo}</td>
                      <td className="px-2 py-3 text-sm text-gray-900">{bill.refCenter}</td>
                      <td className="px-2 py-3 text-sm text-gray-900">{bill.billedAt}</td>
                      <td className="px-2 py-3 text-sm text-center text-gray-900">{bill.type}</td>
                      <td className="px-2 py-3 text-sm text-center text-gray-900">₹{formatCurrency(bill.amount)}</td>
                      <td className="px-2 py-3 text-sm text-center text-gray-900">₹{formatCurrency(bill.discount)}</td>
                      <td className="px-2 py-3 text-sm text-center text-gray-900">₹{formatCurrency(bill.netAmount)}</td>
                      <td className="px-2 py-3 text-sm text-center text-gray-900">₹{formatCurrency(bill.refund)}</td>
                      <td className="px-2 py-3 text-sm text-center text-gray-900">₹{formatCurrency(bill.writeoff)}</td>
                      <td className="px-2 py-3 text-sm text-center text-gray-900">₹{formatCurrency(bill.received)}</td>
                      <td className="px-2 py-3 text-sm text-center text-gray-900">₹{formatCurrency(bill.advance)}</td>
                      <td className="px-2 py-3 text-sm text-center text-gray-900">₹{formatCurrency(bill.due)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={15} className="px-4 py-8 text-center text-gray-500">No past bill details available</td>
                  </tr>
                )}
                {pastBillDetails.length > 0 && (
                  <tr className="bg-gray-100 font-semibold">
                    <td className="px-2 py-3 text-sm font-bold text-gray-900" colSpan={7}>Total</td>
                    <td className="px-2 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(pastBillTotals.amount)}</td>
                    <td className="px-2 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(pastBillTotals.discount)}</td>
                    <td className="px-2 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(pastBillTotals.netAmount)}</td>
                    <td className="px-2 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(pastBillTotals.refund)}</td>
                    <td className="px-2 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(pastBillTotals.writeoff)}</td>
                    <td className="px-2 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(pastBillTotals.received)}</td>
                    <td className="px-2 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(pastBillTotals.advance)}</td>
                    <td className="px-2 py-3 text-sm text-center font-bold text-gray-900">₹{formatCurrency(pastBillTotals.due)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayClosingSummary;
