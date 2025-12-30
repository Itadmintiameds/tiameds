'use client';

import React, { useState, useEffect } from 'react';
import { getDatewiseTransactionDetails, getDatewisePaymentDetails } from '@/../services/patientServices';
import { useLabs } from '@/context/LabContext';


// Interface for transaction data
interface BillingTransaction {
  id: number;
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
  created_at: string;
  createdBy: string;
}

// Interface for API response data
interface TransactionData {
  id: number;
  firstName: string;
  lastName?: string;
  phone: string;
  city: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  createdBy: string;
  updatedBy: string | null;
  doctorName?: string;
  doctor?: {
    name: string;
  };
  visit: {
    visitId: number;
    visitDate: string;
    visitType: string;
    visitStatus: string;
    visitDescription: string;
    doctorId: number | null;
    testNames?: string[];
    testIds: number[];
    packageIds: number[];
    packageNames: string[];
    createdBy: string;
    updatedBy: string | null;
    visitCancellationReason: string;
    visitCancellationDate: string;
    visitCancellationBy: string;
    visitCancellationTime: string | null;
    doctorName?: string;
    billing: {
      billingId: number;
      totalAmount: number;
      paymentStatus: string;
      paymentMethod: string;
      paymentDate: string;
      discount: number;
      netAmount: number;
      discountReason: string;
      createdBy: string;
      updatedBy: string;
      billingTime: string;
      billingDate: string;
      createdAt: string;
      updatedAt: string;
      received_amount: number;
      due_amount: number;
      transactions: BillingTransaction[];
    };
    testResult: Array<{
      id: number;
      testId: number;
      testName: string;
      category: string;
      reportStatus: string;
      createdBy: string;
      updatedBy: string;
      createdAt: string;
      updatedAt: string;
      filled: boolean;
    }>;
    listofeachtestdiscount: Array<{
      discountAmount: number;
      discountPercent: number;
      finalPrice: number;
      testName: string;
      category: string;
      createdBy: string;
      updatedBy: string;
      id: number;
    }>;
  };
  patientCreatedBy: string;
  patientUpdatedBy: string | null;
}

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


// Interface for Bill Details
interface BillDetail {
  slNo: number;
  billNo: string;
  billName: string;
  regLabNo: string;
  refCenter: string;
  billedAt: string;
  visitType: string;
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
  startDate?: string;
  endDate?: string;
  billCountData?: BillCountData;
  amountBilledData?: AmountBilledData;
  billDueAmountData?: BillDueAmountData;
  receiptsData?: ReceiptsData;
  modeOfPaymentData?: ModeOfPaymentData;
  currentBillDetails?: BillDetail[];
  pastBillDetails?: BillDetail[];
  currentBillTotals?: BillDetailsTotals;
  pastBillTotals?: BillDetailsTotals;
  onPrint?: () => void;
  onExportCSV?: () => void;
}

