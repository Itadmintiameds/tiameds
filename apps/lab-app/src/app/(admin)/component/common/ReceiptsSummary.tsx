'use client';

import React, { useState, useEffect } from 'react';
import { getDatewiseTransactionDetails } from '../../../../../services/patientServices';
import { useLabs } from '../../../../context/LabContext';

// Interface for Transaction Data (same as DayClosingSummary)
interface TransactionData {
  patient: {
    id: number;
    name: string;
    dateOfBirth: string;
    phoneNumber: string;
    email: string;
    address: string;
    gender: string;
    doctor?: {
      name: string;
    };
  };
  visit: {
    visitId: number;
    visitDate: string;
    visitType: string;
    billing: {
      billingId: number;
      billNumber: string;
      billingDate: string;
      totalAmount: number;
      discount: number;
      netAmount: number;
      due_amount: number;
      transactions: BillingTransaction[];
    };
  };
}

interface BillingTransaction {
  id: number;
  received_amount: number;
  refund_amount: number;
  payment_method: string;
  due_amount: number;
  created_at: string;
  updatedAt: string;
}

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

// Interface for Mode of Payment data (comprehensive structure)
interface ModeOfPaymentData {
  receiptForCurrentBills: {
    cash: number;
    card: number;
    upi: number;
    total: number;
  };
  receiptForPastBills: {
    cash: number;
    card: number;
    upi: number;
    total: number;
  };
  advanceReceipt: {
    cash: number;
    card: number;
    upi: number;
    total: number;
  };
  otherReceipt: {
    cash: number;
    card: number;
    upi: number;
    total: number;
  };
  totalReceipt: {
    cash: number;
    card: number;
    upi: number;
    total: number;
  };
  refund: {
    cash: number;
    card: number;
    upi: number;
    total: number;
  };
  otherPayments: {
    cash: number;
    card: number;
    upi: number;
    total: number;
  };
  totalPayment: {
    cash: number;
    card: number;
    upi: number;
    total: number;
  };
  netAmount: {
    cash: number;
    card: number;
    upi: number;
    total: number;
  };
}

// Props interface
interface ReceiptsSummaryProps {
  startDate?: string;
  endDate?: string;
  onPrint?: () => void;
  onExportCSV?: () => void;
}

// Helper function to format currency (same as DayClosingSummary)
const formatCurrency = (amount: number): string => {
  return amount === 0 ? "0" : amount.toFixed(2);
};

