'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AmountReceivedTable, { transformApiDataToTableFormat } from '../../component/common/AmountReceivedTable';
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
import { FaMoneyBillWave, FaFileInvoice, FaCalendarDay, FaArrowLeft } from 'react-icons/fa';
import { DATE_FILTER_OPTIONS, DateFilterOption, getDateRange, formatDateForAPI } from '@/utils/dateUtils';
import { VisitType, Patient } from '@/types/patient/patient';
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
const convertPatientToApiResponse = (patient: Patient): unknown => {
  return {
    id: patient.id,
    firstName: patient.firstName,
    phone: patient.phone,
    city: patient.city,
    dateOfBirth: patient.dateOfBirth,
    age: patient.age,
    gender: patient.gender,
    visit: {
      visitId: patient.visit.visitId,
      visitDate: patient.visit.visitDate,
      visitType: patient.visit.visitType,
      visitStatus: patient.visit.visitStatus,
      visitDescription: patient.visit.visitDescription,
      doctorId: patient.visit.doctorId,
      testIds: patient.visit.testIds,
      packageIds: patient.visit.packageIds,
      billing: {
        billingId: patient.visit.billing.billingId,
        totalAmount: patient.visit.billing.totalAmount,
        paymentStatus: patient.visit.billing.paymentStatus,
        paymentMethod: patient.visit.billing.paymentMethod,
        paymentDate: patient.visit.billing.paymentDate,
        billingDate: (patient.visit.billing as { billingDate?: string }).billingDate || patient.visit.billing.paymentDate,
        discount: patient.visit.billing.discount,
        netAmount: patient.visit.billing.netAmount,
        discountReason: patient.visit.billing.discountReason,
        discountPercentage: patient.visit.billing.discountPercentage,
        upi_id: patient.visit.billing.upi_id,
        received_amount: patient.visit.billing.received_amount,
        refund_amount: patient.visit.billing.refund_amount,
        upi_amount: patient.visit.billing.upi_amount,
        card_amount: patient.visit.billing.card_amount,
        cash_amount: patient.visit.billing.cash_amount,
        due_amount: patient.visit.billing.due_amount,
        transactions: patient.visit.billing.transactions?.map(transaction => ({
          id: transaction.id,
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
          created_at: transaction.created_at,
          createdBy: transaction.createdBy
        })) || [],
        gstRate: patient.visit.billing.gstRate
      },
      visitCancellationReason: patient.visit.visitCancellationReason,
      visitCancellationDate: patient.visit.visitCancellationDate,
      visitCancellationBy: patient.visit.visitCancellationBy,
      visitCancellationTime: patient.visit.visitCancellationTime,
      testResult: patient.visit.testResult,
      listofeachtestdiscount: patient.visit.listofeachtestdiscount
    },
    createdBy: 'system', // Default value since Patient doesn't have this field
    updatedBy: null // Default value since Patient doesn't have this field
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
  const [dateRangeFilter, setDateRangeFilter] = useState<DateFilterOption>('today');
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [visitTypeFilter, setVisitTypeFilter] = useState<string>('');
  const [amountReceivedData, setAmountReceivedData] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Handle CSV download
  const handleDownloadCSV = () => {
    if (activeTab === 'amount-received') {
      // Filter data based on visit type if selected
      const filteredData = visitTypeFilter 
        ? amountReceivedData.filter(patient => patient.visit.visitType === visitTypeFilter)
        : amountReceivedData;
      
      const convertedData = filteredData.map(convertPatientToApiResponse);
      const transformedData = transformApiDataToTableFormat(convertedData as Parameters<typeof transformApiDataToTableFormat>[0]);
      
      if (transformedData.length === 0) {
        toast.warning('No data available to download');
        return;
      }

      const csvData = filteredData.map(convertPatientToCsvData);
      const csvContent = convertToCSV(transformedData, csvData as Parameters<typeof convertToCSV>[1]);
      const filename = generateCSVFilename('amount-received');
      
      downloadCSV(csvContent, filename);
      toast.success('CSV file downloaded successfully');
    } else {
      toast.info('CSV download is only available for "Amount Received by Me" tab');
    }
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
      const filteredData = visitTypeFilter 
        ? amountReceivedData.filter(patient => patient.visit.visitType === visitTypeFilter)
        : amountReceivedData;
      
      const convertedData = filteredData.map(convertPatientToApiResponse);
      const transformedData = transformApiDataToTableFormat(convertedData as Parameters<typeof transformApiDataToTableFormat>[0]);
      
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
    } else {
      toast.info('Print is only available for "Amount Received by Me" tab');
    }
  };

  // Fetch amount received data
  const fetchAmountReceivedData = async () => {
    if (!currentLab?.id) return;

    try {
      setIsLoading(true);
      const { startDate, endDate } = getDateRange(dateRangeFilter, customStartDate, customEndDate);
      
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
      console.error('Error fetching amount received data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
      toast.error(errorMessage);
      setAmountReceivedData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when filters change (excluding visitTypeFilter as it's client-side filtering)
  useEffect(() => {
    if (activeTab === 'amount-received') {
      fetchAmountReceivedData();
    }
  }, [currentLab, dateRangeFilter, customStartDate, customEndDate, activeTab]);

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
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'amount-received':
        if (isLoading) {
          return (
            <div className="flex items-center justify-center h-64">
              <Loader type="progress" fullScreen={false} text="Loading amount received data..." />
            </div>
          );
        }
        
        // Filter data based on visit type if selected
        const filteredData = visitTypeFilter 
          ? amountReceivedData.filter(patient => patient.visit.visitType === visitTypeFilter)
          : amountReceivedData;
        
        const convertedData = filteredData.map(convertPatientToApiResponse);
        const transformedData = transformApiDataToTableFormat(convertedData as Parameters<typeof transformApiDataToTableFormat>[0]);
        
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
          
          switch (dateRangeFilter) {
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
              if (customStartDate && customEndDate) {
                return itemDateStr >= customStartDate.toISOString().split('T')[0] && itemDateStr <= customEndDate.toISOString().split('T')[0];
              }
              return true;
            default:
              return true;
          }
        });
        
        const convertedApiData = filteredData.map(convertPatientToApiResponse);
        // Get the current selected date for discount filtering
        const { startDate, endDate } = getDateRange(dateRangeFilter, customStartDate, customEndDate);
        
        // Only set selectedDate for single date selections, not ranges
        const isDateRange = startDate && endDate && startDate !== endDate;
        const selectedDate = !isDateRange && startDate ? formatDateForAPI(startDate) : undefined;
        const startDateStr = startDate ? formatDateForAPI(startDate) : undefined;
        const endDateStr = endDate ? formatDateForAPI(endDate) : undefined;
        
        return <AmountReceivedTable 
          data={dateFilteredData} 
          rawApiData={convertedApiData as Parameters<typeof AmountReceivedTable>[0]['rawApiData']} 
          showTitle={false}
          selectedDate={selectedDate}
          startDate={startDateStr}
          endDate={endDateStr}
        />;
      
      case 'bill-report':
        return (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Bill Report</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        No data available
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      
      case 'day-closing':
        return (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Day Closing Summary</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tests</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cash</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Digital</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        No data available
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-full mx-auto px-6 py-10">
      {/* Custom Header with Tabs and Back Button */}
      <div className="flex items-center justify-between mb-4">
        {/* Tabs */}
        <div className="flex space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center px-4 py-2 rounded-lg text-xs transition-all duration-300 focus:outline-none ${activeTab === tab.id
                ? 'bg-primary text-purple-700 scale-105 hover:bg-primarylight'
                : 'bg-gray-200 text-gray-500'
                }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="mr-2">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard?tab=dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-purple-700 font-semibold rounded-lg transition-all duration-300 hover:bg-primarylight hover:scale-105 focus:outline-none shadow-md hover:shadow-lg"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Analytics</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="w-full">
          {/* Filter and Action Buttons Section */}
          <div className="mb-4 flex justify-between items-center">
            {/* Left side - Date Filter */}
            <div className="flex items-center gap-3">
              {/* Date Range Filter */}
              <div className="min-w-[150px]">
                <select
                  value={dateRangeFilter}
                  onChange={(e) => setDateRangeFilter(e.target.value as DateFilterOption)}
                  className="border border-gray-300 px-3 py-1.5 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                >
                  {DATE_FILTER_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Date Range */}
              {dateRangeFilter === 'custom' && (
                <>
                  <div className="min-w-[150px]">
                    <input
                      type="date"
                      value={customStartDate ? customStartDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => setCustomStartDate(e.target.value ? new Date(e.target.value) : null)}
                      className="border border-gray-300 px-3 py-1.5 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      placeholder="Start Date"
                    />
                  </div>
                  <div className="min-w-[150px]">
                    <input
                      type="date"
                      value={customEndDate ? customEndDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => setCustomEndDate(e.target.value ? new Date(e.target.value) : null)}
                      className="border border-gray-300 px-3 py-1.5 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      placeholder="End Date"
                    />
                  </div>
                </>
              )}

              {/* Visit Type Filter */}
              <div className="min-w-[150px]">
                <select
                  value={visitTypeFilter}
                  onChange={(e) => setVisitTypeFilter(e.target.value)}
                  className="border border-gray-300 px-3 py-1.5 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                >
                  <option value="">All Types</option>
                  {Object.values(VisitType).map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filter */}
              {(dateRangeFilter !== 'today' || visitTypeFilter) && (
                <button
                  onClick={() => {
                    setDateRangeFilter('today');
                    setCustomStartDate(null);
                    setCustomEndDate(null);
                    setVisitTypeFilter('');
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 transition-colors duration-200 bg-white border border-gray-300 rounded-md shadow-sm"
                  title="Clear all filters"
                >
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Right side - Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              
              
              <button
                onClick={handleDownloadCSV}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download CSV
              </button>
            </div>
          </div>

          {/* Table Content */}
          {renderTabContent()}
      </div>
    </div>
  );
};

export default Page;
