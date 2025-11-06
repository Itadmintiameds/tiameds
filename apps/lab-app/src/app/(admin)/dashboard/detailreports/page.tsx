'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AmountReceivedTable, { transformApiDataToTableFormat } from '../../component/common/AmountReceivedTable';
import BillReport from '../../component/common/BillReport';
import DayClosingSummary from '../../component/common/DayClosingSummary';
import ReceiptsSummary from '../../component/common/ReceiptsSummary';

// Base types for type safety
interface BaseTestResult {
  id: number;
  testId: number;
  reportStatus: string;
}

interface BaseDiscount {
  discountAmount: number;
  discountPercent: number;
  finalPrice: number;
  id: number;
}

// Extended interfaces for type safety
interface ExtendedTestResult extends BaseTestResult {
  testName?: string;
  category?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  filled?: boolean;
}

interface ExtendedDiscount extends BaseDiscount {
  testName?: string;
  category?: string;
  createdBy?: string;
  updatedBy?: string;
}

// Type that matches AmountReceivedTable's PatientApiResponse exactly
interface PatientApiResponse {
  id: number;
  firstName: string;
  phone: string;
  city: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  visit: {
    visitId: number;
    visitDate: string;
    visitType: string;
    visitStatus: string;
    visitDescription: string;
    doctorId: number | null;
    testIds: number[];
    packageIds: number[];
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
      transactions: Array<{
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
      }>;
    };
    createdBy: string;
    updatedBy: string | null;
    visitCancellationReason: string;
    visitCancellationDate: string | null;
    visitCancellationBy: string;
    visitCancellationTime: string | null;
    testResult: unknown[];
    listofeachtestdiscount: unknown[];
  };
  createdBy: string;
  updatedBy: string | null;
}

// Import PatientData type from BillReport
interface PatientData {
  id: number;
  firstName: string;
  phone: string;
  city: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  createdBy: string;
  updatedBy: string | null;
  doctorName?: string;
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
      transactions: Array<{
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
      }>;
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
}
// Local interface for amount received data (matching csvUtils)
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
import { FaMoneyBillWave, FaFileInvoice, FaCalendarDay, FaReceipt, FaArrowLeft } from 'react-icons/fa';
import { DateFilterOption, getDateRange, formatDateForAPI } from '@/utils/dateUtils';

// Custom date filter options for detail reports (simplified)
const DETAIL_REPORTS_DATE_FILTER_OPTIONS = [
  { value: 'today', label: 'Today' },
  // { value: 'yesterday', label: 'Yesterday' },
  { value: 'custom', label: 'Select Date' },
] as const;
import { Patient } from '@/types/patient/patient';
import { getDatewiseTransactionDetails } from '@/../services/patientServices';
import { useLabs } from '@/context/LabContext';
import Loader from '../../component/common/Loader';
import { toast } from 'react-toastify';
import { convertToCSV, downloadCSV, generateCSVFilename } from '@/utils/csvUtils';

// Interface for totals
interface Totals {
  totalAmount: number;
  discount: number;
  due: number;
  received: number;
  netReceived: number;
  refund: number;
}

// Interface for payment totals
interface PaymentTotals {
  cashTotal: number;
  cardTotal: number;
  upiTotal: number;
}



// Type conversion functions
// Convert PatientData to PatientApiResponse for transformApiDataToTableFormat
const convertPatientDataToApiResponse = (patientData: PatientData): PatientApiResponse => {
  return {
    id: patientData.id,
    firstName: patientData.firstName,
    phone: patientData.phone,
    city: patientData.city,
    dateOfBirth: patientData.dateOfBirth,
    age: patientData.age,
    gender: patientData.gender,
    createdBy: patientData.createdBy,
    updatedBy: patientData.updatedBy,
    visit: {
      visitId: patientData.visit.visitId,
      visitDate: patientData.visit.visitDate,
      visitType: patientData.visit.visitType,
      visitStatus: patientData.visit.visitStatus,
      visitDescription: patientData.visit.visitDescription,
      doctorId: patientData.visit.doctorId,
      testIds: patientData.visit.testIds,
      packageIds: patientData.visit.packageIds,
      billing: {
        billingId: patientData.visit.billing.billingId,
        totalAmount: patientData.visit.billing.totalAmount,
        paymentStatus: patientData.visit.billing.paymentStatus,
        paymentMethod: patientData.visit.billing.paymentMethod,
        paymentDate: patientData.visit.billing.paymentDate,
        discount: patientData.visit.billing.discount,
        netAmount: patientData.visit.billing.netAmount,
        discountReason: patientData.visit.billing.discountReason,
        createdBy: patientData.visit.billing.createdBy,
        updatedBy: patientData.visit.billing.updatedBy,
        billingTime: patientData.visit.billing.billingTime,
        billingDate: patientData.visit.billing.billingDate,
        createdAt: patientData.visit.billing.createdAt,
        updatedAt: patientData.visit.billing.updatedAt,
        received_amount: patientData.visit.billing.received_amount,
        due_amount: patientData.visit.billing.due_amount,
        transactions: patientData.visit.billing.transactions.map(transaction => ({
          id: transaction.id,
          createdBy: transaction.createdBy,
          billing_id: transaction.billing_id,
          payment_method: transaction.payment_method,
          upi_id: transaction.upi_id,
          upi_amount: transaction.upi_amount,
          card_amount: transaction.card_amount,
          cash_amount: transaction.cash_amount,
          received_amount: transaction.received_amount,
          refund_amount: transaction.refund_amount,
          due_amount: transaction.due_amount,
          payment_date: transaction.payment_date,
          remarks: '', // Add default remarks since it's required
          created_at: transaction.created_at
        }))
      },
      createdBy: patientData.visit.createdBy,
      updatedBy: patientData.visit.updatedBy,
      visitCancellationReason: patientData.visit.visitCancellationReason,
      visitCancellationDate: patientData.visit.visitCancellationTime,
      visitCancellationBy: patientData.visit.visitCancellationBy,
      visitCancellationTime: patientData.visit.visitCancellationTime,
      testResult: patientData.visit.testResult || [],
      listofeachtestdiscount: patientData.visit.listofeachtestdiscount || []
    }
  };
};