const ReceiptsSummary: React.FC<ReceiptsSummaryProps> = ({
  startDate,
  endDate,
}) => {
  const { currentLab } = useLabs();
  const [loading, setLoading] = useState(false);
  const [receiptSummaryData, setReceiptSummaryData] = useState<ReceiptSummaryData>({
    totalSales: 0,
    totalDiscount: 0,
    netAmount: 0,
    cashSales: 0,
    creditSales: 0,
    due: 0,
    excessReceived: 0,
    refund: 0,
    totalReceipts: 0,
    netReceipts: 0,
  });
  const [modeOfPaymentData, setModeOfPaymentData] = useState<ModeOfPaymentData>({
    receiptForCurrentBills: { cash: 0, card: 0, upi: 0, total: 0 },
    receiptForPastBills: { cash: 0, card: 0, upi: 0, total: 0 },
    advanceReceipt: { cash: 0, card: 0, upi: 0, total: 0 },
    otherReceipt: { cash: 0, card: 0, upi: 0, total: 0 },
    totalReceipt: { cash: 0, card: 0, upi: 0, total: 0 },
    refund: { cash: 0, card: 0, upi: 0, total: 0 },
    otherPayments: { cash: 0, card: 0, upi: 0, total: 0 },
    totalPayment: { cash: 0, card: 0, upi: 0, total: 0 },
    netAmount: { cash: 0, card: 0, upi: 0, total: 0 },
  });

  // Calculate receipt summary data from API (same logic as DayClosingSummary)
  const calculateReceiptSummary = (data: TransactionData[]): ReceiptSummaryData => {
    if (!data || data.length === 0) {
      return {
        totalSales: 0,
        totalDiscount: 0,
        netAmount: 0,
        cashSales: 0,
        creditSales: 0,
        due: 0,
        excessReceived: 0,
        refund: 0,
        totalReceipts: 0,
        netReceipts: 0,
      };
    }

    // Use all data from the date range, not just start date
    // Deduplicate by visit ID to avoid double counting
    const uniqueVisits = new Map();
    data.forEach(item => {
      const visitId = item.visit.visitId;
      if (!uniqueVisits.has(visitId)) {
        uniqueVisits.set(visitId, item);
      }
    });
    
    const uniqueVisitsArray = Array.from(uniqueVisits.values());
    
    // Calculate totals
    const totalSales = uniqueVisitsArray.reduce((sum, item) => sum + (item.visit.billing.totalAmount || 0), 0);
    const totalDiscount = uniqueVisitsArray.reduce((sum, item) => sum + (item.visit.billing.discount || 0), 0);
    const netAmount = uniqueVisitsArray.reduce((sum, item) => sum + (item.visit.billing.netAmount || 0), 0);
    
    // Calculate cash sales (visits with received amount > 0)
    const cashSales = uniqueVisitsArray.reduce((sum, item) => {
      const hasReceivedAmount = item.visit.billing.transactions?.some((t: BillingTransaction) => t.received_amount > 0) || false;
      return hasReceivedAmount ? sum + (item.visit.billing.netAmount || 0) : sum;
    }, 0);
    
    // Set credit sales to 0 by default (no API data available)
    const creditSales = 0;
    
    // Calculate due amount (minimum due for each visit) - same logic as DayClosingSummary
    const visitMinDue = new Map();
    data.forEach(item => {
      const visitId = item.visit.visitId;
      const billing = item.visit.billing;
      
      if (billing.transactions && billing.transactions.length > 0) {
        // Find the minimum due amount from all transactions
        let minDue = billing.netAmount || 0;
        billing.transactions.forEach((transaction: BillingTransaction) => {
          if (transaction.due_amount !== undefined && transaction.due_amount !== null) {
            minDue = Math.min(minDue, transaction.due_amount);
          }
        });
        visitMinDue.set(visitId, minDue);
      } else {
        visitMinDue.set(visitId, billing.due_amount || 0);
      }
    });
    
    const due = Array.from(visitMinDue.values()).reduce((sum, dueAmount) => sum + dueAmount, 0);
    
    // Calculate total receipts
    const totalReceipts = data.reduce((sum, item) => {
      return sum + (item.visit.billing.transactions?.reduce((transactionSum, transaction) => {
        return transactionSum + (transaction.received_amount || 0);
      }, 0) || 0);
    }, 0);
    
    // Calculate refunds
    const refund = data.reduce((sum, item) => {
      return sum + (item.visit.billing.transactions?.reduce((transactionSum, transaction) => {
        return transactionSum + (transaction.refund_amount || 0);
      }, 0) || 0);
    }, 0);
    
    const netReceipts = totalReceipts - refund;
    const excessReceived = Math.max(0, totalReceipts - netAmount);
    
    return {
      totalSales,
      totalDiscount,
      netAmount,
      cashSales,
      creditSales,
      due,
      excessReceived,
      refund,
      totalReceipts,
      netReceipts,
    };
  };

  // Calculate mode of payment data from API (comprehensive structure)
  const calculateModeOfPayment = (data: TransactionData[]): ModeOfPaymentData => {
    if (!data || data.length === 0) {
      return {
        receiptForCurrentBills: { cash: 0, card: 0, upi: 0, total: 0 },
        receiptForPastBills: { cash: 0, card: 0, upi: 0, total: 0 },
        advanceReceipt: { cash: 0, card: 0, upi: 0, total: 0 },
        otherReceipt: { cash: 0, card: 0, upi: 0, total: 0 },
        totalReceipt: { cash: 0, card: 0, upi: 0, total: 0 },
        refund: { cash: 0, card: 0, upi: 0, total: 0 },
        otherPayments: { cash: 0, card: 0, upi: 0, total: 0 },
        totalPayment: { cash: 0, card: 0, upi: 0, total: 0 },
        netAmount: { cash: 0, card: 0, upi: 0, total: 0 },
      };
    }

    // Filter for current bills only (visits with billing date matching selected date)
    const filteredDate = startDate || new Date().toISOString().split('T')[0];
    const currentBillsData = data.filter(patient => 
      patient.visit.billing.billingDate === filteredDate
    );
    
    // Calculate Receipt for Current bills (only current billing date visits with received payments)
    const receiptForCurrentBills = { cash: 0, card: 0, upi: 0, total: 0 };
    
    currentBillsData.forEach(patient => {
      const transactions = patient.visit.billing.transactions || [];
      transactions.forEach(transaction => {
        if (transaction.received_amount > 0) {
          const paymentMethod = transaction.payment_method?.toLowerCase() || '';
          const amount = transaction.received_amount;
          
          if (paymentMethod.includes('cash')) {
            receiptForCurrentBills.cash += amount;
          } else if (paymentMethod.includes('card')) {
            receiptForCurrentBills.card += amount;
          } else if (paymentMethod.includes('upi') || paymentMethod.includes('imps')) {
            receiptForCurrentBills.upi += amount;
          }
          
          receiptForCurrentBills.total += amount;
        }
      });
    });

    // Calculate Receipt for Past bills (bills with past billing date but transactions from today/filtered date)
    const receiptForPastBills = { cash: 0, card: 0, upi: 0, total: 0 };
    
    data.forEach(patient => {
      const billingDate = patient.visit.billing.billingDate;
      const transactions = patient.visit.billing.transactions || [];
      
      // Check if billing date is different from filtered date (past bill) but has transactions from filtered date
      if (billingDate !== filteredDate) {
        transactions.forEach(transaction => {
          const transactionDate = transaction.created_at.split('T')[0];
          if (transactionDate === filteredDate && transaction.received_amount > 0) {
            const paymentMethod = transaction.payment_method?.toLowerCase() || '';
            const amount = transaction.received_amount;
            
            if (paymentMethod.includes('cash')) {
              receiptForPastBills.cash += amount;
            } else if (paymentMethod.includes('card')) {
              receiptForPastBills.card += amount;
            } else if (paymentMethod.includes('upi') || paymentMethod.includes('imps')) {
              receiptForPastBills.upi += amount;
            }
            
            receiptForPastBills.total += amount;
          }
        });
      }
    });

    // Set other receipt types to 0 (no data available for these)
    const advanceReceipt = { cash: 0, card: 0, upi: 0, total: 0 };
    const otherReceipt = { cash: 0, card: 0, upi: 0, total: 0 };

    const totalReceipt = {
      cash: receiptForCurrentBills.cash + receiptForPastBills.cash + advanceReceipt.cash + otherReceipt.cash,
      card: receiptForCurrentBills.card + receiptForPastBills.card + advanceReceipt.card + otherReceipt.card,
      upi: receiptForCurrentBills.upi + receiptForPastBills.upi + advanceReceipt.upi + otherReceipt.upi,
      total: receiptForCurrentBills.total + receiptForPastBills.total + advanceReceipt.total + otherReceipt.total
    };
    
    // Calculate Refund (transactions with refund_amount > 0)
    const refund = { cash: 0, card: 0, upi: 0, total: 0 };
    
    data.forEach(patient => {
      const transactions = patient.visit.billing.transactions || [];
      transactions.forEach(transaction => {
        if (transaction.refund_amount > 0) {
          const paymentMethod = transaction.payment_method?.toLowerCase() || '';
          const amount = transaction.refund_amount;
          
          if (paymentMethod.includes('cash')) {
            refund.cash += amount;
          } else if (paymentMethod.includes('card')) {
            refund.card += amount;
          } else if (paymentMethod.includes('upi') || paymentMethod.includes('imps')) {
            refund.upi += amount;
          }
          
          refund.total += amount;
        }
      });
    });

    // Set other payments to 0 (no data available for these)
    const otherPayments = { cash: 0, card: 0, upi: 0, total: 0 };

    const totalPayment = {
      cash: refund.cash + otherPayments.cash,
      card: refund.card + otherPayments.card,
      upi: refund.upi + otherPayments.upi,
      total: refund.total + otherPayments.total
    };

    const netAmount = {
      cash: totalReceipt.cash - totalPayment.cash,
      card: totalReceipt.card - totalPayment.card,
      upi: totalReceipt.upi - totalPayment.upi,
      total: totalReceipt.total - totalPayment.total
    };

    return {
      receiptForCurrentBills,
      receiptForPastBills,
      advanceReceipt,
      otherReceipt,
      totalReceipt,
      refund,
      otherPayments,
      totalPayment,
      netAmount,
    };
  };

  // Fetch data when component mounts or dates change
  useEffect(() => {
    const fetchData = async () => {
      if (!currentLab?.id || !startDate || !endDate) return;

      setLoading(true);
      try {
        const response = await getDatewiseTransactionDetails(currentLab.id, startDate, endDate);
        
        const data = Array.isArray(response) ? response : response?.data || [];
        const receiptSummary = calculateReceiptSummary(data);
        const modeOfPayment = calculateModeOfPayment(data);
        
        setReceiptSummaryData(receiptSummary);
        setModeOfPaymentData(modeOfPayment);
      } catch (error) {
        console.error('Error fetching receipt summary data:', error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentLab?.id, startDate, endDate]);

  // Check if we have any data to display (same logic as DayClosingSummary)
  const hasData = receiptSummaryData.totalSales > 0 || 
                  receiptSummaryData.totalReceipts > 0 || 
                  modeOfPaymentData.receiptForCurrentBills.total > 0 ||
                  modeOfPaymentData.receiptForPastBills.total > 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && !hasData) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-sm text-gray-500 text-center">
              Receipt summary data is not available for the selected date range.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      {/* <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Receipts Summary</h3>
            <p className="text-sm text-gray-600">Daily financial receipts and payment analysis</p>
          </div>
        </div>
      </div> */}

      {/* Receipt Summary Cards */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
            <h4 className="text-xl font-bold text-gray-900">Financial Summary</h4>
          </div>
        </div>
        
        <div className="p-6">
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Total Sales */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">Total Sales</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">₹{formatCurrency(receiptSummaryData.totalSales)}</p>
                </div>
                <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Discount */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600 uppercase tracking-wide">Total Discount</p>
                  <p className="text-2xl font-bold text-yellow-900 mt-1">₹{formatCurrency(receiptSummaryData.totalDiscount)}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-200 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Net Amount */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 uppercase tracking-wide">Net Amount</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">₹{formatCurrency(receiptSummaryData.netAmount)}</p>
                </div>
                <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Receipts */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-600 uppercase tracking-wide">Total Receipts</p>
                  <p className="text-2xl font-bold text-indigo-900 mt-1">₹{formatCurrency(receiptSummaryData.totalReceipts)}</p>
                </div>
                <div className="w-10 h-10 bg-indigo-200 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

               {/* Additional Metrics */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-1">Cash Sales</p>
                <p className="text-xl font-bold text-gray-900">₹{formatCurrency(receiptSummaryData.cashSales)}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-1">Credit Sales</p>
                <p className="text-xl font-bold text-gray-900">₹{formatCurrency(receiptSummaryData.creditSales)}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-1">Due Amount</p>
                <p className="text-xl font-bold text-gray-900">₹{formatCurrency(receiptSummaryData.due)}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-1">Net Receipts</p>
                <p className="text-xl font-bold text-green-600">₹{formatCurrency(receiptSummaryData.netReceipts)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mode of Payment Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
            <h4 className="text-xl font-bold text-gray-900">Payment Methods Analysis</h4>
        </div>
      </div>

        <div className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg border border-gray-200">
              <thead className="bg-gradient-to-r from-indigo-50 to-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Method</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Cash</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Card</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">UPI</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
              <tbody className="bg-white divide-y divide-gray-100">
              {/* Receipt Details Section */}
              <tr className="bg-blue-50">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900" colSpan={5}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Receipt Details
                    </div>
                  </td>
              </tr>
                
                <tr className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 pl-8">Current Cash Bills</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-900 font-semibold">₹{formatCurrency(modeOfPaymentData.receiptForCurrentBills.cash)}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-900 font-semibold">₹{formatCurrency(modeOfPaymentData.receiptForCurrentBills.card)}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-900 font-semibold">₹{formatCurrency(modeOfPaymentData.receiptForCurrentBills.upi)}</td>
                  <td className="px-6 py-4 text-sm text-center font-bold text-indigo-600">₹{formatCurrency(modeOfPaymentData.receiptForCurrentBills.total)}</td>
              </tr>
                
                <tr className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 pl-8">Current Credit Bills</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-500">₹0.00</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-500">₹0.00</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-500">₹0.00</td>
                  <td className="px-6 py-4 text-sm text-center font-semibold text-gray-500">₹0.00</td>
              </tr>
                
                <tr className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 pl-8">Past Cash Bills</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-900 font-semibold">₹{formatCurrency(modeOfPaymentData.receiptForPastBills.cash)}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-900 font-semibold">₹{formatCurrency(modeOfPaymentData.receiptForPastBills.card)}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-900 font-semibold">₹{formatCurrency(modeOfPaymentData.receiptForPastBills.upi)}</td>
                  <td className="px-6 py-4 text-sm text-center font-bold text-indigo-600">₹{formatCurrency(modeOfPaymentData.receiptForPastBills.total)}</td>
              </tr>
                
                <tr className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 pl-8">Past Credit Bills</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-500">₹0.00</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-500">₹0.00</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-500">₹0.00</td>
                  <td className="px-6 py-4 text-sm text-center font-semibold text-gray-500">₹0.00</td>
              </tr>
                
                <tr className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 pl-8">Advance Receipt</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-500">₹0.00</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-500">₹0.00</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-500">₹0.00</td>
                  <td className="px-6 py-4 text-sm text-center font-semibold text-gray-500">₹0.00</td>
              </tr>
                
                <tr className="bg-gradient-to-r from-gray-100 to-gray-200 font-bold">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 pl-8">Total Receipt</td>
                  <td className="px-6 py-4 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.totalReceipt.cash)}</td>
                  <td className="px-6 py-4 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.totalReceipt.card)}</td>
                  <td className="px-6 py-4 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.totalReceipt.upi)}</td>
                  <td className="px-6 py-4 text-sm text-center font-bold text-indigo-600 text-lg">₹{formatCurrency(modeOfPaymentData.totalReceipt.total)}</td>
              </tr>

              {/* Empty row for spacing */}
              <tr>
                  <td className="px-6 py-2" colSpan={5}></td>
              </tr>

              {/* Payment Details Section */}
                <tr className="bg-red-50">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900" colSpan={5}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Payment Details
                    </div>
                  </td>
              </tr>
                
                <tr className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 pl-8">Refund</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-900 font-semibold">₹{formatCurrency(modeOfPaymentData.refund.cash)}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-900 font-semibold">₹{formatCurrency(modeOfPaymentData.refund.card)}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-900 font-semibold">₹{formatCurrency(modeOfPaymentData.refund.upi)}</td>
                  <td className="px-6 py-4 text-sm text-center font-bold text-red-600">₹{formatCurrency(modeOfPaymentData.refund.total)}</td>
              </tr>
                
                <tr className="bg-gradient-to-r from-gray-100 to-gray-200 font-bold">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 pl-8">Total Payment</td>
                  <td className="px-6 py-4 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.totalPayment.cash)}</td>
                  <td className="px-6 py-4 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.totalPayment.card)}</td>
                  <td className="px-6 py-4 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.totalPayment.upi)}</td>
                  <td className="px-6 py-4 text-sm text-center font-bold text-red-600 text-lg">₹{formatCurrency(modeOfPaymentData.totalPayment.total)}</td>
              </tr>

              {/* Empty row for spacing */}
              <tr>
                  <td className="px-6 py-2" colSpan={5}></td>
              </tr>

              {/* Net Amount Row */}
                <tr className="bg-gradient-to-r from-green-50 to-emerald-50 font-bold border-2 border-green-200">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 pl-8">Net Amount</td>
                  <td className="px-6 py-4 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.netAmount.cash)}</td>
                  <td className="px-6 py-4 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.netAmount.card)}</td>
                  <td className="px-6 py-4 text-sm text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.netAmount.upi)}</td>
                  <td className="px-6 py-4 text-sm text-center font-bold text-green-600 text-xl">₹{formatCurrency(modeOfPaymentData.netAmount.total)}</td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptsSummary;
