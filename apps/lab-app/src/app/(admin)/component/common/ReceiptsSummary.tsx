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
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && !hasData) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="text-gray-400 mb-3">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">No Data Available</h3>
            <p className="text-xs text-gray-600 text-center">
              Receipt summary data is not available for the selected date range.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Receipt Summary Cards */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div 
          className="px-4 py-3 border-b border-gray-200"
          style={{ background: `linear-gradient(135deg, #E1C4F8 0%, #d1a8f5 100%)` }}
        >
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-white/30 rounded-full"></div>
            <h4 className="text-xs font-semibold text-white">Financial Summary</h4>
          </div>
        </div>
        
        <div className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {/* Total Sales */}
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Total Sales</p>
                  <p className="text-lg font-bold text-gray-900">₹{formatCurrency(receiptSummaryData.totalSales)}</p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-lg font-bold">₹</span>
                </div>
              </div>
            </div>

            {/* Total Discount */}
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Total Discount</p>
                  <p className="text-lg font-bold text-gray-900">₹{formatCurrency(receiptSummaryData.totalDiscount)}</p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-lg font-bold">₹</span>
                </div>
              </div>
            </div>

            {/* Net Amount */}
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Net Amount</p>
                  <p className="text-lg font-bold text-green-600">₹{formatCurrency(receiptSummaryData.netAmount)}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Receipts */}
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Total Receipts</p>
                  <p className="text-lg font-bold text-gray-900">₹{formatCurrency(receiptSummaryData.totalReceipts)}</p>
                </div>
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-3">
            <div className="bg-white p-2 rounded-lg border border-gray-200">
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600 mb-1">Cash Sales</p>
                <p className="text-sm font-bold text-gray-900">₹{formatCurrency(receiptSummaryData.cashSales)}</p>
              </div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-gray-200">
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600 mb-1">Credit Sales</p>
                <p className="text-sm font-bold text-gray-900">₹{formatCurrency(receiptSummaryData.creditSales)}</p>
              </div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-gray-200">
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600 mb-1">Due Amount</p>
                <p className="text-sm font-bold text-gray-900">₹{formatCurrency(receiptSummaryData.due)}</p>
              </div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-gray-200">
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600 mb-1">Net Receipts</p>
                <p className="text-sm font-bold text-green-600">₹{formatCurrency(receiptSummaryData.netReceipts)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mode of Payment Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div 
          className="px-4 py-3 border-b border-gray-200"
          style={{ background: `linear-gradient(135deg, #E1C4F8 0%, #d1a8f5 100%)` }}
        >
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-white/30 rounded-full"></div>
            <h4 className="text-xs font-semibold text-white">Payment Methods Analysis</h4>
          </div>
        </div>

        <div className="p-3">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg border border-gray-200">
              <thead 
                className="border-b border-gray-200"
                style={{ background: `linear-gradient(135deg, #E1C4F8 0%, #d1a8f5 100%)` }}
              >
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">Payment Method</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">Cash</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">Card</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">UPI</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {/* Receipt Details Section */}
                <tr className="bg-purple-50">
                  <td className="px-2 py-2 text-xs font-semibold text-gray-900" colSpan={5}>
                    Receipt Details
                  </td>
                </tr>
                
                <tr className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-2 py-2 text-xs font-medium text-gray-900 pl-4">Current Cash Bills</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-900 font-semibold">₹{formatCurrency(modeOfPaymentData.receiptForCurrentBills.cash)}</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-900 font-semibold">₹{formatCurrency(modeOfPaymentData.receiptForCurrentBills.card)}</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-900 font-semibold">₹{formatCurrency(modeOfPaymentData.receiptForCurrentBills.upi)}</td>
                  <td className="px-2 py-2 text-xs text-center font-bold text-purple-600">₹{formatCurrency(modeOfPaymentData.receiptForCurrentBills.total)}</td>
                </tr>
                
                <tr className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-2 py-2 text-xs font-medium text-gray-900 pl-4">Current Credit Bills</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-500">₹0.00</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-500">₹0.00</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-500">₹0.00</td>
                  <td className="px-2 py-2 text-xs text-center font-semibold text-gray-500">₹0.00</td>
                </tr>
                
                <tr className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-2 py-2 text-xs font-medium text-gray-900 pl-4">Past Cash Bills</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-900 font-semibold">₹{formatCurrency(modeOfPaymentData.receiptForPastBills.cash)}</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-900 font-semibold">₹{formatCurrency(modeOfPaymentData.receiptForPastBills.card)}</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-900 font-semibold">₹{formatCurrency(modeOfPaymentData.receiptForPastBills.upi)}</td>
                  <td className="px-2 py-2 text-xs text-center font-bold text-purple-600">₹{formatCurrency(modeOfPaymentData.receiptForPastBills.total)}</td>
                </tr>
                
                <tr className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-2 py-2 text-xs font-medium text-gray-900 pl-4">Past Credit Bills</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-500">₹0.00</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-500">₹0.00</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-500">₹0.00</td>
                  <td className="px-2 py-2 text-xs text-center font-semibold text-gray-500">₹0.00</td>
                </tr>
                
                <tr className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-2 py-2 text-xs font-medium text-gray-900 pl-4">Advance Receipt</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-500">₹0.00</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-500">₹0.00</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-500">₹0.00</td>
                  <td className="px-2 py-2 text-xs text-center font-semibold text-gray-500">₹0.00</td>
                </tr>
                
                <tr className="bg-gray-100 font-bold">
                  <td className="px-2 py-2 text-xs font-bold text-gray-900 pl-4">Total Receipt</td>
                  <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.totalReceipt.cash)}</td>
                  <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.totalReceipt.card)}</td>
                  <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.totalReceipt.upi)}</td>
                  <td className="px-2 py-2 text-xs text-center font-bold text-purple-600 text-sm">₹{formatCurrency(modeOfPaymentData.totalReceipt.total)}</td>
                </tr>

                {/* Empty row for spacing */}
                <tr>
                  <td className="px-2 py-1" colSpan={5}></td>
                </tr>

                {/* Payment Details Section */}
                <tr className="bg-purple-50">
                  <td className="px-2 py-2 text-xs font-semibold text-gray-900" colSpan={5}>
                    Payment Details
                  </td>
                </tr>
                
                <tr className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-2 py-2 text-xs font-medium text-gray-900 pl-4">Refund</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-900 font-semibold">₹{formatCurrency(modeOfPaymentData.refund.cash)}</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-900 font-semibold">₹{formatCurrency(modeOfPaymentData.refund.card)}</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-900 font-semibold">₹{formatCurrency(modeOfPaymentData.refund.upi)}</td>
                  <td className="px-2 py-2 text-xs text-center font-bold text-red-600">₹{formatCurrency(modeOfPaymentData.refund.total)}</td>
                </tr>
                
                <tr className="bg-gray-100 font-bold">
                  <td className="px-2 py-2 text-xs font-bold text-gray-900 pl-4">Total Payment</td>
                  <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.totalPayment.cash)}</td>
                  <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.totalPayment.card)}</td>
                  <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.totalPayment.upi)}</td>
                  <td className="px-2 py-2 text-xs text-center font-bold text-red-600 text-sm">₹{formatCurrency(modeOfPaymentData.totalPayment.total)}</td>
                </tr>

                {/* Empty row for spacing */}
                <tr>
                  <td className="px-2 py-1" colSpan={5}></td>
                </tr>

                {/* Net Amount Row */}
                <tr className="bg-purple-100 font-bold">
                  <td className="px-2 py-2 text-xs font-bold text-gray-900 pl-4">Net Amount</td>
                  <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.netAmount.cash)}</td>
                  <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.netAmount.card)}</td>
                  <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(modeOfPaymentData.netAmount.upi)}</td>
                  <td className="px-2 py-2 text-xs text-center font-bold text-green-600 text-sm">₹{formatCurrency(modeOfPaymentData.netAmount.total)}</td>
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
