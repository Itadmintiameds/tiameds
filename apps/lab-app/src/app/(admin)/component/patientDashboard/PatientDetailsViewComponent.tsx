'use client';
import { doctorGetById } from '@/../services/doctorServices';
import { getHealthPackageById } from '@/../services/packageServices';
import { getTestById } from '@/../services/testService';
import { useLabs } from '@/context/LabContext';
import { Doctor } from '@/types/doctor/doctor';
import { Packages } from '@/types/package/package';
import { TestList } from '@/types/test/testlist';
import { Patient, BillingTransaction } from '@/types/patient/patient';
import { calculateAge } from '@/utils/ageUtils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { FaFileInvoiceDollar, FaFilePdf, FaPrint, FaUser, FaCalendarAlt, FaHospital, FaSignature } from 'react-icons/fa';
import Loader from '../common/Loader';
import { MdDownloading } from "react-icons/md";
import Image from 'next/image';

const A4_WIDTH = 210; // mm
const TESTS_PER_PAGE = 10;

type PatientWithVisit = Patient;

const PatientDetailsViewComponent = ({ patient }: { patient: PatientWithVisit }) => {
  const { currentLab } = useLabs();
  const [tests, setTests] = useState<TestList[]>([]);
  const [doctor, setDoctor] = useState<Doctor>();
  const [healthPackage, setHealthPackage] = useState<Packages[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [printMode, setPrintMode] = useState<'all' | 'per-transaction' | 'no-transaction'>('no-transaction');
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch tests
        if (patient?.visit?.testIds?.length && currentLab?.id) {
          const testPromises = patient.visit.testIds.map((id: number) =>
            id !== undefined ? getTestById(currentLab.id.toString(), id) : Promise.resolve(null)
          );
          const testResults = await Promise.all(testPromises);
          setTests(testResults.filter((test) => test !== null) as TestList[]);
        }

        // Fetch doctor
        if (patient?.visit?.doctorId && currentLab?.id) {
          const doctorResult = await doctorGetById(currentLab.id.toString(), Number(patient.visit.doctorId));
          setDoctor(doctorResult.data);
        }

        // Fetch health packages
        if (patient?.visit?.packageIds?.length && currentLab?.id) {
          const healthPackagePromises = patient.visit.packageIds.map((id: number) =>
            id !== undefined ? getHealthPackageById(currentLab.id, id) : Promise.resolve(null)
          );
          const healthPackageResults = await Promise.all(healthPackagePromises);
          const validPackages = healthPackageResults
            .filter((pkg) => pkg !== null && pkg.data !== null)
            .map((pkg) => pkg.data);
          setHealthPackage(validPackages as Packages[]);
        } else {
          setHealthPackage([]);
        }
      } catch (error) {
        // Handle data fetch error
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [patient, currentLab]);



  const getTestDiscount = (testId: number) => {
    if (!patient?.visit?.listofeachtestdiscount) return { discountAmount: 0, finalPrice: 0 };
    const discountInfo = patient.visit.listofeachtestdiscount.find((item: { id: number; discountAmount: number; finalPrice: number }) => item.id === testId);
    return discountInfo || { discountAmount: 0, finalPrice: 0 };
  };

  const calculateTotal = () => {
    let total = 0;
    tests.forEach(test => {
      const discountInfo = getTestDiscount(test.id);
      total += discountInfo.finalPrice || test.price;
    });
    healthPackage?.forEach(pkg => total += (pkg.price - pkg.discount));
    return total;
  };

  const generateInvoicePages = () => {
    if (!invoiceRef.current) return [];

    const testChunks = [];
    for (let i = 0; i < tests.length; i += TESTS_PER_PAGE) {
      testChunks.push(tests.slice(i, i + TESTS_PER_PAGE));
    }

    if (testChunks.length === 0) testChunks.push([]);

    return testChunks;
  };

  const formatPaymentMethod = (method: string) => {
    if (!method) return 'N/A';
    return method.split('+').map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(' + ');
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderTransactionTable = (transaction?: BillingTransaction) => {
    const transactions: BillingTransaction[] = transaction ? [transaction] : (patient?.visit?.billing?.transactions || []);
    if (transactions.length === 0) return null;

    // Use API's due_amount instead of calculating on frontend
    const totalReceived = transactions.reduce((sum: number, txn: BillingTransaction) => sum + Number(txn.received_amount || 0), 0);
    // const totalRefund = transactions.reduce((sum: number, txn: BillingTransaction) => sum + Number(txn.refund_amount || 0), 0);
    const remainingDue = Number(patient?.visit?.billing?.due_amount || 0);

    return (
      <div className="mt-6 pt-4 border-t border-gray-200 print:mt-4 print:pt-2">
        <h3 className="font-bold text-gray-800 mb-3 text-lg print:mb-2">PAYMENT TRANSACTIONS</h3>
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-xs border-collapse print:table-fixed print:w-full">
            <thead>
              <tr className="bg-gray-200 text-gray-800">
                <th className="p-1 font-medium text-left align-top">ID</th>
                <th className="p-1 font-medium text-left align-top">Method</th>
                <th className="p-1 font-medium text-left align-top">UPI</th>
                <th className="p-1 font-medium text-left align-top">Card</th>
                <th className="p-1 font-medium text-left align-top">Cash</th>
                <th className="p-1 font-medium text-left align-top">Received</th>
                {/* <th className="p-1 font-medium text-left align-top">Refund</th> */}
                <th className="p-1 font-medium text-left align-top">Due</th>
                <th className="p-1 font-medium text-left align-top">Date/Time</th>
                <th className="p-1 font-medium text-left align-top">Received by</th>
                <th className="p-1 font-medium text-left align-top">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {[...transactions]
                .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
                .map((txn: BillingTransaction, idx: number) => {
                  const isPaid = Number(txn.due_amount ?? 0) <= 0;
                  return (
                    <tr
                      key={`txn-${idx}`}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className="p-1 border-b border-gray-100 align-top">{txn.id}</td>
                      <td className="p-1 border-b border-gray-100 font-medium align-top">
                        {formatPaymentMethod(txn.payment_method)}
                      </td>
                      <td className="p-1 border-b border-gray-100 align-top">
                        {Number(txn.upi_amount ?? 0) > 0 ? `₹${Number(txn.upi_amount ?? 0)}` : '-'}
                      </td>
                      <td className="p-1 border-b border-gray-100 align-top">
                        {Number(txn.card_amount ?? 0) > 0 ? `₹${Number(txn.card_amount ?? 0)}` : '-'}
                      </td>
                      <td className="p-1 border-b border-gray-100 align-top">
                        {Number(txn.cash_amount ?? 0) > 0 ? `₹${Number(txn.cash_amount ?? 0)}` : '-'}
                      </td>
                      <td
                        className={`p-1 border-b border-gray-100 font-bold align-top ${isPaid ? 'text-green-600' : ''}`}
                      >
                        ₹{txn.received_amount}
                      </td>
                      {/* <td className="p-1 border-b border-gray-100 align-top">
                        {Number(txn.refund_amount ?? 0) > 0 ? (
                          <span className="text-red-600">-₹{Number(txn.refund_amount ?? 0).toFixed(2)}</span>
                        ) : (
                          <span>₹{Number(txn.refund_amount ?? 0).toFixed(2)}</span>
                        )}
                      </td> */}
                      <td
                        className={`p-1 border-b border-gray-100 align-top ${Number(txn.due_amount ?? 0) > 0 ? 'text-red-600' : ''}`}
                      >
                        {Number(txn.due_amount ?? 0) > 0 ? <span>₹{Number(txn.due_amount ?? 0)}</span> : '-'}
                      </td>
                      <td className="p-1 border-b border-gray-100 whitespace-nowrap align-top">
                        {formatDateTime(txn.created_at || '')}
                      </td>
                      <td className="p-1 border-b border-gray-100 align-top">
                        {txn.createdBy || '-'}
                      </td>
                      <td className="p-1 border-b border-gray-100 align-top">
                        {txn.remarks || '-'}
                      </td>
                    </tr>
                  );
                })}
            </tbody>

            {!transaction && (
              <tfoot>
                <tr className="bg-gray-50 font-medium">
                  {/* ID + Method columns combined for the label */}
                  <td colSpan={2} className="p-1 align-top">Total:</td>
                  {/* UPI total */}
                  <td className="p-1 align-top">
                    ₹{transactions
                      .reduce((sum: number, txn: BillingTransaction) => sum + Number(txn.upi_amount || 0), 0)
                      .toFixed(2)}
                  </td>
                  {/* Card total */}
                  <td className="p-1 align-top">
                    ₹{transactions
                      .reduce((sum: number, txn: BillingTransaction) => sum + Number(txn.card_amount || 0), 0)
                      .toFixed(2)}
                  </td>
                  {/* Cash total */}
                  <td className="p-1 align-top">
                    ₹{transactions
                      .reduce((sum: number, txn: BillingTransaction) => sum + Number(txn.cash_amount || 0), 0)
                      .toFixed(2)}
                  </td>
                  {/* Received total */}
                  <td className="p-1 text-green-600 font-bold align-top">
                    ₹{totalReceived.toFixed(2)}
                  </td>
                  {/* Refund total */}
                  {/* <td className={`p-1 font-bold align-top ${totalRefund > 0 ? 'text-red-600' : ''}`}>
                    {totalRefund > 0 ? `-₹${totalRefund.toFixed(2)}` : `₹${totalRefund.toFixed(2)}`}
                  </td> */}
                  {/* Remaining due (computed) */}
                  <td
                    className={`p-1 font-bold align-top ${remainingDue > 0 ? 'text-red-600' : ''}`}
                  >
                    ₹{remainingDue.toFixed(2)}
                  </td>
                  {/* Date/Time + Received by + Remarks empty for alignment */}
                  <td className="p-1 align-top"></td>
                  <td className="p-1 align-top"></td>
                  <td className="p-1 align-top"></td>
                </tr>
                <tr className="bg-gray-50 font-medium ">
                  <td colSpan={9} className="p-1 align-top text-right">Net Amount:</td>
                  <td className="p-1 text-blue-600 font-bold align-top" colSpan={2}>
                    ₹{Number(patient?.visit?.billing?.netAmount || 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    );
  };

  const renderInvoicePage = (pageTests: TestList[], pageNumber: number, totalPages: number, transaction?: BillingTransaction, hideButtons: boolean = false) => {

    return (
      <div
        key={`page-${pageNumber}${transaction ? `-txn-${transaction.id}` : ''}`}
        className="bg-white p-6 border border-gray-200 rounded-lg mb-6 font-sans"
        style={{
          width: '210mm',
          minHeight: '297mm',
          pageBreakAfter: pageNumber < totalPages ? 'always' : 'auto'
        }}
      >
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6 border-b pb-4">
          <div className="flex flex-col ">
            <div >
              <Image src="/CUREPLUS HOSPITALS (1).png"
                alt="Lab Logo" width={90} height={56}
                className="h-14 w-14 mr-4" priority loading="eager"
                unoptimized crossOrigin="anonymous" data-print-logo="true"
                quality={100}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{currentLab?.name}</h1>
              <p className="text-xs text-gray-600">{currentLab?.address}</p>
            </div>
          </div>
          <div className="text-right bg-blue-50 p-3 rounded">
            <p className="text-sm font-medium">Report No: <span className="font-bold">{patient?.visit?.billing?.billingId || 'N/A'}</span></p>
            <p className="text-sm font-medium">Date: <span className="font-normal">{new Date().toLocaleDateString()}</span></p>
            {transaction && (
              <p className="text-sm font-medium">Transaction ID: <span className="font-bold">{transaction.id}</span></p>
            )}
          </div>
        </div>
        

        {/* Patient Info Section */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FaUser className="text-blue-500" />
              PATIENT DETAILS
            </h2>
            <div className="pl-6 space-y-1">
              <p className="text-sm"><span className="font-medium">Name:</span> {patient?.firstName} {patient?.lastName}</p>
              <p className="text-sm"><span className="font-medium">Age/Sex:</span> {calculateAge(patient?.dateOfBirth || '').split(' ')[0]} yrs / {patient?.gender || 'N/A'}</p>
              <p className="text-sm"><span className="font-medium">Contact:</span> {patient?.phone || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FaHospital className="text-blue-500" />
              VISIT DETAILS
            </h2>
            <div className="pl-6 space-y-1">
              <p className="text-sm flex items-center gap-1">
                <FaCalendarAlt className="text-gray-500" />
                <span className="font-medium">Date:</span> {patient?.visit?.visitDate ? new Date(patient.visit.visitDate).toLocaleDateString() : 'N/A'}
              </p>
              <p className="text-sm"><span className="font-medium">Visit ID:</span> {patient?.visit?.visitId || 'N/A'}</p>
              <p className="text-sm"><span className="font-medium">Referred By:</span> {doctor?.name || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Tests Table */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3 border-b pb-2">TESTS CONDUCTED</h2>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-1 font-medium border">Test Name</th>
                <th className="text-left p-1 font-medium border">Category</th>
                <th className="text-right p-1 font-medium border">Price (₹)</th>
                <th className="text-right p-1 font-medium border">Discount (₹)</th>
                <th className="text-right p-1 font-medium border">Net Price (₹)</th>
              </tr>
            </thead>
            <tbody>
              {pageTests.map((test, idx) => {
                const discountInfo = getTestDiscount(test.id);
                const hasDiscount = discountInfo.discountAmount > 0;
                return (
                  <tr key={`test-${idx}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-1 border">{test.name}</td>
                    <td className="p-1 border">{test.category || 'General'}</td>
                    <td className="p-1 text-right border">{test.price.toFixed(2)}</td>
                    <td className={`p-1 text-right border ${hasDiscount ? 'text-red-600' : ''}`}>
                      {hasDiscount ? `-${discountInfo.discountAmount.toFixed(2)}` : '0.00'}
                    </td>
                    <td className="p-1 text-right border font-medium">
                      {hasDiscount ? discountInfo.finalPrice.toFixed(2) : test.price.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Packages Section (only on last page) */}
        {pageNumber === totalPages && healthPackage && healthPackage.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3 border-b pb-2">HEALTH PACKAGES</h2>
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-1 font-medium border">Package Name</th>
                  <th className="text-right p-1 font-medium border">Price (₹)</th>
                  <th className="text-right p-1 font-medium border">Discount (₹)</th>
                  <th className="text-right p-1 font-medium border">Net Price (₹)</th>
                </tr>
              </thead>
              <tbody>
                {healthPackage.map((pkg, idx) => (
                  <React.Fragment key={`pkg-${idx}`}>
                    <tr className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-1 border">{pkg.packageName}</td>
                      <td className="p-1 text-right border">{pkg.price.toFixed(2)}</td>
                      <td className="p-1 text-right border text-red-600">-{pkg.discount.toFixed(2)}</td>
                      <td className="p-1 text-right border font-medium text-green-600">{(pkg.price - pkg.discount).toFixed(2)}</td>
                    </tr>
                    {pkg.tests && pkg.tests.length > 0 && (
                      <tr className="bg-gray-50">
                        <td colSpan={4} className="p-1 border">
                          <div className="pl-2">
                            <p className="text-xs font-medium mb-1 text-gray-600">Includes:</p>
                            <div className="grid grid-cols-2 gap-1">
                              {pkg.tests.map((test, testIdx) => (
                                <div key={testIdx} className="text-xs bg-white p-1 rounded border border-gray-100">
                                  {test.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Payment Summary Section */}
        {pageNumber === totalPages && (() => {
          // For per-transaction pages, show summary based on that transaction.
          // Otherwise, show overall summary across all transactions.
          // const allTxns = patient?.visit?.billing?.transactions || [];
          // const netAmountVal = Number(patient?.visit?.billing?.netAmount || 0);
          const summaryTxn = transaction ? transaction : undefined;

          // const totalReceived = (summaryTxn ? [summaryTxn] : allTxns)
          //   .reduce((sum: number, txn: BillingTransaction) => sum + Number(txn.received_amount || 0), 0);
          // const totalRefund = (summaryTxn ? [summaryTxn] : allTxns)
          //   .reduce((sum: number, txn: BillingTransaction) => sum + Number(txn.refund_amount || 0), 0);

          const totalDue = summaryTxn
            ? Math.max(0, Number(summaryTxn.due_amount || 0))
            : Number(patient?.visit?.billing?.due_amount || 0);

          return (
            <div className="border-t pt-2">
              <h2 className="text-sm font-bold mb-2">PAYMENT SUMMARY</h2>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="font-medium">Tests Total:</span>
                  <span>₹{tests.reduce((sum, test) => sum + (getTestDiscount(test.id).finalPrice || test.price), 0).toFixed(2)}</span>
                </div>
                {healthPackage && healthPackage.length > 0 && (
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="font-medium">Packages Total:</span>
                    <span>₹{healthPackage.reduce((sum, pkg) => sum + (pkg.price - pkg.discount), 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-gray-200 font-bold">
                  <span>Subtotal:</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span>Additional Discount:</span>
                  <span className="text-red-600">-₹{patient?.visit?.billing?.discount || '0.00'}</span>
                </div>
                <div className="flex justify-between py-2 font-bold bg-gray-50 px-2 rounded">
                  <span>TOTAL AMOUNT:</span>
                  <span className="text-blue-600">
                    ₹{patient?.visit?.billing?.netAmount || calculateTotal().toFixed(2)}
                    {totalDue > 0 && (
                      <span className="text-red-600 ml-1">(Due: ₹{totalDue.toFixed(2)})</span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    {(() => {
                      if (summaryTxn) {
                        const isPaid = Number(summaryTxn.due_amount || 0) <= 0;
                        return (
                          <span className={isPaid ? 'text-green-600' : 'text-red-600'}>
                            {isPaid ? 'PAID' : 'DUE'}
                          </span>
                        );
                      }
                      // Use API's due_amount instead of calculating on frontend
                      const dueAmount = Number(patient?.visit?.billing?.due_amount || 0);
                      const isPaid = dueAmount === 0;
                      const label = isPaid ? 'PAID' : (patient?.visit?.billing?.paymentStatus || 'DUE');
                      return (
                        <span className={isPaid ? 'text-green-600' : 'text-red-600'}>
                          {label}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-medium">Method:</span>
                    <span>{formatPaymentMethod(summaryTxn ? summaryTxn.payment_method : (patient?.visit?.billing?.paymentMethod || 'N/A'))}</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <span className="font-medium">Date:</span>
                    <span>
                      {summaryTxn
                        ? (summaryTxn.created_at ? new Date(summaryTxn.created_at).toLocaleString() : (summaryTxn.payment_date || 'N/A'))
                        : (patient?.visit?.billing?.paymentDate
                          ? new Date(patient.visit.billing.paymentDate).toLocaleDateString()
                          : 'N/A')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Transactions Table */}
        {printMode === 'all' && pageNumber === totalPages && renderTransactionTable()}
        {printMode === 'per-transaction' && transaction && renderTransactionTable(transaction)}

        {/* Individual Transaction Action Buttons - Only for Per Transaction mode */}
        {!hideButtons && printMode === 'per-transaction' && transaction && (
          <div className="mt-6 pt-4 border-t border-gray-200 print:hidden">
            <div className="flex justify-end gap-2">
              <button
                onClick={() => generatePDF('print', transaction)}
                disabled={isGeneratingPDF || isLoading}
                className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50 text-xs"
              >
                {isGeneratingPDF ? (
                  <MdDownloading className="animate-spin" size={12} />
                ) : (
                  <FaPrint size={12} />
                )}
                {isGeneratingPDF ? 'Generating...' : 'Print'}
              </button>
              <button
                onClick={() => generatePDF('download', transaction)}
                disabled={isGeneratingPDF || isLoading}
                className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1 disabled:opacity-50 text-xs"
              >
                <FaFilePdf size={12} />
                PDF
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-center text-xs text-gray-600">
          <p>This is an electronically generated report. No signature required.</p>
          <p className="mt-1">For any queries, please contact: {currentLab?.name || 'N/A'}</p>
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center gap-1">
              <FaSignature className="text-gray-500" />
              <span>Authorized Signatory</span>
            </div>
            <p>Generated on: {new Date().toLocaleString()}</p>
          </div>
          <div className="mt-4 flex justify-center items-center">
            <Image src="/tiamed1.svg" alt="TiaMeds Logo" width={16} height={16} className="h-4 mr-2 opacity-80" />
            <span className="text-xs font-medium text-gray-600">Powered by TiaMeds Technologies Pvt.Ltd</span>
          </div>
        </div>
      </div>
    );
  };

  const generatePDF = async (action: 'print' | 'download', specificTransaction?: BillingTransaction) => {
    if (!invoiceRef.current) return;

    setIsGeneratingPDF(true);
    setError(null);

    try {
      const pages = generateInvoicePages();
      const transactions = patient?.visit?.billing?.transactions || [];
      const pdf = new jsPDF('p', 'mm', 'a4');

      const renderPages = () => {
        // If specific transaction is provided, generate only for that transaction
        if (specificTransaction) {
          return pages.map((pageTests, index) =>
            renderInvoicePage(pageTests, index + 1, pages.length, specificTransaction, true)
          );
        }

        if (printMode === 'per-transaction' && transactions.length > 0) {
          // Generate one invoice per transaction
          return transactions.flatMap((txn: BillingTransaction) => {
            return pages.map((pageTests, index) =>
              renderInvoicePage(pageTests, index + 1, pages.length, txn, true)
            );
          });
        } else if (printMode === 'no-transaction') {
          // Generate invoice without transactions
          return pages.map((pageTests, index) =>
            renderInvoicePage(pageTests, index + 1, pages.length, undefined, true)
          );
        } else {
          // Default: generate invoice with all transactions
          return pages.map((pageTests, index) =>
            renderInvoicePage(pageTests, index + 1, pages.length, undefined, true)
          );
        }
      };

      const pagesToRender = renderPages();

      for (let i = 0; i < pagesToRender.length; i++) {
        if (i > 0) pdf.addPage();

        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.width = '210mm';
        document.body.appendChild(tempDiv);

        await new Promise<void>((resolve) => {
          const root = createRoot(tempDiv);
          root.render(pagesToRender[i]);

          setTimeout(async () => {
            try {
              const canvas = await html2canvas(tempDiv.firstChild as HTMLElement, {
                logging: false,
                useCORS: true,
                allowTaint: true
              });

              const imgData = canvas.toDataURL('image/png');
              const imgWidth = A4_WIDTH - 20;
              const imgHeight = (canvas.height * imgWidth) / canvas.width;

              pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

              document.body.removeChild(tempDiv);
              resolve();
            } catch (err) {
              // Handle page generation error
              document.body.removeChild(tempDiv);
              resolve();
            }
          }, 500);
        });
      }

      if (action === 'print') {
        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const printWindow = window.open(pdfUrl);
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }
      } else {
        const transactionSuffix = specificTransaction ? `_txn_${specificTransaction.id}` : '';
        pdf.save(`invoice_${patient?.firstName}_${patient?.lastName || 'patient'}${transactionSuffix}.pdf`);
      }
    } catch (err) {
      // Handle PDF generation error
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = async () => {
    await generatePDF('print');
  };

  const handleDownloadPDF = async () => {
    await generatePDF('download');
  };

  const renderInvoicePreview = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader type="progress" fullScreen={false} text="Loading invoice data..." />
        </div>
      );
    }

    const pages = generateInvoicePages();
    const transactions = patient?.visit?.billing?.transactions || [];

    if (printMode === 'per-transaction' && transactions.length > 0) {
      return transactions.flatMap((txn: BillingTransaction) => {
        return pages.map((pageTests, index) =>
          renderInvoicePage(pageTests, index + 1, pages.length, txn)
        );
      });
    } else if (printMode === 'no-transaction') {
      return pages.map((pageTests, index) =>
        renderInvoicePage(pageTests, index + 1, pages.length)
      );
    } else {
      return pages.map((pageTests, index) =>
        renderInvoicePage(pageTests, index + 1, pages.length)
      );
    }
  };

  if (!currentLab || !patient) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader type="progress" fullScreen={false} text="Loading lab and patient data..." />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 print:hidden gap-4">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <FaFileInvoiceDollar />
            <span>Invoice for visit #{patient?.visit?.visitId || 'N/A'}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="flex gap-3 items-center">
              <label className="text-sm font-medium whitespace-nowrap">Print Mode:</label>
              <select
                value={printMode}
                onChange={(e) => setPrintMode(e.target.value as "all" | "per-transaction" | "no-transaction")}
                className="border rounded px-2 py-1 text-sm min-w-[150px]"
                disabled={isGeneratingPDF}
              >
                <option value="all">All Transactions</option>
                <option value="per-transaction">Per Transaction</option>
                <option value="no-transaction">No Transactions</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                disabled={isGeneratingPDF || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                {isGeneratingPDF ? (
                  <MdDownloading className="animate-spin" />
                ) : (
                  <FaPrint />
                )}
                {isGeneratingPDF ? 'Generating...' : 'Print'}
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF || isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              >
                <FaFilePdf />
                PDF
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {/* Invoice Container */}
        <div ref={invoiceRef}>
          {renderInvoicePreview()}
        </div>
      </div>
    </>
  );
};

export default PatientDetailsViewComponent;





