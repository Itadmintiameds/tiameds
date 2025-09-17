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
    billing.transactions?.forEach((transaction) => {
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
      
      return acc;
    }, { discount: 0, due: 0 });
    
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

  return (
    <div className={className}>
      {showTitle && (
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sl no.
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receipt no. Receipt Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bill no/Bill type/type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Billed date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Received
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net received
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Received by
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-8 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <svg 
                        className="w-12 h-12 text-gray-400 mb-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={1.5} 
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                        />
                      </svg>
                      <span className="text-gray-600 font-medium">No data available</span>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item, rowIndex) => (
                  <React.Fragment key={item.id}>
                    <tr className={`transition-colors duration-150 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        <div className="flex items-center">
                          <span className="text-gray-900 font-medium">{item.slNo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        <div className="flex items-center">
                          <div>
                            <div className="font-medium text-gray-900">{item.receiptNo}</div>
                            <div className="text-gray-500 text-xs">{formatDate(item.receiptDate)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        <div className="flex items-center">
                          <span className="text-gray-900 font-medium">{item.patientName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        <div className="flex items-center">
                          <div>
                            <div className="font-medium text-gray-900">{item.billNo}</div>
                            <div className="text-gray-500 text-xs">{item.billType} / {item.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        <div className="flex items-center">
                          <div>
                            <div className="font-medium text-gray-900">{item.paymentType}</div>
                            <div className="text-gray-500 text-xs">{formatAmount(item.paymentAmount)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        <div className="flex items-center">
                          <span className="text-gray-900 font-medium">{formatDate(item.billedDate)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        <div className="flex items-center">
                          <span className="text-green-600 font-medium">{formatAmount(item.totalAmount)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        <div className="flex items-center">
                          <span className="text-gray-900 font-medium">{formatAmount(item.discount)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        <div className="flex items-center">
                          <div>
                            <div className="text-gray-900 font-medium">{formatAmount(item.due)}</div>
                            <div className="text-red-600 text-xs">Refund: {formatAmount(item.refund || 0)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        <div className="flex items-center">
                          <span className="text-green-600 font-medium">{formatAmount(item.received)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        <div className="flex items-center">
                          <span className="text-green-600 font-medium">{formatAmount(item.netReceived)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        <div className="flex items-center">
                          <span className="text-gray-900 font-medium">{item.receivedBy}</span>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Summary Footer - Sticky */}
        {data.length > 0 && (
          <div className="sticky bottom-0 mt-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 shadow-lg z-10">
            <div className="px-6 py-4">
              {/* Financial Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
                <div className="text-center">
                  <div className="text-xs font-semibold text-gray-700 mb-1">Discount</div>
                  <div className="text-lg font-bold text-gray-900">₹{formatAmount(totals.discount)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-gray-700 mb-1">Due</div>
                  <div className="text-lg font-bold text-gray-900">₹{formatAmount(totals.due)}</div>
                  <div className="text-xs font-medium text-red-600 mt-1">Refund: ₹{formatAmount(totals.refund)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-gray-700 mb-1">Received</div>
                  <div className="text-lg font-bold text-green-600">₹{formatAmount(totals.received)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-gray-700 mb-1">Net Received</div>
                  <div className="text-lg font-bold text-green-600">₹{formatAmount(totals.netReceived)}</div>
                </div>
              </div>

              {/* Payment Methods Breakdown */}
              <div className="border-t border-gray-300 pt-3">
                <div className="flex items-center justify-center gap-8">
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                     <span className="text-sm font-medium text-gray-700">Cash:</span>
                     <span className="text-base font-bold text-blue-600">₹{formatAmount(totals.cashTotal)}</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                     <span className="text-sm font-medium text-gray-700">Card:</span>
                     <span className="text-base font-bold text-purple-600">₹{formatAmount(totals.cardTotal)}</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                     <span className="text-sm font-medium text-gray-700">UPI:</span>
                     <span className="text-base font-bold text-orange-600">₹{formatAmount(totals.upiTotal)}</span>
                   </div>
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
