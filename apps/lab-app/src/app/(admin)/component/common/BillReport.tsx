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
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center text-red-600">
          <FaFileInvoice className="h-12 w-12 mx-auto mb-4 text-red-300" />
          <p className="text-lg font-medium">Error loading bill data</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!billData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center text-gray-500">
          <FaFileInvoice className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No bill data available</p>
          <p className="text-sm">Please select a date range to view bill summary</p>
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
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Bill Summary</h3>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 shadow-sm">
            <div className="text-sm text-blue-600 font-medium">Total</div>
            <div className="text-2xl font-bold text-blue-900">₹{billData.total.toFixed(1)}</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200 shadow-sm">
            <div className="text-sm text-yellow-600 font-medium">Total Discount</div>
            <div className="text-2xl font-bold text-yellow-900">₹{billData.totalDiscount.toFixed(1)}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200 shadow-sm">
            <div className="text-sm text-green-600 font-medium">Net Amount</div>
            <div className="text-2xl font-bold text-green-900">₹{billData.netAmount.toFixed(1)}</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200 shadow-sm">
            <div className="text-sm text-red-600 font-medium">Refund Amount</div>
            <div className="text-2xl font-bold text-red-900">₹{billData.refundAmount.toFixed(1)}</div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-600 font-medium">Total Write off</div>
            <div className="text-2xl font-bold text-gray-900">₹{billData.totalWriteOff.toFixed(1)}</div>
          </div>
        </div>
      </div>

      {/* Main Content - Single Column Layout */}
      <div className="p-6">
        {/* Lab Tests Section */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
            Lab Tests
          </h4>
          <div className="border border-blue-200 rounded-lg shadow-sm">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-blue-200">
              <div className="grid grid-cols-4 gap-4">
                <div className="font-semibold text-blue-900">Category</div>
                <div className="font-semibold text-blue-900">Test Name</div>
                <div className="font-semibold text-blue-900 text-right">Amount</div>
                <div className="font-semibold text-blue-900 text-right">Count</div>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {billData.labTests.map((category, categoryIndex) => (
                  <React.Fragment key={categoryIndex}>
                    {category.tests.map((test, testIndex) => (
                      <div key={`${categoryIndex}-${testIndex}`} className="grid grid-cols-4 gap-4 py-1">
                        <div className="text-sm text-gray-700 font-medium">
                          {testIndex === 0 ? category.category : ''}
                        </div>
                        <div className="text-sm text-gray-700">
                          {test.name}
                        </div>
                        <div className="text-sm text-gray-700 text-right">
                          {test.amount.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-700 text-right">
                          {test.count}
                        </div>
                      </div>
                    ))}
                    {/* Category Total Row */}
                    <div className="grid grid-cols-4 gap-4 py-3 font-medium text-blue-800 bg-gradient-to-r from-blue-50 to-blue-100 -mx-4 px-4 border-t border-blue-200 rounded-md shadow-sm">
                      <div className="font-semibold text-blue-900">Total for {category.category}</div>
                      <div>-</div>
                      <div className="text-right font-bold text-blue-900 text-lg">₹{category.total.amount.toFixed(1)}</div>
                      <div className="text-right font-bold text-blue-900">
                        {category.total.count}
                      </div>
                    </div>
                    {/* Horizontal Separator Line - Only add if not the last category */}
                    {categoryIndex < billData.labTests.length - 1 && (
                      <div className="border-t border-gray-300 my-3 -mx-4"></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="grid grid-cols-4 gap-4 font-semibold text-gray-900 bg-gradient-to-r from-blue-50 to-indigo-50 py-3 px-4 rounded-lg border border-blue-100">
                  <div className="text-blue-900">Grand Total</div>
                  <div>-</div>
                  <div className="text-right text-blue-900 font-bold text-lg">₹{labTestsGrandTotal.toFixed(1)}</div>
                  <div className="text-right text-blue-900 font-bold">{labTestsGrandCount}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Doctors Section */}
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
            Doctors
          </h4>
          <div className="border border-gray-200 rounded-lg shadow-sm bg-white">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
              <div className="grid grid-cols-3 gap-4">
                <div className="font-semibold text-gray-900">Name</div>
                <div className="font-semibold text-gray-900 text-center">Count</div>
                <div className="font-semibold text-gray-900 text-right">Amount</div>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-1">
                {billData.doctors.map((doctor, index) => (
                  <div key={index} className={`grid grid-cols-3 gap-4 py-2 px-3 rounded-md hover:bg-gray-50 transition-colors duration-150 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                  }`}>
                    <div className="text-sm text-gray-800 font-medium">
                      {doctor.name}
                    </div>
                    <div className="text-sm text-gray-700 text-center">
                      {doctor.count}
                    </div>
                    <div className="text-sm text-gray-800 text-right font-medium">
                      ₹{doctor.amount.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="grid grid-cols-3 gap-4 font-bold text-gray-900 bg-gradient-to-r from-gray-100 to-gray-200 py-3 px-4 rounded-lg border border-gray-200">
                  <div className="text-gray-900">Total</div>
                  <div className="text-center text-gray-900 font-bold">{doctorsCount}</div>
                  <div className="text-right text-gray-900 text-lg font-bold">₹{doctorsTotal.toFixed(1)}</div>
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