const convertPatientToApiResponse = (patient: Patient): PatientData => {
  const patientAny = patient as Patient & {
    createdBy?: string;
    updatedBy?: string | null;
    doctorName?: string;
    visit?: {
      testNames?: string[];
      packageNames?: string[];
      createdBy?: string;
      updatedBy?: string | null;
      doctorName?: string;
      billing?: {
        createdBy?: string;
        updatedBy?: string;
        billingTime?: string;
        createdAt?: string;
        updatedAt?: string;
      };
    };
  };
  return {
    id: patient.id || 0,
    firstName: patient.firstName || '',
    phone: patient.phone || '',
    city: patient.city || '',
    dateOfBirth: patient.dateOfBirth || '',
    age: patient.age || '',
    gender: patient.gender || '',
    createdBy: patientAny.createdBy || '',
    updatedBy: patientAny.updatedBy || null,
    doctorName: patientAny.doctorName,
    visit: {
      visitId: patient.visit.visitId || 0,
      visitDate: patient.visit.visitDate || '',
      visitType: patient.visit.visitType || '',
      visitStatus: patient.visit.visitStatus || '',
      visitDescription: patient.visit.visitDescription || '',
      doctorId: typeof patient.visit.doctorId === 'string' ? parseInt(patient.visit.doctorId) : patient.visit.doctorId || null,
      testNames: patientAny.visit?.testNames,
      testIds: patient.visit.testIds || [],
      packageIds: patient.visit.packageIds || [],
      packageNames: patientAny.visit?.packageNames || [],
      createdBy: patientAny.visit?.createdBy || '',
      updatedBy: patientAny.visit?.updatedBy || null,
      visitCancellationReason: patient.visit.visitCancellationReason || '',
      visitCancellationDate: patient.visit.visitCancellationDate || '',
      visitCancellationBy: patient.visit.visitCancellationBy || '',
      visitCancellationTime: patient.visit.visitCancellationTime || null,
      doctorName: patientAny.visit?.doctorName,
      billing: {
        billingId: patient.visit.billing.billingId || 0,
        totalAmount: patient.visit.billing.totalAmount || 0,
        paymentStatus: patient.visit.billing.paymentStatus || '',
        paymentMethod: patient.visit.billing.paymentMethod || '',
        paymentDate: patient.visit.billing.paymentDate || '',
        discount: patient.visit.billing.discount || 0,
        netAmount: patient.visit.billing.netAmount || 0,
        discountReason: patient.visit.billing.discountReason || '',
        createdBy: patientAny.visit?.billing?.createdBy || '',
        updatedBy: patientAny.visit?.billing?.updatedBy || '',
        billingTime: patientAny.visit?.billing?.billingTime || '',
        billingDate: (patient.visit.billing as { billingDate?: string }).billingDate || patient.visit.billing.paymentDate || '',
        createdAt: patientAny.visit?.billing?.createdAt || '',
        updatedAt: patientAny.visit?.billing?.updatedAt || '',
        received_amount: patient.visit.billing.received_amount || 0,
        due_amount: patient.visit.billing.due_amount || 0,
        transactions: patient.visit.billing.transactions?.map(transaction => ({
          id: transaction.id || 0,
          billing_id: transaction.billing_id || 0,
          payment_method: transaction.payment_method || '',
          upi_id: transaction.upi_id || null,
          upi_amount: transaction.upi_amount || 0,
          card_amount: transaction.card_amount || 0,
          cash_amount: transaction.cash_amount || 0,
          received_amount: transaction.received_amount || 0,
          refund_amount: transaction.refund_amount || 0,
          due_amount: transaction.due_amount || 0,
          payment_date: transaction.payment_date || '',
          created_at: transaction.created_at || '',
          createdBy: transaction.createdBy || ''
        })) || []
      },
      testResult: patient.visit.testResult?.map(test => {
        const testAny = test as ExtendedTestResult;
        return {
          id: test.id || 0,
          testId: test.testId || 0,
          testName: testAny.testName || '',
          category: testAny.category || '',
          reportStatus: test.reportStatus || '',
          createdBy: testAny.createdBy || '',
          updatedBy: testAny.updatedBy || '',
          createdAt: testAny.createdAt || '',
          updatedAt: testAny.updatedAt || '',
          filled: testAny.filled || false
        };
      }) || [],
      listofeachtestdiscount: patient.visit.listofeachtestdiscount?.map(discount => {
        const discountAny = discount as ExtendedDiscount;
        return {
          discountAmount: discount.discountAmount || 0,
          discountPercent: discount.discountPercent || 0,
          finalPrice: discount.finalPrice || 0,
          testName: discountAny.testName || '',
          category: discountAny.category || '',
          createdBy: discountAny.createdBy || '',
          updatedBy: discountAny.updatedBy || '',
          id: discount.id || 0
        };
      }) || []
    }
  };
};