const DayClosingSummary: React.FC<DayClosingSummaryProps> = ({
  startDate,
  endDate,
  receiptsData,
}) => {
  const { currentLab } = useLabs();
  const [calculatedBillCount, setCalculatedBillCount] = useState<BillCountData>({
    totalBills: 0,
    cashBills: 0,
    creditBills: 0
  });
  const [calculatedAmountBilled, setCalculatedAmountBilled] = useState<AmountBilledData>({
    totalSales: 0,
    discount: 0,
    netSales: 0,
    cashBills: 0.0,
    creditBills: 0.0,
    totalWriteOff: 0
  });
  const [calculatedBillDueAmount, setCalculatedBillDueAmount] = useState<BillDueAmountData>({
    totalBillDue: 0.0,
    cashBillDue: 0.0,
    creditBillDue: 0.0,
    excessReceived: 0.0
  });
  const [calculatedModeOfPayment, setCalculatedModeOfPayment] = useState<ModeOfPaymentData>({
    receiptForCurrentBills: { cash: 0, card: 0, cheque: 0, imps: 0, wallet: 0, total: 0 },
    receiptForPastBills: { cash: 0, card: 0, cheque: 0, imps: 0, wallet: 0, total: 0 },
    otherReceipt: { cash: 0, card: 0, cheque: 0, imps: 0, wallet: 0, total: 0 },
    advanceReceipt: { cash: 0, card: 0, cheque: 0, imps: 0, wallet: 0, total: 0 },
    totalReceipt: { cash: 0, card: 0, cheque: 0, imps: 0, wallet: 0, total: 0 },
    refund: { cash: 0, card: 0, cheque: 0, imps: 0, wallet: 0, total: 0 },
    otherPayments: { cash: 0, card: 0, cheque: 0, imps: 0, wallet: 0, total: 0 },
    totalPayment: { cash: 0, card: 0, cheque: 0, imps: 0, wallet: 0, total: 0 },
    netAmount: { cash: 0, card: 0, cheque: 0, imps: 0, wallet: 0, total: 0 }
  });

  const [calculatedCurrentBillDetails, setCalculatedCurrentBillDetails] = useState<BillDetail[]>([]);
  const [calculatedCurrentBillTotals, setCalculatedCurrentBillTotals] = useState<BillDetailsTotals>({
    amount: 0,
    discount: 0,
    netAmount: 0,
    refund: 0,
    writeoff: 0,
    received: 0,
    advance: 0,
    due: 0
  });
  // State for past bill payment details from new API
  const [pastBillPaymentDetails, setPastBillPaymentDetails] = useState<BillDetail[]>([]);
  const [pastBillPaymentTotals, setPastBillPaymentTotals] = useState<BillDetailsTotals>({
    amount: 0,
    discount: 0,
    netAmount: 0,
    refund: 0,
    writeoff: 0,
    received: 0,
    advance: 0,
    due: 0
  });
  const [pastBillPaymentRawData, setPastBillPaymentRawData] = useState<TransactionData[]>([]);
  const [loadingPastPayments, setLoadingPastPayments] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number): string => {
    return amount === 0 ? "0" : amount.toFixed(2);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };

  // Format date range for display in header
  const formatHeaderDateRange = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const startFormatted = start.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const endFormatted = end.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      return `${startFormatted} - ${endFormatted}`;
    }

    if (startDate) {
      const start = new Date(startDate);
      return `From ${start.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })}`;
    }

    if (endDate) {
      const end = new Date(endDate);
      return `Until ${end.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })}`;
    }

    return null;
  };

  const headerDateRange = formatHeaderDateRange();

  // Function to calculate bill counts from API data
  const calculateBillCounts = (data: TransactionData[]): BillCountData => {
    // Helper function to check if date is within range
    const isDateInRange = (date: string): boolean => {
      if (startDate && endDate) {
        return date >= startDate && date <= endDate;
      }
      if (startDate) {
        return date >= startDate;
      }
      if (endDate) {
        return date <= endDate;
      }
      // If no dates provided, default to today
      const today = new Date().toISOString().split('T')[0];
      return date === today;
    };

    // Filter data by billingDate to only include bills from the selected date range
    const filteredBills = data.filter(item => {
      const billingDate = item.visit.billing.billingDate;
      return isDateInRange(billingDate);
    });

    // Get unique visit IDs for the filtered bills only
    const uniqueVisitIds = new Set(filteredBills.map(item => item.visit.visitId));
    const totalBills = uniqueVisitIds.size;

    // Count cash bills - bills with received amount > 0 from selected date range
    const cashBills = filteredBills.filter(item => {
      const receivedAmount = item.visit.billing.received_amount || 0;
      return receivedAmount > 0;
    }).length;

    // Credit bills are static 0 for now
    const creditBills = 0;

    return {
      totalBills,
      cashBills,
      creditBills
    };
  };

  // Function to calculate amount billed from API data
  const calculateAmountBilled = (data: TransactionData[]): AmountBilledData => {
    // Helper function to check if billing date is within range
    const isBillingDateInRange = (billingDate: string): boolean => {
      if (startDate && endDate) {
        return billingDate >= startDate && billingDate <= endDate;
      }
      if (startDate) {
        return billingDate >= startDate;
      }
      if (endDate) {
        return billingDate <= endDate;
      }
      // If no dates provided, default to today
      const today = new Date().toISOString().split('T')[0];
      return billingDate === today;
    };

    // Helper function to check if billing date is outside range (for past bills)
    const isBillingDateOutsideRange = (billingDate: string): boolean => {
      if (startDate && endDate) {
        return billingDate < startDate || billingDate > endDate;
      }
      if (startDate) {
        return billingDate < startDate;
      }
      if (endDate) {
        return billingDate > endDate;
      }
      // If no dates provided, default to today
      const today = new Date().toISOString().split('T')[0];
      return billingDate !== today;
    };
    
    // Filter bills by billingDate within the selected date range
    const selectedDateBills = data.filter(item => {
      const billingDate = item.visit.billing.billingDate;
      return isBillingDateInRange(billingDate);
    });

    // Get unique visits by visitId to avoid counting duplicates
    const uniqueVisits = new Map();
    selectedDateBills.forEach(item => {
      const visitId = item.visit.visitId;
      if (!uniqueVisits.has(visitId)) {
        uniqueVisits.set(visitId, item);
      }
    });

    // Convert map values to array for calculations
    const uniqueBills = Array.from(uniqueVisits.values());

    const totalSales = uniqueBills.reduce((sum, item) => sum + (item.visit.billing.totalAmount || 0), 0);
    const discount = uniqueBills.reduce((sum, item) => sum + (item.visit.billing.discount || 0), 0);
    const netSales = uniqueBills.reduce((sum, item) => sum + (item.visit.billing.netAmount || 0), 0);
    
    // Calculate cash bills amount (total received amount from all transactions of selected date range bills)
    const currentDateCashBills = selectedDateBills.reduce((sum, item) => {
      const transactions = item.visit.billing.transactions || [];
      const totalReceived = transactions.reduce((transactionSum, transaction) => {
        return transactionSum + (transaction.received_amount || 0);
      }, 0);
      return sum + totalReceived;
    }, 0);

    // Calculate previous bills amount (bills that are NOT from selected date range)
    const previousBillsAmount = data.filter(item => {
      const billingDate = item.visit.billing.billingDate;
      return isBillingDateOutsideRange(billingDate);
    }).reduce((sum, item) => {
      const transactions = item.visit.billing.transactions || [];
      const totalReceived = transactions.reduce((transactionSum, transaction) => {
        return transactionSum + (transaction.received_amount || 0);
      }, 0);
      return sum + totalReceived;
    }, 0);

    // Total cash bills (current + previous)
    const cashBills = currentDateCashBills + previousBillsAmount;

    // Credit bills amount (static 0 for now)
    const creditBills = 0.0;
    
    // Total write off (static 0 for now)
    const totalWriteOff = 0;

    return {
      totalSales,
      discount,
      netSales,
      cashBills,
      creditBills,
      totalWriteOff
    };
  };

  // Function to calculate bill due amount from API data (using same logic as AmountReceivedTable)
  const calculateBillDueAmount = (data: TransactionData[]): BillDueAmountData => {
    // Helper function to check if billing date is within range
    const isBillingDateInRange = (billingDate: string): boolean => {
      if (startDate && endDate) {
        return billingDate >= startDate && billingDate <= endDate;
      }
      if (startDate) {
        return billingDate >= startDate;
      }
      if (endDate) {
        return billingDate <= endDate;
      }
      // If no dates provided, default to today
      const today = new Date().toISOString().split('T')[0];
      return billingDate === today;
    };
    
    // Filter for selected date range bills (using billingDate for consistency)
    const selectedDateVisits = data.filter(item => isBillingDateInRange(item.visit.billing.billingDate));
    
    // Deduplicate by visitId to avoid counting same visit multiple times
    const uniqueVisits = new Map();
    selectedDateVisits.forEach(item => {
      const visitId = item.visit.visitId;
      if (!uniqueVisits.has(visitId)) {
        uniqueVisits.set(visitId, item);
      }
    });
    
    const uniqueSelectedDateVisits = Array.from(uniqueVisits.values());
    
    // For due calculation, use the minimum due amount for each visit (same as Current Bill Details)
    const visitMinDue = new Map();
    selectedDateVisits.forEach(item => {
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
        visitMinDue.set(visitId, {
          due: minDue,
          paymentMethod: billing.paymentMethod
        });
      } else {
        visitMinDue.set(visitId, {
          due: billing.due_amount || 0,
          paymentMethod: billing.paymentMethod
        });
      }
    });
    
    const visitData = Array.from(visitMinDue.values());
    
    // Calculate due amounts using the same logic as the table
    const totalBillDue = visitData.reduce((sum, item) => sum + item.due, 0);

    const cashBillDue = visitData.filter(item => 
      item.paymentMethod?.toLowerCase().includes('cash')
    ).reduce((sum, item) => sum + item.due, 0);

    const creditBillDue = visitData.filter(item => 
      !item.paymentMethod?.toLowerCase().includes('cash')
    ).reduce((sum, item) => sum + item.due, 0);

    const excessReceived = uniqueSelectedDateVisits.reduce((sum, item) => {
      const received = item.visit.billing.received_amount || 0;
      const total = item.visit.billing.totalAmount || 0;
      const discount = item.visit.billing.discount || 0;
      const netAmount = total - discount;
      return sum + Math.max(0, received - netAmount);
    }, 0);

    return {
      totalBillDue,
      cashBillDue,
      creditBillDue,
      excessReceived
    };
  };

  // Function to calculate mode of payment data from API data
  const calculateModeOfPayment = (data: TransactionData[], pastBillPaymentData?: TransactionData[]): ModeOfPaymentData => {
    // Helper function to check if billing date is within range
    const isBillingDateInRange = (billingDate: string): boolean => {
      if (startDate && endDate) {
        return billingDate >= startDate && billingDate <= endDate;
      }
      if (startDate) {
        return billingDate >= startDate;
      }
      if (endDate) {
        return billingDate <= endDate;
      }
      // If no dates provided, default to today
      const today = new Date().toISOString().split('T')[0];
      return billingDate === today;
    };

    // Helper function to check if billing date is outside range (for past bills)
    const isBillingDateOutsideRange = (billingDate: string): boolean => {
      if (startDate && endDate) {
        return billingDate < startDate || billingDate > endDate;
      }
      if (startDate) {
        return billingDate < startDate;
      }
      if (endDate) {
        return billingDate > endDate;
      }
      // If no dates provided, default to today
      const today = new Date().toISOString().split('T')[0];
      return billingDate !== today;
    };
    
    // Filter data for selected date range bills only (using billingDate for consistency)
    const selectedDateVisits = data.filter(item => isBillingDateInRange(item.visit.billing.billingDate));

    // Calculate Receipt for Current bills (selected date visits with received payments)
    const receiptForCurrentBills = { cash: 0, card: 0, cheque: 0, imps: 0, wallet: 0, total: 0 };
    
    selectedDateVisits.forEach(patient => {
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
            receiptForCurrentBills.imps += amount;
          } else if (paymentMethod.includes('cheque')) {
            receiptForCurrentBills.cheque += amount;
          } else if (paymentMethod.includes('wallet')) {
            receiptForCurrentBills.wallet += amount;
          }
          
          receiptForCurrentBills.total += amount;
        }
      });
    });

    // Calculate Receipt for Past bills
    // If past bill payment data is provided (from new API), use it; otherwise use existing logic
    const receiptForPastBills = { cash: 0, card: 0, cheque: 0, imps: 0, wallet: 0, total: 0 };
    
    if (pastBillPaymentData && pastBillPaymentData.length > 0) {
      // Use past bill payment data from new API (for single date selection)
      pastBillPaymentData.forEach(patient => {
        const transactions = patient.visit.billing.transactions || [];
        transactions.forEach(transaction => {
          if (transaction.received_amount > 0) {
            const paymentMethod = transaction.payment_method?.toLowerCase() || '';
            const amount = transaction.received_amount;
            
            if (paymentMethod.includes('cash')) {
              receiptForPastBills.cash += amount;
            } else if (paymentMethod.includes('card')) {
              receiptForPastBills.card += amount;
            } else if (paymentMethod.includes('upi') || paymentMethod.includes('imps')) {
              receiptForPastBills.imps += amount;
            } else if (paymentMethod.includes('cheque')) {
              receiptForPastBills.cheque += amount;
            } else if (paymentMethod.includes('wallet')) {
              receiptForPastBills.wallet += amount;
            }
            
            receiptForPastBills.total += amount;
          }
        });
      });
    } else {
      // Use existing logic (for date range selection)
      const pastVisits = data.filter(item => isBillingDateOutsideRange(item.visit.billing.billingDate));
      
      pastVisits.forEach(patient => {
        const transactions = patient.visit.billing.transactions || [];
        transactions.forEach(transaction => {
          if (transaction.received_amount > 0) {
            const paymentMethod = transaction.payment_method?.toLowerCase() || '';
            const amount = transaction.received_amount;
            
            if (paymentMethod.includes('cash')) {
              receiptForPastBills.cash += amount;
            } else if (paymentMethod.includes('card')) {
              receiptForPastBills.card += amount;
            } else if (paymentMethod.includes('upi') || paymentMethod.includes('imps')) {
              receiptForPastBills.imps += amount;
            } else if (paymentMethod.includes('cheque')) {
              receiptForPastBills.cheque += amount;
            } else if (paymentMethod.includes('wallet')) {
              receiptForPastBills.wallet += amount;
            }
            
            receiptForPastBills.total += amount;
          }
        });
      });
    }
    const otherReceipt = { cash: 0, card: 0, cheque: 0, imps: 0, wallet: 0, total: 0 };
    const advanceReceipt = { cash: 0, card: 0, cheque: 0, imps: 0, wallet: 0, total: 0 };
    const totalReceipt = {
      cash: receiptForCurrentBills.cash + receiptForPastBills.cash + otherReceipt.cash + advanceReceipt.cash,
      card: receiptForCurrentBills.card + receiptForPastBills.card + otherReceipt.card + advanceReceipt.card,
      cheque: receiptForCurrentBills.cheque + receiptForPastBills.cheque + otherReceipt.cheque + advanceReceipt.cheque,
      imps: receiptForCurrentBills.imps + receiptForPastBills.imps + otherReceipt.imps + advanceReceipt.imps,
      wallet: receiptForCurrentBills.wallet + receiptForPastBills.wallet + otherReceipt.wallet + advanceReceipt.wallet,
      total: receiptForCurrentBills.total + receiptForPastBills.total + otherReceipt.total + advanceReceipt.total
    };
    
    // Calculate Refund (transactions with refund_amount > 0)
    const refund = { cash: 0, card: 0, cheque: 0, imps: 0, wallet: 0, total: 0 };
    
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
            refund.imps += amount;
          } else if (paymentMethod.includes('cheque')) {
            refund.cheque += amount;
          } else if (paymentMethod.includes('wallet')) {
            refund.wallet += amount;
          }
          
          refund.total += amount;
        }
      });
    });
    const otherPayments = { cash: 0, card: 0, cheque: 0, imps: 0, wallet: 0, total: 0 };
    const totalPayment = {
      cash: refund.cash + otherPayments.cash,
      card: refund.card + otherPayments.card,
      cheque: refund.cheque + otherPayments.cheque,
      imps: refund.imps + otherPayments.imps,
      wallet: refund.wallet + otherPayments.wallet,
      total: refund.total + otherPayments.total
    };
    
    const netAmount = {
      cash: totalReceipt.cash - totalPayment.cash,
      card: totalReceipt.card - totalPayment.card,
      cheque: totalReceipt.cheque - totalPayment.cheque,
      imps: totalReceipt.imps - totalPayment.imps,
      wallet: totalReceipt.wallet - totalPayment.wallet,
      total: totalReceipt.total - totalPayment.total
    };

    return {
      receiptForCurrentBills,
      receiptForPastBills,
      otherReceipt,
      advanceReceipt,
      totalReceipt,
      refund,
      otherPayments,
      totalPayment,
      netAmount
    };
  };

  const calculateCurrentBillDetails = (data: TransactionData[]): { details: BillDetail[], totals: BillDetailsTotals } => {
    // Helper function to check if billing date is within range
    const isBillingDateInRange = (billingDate: string): boolean => {
      if (startDate && endDate) {
        return billingDate >= startDate && billingDate <= endDate;
      }
      if (startDate) {
        return billingDate >= startDate;
      }
      if (endDate) {
        return billingDate <= endDate;
      }
      // If no dates provided, default to today
      const today = new Date().toISOString().split('T')[0];
      return billingDate === today;
    };

    // Use startDate for fallback date formatting (if needed)
    const selectedDate = startDate || new Date().toISOString().split('T')[0];
    
    // Filter for selected date range bills (using billingDate for consistency)
    const selectedDateVisits = data.filter(item => isBillingDateInRange(item.visit.billing.billingDate));
    
    // First, calculate the minimum due amount for each visit
    const visitMinDue = new Map();
    selectedDateVisits.forEach(item => {
      const visitId = item.visit.visitId;
      const currentDue = item.visit.billing.due_amount || 0;
      
      if (!visitMinDue.has(visitId) || currentDue < visitMinDue.get(visitId)) {
        visitMinDue.set(visitId, currentDue);
      }
    });
    
    // Create details for each transaction, not just unique visits
    const details: BillDetail[] = [];
    let slNo = 1;
    
    selectedDateVisits.forEach((item) => {
      const billing = item.visit.billing;
      const patient = item;
      // const visitId = item.visit.visitId;
      
      // If there are transactions, create a row for each transaction
      if (billing.transactions && billing.transactions.length > 0) {
        let runningDue = billing.netAmount || 0; // Start with net amount as initial due
        
        // Sort transactions by created_at to ensure correct order
        const sortedTransactions = [...billing.transactions].sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        sortedTransactions.forEach((transaction: BillingTransaction, transactionIndex: number) => {
          // Use the due_amount from the transaction if available, otherwise calculate
          let dueAmount;
          if (transaction.due_amount !== undefined && transaction.due_amount !== null) {
            dueAmount = transaction.due_amount;
          } else {
            // Calculate due amount after this transaction
            const receivedAmount = transaction.received_amount || 0;
            const refundAmount = transaction.refund_amount || 0;
            const netTransaction = receivedAmount - refundAmount;
            runningDue = Math.max(0, runningDue - netTransaction);
            dueAmount = runningDue;
          }
          
          details.push({
            slNo: slNo++,
            billNo: billing.billingId?.toString() || `BILL-${billing.billingId}`,
            billName: `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown Patient',
            regLabNo: currentLab?.id?.toString() || 'Lab ID',
            refCenter: patient.doctor?.name || 'N/A',
            billedAt: formatDate(billing.billingDate || selectedDate),
            visitType: item.visit.visitType || 'N/A',
            type: transaction.payment_method || billing.paymentMethod || 'Cash',
            amount: transactionIndex === 0 ? (billing.totalAmount || 0) : 0, // Only show amount for first transaction
            discount: transactionIndex === 0 ? (billing.discount || 0) : 0, // Only show discount for first transaction
            netAmount: transactionIndex === 0 ? (billing.netAmount || 0) : 0, // Only show net amount for first transaction
            refund: transaction.refund_amount || 0,
            writeoff: 0, // Static for now
            received: transaction.received_amount || 0,
            advance: 0, // Static for now
            due: dueAmount // Use transaction due_amount or calculated due
          });
        });
      } else {
        // If no transactions, create one row for the visit
        details.push({
          slNo: slNo++,
          billNo: billing.billingId?.toString() || `BILL-${billing.billingId}`,
          billName: `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown Patient',
          regLabNo: currentLab?.id?.toString() || 'Lab ID',
          refCenter: patient.doctor?.name || 'N/A',
          billedAt: formatDate(billing.billingDate || selectedDate),
          visitType: item.visit.visitType || 'N/A',
          type: billing.paymentMethod || 'Cash',
          amount: billing.totalAmount || 0,
          discount: billing.discount || 0,
          netAmount: billing.netAmount || 0,
          refund: 0,
          writeoff: 0, // Static for now
          received: 0,
          advance: 0, // Static for now
          due: billing.due_amount || 0
        });
      }
    });
    
    // Calculate totals - for amount, discount, netAmount, and due, we need to deduplicate by visitId
    // since these values are per visit, not per transaction
    const uniqueVisits = new Map();
    selectedDateVisits.forEach(item => {
      const visitId = item.visit.visitId;
      if (!uniqueVisits.has(visitId)) {
        uniqueVisits.set(visitId, item);
      }
    });
    
    const uniqueSelectedDateVisits = Array.from(uniqueVisits.values());
    
    // Calculate final due amount for each visit (minimum due amount)
    const visitFinalDue = new Map();
    selectedDateVisits.forEach(item => {
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
        visitFinalDue.set(visitId, minDue);
      } else {
        visitFinalDue.set(visitId, billing.due_amount || 0);
      }
    });
    
    const totals: BillDetailsTotals = {
      // These are per visit (deduplicated)
      amount: uniqueSelectedDateVisits.reduce((sum, item) => sum + (item.visit.billing.totalAmount || 0), 0),
      discount: uniqueSelectedDateVisits.reduce((sum, item) => sum + (item.visit.billing.discount || 0), 0),
      netAmount: uniqueSelectedDateVisits.reduce((sum, item) => sum + (item.visit.billing.netAmount || 0), 0),
      due: Array.from(visitFinalDue.values()).reduce((sum, due) => sum + due, 0),
      // These are per transaction (sum all transactions)
      refund: details.reduce((sum, item) => sum + item.refund, 0),
      writeoff: details.reduce((sum, item) => sum + item.writeoff, 0),
      received: details.reduce((sum, item) => sum + item.received, 0),
      advance: details.reduce((sum, item) => sum + item.advance, 0)
    };
    
    return { details, totals };
  };

  // Function to calculate past bill payment details (no date filtering - API already filtered)
  const calculatePastBillPaymentDetails = (data: TransactionData[]): { details: BillDetail[], totals: BillDetailsTotals } => {
    // Use startDate for fallback date formatting (if needed)
    const selectedDate = startDate || new Date().toISOString().split('T')[0];
    
    // Process ALL data from API (no filtering by billingDate - API already returns correct bills)
    const allVisits = data;
    
    // First, calculate the minimum due amount for each visit
    const visitMinDue = new Map();
    allVisits.forEach(item => {
      const visitId = item.visit.visitId;
      const currentDue = item.visit.billing.due_amount || 0;
      
      if (!visitMinDue.has(visitId) || currentDue < visitMinDue.get(visitId)) {
        visitMinDue.set(visitId, currentDue);
      }
    });
    
    // Create details for each transaction, not just unique visits
    const details: BillDetail[] = [];
    let slNo = 1;
    
    allVisits.forEach((item) => {
      const billing = item.visit.billing;
      const patient = item;
      
      // If there are transactions, create a row for each transaction
      if (billing.transactions && billing.transactions.length > 0) {
        let runningDue = billing.netAmount || 0; // Start with net amount as initial due
        
        // Sort transactions by created_at to ensure correct order
        const sortedTransactions = [...billing.transactions].sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        sortedTransactions.forEach((transaction: BillingTransaction, transactionIndex: number) => {
          // Use the due_amount from the transaction if available, otherwise calculate
          let dueAmount;
          if (transaction.due_amount !== undefined && transaction.due_amount !== null) {
            dueAmount = transaction.due_amount;
          } else {
            // Calculate due amount after this transaction
            const receivedAmount = transaction.received_amount || 0;
            const refundAmount = transaction.refund_amount || 0;
            const netTransaction = receivedAmount - refundAmount;
            runningDue = Math.max(0, runningDue - netTransaction);
            dueAmount = runningDue;
          }
          
          details.push({
            slNo: slNo++,
            billNo: billing.billingId?.toString() || `BILL-${billing.billingId}`,
            billName: `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown Patient',
            regLabNo: currentLab?.id?.toString() || 'Lab ID',
            refCenter: patient.doctor?.name || 'N/A',
            billedAt: formatDate(billing.billingDate || selectedDate),
            visitType: item.visit.visitType || 'N/A',
            type: transaction.payment_method || billing.paymentMethod || 'Cash',
            amount: transactionIndex === 0 ? (billing.totalAmount || 0) : 0, // Only show amount for first transaction
            discount: transactionIndex === 0 ? (billing.discount || 0) : 0, // Only show discount for first transaction
            netAmount: transactionIndex === 0 ? (billing.netAmount || 0) : 0, // Only show net amount for first transaction
            refund: transaction.refund_amount || 0,
            writeoff: 0, // Static for now
            received: transaction.received_amount || 0,
            advance: 0, // Static for now
            due: dueAmount // Use transaction due_amount or calculated due
          });
        });
      } else {
        // If no transactions, create one row for the visit
        details.push({
          slNo: slNo++,
          billNo: billing.billingId?.toString() || `BILL-${billing.billingId}`,
          billName: `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown Patient',
          regLabNo: currentLab?.id?.toString() || 'Lab ID',
          refCenter: patient.doctor?.name || 'N/A',
          billedAt: formatDate(billing.billingDate || selectedDate),
          visitType: item.visit.visitType || 'N/A',
          type: billing.paymentMethod || 'Cash',
          amount: billing.totalAmount || 0,
          discount: billing.discount || 0,
          netAmount: billing.netAmount || 0,
          refund: 0,
          writeoff: 0, // Static for now
          received: 0,
          advance: 0, // Static for now
          due: billing.due_amount || 0
        });
      }
    });
    
    // Calculate totals - for amount, discount, netAmount, and due, we need to deduplicate by visitId
    // since these values are per visit, not per transaction
    const uniqueVisits = new Map();
    allVisits.forEach(item => {
      const visitId = item.visit.visitId;
      if (!uniqueVisits.has(visitId)) {
        uniqueVisits.set(visitId, item);
      }
    });
    
    const uniqueAllVisits = Array.from(uniqueVisits.values());
    
    // Calculate final due amount for each visit (minimum due amount)
    const visitFinalDue = new Map();
    allVisits.forEach(item => {
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
        visitFinalDue.set(visitId, minDue);
      } else {
        visitFinalDue.set(visitId, billing.due_amount || 0);
      }
    });
    
    const totals: BillDetailsTotals = {
      // These are per visit (deduplicated)
      amount: uniqueAllVisits.reduce((sum, item) => sum + (item.visit.billing.totalAmount || 0), 0),
      discount: uniqueAllVisits.reduce((sum, item) => sum + (item.visit.billing.discount || 0), 0),
      netAmount: uniqueAllVisits.reduce((sum, item) => sum + (item.visit.billing.netAmount || 0), 0),
      due: Array.from(visitFinalDue.values()).reduce((sum, due) => sum + due, 0),
      // These are per transaction (sum all transactions)
      refund: details.reduce((sum, item) => sum + item.refund, 0),
      writeoff: details.reduce((sum, item) => sum + item.writeoff, 0),
      received: details.reduce((sum, item) => sum + item.received, 0),
      advance: details.reduce((sum, item) => sum + item.advance, 0)
    };
    
    return { details, totals };
  };

  // Fetch and calculate bill counts and amount billed
  useEffect(() => {
    const fetchData = async () => {
      if (!currentLab?.id || !startDate || !endDate) return;

      try {
        setLoading(true);
        const response = await getDatewiseTransactionDetails(
          currentLab.id,
          startDate,
          endDate
        );

        const data = Array.isArray(response) ? response : response?.data || [];
        const billCounts = calculateBillCounts(data);
        const amountBilled = calculateAmountBilled(data);
        const billDueAmount = calculateBillDueAmount(data);
        // Pass past bill payment raw data if available (for single date selection)
        const modeOfPayment = calculateModeOfPayment(data, pastBillPaymentRawData);
        const currentBillDetails = calculateCurrentBillDetails(data);
        
        setCalculatedBillCount(billCounts);
        setCalculatedAmountBilled(amountBilled);
        setCalculatedBillDueAmount(billDueAmount);
        setCalculatedModeOfPayment(modeOfPayment);
        setCalculatedCurrentBillDetails(currentBillDetails.details);
        setCalculatedCurrentBillTotals(currentBillDetails.totals);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentLab?.id, startDate, endDate, pastBillPaymentRawData]);

  // Fetch past bill payment details (only for single date selection)
  useEffect(() => {
    const fetchPastBillPayments = async () => {
      // Only fetch when it's a single date selection (startDate === endDate)
      if (!currentLab?.id || !startDate || !endDate || startDate !== endDate) {
        // Reset state when not a single date
        setPastBillPaymentDetails([]);
        setPastBillPaymentRawData([]);
        setPastBillPaymentTotals({
          amount: 0,
          discount: 0,
          netAmount: 0,
          refund: 0,
          writeoff: 0,
          received: 0,
          advance: 0,
          due: 0
        });
        return;
      }

      try {
        setLoadingPastPayments(true);
        const response = await getDatewisePaymentDetails(
          currentLab.id,
          startDate,
          endDate
        );

        const data = Array.isArray(response) ? response : response?.data || [];
        
        // Store raw data for mode of payment calculation
        setPastBillPaymentRawData(data);
        
        // Use calculatePastBillPaymentDetails to transform the data (no date filtering)
        // API already returns bills with payments made on the selected date
        const pastBillPaymentDetailsData = calculatePastBillPaymentDetails(data);
        
        setPastBillPaymentDetails(pastBillPaymentDetailsData.details);
        setPastBillPaymentTotals(pastBillPaymentDetailsData.totals);
      } catch (error) {
        console.error('Error fetching past bill payment details:', error);
        // Reset to empty on error
        setPastBillPaymentDetails([]);
        setPastBillPaymentRawData([]);
        setPastBillPaymentTotals({
          amount: 0,
          discount: 0,
          netAmount: 0,
          refund: 0,
          writeoff: 0,
          received: 0,
          advance: 0,
          due: 0
        });
      } finally {
        setLoadingPastPayments(false);
      }
    };

    fetchPastBillPayments();
  }, [currentLab?.id, startDate, endDate]);

  // Use calculated data only - no fallback to static props
  const finalBillCountData = calculatedBillCount;
  const finalAmountBilledData = calculatedAmountBilled;
  const finalBillDueAmountData = calculatedBillDueAmount;
  const finalModeOfPaymentData = calculatedModeOfPayment;
  const finalCurrentBillDetails = calculatedCurrentBillDetails;
  const finalCurrentBillTotals = calculatedCurrentBillTotals;

  // Check if we have any data to display
  const hasData = finalBillCountData.totalBills > 0 || 
                  finalAmountBilledData.totalSales > 0 || 
                  finalBillDueAmountData.totalBillDue > 0 ||
                  finalCurrentBillDetails.length > 0;

  if (!loading && !hasData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-3">
          <div className="flex items-center justify-center h-48">
            <div className="text-center text-gray-500">
              <p className="text-sm font-semibold">No data available</p>
              <p className="text-xs">Please select a date range to view day closing summary data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Compact Header with Design System Gradient */}
      <div 
        className="px-4 py-3 border-b border-gray-200"
        style={{ background: `linear-gradient(135deg, #E1C4F8 0%, #d1a8f5 100%)` }}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 rounded-lg">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Day Closing Summary</h3>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <p className="text-xs text-white/80">
                Comprehensive daily financial analysis and transaction overview
              </p>
              {headerDateRange && (
                <>
                  <span className="hidden sm:inline text-xs text-white/70">•</span>
                  <p className="text-[11px] font-medium text-white/90">
                    {headerDateRange}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-4">
        {/* Bill Count Section */}
        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
            <h4 className="text-xs font-semibold text-gray-900">Bill Count Analysis</h4>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="text-xs text-gray-600 font-medium">Loading bill counts...</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Total Bills</p>
                    <p className="text-lg font-bold text-gray-900">{finalBillCountData.totalBills}</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Cash Bills</p>
                    <p className="text-lg font-bold text-gray-900">{finalBillCountData.cashBills}</p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Credit Bills</p>
                    <p className="text-lg font-bold text-gray-900">{finalBillCountData.creditBills}</p>
                  </div>
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Amount Billed Section */}
        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
          <h3 className="text-xs font-semibold text-gray-900 mb-2">Amount Billed</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600 mb-1">Total Sales</p>
                <p className="text-sm font-bold text-gray-900">₹{formatCurrency(finalAmountBilledData.totalSales)}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600 mb-1">Discount</p>
                <p className="text-sm font-bold text-gray-900">₹{formatCurrency(finalAmountBilledData.discount)}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600 mb-1">Net Sales</p>
                <p className="text-sm font-bold text-gray-900">₹{formatCurrency(finalAmountBilledData.netSales)}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600 mb-1">Cash Bills</p>
                <p className="text-sm font-bold text-gray-900">₹{formatCurrency(finalAmountBilledData.cashBills)}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600 mb-1">Credit Bills</p>
                <p className="text-sm font-bold text-gray-900">₹{formatCurrency(finalAmountBilledData.creditBills)}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600 mb-1">Total Write off</p>
                <p className="text-sm font-bold text-gray-900">₹{formatCurrency(finalAmountBilledData.totalWriteOff)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bill Due Amount Section */}
        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
          <h3 className="text-xs font-semibold text-gray-900 mb-2">Bill Due Amount</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600 mb-1">Total Bill Due</p>
                <p className="text-sm font-bold text-gray-900">₹{formatCurrency(finalBillDueAmountData.totalBillDue)}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600 mb-1">Cash Bill Due</p>
                <p className="text-sm font-bold text-gray-900">₹{formatCurrency(finalBillDueAmountData.cashBillDue)}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600 mb-1">Credit Bill Due</p>
                <p className="text-sm font-bold text-gray-900">₹{formatCurrency(finalBillDueAmountData.creditBillDue)}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600 mb-1">Excess Received</p>
                <p className="text-sm font-bold text-gray-900">₹{formatCurrency(finalBillDueAmountData.excessReceived)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Receipts Section */}
        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
          <h3 className="text-xs font-semibold text-gray-900 mb-2">Receipts</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg border border-gray-200">
              <thead 
                className="border-b border-gray-200"
                style={{ background: `linear-gradient(135deg, #E1C4F8 0%, #d1a8f5 100%)` }}
              >
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">Total Receipts</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">Total Payments</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">Net Receipts</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                    {receiptsData !== undefined ? `₹${formatCurrency(receiptsData.totalReceipts)}` : ''}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                    {receiptsData !== undefined ? `₹${formatCurrency(receiptsData.totalPayments)}` : ''}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                    {receiptsData !== undefined ? `₹${formatCurrency(receiptsData.netReceipts)}` : ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Mode of Payment Section */}
        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg border border-gray-200">
              <thead 
                className="border-b border-gray-200"
                style={{ background: `linear-gradient(135deg, #E1C4F8 0%, #d1a8f5 100%)` }}
              >
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">Mode of Payment</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">Cash</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">Card</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">UPI</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Receipt Details Section */}
                <tr className="bg-purple-50">
                  <td className="px-2 py-2 text-xs font-semibold text-gray-900" colSpan={5}>Receipt Details</td>
                </tr>
                <tr>
                  <td className="px-2 py-2 text-xs font-medium text-gray-900 pl-4">Receipt for Current bills</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-900">₹{formatCurrency(finalModeOfPaymentData.receiptForCurrentBills.cash)}</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-900">₹{formatCurrency(finalModeOfPaymentData.receiptForCurrentBills.card)}</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-900">₹{formatCurrency(finalModeOfPaymentData.receiptForCurrentBills.imps)}</td>
                  <td className="px-2 py-2 text-xs text-center font-semibold text-gray-900">₹{formatCurrency(finalModeOfPaymentData.receiptForCurrentBills.total)}</td>
                </tr>
                <tr>
                  <td className="px-2 py-2 text-xs font-medium text-gray-900 pl-4">Receipt for Past bills</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-900">₹{formatCurrency(finalModeOfPaymentData.receiptForPastBills.cash)}</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-900">₹{formatCurrency(finalModeOfPaymentData.receiptForPastBills.card)}</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-900">₹{formatCurrency(finalModeOfPaymentData.receiptForPastBills.imps)}</td>
                  <td className="px-2 py-2 text-xs text-center font-semibold text-gray-900">₹{formatCurrency(finalModeOfPaymentData.receiptForPastBills.total)}</td>
                </tr>
                <tr>
                  <td className="px-2 py-2 text-xs font-medium text-gray-900 pl-4">Advance Receipt</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-900">₹{formatCurrency(finalModeOfPaymentData.advanceReceipt.cash)}</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-900">₹{formatCurrency(finalModeOfPaymentData.advanceReceipt.card)}</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-900">₹{formatCurrency(finalModeOfPaymentData.advanceReceipt.imps)}</td>
                  <td className="px-2 py-2 text-xs text-center font-semibold text-gray-900">₹{formatCurrency(finalModeOfPaymentData.advanceReceipt.total)}</td>
                </tr>
                <tr className="bg-gray-100 font-semibold">
                  <td className="px-2 py-2 text-xs font-bold text-gray-900 pl-4">Total Receipt</td>
                  <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(finalModeOfPaymentData.totalReceipt.cash)}</td>
                  <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(finalModeOfPaymentData.totalReceipt.card)}</td>
                  <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(finalModeOfPaymentData.totalReceipt.imps)}</td>
                  <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(finalModeOfPaymentData.totalReceipt.total)}</td>
                </tr>

                {/* Empty row for spacing */}
                <tr>
                  <td className="px-2 py-1" colSpan={5}></td>
                </tr>

                {/* Payment Details Section */}
                <tr className="bg-purple-50">
                  <td className="px-2 py-2 text-xs font-semibold text-gray-900" colSpan={5}>Payment Details</td>
                </tr>
                <tr>
                  <td className="px-2 py-2 text-xs font-medium text-gray-900 pl-4">Refund</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-900">₹{formatCurrency(finalModeOfPaymentData.refund.cash)}</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-900">₹{formatCurrency(finalModeOfPaymentData.refund.card)}</td>
                  <td className="px-2 py-2 text-xs text-center text-gray-900">₹{formatCurrency(finalModeOfPaymentData.refund.imps)}</td>
                  <td className="px-2 py-2 text-xs text-center font-semibold text-gray-900">₹{formatCurrency(finalModeOfPaymentData.refund.total)}</td>
                </tr>
                <tr className="bg-gray-100 font-semibold">
                  <td className="px-2 py-2 text-xs font-bold text-gray-900 pl-4">Total Payment</td>
                  <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(finalModeOfPaymentData.totalPayment.cash)}</td>
                  <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(finalModeOfPaymentData.totalPayment.card)}</td>
                  <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(finalModeOfPaymentData.totalPayment.imps)}</td>
                  <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(finalModeOfPaymentData.totalPayment.total)}</td>
                </tr>

                {/* Empty row for spacing */}
                <tr>
                  <td className="px-2 py-1" colSpan={5}></td>
                </tr>

                {/* Net Amount Section */}
                <tr className="bg-purple-100 font-bold">
                  <td className="px-2 py-2 text-xs font-bold text-gray-900 pl-4">Net Amount</td>
                  <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(finalModeOfPaymentData.netAmount.cash)}</td>
                  <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(finalModeOfPaymentData.netAmount.card)}</td>
                  <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(finalModeOfPaymentData.netAmount.imps)}</td>
                  <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(finalModeOfPaymentData.netAmount.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>


        {/* Bill Details Section */}
        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
          <h3 className="text-xs font-semibold text-gray-900 mb-2">Bill Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg border border-gray-200">
              <thead 
                className="border-b border-gray-200"
                style={{ background: `linear-gradient(135deg, #E1C4F8 0%, #d1a8f5 100%)` }}
              >
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">Sl no.</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">Bill No.</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">Bill name</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">Visit Type</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">Reg/Lab no</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">Ref by</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">Billed at</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">Type</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">Amount</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">Discount</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">Net Amount</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">Refund</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">Writeoff</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">Received</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">Advance</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">Due</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {finalCurrentBillDetails.length > 0 ? (
                  finalCurrentBillDetails.map((bill, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-2 py-2 text-xs text-gray-900">{bill.slNo}</td>
                      <td className="px-2 py-2 text-xs text-gray-900">{bill.billNo}</td>
                      <td className="px-2 py-2 text-xs text-gray-900">{bill.billName}</td>
                      <td className="px-2 py-2 text-xs text-center text-gray-900">{bill.visitType}</td>
                      <td className="px-2 py-2 text-xs text-gray-900">{bill.regLabNo}</td>
                      <td className="px-2 py-2 text-xs text-gray-900">{bill.refCenter}</td>
                      <td className="px-2 py-2 text-xs text-gray-900">{bill.billedAt}</td>
                      <td className="px-2 py-2 text-xs text-center text-gray-900">{bill.type}</td>
                      <td className="px-2 py-2 text-xs text-center text-gray-900">₹{formatCurrency(bill.amount)}</td>
                      <td className="px-2 py-2 text-xs text-center text-gray-900">₹{formatCurrency(bill.discount)}</td>
                      <td className="px-2 py-2 text-xs text-center text-gray-900">₹{formatCurrency(bill.netAmount)}</td>
                      <td className="px-2 py-2 text-xs text-center text-gray-900">₹{formatCurrency(bill.refund)}</td>
                      <td className="px-2 py-2 text-xs text-center text-gray-900">₹{formatCurrency(bill.writeoff)}</td>
                      <td className="px-2 py-2 text-xs text-center text-gray-900">₹{formatCurrency(bill.received)}</td>
                      <td className="px-2 py-2 text-xs text-center text-gray-900">₹{formatCurrency(bill.advance)}</td>
                      <td className="px-2 py-2 text-xs text-center text-gray-900">₹{formatCurrency(bill.due)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={16} className="px-4 py-6 text-center text-xs text-gray-500">No current bill details available</td>
                  </tr>
                )}
                {finalCurrentBillDetails.length > 0 && (
                  <tr className="bg-gray-100 font-semibold">
                    <td className="px-2 py-2 text-xs font-bold text-gray-900" colSpan={8}>Total</td>
                    <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(finalCurrentBillTotals.amount)}</td>
                    <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(finalCurrentBillTotals.discount)}</td>
                    <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(finalCurrentBillTotals.netAmount)}</td>
                    <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(finalCurrentBillTotals.refund)}</td>
                    <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(finalCurrentBillTotals.writeoff)}</td>
                    <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(finalCurrentBillTotals.received)}</td>
                    <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(finalCurrentBillTotals.advance)}</td>
                    <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(finalCurrentBillTotals.due)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Past Bill Details Section - Only shown for single date selection */}
        {startDate === endDate && (
          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
            <h3 className="text-xs font-semibold text-gray-900 mb-2">Past Bill Details</h3>
            <div className="overflow-x-auto">
              {loadingPastPayments ? (
                <div className="flex justify-center items-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="text-xs text-gray-600 font-medium">Loading past bill payments...</span>
                  </div>
                </div>
              ) : (
                <table className="min-w-full bg-white rounded-lg border border-gray-200">
                  <thead 
                    className="border-b border-gray-200"
                    style={{ background: `linear-gradient(135deg, #E1C4F8 0%, #d1a8f5 100%)` }}
                  >
                    <tr>
                      <th className="px-2 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">Sl no.</th>
                      <th className="px-2 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">Bill No.</th>
                      <th className="px-2 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">Bill name</th>
                      <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">Visit Type</th>
                      <th className="px-2 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">Reg/Lab no</th>
                      <th className="px-2 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">Ref by</th>
                      <th className="px-2 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">Billed at</th>
                      <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">Type</th>
                      <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">Amount</th>
                      <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">Discount</th>
                      <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">Net Amount</th>
                      <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">Refund</th>
                      <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">Writeoff</th>
                      <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">Received</th>
                      <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">Advance</th>
                      <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">Due</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pastBillPaymentDetails.length > 0 ? (
                      pastBillPaymentDetails.map((bill, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                          <td className="px-2 py-2 text-xs text-gray-900">{bill.slNo}</td>
                          <td className="px-2 py-2 text-xs text-gray-900">{bill.billNo}</td>
                          <td className="px-2 py-2 text-xs text-gray-900">{bill.billName}</td>
                          <td className="px-2 py-2 text-xs text-center text-gray-900">{bill.visitType}</td>
                          <td className="px-2 py-2 text-xs text-gray-900">{bill.regLabNo}</td>
                          <td className="px-2 py-2 text-xs text-gray-900">{bill.refCenter}</td>
                          <td className="px-2 py-2 text-xs text-gray-900">{bill.billedAt}</td>
                          <td className="px-2 py-2 text-xs text-center text-gray-900">{bill.type}</td>
                          <td className="px-2 py-2 text-xs text-center text-gray-900">₹{formatCurrency(bill.amount)}</td>
                          <td className="px-2 py-2 text-xs text-center text-gray-900">₹{formatCurrency(bill.discount)}</td>
                          <td className="px-2 py-2 text-xs text-center text-gray-900">₹{formatCurrency(bill.netAmount)}</td>
                          <td className="px-2 py-2 text-xs text-center text-gray-900">₹{formatCurrency(bill.refund)}</td>
                          <td className="px-2 py-2 text-xs text-center text-gray-900">₹{formatCurrency(bill.writeoff)}</td>
                          <td className="px-2 py-2 text-xs text-center text-gray-900">₹{formatCurrency(bill.received)}</td>
                          <td className="px-2 py-2 text-xs text-center text-gray-900">₹{formatCurrency(bill.advance)}</td>
                          <td className="px-2 py-2 text-xs text-center text-gray-900">₹{formatCurrency(bill.due)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={16} className="px-4 py-6 text-center text-xs text-gray-500">No past bill payments found for this date</td>
                      </tr>
                    )}
                    {pastBillPaymentDetails.length > 0 && (
                      <tr className="bg-gray-100 font-semibold">
                        <td className="px-2 py-2 text-xs font-bold text-gray-900" colSpan={8}>Total</td>
                        <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(pastBillPaymentTotals.amount)}</td>
                        <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(pastBillPaymentTotals.discount)}</td>
                        <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(pastBillPaymentTotals.netAmount)}</td>
                        <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(pastBillPaymentTotals.refund)}</td>
                        <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(pastBillPaymentTotals.writeoff)}</td>
                        <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(pastBillPaymentTotals.received)}</td>
                        <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(pastBillPaymentTotals.advance)}</td>
                        <td className="px-2 py-2 text-xs text-center font-bold text-gray-900">₹{formatCurrency(pastBillPaymentTotals.due)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DayClosingSummary;
