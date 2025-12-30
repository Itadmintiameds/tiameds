'use client';

import React, { useMemo } from 'react';
import { formatAmount, formatDate } from '@/utils/csvUtils';

interface AmountReceivedData {
  id: string;
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

// API Response interfaces
interface BillingTransaction {
  id: number;
  createdBy: string;
  billing_id: number;
  payment_method: string;
  upi_id: string | null;
  upi_amount: number;
  card_amount: number;
  cash_amount: number;
  received_amount: number;
  refund_amount: number;
  due_amount: number;
  payment_date: string;
  remarks: string;
  created_at: string;
}

interface Billing {
  billingId: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  paymentDate: string;
  discount: number;
  netAmount: number;
  discountReason: string;
  createdBy: string;
  billingTime: string;
  billingDate: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  transactions: BillingTransaction[];
  received_amount: number;
  due_amount: number;
}

interface Visit {
  visitId: number;
  visitDate: string;
  visitType: string;
  visitStatus: string;
  visitDescription: string;
  doctorId: number | null;
  testIds: number[];
  packageIds: number[];
  billing: Billing;
  createdBy: string;
  updatedBy: string | null;
  visitCancellationReason: string;
  visitCancellationDate: string | null;
  visitCancellationBy: string;
  visitCancellationTime: string | null;
  testResult: unknown[];
  listofeachtestdiscount: unknown[];
}

interface PatientApiResponse {
  id: number;
  firstName: string;
  phone: string;
  city: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  visit: Visit;
  createdBy: string;
  updatedBy: string | null;
}

interface AmountReceivedTableProps {
  data?: AmountReceivedData[];
  title?: string;
  showTitle?: boolean;
  className?: string;
  rawApiData?: PatientApiResponse[]; // Add raw API data for payment method calculations
  selectedDate?: string; // Add selected date for discount filtering
  startDate?: string; // Add start date for range filtering
  endDate?: string; // Add end date for range filtering
}

// Utility function to transform API response to table format
export const transformApiDataToTableFormat = (apiData: PatientApiResponse[]): AmountReceivedData[] => {
  const allRows: AmountReceivedData[] = [];
  let slNo = 1;

  apiData.forEach((patient) => {
    const { visit } = patient;
    const { billing } = visit;
    
    // Calculate minimum due amount for this visit (same logic as Day Closing Summary)
    let minDue = billing.due_amount || 0;
    if (billing.transactions && billing.transactions.length > 0) {
      minDue = billing.netAmount || 0;
      billing.transactions.forEach((transaction: BillingTransaction) => {
        if (transaction.due_amount !== undefined && transaction.due_amount !== null) {
          minDue = Math.min(minDue, transaction.due_amount);
        }
      });
    }
    
    // Create a row for each transaction (including zero received amounts)
    if (billing.transactions && billing.transactions.length > 0) {
      billing.transactions.forEach((transaction) => {
        // Calculate net received for this specific transaction
        const netReceived = transaction.received_amount - (transaction.refund_amount || 0);

        allRows.push({
        id: `${visit.visitId}-${transaction.id}`,
        slNo: slNo++,
        receiptNo: billing.billingId.toString(),
        receiptDate: transaction.payment_date,
        patientName: patient.firstName,
        billNo: billing.billingId.toString(),
        billType: billing.paymentMethod.toLowerCase(),
        type: visit.visitType === 'Out-Patient' ? 'OP' : visit.visitType === 'In-Patient' ? 'IP' : visit.visitType,
        paymentType: transaction.payment_method,
        paymentAmount: transaction.received_amount,
        billedDate: billing.billingDate,
        totalAmount: billing.totalAmount,
        discount: billing.discount,
        due: minDue, // Use minimum due amount instead of transaction.due_amount
        received: transaction.received_amount,
        netReceived: netReceived,
        receivedBy: transaction.createdBy,
        refund: transaction.refund_amount > 0 ? transaction.refund_amount : undefined
        });
      });
    } else {
      // Create a row for visits with no transactions
      allRows.push({
        id: `${visit.visitId}-no-transaction`,
        slNo: slNo++,
        receiptNo: billing.billingId.toString(),
        receiptDate: billing.billingDate || billing.paymentDate,
        patientName: patient.firstName,
        billNo: billing.billingId.toString(),
        billType: billing.paymentMethod.toLowerCase(),
        type: visit.visitType === 'Out-Patient' ? 'OP' : visit.visitType === 'In-Patient' ? 'IP' : visit.visitType,
        paymentType: billing.paymentMethod || 'N/A',
        paymentAmount: 0,
        billedDate: billing.billingDate,
        totalAmount: billing.totalAmount,
        discount: billing.discount,
        due: minDue,
        received: 0,
        netReceived: 0,
        receivedBy: billing.createdBy || 'N/A',
        refund: undefined
      });
    }
  });

  return allRows;
};

const AmountReceivedTable: React.FC<AmountReceivedTableProps> = ({
  data = [],
  title = "Amount Received by Me",
  showTitle = true,
  className = "",
  rawApiData = [],
  selectedDate,
  startDate,
  endDate
}) => {
  // Memoize totals calculation to prevent recalculation on every render
  const totals = useMemo(() => {
    // Group by visit ID to get unique visits (same logic as Day Closing Summary)
    const visitMap = new Map();
    
    rawApiData.forEach((patient) => {
      // Group by visit ID - each visit should be counted once
      const visitKey = patient.visit.visitId;
      const existingVisit = visitMap.get(visitKey);
      
      // If this is the first time we see this visit ID, or if this transaction is more recent
      let currentTransactionTime: Date | null = null;
      let existingTransactionTime: Date | null = null;
      
      try {
        // Get the latest transaction time for current visit
        const currentLatestTransaction = patient.visit.billing.transactions?.reduce((latest: BillingTransaction | null, transaction: BillingTransaction) => {
          try {
            const transactionTime = new Date(transaction.created_at);
            if (isNaN(transactionTime.getTime())) {
              return latest;
            }
            return !latest || transactionTime > new Date(latest.created_at) ? transaction : latest;
          } catch (error) {
            return latest;
          }
        }, null as BillingTransaction | null);
        
        if (currentLatestTransaction) {
          currentTransactionTime = new Date(currentLatestTransaction.created_at);
        }
        
        if (existingVisit) {
          const existingLatestTransaction = existingVisit.visit.billing.transactions?.reduce((latest: BillingTransaction | null, transaction: BillingTransaction) => {
            try {
              const transactionTime = new Date(transaction.created_at);
              if (isNaN(transactionTime.getTime())) {
                return latest;
              }
              return !latest || transactionTime > new Date(latest.created_at) ? transaction : latest;
            } catch (error) {
              return latest;
            }
          }, null as BillingTransaction | null);
          
          if (existingLatestTransaction) {
            existingTransactionTime = new Date(existingLatestTransaction.created_at);
          }
        }
      } catch (error) {
        return; // Skip this visit if date parsing fails
      }
      
      const shouldUpdate = !existingVisit || 
        (currentTransactionTime && existingTransactionTime && currentTransactionTime > existingTransactionTime) ||
        (!existingTransactionTime && currentTransactionTime);
      
      if (shouldUpdate) {
        visitMap.set(visitKey, patient);
      }
    });
    
    // Calculate totals: use unique visits for due amounts, but sum all transactions for received amounts
    const uniqueVisits = Array.from(visitMap.values());
    
    // First, calculate due amounts using minimum due calculation (same as Day Closing Summary)
    // Only include discount for billing dates that match the selected date
    const dueTotals = uniqueVisits.reduce((acc, patient) => {
      const { visit } = patient;
      const { billing } = visit;
      
      // Only add discount if there's no date filter (show all discounts)
      // OR if the billing date matches the selected date/range
      // This ensures discount only shows on the day the billing was created
      if (!selectedDate && !startDate && !endDate) {
        // No date filter - show all discounts
        acc.discount += billing.discount;
      } else {
        // Date filter is active - check if billing date falls within the range
        let billingDate = '';
        try {
          // Try to get billing date from the raw API data
          const rawPatient = rawApiData?.find(p => p.visit.visitId === visit.visitId);
          if (rawPatient?.visit.billing.billingDate) {
            const date = new Date(rawPatient.visit.billing.billingDate);
            if (!isNaN(date.getTime())) {
              billingDate = date.toISOString().split('T')[0];
            }
          }
        } catch (error) {
          // Error parsing billing date
        }
        
        // Check if billing date falls within the selected range
        let shouldIncludeDiscount = false;
        
        if (selectedDate) {
          // Single date selection
          shouldIncludeDiscount = billingDate === selectedDate;
        } else if (startDate && endDate) {
          // Date range selection - use string comparison for YYYY-MM-DD format
          shouldIncludeDiscount = billingDate >= startDate && billingDate <= endDate;
        } else if (startDate) {
          // Only start date (from startDate onwards)
          shouldIncludeDiscount = billingDate >= startDate;
        } else if (endDate) {
          // Only end date (up to endDate)
          shouldIncludeDiscount = billingDate <= endDate;
        }
        
        if (shouldIncludeDiscount) {
          acc.discount += billing.discount;
        }
      }
      
      // Calculate minimum due amount using same logic as Day Closing Summary
      let minDue = billing.due_amount || 0;
      if (billing.transactions && billing.transactions.length > 0) {
        // Find the minimum due amount from all transactions
        minDue = billing.netAmount || 0;
        billing.transactions.forEach((transaction: BillingTransaction) => {
          if (transaction.due_amount !== undefined && transaction.due_amount !== null) {
            minDue = Math.min(minDue, transaction.due_amount);
          }
        });
      }
      acc.due += minDue;
      acc.total += billing.totalAmount || 0;
      
      return acc;
    }, { discount: 0, due: 0, total: 0 });
    
    // Then, calculate received amounts using ALL transactions from ALL patients
    const receivedTotals = rawApiData.reduce((acc, patient) => {
      const { visit } = patient;
      const { billing } = visit;
      
      // Sum up all transaction amounts (including zero amounts for complete reporting)
      billing.transactions?.forEach((transaction: BillingTransaction) => {
        acc.received += transaction.received_amount || 0;
        acc.refund += transaction.refund_amount || 0;
        acc.cashTotal += transaction.cash_amount || 0;
        acc.cardTotal += transaction.card_amount || 0;
        acc.upiTotal += transaction.upi_amount || 0;
      });
      
      // Calculate net received from final billing state
      acc.netReceived += billing.received_amount - (billing.transactions?.reduce((sum: number, t: { refund_amount?: number; }) => sum + (t.refund_amount || 0), 0) || 0);
      
      return acc;
    }, {
      received: 0,
      netReceived: 0,
      refund: 0,
      cashTotal: 0,
      cardTotal: 0,
      upiTotal: 0
    });
    
    // Combine both totals
    return {
      ...dueTotals,
      ...receivedTotals
    };
  }, [rawApiData]); // Only recalculate when rawApiData changes

  // Format date range for display
  const formatDateRange = () => {
    if (selectedDate) {
      // Single date selected
      const date = new Date(selectedDate);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } else if (startDate && endDate) {
      // Date range selected
      const start = new Date(startDate);
      const end = new Date(endDate);
      const startFormatted = start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const endFormatted = end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      return `${startFormatted} - ${endFormatted}`;
    } else if (startDate) {
      // Only start date
      const start = new Date(startDate);
      return `From ${start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    } else if (endDate) {
      // Only end date
      const end = new Date(endDate);
      return `Until ${end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    }
    return null;
  };

  const dateRangeDisplay = formatDateRange();

  return (
    <div className={className}>
      {showTitle && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <p className="text-xs text-gray-600">Financial transaction details and payment summaries</p>
            {dateRangeDisplay && (
              <>
                <span className="hidden sm:inline text-xs text-gray-400">•</span>
                <p className="text-xs font-medium text-purple-600">{dateRangeDisplay}</p>
              </>
            )}
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead 
              className="border-b border-gray-200"
              style={{ background: `linear-gradient(135deg, #E1C4F8 0%, #d1a8f5 100%)` }}
            >
              <tr>
                <th scope="col" className="px-2 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  #
                </th>
                <th scope="col" className="px-2 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  <span className="hidden sm:inline">Receipt Details</span>
                  <span className="sm:hidden">Receipt</span>
                </th>
                <th scope="col" className="px-2 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Patient
                </th>
                <th scope="col" className="px-2 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  <span className="hidden lg:inline">Bill Info</span>
                  <span className="lg:hidden">Bill</span>
                </th>
                <th scope="col" className="px-2 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Payment
                </th>
                <th scope="col" className="px-2 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider hidden lg:table-cell">
                  <span className="hidden xl:inline">Billed Date</span>
                  <span className="xl:hidden">Date</span>
                </th>
                <th scope="col" className="px-2 py-2 text-right text-xs font-semibold text-white uppercase tracking-wider">
                  <span className="hidden sm:inline">Total Amount</span>
                  <span className="sm:hidden">Total</span>
                </th>
                <th scope="col" className="px-2 py-2 text-right text-xs font-semibold text-white uppercase tracking-wider hidden md:table-cell">
                  Discount
                </th>
                <th scope="col" className="px-2 py-2 text-right text-xs font-semibold text-white uppercase tracking-wider">
                  Due
                </th>
                <th scope="col" className="px-2 py-2 text-right text-xs font-semibold text-white uppercase tracking-wider">
                  <span className="hidden sm:inline">Received</span>
                  <span className="sm:hidden">Recv</span>
                </th>
                <th scope="col" className="px-2 py-2 text-right text-xs font-semibold text-white uppercase tracking-wider hidden lg:table-cell">
                  <span className="hidden xl:inline">Net Received</span>
                  <span className="xl:hidden">Net</span>
                </th>
                <th scope="col" className="px-2 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider hidden xl:table-cell">
                  Received By
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <svg 
                          className="w-6 h-6 text-gray-400" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24" 
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={1.5} 
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                          />
                        </svg>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">No transactions found</h3>
                      <p className="text-xs text-gray-600">No amount received data available for the selected date range</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item, rowIndex) => (
                  <tr key={item.id} className={`group hover:bg-gray-50 transition-colors duration-150 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                          {item.slNo}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-gray-900">{item.receiptNo}</div>
                        <div className="text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-md inline-block">
                          {formatDate(item.receiptDate)}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <div className="text-xs font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">{item.patientName}</div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-gray-900">{item.billNo}</div>
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.billType}
                          </span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {item.type}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <div className="text-xs font-medium text-gray-900">{item.paymentType}</div>
                        <div className="text-xs text-gray-600">₹{formatAmount(item.paymentAmount)}</div>
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap hidden lg:table-cell">
                      <div className="text-xs text-gray-900">{formatDate(item.billedDate)}</div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-right">
                      <div className="text-xs font-semibold text-green-600">₹{formatAmount(item.totalAmount)}</div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-right hidden md:table-cell">
                      <div className="text-xs text-gray-900">₹{formatAmount(item.discount)}</div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-right">
                      <div className="space-y-0.5">
                        <div className="text-xs font-medium text-gray-900">₹{formatAmount(item.due)}</div>
                        {item.refund && item.refund > 0 && (
                          <div className="text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded-md">
                            Refund: ₹{formatAmount(item.refund)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-right">
                      <div className="text-xs font-semibold text-green-600">₹{formatAmount(item.received)}</div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-right hidden lg:table-cell">
                      <div className="text-xs font-semibold text-green-600">₹{formatAmount(item.netReceived)}</div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap hidden xl:table-cell">
                      <div className="text-xs text-gray-900 truncate max-w-[100px]">{item.receivedBy}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Compact Summary Footer */}
        {data.length > 0 && (
          <div className="border-t border-gray-200 p-3">
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-3">
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Total</p>
                    <p className="text-lg font-bold text-gray-900">₹{formatAmount(totals.total)}</p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600 text-lg font-bold">₹</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Discount</p>
                    <p className="text-lg font-bold text-gray-900">₹{formatAmount(totals.discount)}</p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600 text-lg font-bold">₹</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Due Amount</p>
                    <p className="text-lg font-bold text-gray-900">₹{formatAmount(totals.due)}</p>
                    {totals.refund > 0 && (
                      <p className="text-xs text-red-600 mt-0.5">Refund: ₹{formatAmount(totals.refund)}</p>
                    )}
                  </div>
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Received</p>
                    <p className="text-lg font-bold text-green-600">₹{formatAmount(totals.received)}</p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Net Received</p>
                    <p className="text-lg font-bold text-green-600">₹{formatAmount(totals.netReceived)}</p>
                  </div>
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods Breakdown */}
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-900 mb-2">Payment Methods Breakdown</h4>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs font-medium text-gray-700">Cash:</span>
                  <span className="text-sm font-bold text-blue-600">₹{formatAmount(totals.cashTotal)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-xs font-medium text-gray-700">Card:</span>
                  <span className="text-sm font-bold text-purple-600">₹{formatAmount(totals.cardTotal)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-xs font-medium text-gray-700">UPI:</span>
                  <span className="text-sm font-bold text-orange-600">₹{formatAmount(totals.upiTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AmountReceivedTable;