const convertPatientToCsvData = (patient: Patient): unknown => {
  return {
    visit: {
      billing: {
        transactions: patient.visit.billing.transactions?.map(transaction => ({
          cash_amount: transaction.cash_amount,
          card_amount: transaction.card_amount,
          upi_amount: transaction.upi_amount,
          refund_amount: transaction.refund_amount
        })) || []
      }
    }
  };
};


const Page = () => {
  const { currentLab } = useLabs();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('amount-received');

  // Separate filter states for each tab
  const [amountReceivedDateFilter, setAmountReceivedDateFilter] = useState<DateFilterOption>('today');
  const [amountReceivedCustomStartDate, setAmountReceivedCustomStartDate] = useState<Date | null>(null);
  const [amountReceivedCustomEndDate, setAmountReceivedCustomEndDate] = useState<Date | null>(null);
  const [billReportDateFilter, setBillReportDateFilter] = useState<DateFilterOption>('today');
  const [billReportCustomStartDate, setBillReportCustomStartDate] = useState<Date | null>(null);
  const [billReportCustomEndDate, setBillReportCustomEndDate] = useState<Date | null>(null);

  const [dayClosingDateFilter, setDayClosingDateFilter] = useState<DateFilterOption>('today');
  const [dayClosingCustomStartDate, setDayClosingCustomStartDate] = useState<Date | null>(null);
  const [dayClosingCustomEndDate, setDayClosingCustomEndDate] = useState<Date | null>(null);

  const [receiptsDateFilter, setReceiptsDateFilter] = useState<DateFilterOption>('today');
  const [receiptsCustomStartDate, setReceiptsCustomStartDate] = useState<Date | null>(null);
  const [receiptsCustomEndDate, setReceiptsCustomEndDate] = useState<Date | null>(null);

  // Legacy states for backward compatibility (will be removed)
  const [amountReceivedData, setAmountReceivedData] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Separate state for Bill Report tab
  const [billReportData, setBillReportData] = useState<Patient[]>([]);
  const [isBillReportLoading, setIsBillReportLoading] = useState(false);
  const [billReportError, setBillReportError] = useState<string | null>(null);

  // Helper functions to get current filter values based on active tab
  const getCurrentDateFilter = () => {
    switch (activeTab) {
      case 'amount-received':
        return amountReceivedDateFilter;
      case 'bill-report':
        return billReportDateFilter;
      case 'day-closing':
        return dayClosingDateFilter;
      case 'receipts':
        return receiptsDateFilter;
      default:
        return 'today';
    }
  };

  const getCurrentCustomStartDate = () => {
    switch (activeTab) {
      case 'amount-received':
        return amountReceivedCustomStartDate;
      case 'bill-report':
        return billReportCustomStartDate;
      case 'day-closing':
        return dayClosingCustomStartDate;
      case 'receipts':
        return receiptsCustomStartDate;
      default:
        return null;
    }
  };

  const getCurrentCustomEndDate = () => {
    switch (activeTab) {
      case 'amount-received':
        return amountReceivedCustomEndDate;
      case 'bill-report':
        return billReportCustomEndDate;
      case 'day-closing':
        return dayClosingCustomEndDate;
      case 'receipts':
        return receiptsCustomEndDate;
      default:
        return null;
    }
  };


  // Helper functions to set current filter values based on active tab
  const setCurrentDateFilter = (filter: DateFilterOption) => {
    switch (activeTab) {
      case 'amount-received':
        setAmountReceivedDateFilter(filter);
        break;
      case 'bill-report':
        setBillReportDateFilter(filter);
        break;
      case 'day-closing':
        setDayClosingDateFilter(filter);
        break;
      case 'receipts':
        setReceiptsDateFilter(filter);
        break;
    }
  };

  const setCurrentCustomStartDate = (date: Date | null) => {
    switch (activeTab) {
      case 'amount-received':
        setAmountReceivedCustomStartDate(date);
        break;
      case 'bill-report':
        setBillReportCustomStartDate(date);
        break;
      case 'day-closing':
        setDayClosingCustomStartDate(date);
        break;
      case 'receipts':
        setReceiptsCustomStartDate(date);
        break;
    }
  };

  const setCurrentCustomEndDate = (date: Date | null) => {
    switch (activeTab) {
      case 'amount-received':
        setAmountReceivedCustomEndDate(date);
        break;
      case 'bill-report':
        setBillReportCustomEndDate(date);
        break;
      case 'day-closing':
        setDayClosingCustomEndDate(date);
        break;
      case 'receipts':
        setReceiptsCustomEndDate(date);
        break;
    }
  };


  // Handle CSV download
  const handleDownloadCSV = () => {
    if (activeTab === 'amount-received') {
      const filteredData = amountReceivedData;

      const convertedData = filteredData.map(convertPatientToApiResponse);
      const apiResponseData = convertedData.map(convertPatientDataToApiResponse);
      const transformedData = transformApiDataToTableFormat(apiResponseData);

      if (transformedData.length === 0) {
        toast.warning('No data available to download');
        return;
      }

      const csvData = filteredData.map(convertPatientToCsvData);
      const csvContent = convertToCSV(transformedData, csvData as Parameters<typeof convertToCSV>[1]);
      const filename = generateCSVFilename('amount-received');

      downloadCSV(csvContent, filename);
      toast.success('CSV file downloaded successfully');
    } else if (activeTab === 'receipts') {
      // Generate CSV content for receipts
      const csvContent = generateReceiptsCSVContent();
      const filename = `receipts-summary-${new Date().toISOString().split('T')[0]}.csv`;

      downloadCSV(csvContent, filename);
      toast.success('CSV file downloaded successfully');
    } else {
      toast.info('CSV download is only available for "Amount Received by Me" and "Receipts" tabs');
    }
  };


  // Generate print content for receipts
  const generateReceiptsPrintContent = () => {
    const currentDate = new Date().toLocaleDateString('en-GB');
    const currentLabName = currentLab?.name || "Lab Name";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipts Summary - ${currentDate}</title>
        <style>
          @media print {
            @page { margin: 0.5in; }
            body { font-family: Arial, sans-serif; font-size: 12px; }
            .no-print { display: none !important; }
          }
          body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .lab-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
          .date-range { font-size: 14px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .section-header { background-color: #e3f2fd; font-weight: bold; }
          .total-row { background-color: #f0f0f0; font-weight: bold; }
          .net-amount-row { background-color: #e8f5e8; font-weight: bold; }
          .outsource-row { background-color: #fff3e0; font-weight: bold; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .pl-8 { padding-left: 32px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="lab-name">${currentLabName}</div>
          <div class="date-range">Receipts Summary - ${currentDate}</div>
        </div>
        
        <h3>Receipt Summary</h3>
        <table>
          <tr><td>Total Sales</td><td class="text-right">₹450.0</td></tr>
          <tr><td>Total Discount</td><td class="text-right">₹0.0</td></tr>
          <tr><td>Net Amount</td><td class="text-right">₹450.0</td></tr>
          <tr><td>Cash Sales</td><td class="text-right">₹450.0</td></tr>
          <tr><td>Credit Sales</td><td class="text-right">₹0.0</td></tr>
          <tr><td>Due</td><td class="text-right">₹0.0</td></tr>
          <tr><td>Excess Received</td><td class="text-right">₹0.0</td></tr>
          <tr><td>Refund</td><td class="text-right">₹0.0</td></tr>
          <tr><td>Total Receipts</td><td class="text-right">₹550.0</td></tr>
          <tr><td>Net Receipts</td><td class="text-right">₹550.0</td></tr>
        </table>
        
        <h3>Mode of Payment</h3>
        <table>
          <thead>
            <tr>
              <th>Mode of Payment</th>
              <th class="text-center">Cash</th>
              <th class="text-center">Card</th>
              <th class="text-center">Cheque</th>
              <th class="text-center">IMPS</th>
              <th class="text-center">Wallet</th>
              <th class="text-center">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr class="section-header"><td colspan="7">Receipt Details</td></tr>
            <tr><td class="pl-8">Receipt for current cash bills</td><td class="text-center">₹450.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹450.0</td></tr>
            <tr><td class="pl-8">Receipt for current credit bills</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td></tr>
            <tr><td class="pl-8">Receipt for past cash bills</td><td class="text-center">₹100.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹100.0</td></tr>
            <tr><td class="pl-8">Receipt for past credit bills</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td></tr>
            <tr><td class="pl-8">Other Receipts</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td></tr>
            <tr><td class="pl-8">Advance Receipt</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td></tr>
            <tr class="total-row"><td class="pl-8">Total Receipt</td><td class="text-center">₹550.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹550.0</td></tr>
            <tr><td colspan="7"></td></tr>
            <tr class="section-header"><td colspan="7">Payment Details</td></tr>
            <tr><td class="pl-8">Refund</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td></tr>
            <tr><td class="pl-8">Other Payments</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td></tr>
            <tr class="total-row"><td class="pl-8">Total Payment</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td></tr>
            <tr><td colspan="7"></td></tr>
            <tr class="net-amount-row"><td class="pl-8">Net Amount</td><td class="text-center">₹550.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹550.0</td></tr>
            <tr><td colspan="7"></td></tr>
            <tr class="outsource-row"><td class="pl-8">Outsource Test Amount</td><td class="text-center">₹150.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹0.0</td><td class="text-center">₹150.0</td></tr>
          </tbody>
        </table>
      </body>
      </html>
    `;
  };

  // Generate CSV content for receipts
  const generateReceiptsCSVContent = () => {
    const headers = [
      'Receipt Summary',
      'Value',
      'Mode of Payment',
      'Cash',
      'Card',
      'Cheque',
      'IMPS',
      'Wallet',
      'Total'
    ];

    const rows = [
      ['Total Sales', '450.0', '', '', '', '', '', '', ''],
      ['Total Discount', '0.0', '', '', '', '', '', '', ''],
      ['Net Amount', '450.0', '', '', '', '', '', '', ''],
      ['Cash Sales', '450.0', '', '', '', '', '', '', ''],
      ['Credit Sales', '0.0', '', '', '', '', '', '', ''],
      ['Due', '0.0', '', '', '', '', '', '', ''],
      ['Excess Received', '0.0', '', '', '', '', '', '', ''],
      ['Refund', '0.0', '', '', '', '', '', '', ''],
      ['Total Receipts', '550.0', '', '', '', '', '', '', ''],
      ['Net Receipts', '550.0', '', '', '', '', '', '', ''],
      ['', '', 'Receipt Details', '', '', '', '', '', ''],
      ['', '', 'Receipt for current cash bills', '450.0', '0.0', '0.0', '0.0', '0.0', '450.0'],
      ['', '', 'Receipt for current credit bills', '0.0', '0.0', '0.0', '0.0', '0.0', '0.0'],
      ['', '', 'Receipt for past cash bills', '100.0', '0.0', '0.0', '0.0', '0.0', '100.0'],
      ['', '', 'Receipt for past credit bills', '0.0', '0.0', '0.0', '0.0', '0.0', '0.0'],
      ['', '', 'Other Receipts', '0.0', '0.0', '0.0', '0.0', '0.0', '0.0'],
      ['', '', 'Advance Receipt', '0.0', '0.0', '0.0', '0.0', '0.0', '0.0'],
      ['', '', 'Total Receipt', '550.0', '0.0', '0.0', '0.0', '0.0', '550.0'],
      ['', '', 'Payment Details', '', '', '', '', '', ''],
      ['', '', 'Refund', '0.0', '0.0', '0.0', '0.0', '0.0', '0.0'],
      ['', '', 'Other Payments', '0.0', '0.0', '0.0', '0.0', '0.0', '0.0'],
      ['', '', 'Total Payment', '0.0', '0.0', '0.0', '0.0', '0.0', '0.0'],
      ['', '', 'Net Amount', '550.0', '0.0', '0.0', '0.0', '0.0', '550.0'],
      ['', '', 'Outsource Test Amount', '150.0', '0.0', '0.0', '0.0', '0.0', '150.0']
    ];

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  };

  // Generate print content
  const generatePrintContent = (data: AmountReceivedItem[], rawApiData: Patient[]) => {
    // Calculate totals
    const totals: Totals = data.reduce((acc, item) => {
      acc.totalAmount += item.totalAmount;
      acc.discount += item.discount;
      acc.due += item.due;
      acc.received += item.received;
      acc.netReceived += item.netReceived;
      acc.refund += item.refund || 0;
      return acc;
    }, {
      totalAmount: 0,
      discount: 0,
      due: 0,
      received: 0,
      netReceived: 0,
      refund: 0
    });

    // Calculate payment method totals
    const paymentTotals: PaymentTotals = rawApiData.reduce((acc, patient) => {
      patient.visit.billing.transactions?.forEach((transaction) => {
        acc.cashTotal += transaction.cash_amount || 0;
        acc.cardTotal += transaction.card_amount || 0;
        acc.upiTotal += transaction.upi_amount || 0;
      });
      return acc;
    }, { cashTotal: 0, cardTotal: 0, upiTotal: 0 });

    const formatAmount = (amount: number): string => {
      return amount === 0 ? "0" : amount.toFixed(2);
    };

    const formatDate = (dateString: string): string => {
      if (!dateString) return '';
      const [year, month, day] = dateString.split('-');
      return `${day}-${month}-${year}`;
    };

    const currentDate = new Date().toLocaleDateString('en-GB');
    const currentTime = new Date().toLocaleTimeString('en-GB');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Amount Received Report - ${currentDate}</title>
        <style>
          @media print {
            @page { margin: 0.5in; }
            body { font-family: Arial, sans-serif; font-size: 12px; }
            .no-print { display: none !important; }
          }
          body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .header h1 { margin: 0; color: #333; font-size: 24px; }
          .header p { margin: 5px 0; color: #666; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .table th { background-color: #f5f5f5; font-weight: bold; }
          .table tr:nth-child(even) { background-color: #f9f9f9; }
          .totals { background-color: #e8f4fd; font-weight: bold; }
          .summary { margin-top: 20px; padding: 15px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; }
          .summary h3 { margin: 0 0 10px 0; color: #333; }
          .summary-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .summary-label { font-weight: bold; }
          .payment-methods { margin-top: 15px; }
          .payment-method { display: inline-block; margin-right: 20px; }
          .payment-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 5px; }
          .cash { background-color: #3b82f6; }
          .card { background-color: #8b5cf6; }
          .upi { background-color: #f59e0b; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Amount Received Report</h1>
          <p>Generated on: ${currentDate} at ${currentTime}</p>
          <p>Total Records: ${data.length}</p>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Sl No</th>
              <th>Receipt No</th>
              <th>Receipt Date</th>
              <th>Patient Name</th>
              <th>Bill No/Type</th>
              <th>Payment Type</th>
              <th>Billed Date</th>
              <th>Total Amount</th>
              <th>Discount</th>
              <th>Due</th>
              <th>Received</th>
              <th>Net Received</th>
              <th>Received By</th>
            </tr>
          </thead>
          <tbody>
            ${data.map((item) => `
              <tr>
                <td>${item.slNo}</td>
                <td>${item.receiptNo}</td>
                <td>${formatDate(item.receiptDate)}</td>
                <td>${item.patientName}</td>
                <td>${item.billNo}/${item.billType}</td>
                <td>${item.paymentType}</td>
                <td>${formatDate(item.billedDate)}</td>
                <td>₹${formatAmount(item.totalAmount)}</td>
                <td>₹${formatAmount(item.discount)}</td>
                <td>₹${formatAmount(item.due)}${item.refund && item.refund > 0 ? `<br/><span style="color: #dc2626; font-weight: bold; font-size: 10px;">Refund: ₹${formatAmount(item.refund)}</span>` : ''}</td>
                <td>₹${formatAmount(item.received)}</td>
                <td>₹${formatAmount(item.netReceived)}</td>
                <td>${item.receivedBy}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="totals">
              <td colspan="7"><strong>TOTAL</strong></td>
              <td><strong>₹${formatAmount(totals.totalAmount)}</strong></td>
              <td><strong>₹${formatAmount(totals.discount)}</strong></td>
              <td><strong>₹${formatAmount(totals.due)}</strong></td>
              <td><strong>₹${formatAmount(totals.received)}</strong></td>
              <td><strong>₹${formatAmount(totals.netReceived)}</strong></td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        <div class="summary">
          <h3>Summary</h3>
          <div class="summary-row">
            <span class="summary-label">Total Amount:</span>
            <span>₹${formatAmount(totals.totalAmount)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Total Discount:</span>
            <span>₹${formatAmount(totals.discount)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Total Due:</span>
            <span>₹${formatAmount(totals.due)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Total Received:</span>
            <span>₹${formatAmount(totals.received)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Net Received:</span>
            <span>₹${formatAmount(totals.netReceived)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Total Refund:</span>
            <span>₹${formatAmount(totals.refund)}</span>
          </div>
          
          <div class="payment-methods">
            <h4>Payment Methods Breakdown:</h4>
            <div class="payment-method">
              <span class="payment-dot cash"></span>
              <strong>Cash:</strong> ₹${formatAmount(paymentTotals.cashTotal)}
            </div>
            <div class="payment-method">
              <span class="payment-dot card"></span>
              <strong>Card:</strong> ₹${formatAmount(paymentTotals.cardTotal)}
            </div>
            <div class="payment-method">
              <span class="payment-dot upi"></span>
              <strong>UPI:</strong> ₹${formatAmount(paymentTotals.upiTotal)}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Handle Print functionality
  const handlePrint = () => {
    if (activeTab === 'amount-received') {
      // Filter data based on visit type if selected
      const filteredData = amountReceivedData;

      const convertedData = filteredData.map(convertPatientToApiResponse);
      const apiResponseData = convertedData.map(convertPatientDataToApiResponse);
      const transformedData = transformApiDataToTableFormat(apiResponseData);

      if (transformedData.length === 0) {
        toast.warning('No data available to print');
        return;
      }

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow popups to print');
        return;
      }

      // Generate print content
      const printContent = generatePrintContent(transformedData, filteredData);

      printWindow.document.write(printContent);
      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      };

      toast.success('Print dialog opened');
    } else if (activeTab === 'receipts') {
      // Generate print content for receipts
      const printContent = generateReceiptsPrintContent();

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow popups to print');
        return;
      }

      printWindow.document.write(printContent);
      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      };

      toast.success('Print dialog opened');
    } else {
      toast.info('Print is only available for "Amount Received by Me" and "Receipts" tabs');
    }
  };

  // Fetch amount received data
  const fetchAmountReceivedData = async () => {
    if (!currentLab?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const { startDate, endDate } = getDateRange(amountReceivedDateFilter, amountReceivedCustomStartDate, amountReceivedCustomEndDate);

      if (!startDate || !endDate) {
        toast.warning('Please select valid date range');
        return;
      }

      const formattedStartDate = formatDateForAPI(startDate);
      const formattedEndDate = formatDateForAPI(endDate);

      // Use the new API endpoint for datewise transaction details
      const response = await getDatewiseTransactionDetails(
        currentLab.id,
        formattedStartDate,
        formattedEndDate
      );



      // The new API returns data directly as an array, not wrapped in a data property
      const data = Array.isArray(response) ? response : response?.data || [];
      setAmountReceivedData(data);
    } catch (error: unknown) {

      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
      setError(errorMessage);
      toast.error(errorMessage);
      setAmountReceivedData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch bill report data
  const fetchBillReportData = async () => {
    if (!currentLab?.id) return;

    try {
      setIsBillReportLoading(true);
      setBillReportError(null);
      const { startDate, endDate } = getDateRange(billReportDateFilter, billReportCustomStartDate, billReportCustomEndDate);

      if (!startDate || !endDate) {
        toast.warning('Please select valid date range');
        return;
      }

      const formattedStartDate = formatDateForAPI(startDate);
      const formattedEndDate = formatDateForAPI(endDate);

      // Use the new API endpoint for datewise transaction details
      const response = await getDatewiseTransactionDetails(
        currentLab.id,
        formattedStartDate,
        formattedEndDate
      );

      // The new API returns data directly as an array, not wrapped in a data property
      const data = Array.isArray(response) ? response : response?.data || [];
      setBillReportData(data);
    } catch (error: unknown) {

      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
      setBillReportError(errorMessage);
      toast.error(errorMessage);
      setBillReportData([]);
    } finally {
      setIsBillReportLoading(false);
    }
  };

  // Fetch data when filters change (excluding visitTypeFilter as it's client-side filtering)
  useEffect(() => {
    if (activeTab === 'amount-received') {
      fetchAmountReceivedData();
    } else if (activeTab === 'bill-report') {
      fetchBillReportData();
    }
  }, [currentLab, amountReceivedDateFilter, amountReceivedCustomStartDate, amountReceivedCustomEndDate, billReportDateFilter, billReportCustomStartDate, billReportCustomEndDate, activeTab]);

  const tabs = [
    {
      id: 'amount-received',
      label: 'Amount Received by Me',
      icon: <FaMoneyBillWave />
    },
    {
      id: 'bill-report',
      label: 'Bill Report',
      icon: <FaFileInvoice />
    },
    {
      id: 'day-closing',
      label: 'Day Closing Summary',
      icon: <FaCalendarDay />
    },
    {
      id: 'receipts',
      label: 'Receipts',
      icon: <FaReceipt />
    }
  ];

  const renderTabContent = () => {
    // Get the current selected date for the active tab
    const { startDate, endDate } = getDateRange(getCurrentDateFilter(), getCurrentCustomStartDate(), getCurrentCustomEndDate());

    // Only set selectedDate for single date selections, not ranges
    const isDateRange = startDate && endDate && startDate !== endDate;
    const selectedDate = !isDateRange && startDate ? formatDateForAPI(startDate) : undefined;
    const startDateStr = startDate ? formatDateForAPI(startDate) : undefined;
    const endDateStr = endDate ? formatDateForAPI(endDate) : undefined;


    switch (activeTab) {
      case 'amount-received':
        if (isLoading) {
          return (
            <div className="flex items-center justify-center h-64">
              <Loader type="progress" fullScreen={false} text="Loading amount received data..." />
            </div>
          );
        }

        if (error) {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-red-600">
                <p className="text-lg font-medium">Error loading data</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          );
        }

        if (!amountReceivedData || amountReceivedData.length === 0) {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-gray-500">
                <p className="text-lg font-medium">No data available</p>
                <p className="text-sm">Please select a date range to view amount received data</p>
              </div>
            </div>
          );
        }

        // Process data for amount-received tab
        const filteredData = amountReceivedData;

        const convertedData = filteredData.map(convertPatientToApiResponse);
        const apiResponseData = convertedData.map(convertPatientDataToApiResponse);
        const transformedData = transformApiDataToTableFormat(apiResponseData);

        // Filter transformed data based on transaction payment dates
        const dateFilteredData = transformedData.filter(item => {
          if (!item.receiptDate) return false;

          // Parse the date string (format: "2025-09-09")
          const itemDateStr = item.receiptDate;
          const today = new Date();
          const todayStr = today.toISOString().split('T')[0]; // Get YYYY-MM-DD format
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          switch (getCurrentDateFilter()) {
            case 'today':
              return itemDateStr === todayStr;
            case 'yesterday':
              return itemDateStr === yesterdayStr;
            case 'last7days':
              const sevenDaysAgo = new Date(today);
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
              return itemDateStr >= sevenDaysAgoStr && itemDateStr <= todayStr;
            case 'thisMonth':
              const itemDate = new Date(itemDateStr);
              return itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear();
            case 'thisYear':
              const itemYear = new Date(itemDateStr);
              return itemYear.getFullYear() === today.getFullYear();
            case 'custom':
              if (getCurrentCustomStartDate() && getCurrentCustomEndDate()) {
                return itemDateStr >= getCurrentCustomStartDate()!.toISOString().split('T')[0] && itemDateStr <= getCurrentCustomEndDate()!.toISOString().split('T')[0];
              }
              return true;
            default:
              return true;
          }
        });

        return <AmountReceivedTable
          data={dateFilteredData}
          rawApiData={apiResponseData}
          showTitle={false}
          selectedDate={selectedDate}
          startDate={startDateStr}
          endDate={endDateStr}
        />;

      case 'bill-report':
        if (isBillReportLoading) {
          return (
            <div className="flex items-center justify-center h-64">
              <Loader type="progress" fullScreen={false} text="Loading bill report data..." />
            </div>
          );
        }

        if (billReportError) {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-red-600">
                <p className="text-lg font-medium">Error loading bill report data</p>
                <p className="text-sm">{billReportError}</p>
              </div>
            </div>
          );
        }

        if (!billReportData || billReportData.length === 0) {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-gray-500">
                <p className="text-lg font-medium">No bill report data available</p>
                <p className="text-sm">Please select a date range to view bill report data</p>
              </div>
            </div>
          );
        }

        // Process data for bill-report tab
        const billFilteredData = billReportData;

        // const billConvertedData = billFilteredData.map(convertPatientToApiResponse);
        // const billApiResponseData = billConvertedData.map(convertPatientDataToApiResponse);
        // const billTransformedData = transformApiDataToTableFormat(billApiResponseData);

        const billConvertedApiData = billFilteredData.map(convertPatientToApiResponse);

        return <BillReport
          data={billConvertedApiData as PatientData[]}
          rawApiData={billConvertedApiData as PatientData[]}
          startDate={startDateStr}
          endDate={endDateStr}
          selectedDate={selectedDate}
        />;

      case 'day-closing':
        return (
          <DayClosingSummary
            labName={currentLab?.name || "Lab Name"}
            dateRange={`${startDateStr || 'Start Date'} to ${endDateStr || 'End Date'}`}
            startDate={startDateStr}
            endDate={endDateStr}
          />
        );

      case 'receipts':
        return (
          <ReceiptsSummary
            startDate={startDateStr}
            endDate={endDateStr}
          />
        );

      default:
        return null;
    }
  };

  return (
    //  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <div className="">
      <div className="w-full max-w-9xl mx-auto p-4 sm:p-6">
        {/* Compact Unified Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4">
          {/* Top Row - Title and Back Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FaFileInvoice className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Detail Reports</h1>
                <p className="text-xs sm:text-sm text-gray-600">Comprehensive financial and transaction reports</p>
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard?tab=dashboard')}
              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 text-sm"
            >
              <FaArrowLeft className="w-4 h-4" />
              <span className="font-medium hidden sm:inline">Back to Analytics</span>
              <span className="font-medium sm:hidden">Back</span>
            </button>
          </div>

          {/* Middle Row - Tabs */}
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                    }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="w-3 h-3 sm:w-4 sm:h-4">{tab.icon}</span>
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Row - Filters and Actions */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 pt-3 border-t border-gray-200">
            {/* Left side - Date Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
              <div className="min-w-[140px] sm:min-w-[180px]">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={getCurrentDateFilter()}
                  onChange={(e) => setCurrentDateFilter(e.target.value as DateFilterOption)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white shadow-sm"
                >
                  {DETAIL_REPORTS_DATE_FILTER_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Date Selection */}
              {getCurrentDateFilter() === 'custom' && (
                <div className="min-w-[140px] sm:min-w-[180px]">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Select Date</label>
                  <input
                    type="date"
                    value={getCurrentCustomStartDate() ? getCurrentCustomStartDate()!.toISOString().split('T')[0] : ''}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      const selectedDate = e.target.value ? new Date(e.target.value) : null;
                      setCurrentCustomStartDate(selectedDate);
                      setCurrentCustomEndDate(selectedDate);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white shadow-sm"
                    placeholder="Select Date"
                  />
                </div>
              )}

              {/* Clear Filter */}
              {getCurrentDateFilter() !== 'today' && (
                <div className="flex flex-col justify-end">
                  <div className="h-5"></div> {/* Spacer to align with input fields */}
                  <button
                    onClick={() => {
                      setCurrentDateFilter('today');
                      setCurrentCustomStartDate(null);
                      setCurrentCustomEndDate(null);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-red-600 hover:text-red-800 transition-colors bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 h-[38px]"
                    title="Clear all filters"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right side - Action Buttons */}
            {activeTab !== 'bill-report' && (
              <div className="flex flex-col justify-end">
                <div className="h-5"></div> {/* Spacer to align with input fields */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 h-[38px]"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span className="hidden sm:inline">Print</span>
                  </button>

                  <button
                    onClick={handleDownloadCSV}
                    className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm h-[38px]"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="hidden sm:inline">Download CSV</span>
                    <span className="sm:hidden">CSV</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="w-full">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Page;
