'use client';

import React, { useState, useEffect } from 'react';
import { FaFileInvoice } from 'react-icons/fa';


interface LabTest {
  category: string;
  tests: {
    name: string;
    amount: number;
    count: number;
  }[];
  total: {
    amount: number;
    count: number;
  };
}

interface Doctor {
  name: string;
  count: number;
  amount: number;
}

interface BillSummaryData {
  total: number;
  totalDiscount: number;
  netAmount: number;
  netReceived: number; // Add net received amount
  refundAmount: number;
  totalWriteOff: number;
  labTests: LabTest[];
  doctors: Doctor[];
}

interface TestDiscount {
  discountAmount: number;
  discountPercent: number;
  finalPrice: number;
  testName: string;
  category: string;
  createdBy: string;
  updatedBy: string;
  id: number;
}

interface Transaction {
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
      transactions: Transaction[];
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
    listofeachtestdiscount: TestDiscount[];
  };
}

interface BillReportProps {
  data: PatientData[];
  rawApiData: PatientData[];
  startDate?: string;
  endDate?: string;
  selectedDate?: string;
}

const BillReport: React.FC<BillReportProps> = ({ data, rawApiData, startDate, endDate, selectedDate }) => {
  const [billData, setBillData] = useState<BillSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Format date range for display in header
  const formatDateRange = () => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }

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

  const dateRangeDisplay = formatDateRange();

  // Transform API data to BillSummaryData format
  const transformApiData = (): BillSummaryData => {
    // Initialize totals
    let total = 0;
    let totalDiscount = 0;
    let netAmount = 0;
    let netReceived = 0; // Add net received calculation
    let refundAmount = 0; // Hardcoded to 0
    const totalWriteOff = 0; // Hardcoded to 0

    // Group lab tests by category
    const labTestsMap = new Map<string, LabTest>();
    const doctorsMap = new Map<string, Doctor>();

    // Process lab tests and doctors from rawApiData with date filtering and visit ID deduplication (same as total amount)
    if (rawApiData && Array.isArray(rawApiData)) {
      const processedVisitIds = new Set();
      
      rawApiData.forEach((patient: PatientData) => {
        const { visit } = patient;
        const { billing } = visit;
        const visitId = visit.visitId;
        
        // Get billing date for this visit
        let billingDate = '';
        try {
          if (billing.billingDate) {
            const date = new Date(billing.billingDate);
            if (!isNaN(date.getTime())) {
              billingDate = date.toISOString().split('T')[0];
            }
          }
        } catch (error) {
          // Error parsing billing date for lab tests
        }
        
        // Check if billing date matches the selected date/range (same logic as total amount)
        let shouldIncludeLabTests = false;
        
        if (!selectedDate && !startDate && !endDate) {
          // No date filter - show all lab tests
          shouldIncludeLabTests = true;
        } else {
          if (selectedDate) {
            // Single date selection
            shouldIncludeLabTests = billingDate === selectedDate;
          } else if (startDate && endDate) {
            // Date range selection
            shouldIncludeLabTests = billingDate >= startDate && billingDate <= endDate;
          } else if (startDate) {
            // Only start date
            shouldIncludeLabTests = billingDate >= startDate;
          } else if (endDate) {
            // Only end date
            shouldIncludeLabTests = billingDate <= endDate;
          }
        }
        
        // Only process lab tests if billing date matches selected date AND visit ID not already processed
        if (shouldIncludeLabTests && !processedVisitIds.has(visitId)) {
          processedVisitIds.add(visitId);
          
          // Process lab tests from testResult and listofeachtestdiscount
          if (visit.testResult && Array.isArray(visit.testResult)) {
            visit.testResult.forEach((testResult) => {
              const category = testResult.category || 'OTHER';
              
              // Find corresponding discount info
              const discountInfo = visit.listofeachtestdiscount?.find((discount: TestDiscount) => 
                discount.testName === testResult.testName
              );
              
              const testPrice = discountInfo?.finalPrice || 0;
              
              if (!labTestsMap.has(category)) {
                labTestsMap.set(category, {
                  category,
                  tests: [],
                  total: { amount: 0, count: 0 }
                });
              }
              
              const categoryData = labTestsMap.get(category)!;
              const existingTest = categoryData.tests.find(t => t.name === testResult.testName);
              
              if (existingTest) {
                existingTest.amount += testPrice;
                existingTest.count += 1;
              } else {
                categoryData.tests.push({
                  name: testResult.testName || 'Unknown Test',
                  amount: testPrice,
                  count: 1
                });
              }
              
              categoryData.total.amount += testPrice;
              categoryData.total.count += 1;
            });
          }
        }

        // Process doctors - independent of lab tests date filtering
        
        // Check for doctor name at patient level first, then visit level
        const doctorName = patient.doctorName || visit.doctorName;
        
        if (doctorName) {
          // Calculate total amount from listofeachtestdiscount (finalPrice)
        const doctorAmount = visit.listofeachtestdiscount?.reduce((sum: number, discount: TestDiscount) => {
          return sum + (discount.finalPrice || 0);
        }, 0) || 0;
          
          // Count number of tests for this doctor - check multiple possible fields
          const testCount = visit.testNames?.length || 
                           visit.testIds?.length || 
                           visit.testResult?.length || 
                           visit.listofeachtestdiscount?.length || 
                           0;
          
          
          if (doctorsMap.has(doctorName)) {
            const doctor = doctorsMap.get(doctorName)!;
            doctor.count += testCount;
            doctor.amount += doctorAmount;
          } else {
            doctorsMap.set(doctorName, {
              name: doctorName,
              count: testCount,
              amount: doctorAmount
            });
          }
        } else if (visit.doctorId) {
          // Temporary mapping for doctor IDs to names (you can update this)
        
          
          const doctorName = `Doctor ID: ${visit.doctorId}`;
          
          // Calculate total amount from listofeachtestdiscount (finalPrice)
        const doctorAmount = visit.listofeachtestdiscount?.reduce((sum: number, discount: TestDiscount) => {
          return sum + (discount.finalPrice || 0);
        }, 0) || 0;
          
          // Count number of tests for this doctor - check multiple possible fields
          const testCount = visit.testNames?.length || 
                           visit.testIds?.length || 
                           visit.testResult?.length || 
                           visit.listofeachtestdiscount?.length || 
                           0;
          
          
          if (doctorsMap.has(doctorName)) {
            const doctor = doctorsMap.get(doctorName)!;
            doctor.count += testCount;
            doctor.amount += doctorAmount;
          } else {
            doctorsMap.set(doctorName, {
              name: doctorName,
              count: testCount,
              amount: doctorAmount
            });
          }
        }
      });
    }

    // Calculate discount, refund and net received using rawApiData (exact same logic as AmountReceivedTable)
    if (rawApiData && Array.isArray(rawApiData)) {
      // Group patients by patient ID to get the latest transaction for each patient (for due amounts)
      const patientMap = new Map();
      
      rawApiData.forEach((patient) => {
        // Group by patient ID only - each patient ID should have only one latest visit
        const patientKey = patient.id;
        const existingPatient = patientMap.get(patientKey);
        
        // If this is the first time we see this patient ID, or if this visit/transaction is more recent
        let currentVisitDate: Date;
        let existingVisitDate: Date | null = null;
        
        try {
          currentVisitDate = new Date(patient.visit.visitDate);
          if (isNaN(currentVisitDate.getTime())) {
            return; // Skip this patient if date is invalid
          }
          
          if (existingPatient) {
            existingVisitDate = new Date(existingPatient.visit.visitDate);
            if (isNaN(existingVisitDate.getTime())) {
              existingVisitDate = null;
            }
          }
        } catch (error) {
          return; // Skip this patient if date parsing fails
        }
        
        // Get the latest transaction time for comparison
        const currentLatestTransaction = patient.visit.billing.transactions?.reduce((latest: Transaction | null, transaction: Transaction) => {
          try {
            const transactionTime = new Date(transaction.created_at);
            if (isNaN(transactionTime.getTime())) {
              return latest;
            }
            return !latest || transactionTime > new Date(latest.created_at) ? transaction : latest;
          } catch (error) {
            return latest;
          }
        }, null as Transaction | null);
        
        const existingLatestTransaction = existingPatient?.visit.billing.transactions?.reduce((latest: Transaction | null, transaction: Transaction) => {
          try {
            const transactionTime = new Date(transaction.created_at);
            if (isNaN(transactionTime.getTime())) {
              return latest;
            }
            return !latest || transactionTime > new Date(latest.created_at) ? transaction : latest;
          } catch (error) {
            return latest;
          }
        }, null as Transaction | null);
        
        const shouldUpdate = !existingPatient || 
          (existingVisitDate && currentVisitDate > existingVisitDate) ||
          (existingVisitDate && currentVisitDate.getTime() === existingVisitDate.getTime() && 
           currentLatestTransaction && existingLatestTransaction &&
           new Date(currentLatestTransaction.created_at) > new Date(existingLatestTransaction.created_at));
        
        if (shouldUpdate) {
          patientMap.set(patientKey, patient);
        }
      });
      
      // Calculate totals: use latest due amounts per patient, but sum all transactions for received amounts
      const latestPatients = Array.from(patientMap.values());
      
      // First, calculate due amounts using only latest transactions per patient
      // Only include discount for billing dates that match the selected date
      const dueTotals = latestPatients.reduce((acc, patient) => {
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
        acc.due += billing.due_amount;
        
        return acc;
      }, { discount: 0, due: 0 });
      
      // Set the discount from dueTotals
      totalDiscount = dueTotals.discount;
      
      // Calculate total amount - add only once per visit ID based on billing date matching selected date
      const processedVisitIds = new Set();
      
      rawApiData.forEach((patient: PatientData) => {
        const { visit } = patient;
        const { billing } = visit;
        const visitId = visit.visitId;
        
        // Get billing date for this visit
        let billingDate = '';
        try {
          if (billing.billingDate) {
            const date = new Date(billing.billingDate);
            if (!isNaN(date.getTime())) {
              billingDate = date.toISOString().split('T')[0];
            }
          }
        } catch (error) {
          // Error parsing billing date
        }
        
        // Check if billing date matches the selected date/range
        let shouldIncludeTotal = false;
        
        if (!selectedDate && !startDate && !endDate) {
          // No date filter - show all totals
          shouldIncludeTotal = true;
        } else {
          if (selectedDate) {
            // Single date selection
            shouldIncludeTotal = billingDate === selectedDate;
          } else if (startDate && endDate) {
            // Date range selection
            shouldIncludeTotal = billingDate >= startDate && billingDate <= endDate;
          } else if (startDate) {
            // Only start date
            shouldIncludeTotal = billingDate >= startDate;
          } else if (endDate) {
            // Only end date
            shouldIncludeTotal = billingDate <= endDate;
          }
        }
        
        // Only add total amount once per visit ID if billing date matches selected date
        if (shouldIncludeTotal && !processedVisitIds.has(visitId)) {
          total += billing.totalAmount || 0;
          processedVisitIds.add(visitId);
        }
      });
      
      // Then, calculate received amounts using ALL transactions from ALL patients
      const receivedTotals = rawApiData.reduce((acc, patient) => {
        const { visit } = patient;
        const { billing } = visit;
        
        billing.transactions?.forEach((transaction: Transaction) => {
          acc.received += transaction.received_amount || 0;
          acc.refund += transaction.refund_amount || 0;
          acc.cashTotal += transaction.cash_amount || 0;
          acc.cardTotal += transaction.card_amount || 0;
          acc.upiTotal += transaction.upi_amount || 0;
        });
        acc.netReceived += billing.received_amount - (billing.transactions?.reduce((sum: number, t: { refund_amount?: number; }) => sum + (t.refund_amount || 0), 0) || 0);
        return acc;
      }, { received: 0, netReceived: 0, refund: 0, cashTotal: 0, cardTotal: 0, upiTotal: 0 });
      
      // Set refund and net received from receivedTotals
      refundAmount = receivedTotals.refund;
      netReceived = receivedTotals.netReceived;
    }

    // Calculate net amount as total - discount (same logic as AmountReceivedTable)
    netAmount = total - totalDiscount;


    return {
      total,
      totalDiscount,
      netAmount,
      netReceived, // Calculated from rawApiData
      refundAmount, // Calculated from rawApiData
      totalWriteOff, // Hardcoded to 0
      labTests: Array.from(labTestsMap.values()),
      doctors: Array.from(doctorsMap.values())
    };
  };

  // Transform data when props change
  useEffect(() => {
    if (data && data.length > 0) {
      setIsLoading(false);
      setError(null);
      const transformedData = transformApiData();
      setBillData(transformedData);
    } else {
      setIsLoading(false);
      setError(null);
      setBillData(null);
    }
  }, [data, rawApiData, startDate, endDate, selectedDate]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-3 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="text-center text-red-600">
          <FaFileInvoice className="h-8 w-8 mx-auto mb-2 text-red-300" />
          <p className="text-sm font-semibold">Error loading bill data</p>
          <p className="text-xs">{error}</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!billData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="text-center text-gray-500">
          <FaFileInvoice className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm font-semibold">No bill data available</p>
          <p className="text-xs">Please select a date range to view bill summary</p>
        </div>
      </div>
    );
  }

  // Calculate lab tests grand total
  const labTestsGrandTotal = billData.labTests.reduce((sum, category) => sum + category.total.amount, 0);
  const labTestsGrandCount = billData.labTests.reduce((sum, category) => sum + category.total.count, 0);

  // Calculate doctors total
  const doctorsTotal = billData.doctors.reduce((sum, doctor) => sum + doctor.amount, 0);
  const doctorsCount = billData.doctors.reduce((sum, doctor) => sum + doctor.count, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Compact Header with Design System Gradient */}
      <div 
        className="px-4 py-3 border-b border-gray-200"
        style={{ background: `linear-gradient(135deg, #E1C4F8 0%, #d1a8f5 100%)` }}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 rounded-lg">
            <FaFileInvoice className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Bill Summary</h3>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <p className="text-xs text-white/80">
                Comprehensive billing analysis and test breakdown
              </p>
              {dateRangeDisplay && (
                <>
                  <span className="hidden sm:inline text-xs text-white/60">•</span>
                  <p className="text-[11px] font-medium text-white/90">
                    {dateRangeDisplay}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Compact Summary Cards - Design System Colors */}
      <div className="p-3 border-b border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Total</p>
                <p className="text-lg font-bold text-gray-900">₹{billData.total.toFixed(1)}</p>
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
                <p className="text-lg font-bold text-gray-900">₹{billData.totalDiscount.toFixed(1)}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-lg font-bold">₹</span>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
        <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Net Amount</p>
                <p className="text-lg font-bold text-green-600">₹{billData.netAmount.toFixed(1)}</p>
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
                <p className="text-xs font-medium text-gray-600 mb-1">Refund</p>
                <p className="text-lg font-bold text-red-600">₹{billData.refundAmount.toFixed(1)}</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m5 14v-5a2 2 0 00-2-2H6a2 2 0 00-2 2v5a2 2 0 002 2h12a2 2 0 002-2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Write Off</p>
                <p className="text-lg font-bold text-gray-900">₹{billData.totalWriteOff.toFixed(1)}</p>
          </div>
              <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
          </div>
          </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-3 space-y-4">
        {/* Lab Tests Section - Design System Green */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-6 bg-green-500 rounded-full"></div>
            <h4 className="text-sm font-semibold text-gray-900">Lab Tests Analysis</h4>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-green-50 px-3 py-2 border-b border-green-100">
              <div className="grid grid-cols-4 gap-2">
                <div className="font-semibold text-gray-900 text-xs uppercase tracking-wide">Category</div>
                <div className="font-semibold text-gray-900 text-xs uppercase tracking-wide">Test Name</div>
                <div className="font-semibold text-gray-900 text-xs uppercase tracking-wide text-right">Amount</div>
                <div className="font-semibold text-gray-900 text-xs uppercase tracking-wide text-right">Count</div>
              </div>
            </div>
            
            <div className="p-3">
              <div className="space-y-2">
                {billData.labTests.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="space-y-1">
                    {category.tests.map((test, testIndex) => (
                      <div key={`${categoryIndex}-${testIndex}`} className="grid grid-cols-4 gap-2 py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors duration-150">
                        <div className="text-xs text-gray-700 font-medium">
                          {testIndex === 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              {category.category}
                            </span>
                          ) : ''}
                        </div>
                        <div className="text-xs text-gray-700 font-medium">
                          {test.name}
                        </div>
                        <div className="text-xs text-gray-700 text-right font-semibold">
                          ₹{test.amount.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-700 text-right">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {test.count}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Category Total Row */}
                    <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                      <div className="grid grid-cols-4 gap-2">
                        <div className="font-bold text-green-900 text-xs">Total for {category.category}</div>
                        <div className="text-green-900 text-xs">-</div>
                        <div className="text-right font-bold text-green-900 text-sm">₹{category.total.amount.toFixed(1)}</div>
                        <div className="text-right font-bold text-green-900">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-200 text-green-900">
                        {category.total.count}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Separator */}
                    {categoryIndex < billData.labTests.length - 1 && (
                      <div className="border-t border-gray-200 my-2"></div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Grand Total */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                  <div className="grid grid-cols-4 gap-2">
                    <div className="font-bold text-green-900 text-xs">Grand Total</div>
                    <div className="text-green-900 text-xs">-</div>
                    <div className="text-right text-green-900 font-bold text-base">₹{labTestsGrandTotal.toFixed(1)}</div>
                    <div className="text-right text-green-900 font-bold">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-200 text-green-900">
                        {labTestsGrandCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Doctors Section - Design System Purple */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
            <h4 className="text-sm font-semibold text-gray-900">Doctors Analysis</h4>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-purple-50 px-3 py-2 border-b border-purple-100">
              <div className="grid grid-cols-3 gap-2">
                <div className="font-semibold text-gray-900 text-xs uppercase tracking-wide">Doctor Name</div>
                <div className="font-semibold text-gray-900 text-xs uppercase tracking-wide text-center">Test Count</div>
                <div className="font-semibold text-gray-900 text-xs uppercase tracking-wide text-right">Total Amount</div>
              </div>
            </div>
            
            <div className="p-3">
              <div className="space-y-1">
                {billData.doctors.map((doctor, index) => (
                  <div key={index} className={`grid grid-cols-3 gap-2 py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors duration-150 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}>
                    <div className="text-xs text-gray-800 font-semibold">
                      {doctor.name}
                    </div>
                    <div className="text-xs text-gray-700 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {doctor.count} tests
                      </span>
                    </div>
                    <div className="text-xs text-gray-800 text-right font-bold">
                      ₹{doctor.amount.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Doctors Total */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="bg-purple-50 rounded-lg p-2 border border-purple-100">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="font-bold text-purple-900 text-xs">Total</div>
                    <div className="text-center text-purple-900 font-bold">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-purple-200 text-purple-900">
                        {doctorsCount} tests
                      </span>
                    </div>
                    <div className="text-right text-purple-900 text-sm font-bold">₹{doctorsTotal.toFixed(1)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillReport;
