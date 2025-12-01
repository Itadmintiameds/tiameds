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
import { FaFileInvoiceDollar, FaFilePdf, FaPrint,  FaSignature } from 'react-icons/fa';
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
    const remainingDue = Number(patient?.visit?.billing?.due_amount || 0);

    return (
      <div className="mt-4 pt-2 border-t border-gray-600 print:mt-3 print:pt-1.5">
        <h3 className="font-bold text-black mb-1.5 text-xs print:mb-1 border-b border-gray-600 pb-0.5 uppercase">Payment Transactions</h3>
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-xs border-collapse border border-gray-600 print:table-fixed print:w-full">
            <thead>
              <tr className="bg-white">
                <th className="p-1.5 font-semibold text-left border border-gray-600 text-black">Txn Code</th>
                <th className="p-1.5 font-semibold text-left border border-gray-600 text-black">Method</th>
                <th className="p-1.5 font-semibold text-right border border-gray-600 text-black">UPI</th>
                <th className="p-1.5 font-semibold text-right border border-gray-600 text-black">Card</th>
                <th className="p-1.5 font-semibold text-right border border-gray-600 text-black">Cash</th>
                <th className="p-1.5 font-semibold text-right border border-gray-600 text-black">Received</th>
                <th className="p-1.5 font-semibold text-right border border-gray-600 text-black">Due</th>
                <th className="p-1.5 font-semibold text-left border border-gray-600 text-black">Date/Time</th>
                <th className="p-1.5 font-semibold text-left border border-gray-600 text-black">By</th>
                <th className="p-1.5 font-semibold text-left border border-gray-600 text-black">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {[...transactions]
                .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
                .map((txn: BillingTransaction, idx: number) => {
                  return (
                    <tr
                      key={`txn-${idx}`}
                      className="bg-white"
                    >
                      <td className="p-1.5 border border-gray-400 align-top text-black leading-tight">
                        {txn.transactionCode || txn.id || '-'}
                      </td>
                      <td className="p-1.5 border border-gray-400 font-medium align-top text-black leading-tight">
                        {formatPaymentMethod(txn.payment_method)}
                      </td>
                      <td className="p-1.5 border border-gray-400 align-top text-right text-black leading-tight">
                        {Number(txn.upi_amount ?? 0) > 0 ? `₹${Number(txn.upi_amount ?? 0).toFixed(2)}` : '-'}
                      </td>
                      <td className="p-1.5 border border-gray-400 align-top text-right text-black leading-tight">
                        {Number(txn.card_amount ?? 0) > 0 ? `₹${Number(txn.card_amount ?? 0).toFixed(2)}` : '-'}
                      </td>
                      <td className="p-1.5 border border-gray-400 align-top text-right text-black leading-tight">
                        {Number(txn.cash_amount ?? 0) > 0 ? `₹${Number(txn.cash_amount ?? 0).toFixed(2)}` : '-'}
                      </td>
                      <td className="p-1.5 border border-gray-400 font-bold align-top text-right text-black leading-tight">
                        ₹{Number(txn.received_amount || 0).toFixed(2)}
                      </td>
                      <td className="p-1.5 border border-gray-400 align-top text-right text-black leading-tight">
                        {Number(txn.due_amount ?? 0) > 0 ? `₹${Number(txn.due_amount ?? 0).toFixed(2)}` : '-'}
                      </td>
                      <td className="p-1.5 border border-gray-400 whitespace-nowrap align-top text-black leading-tight text-xs">
                        {formatDateTime(txn.created_at || '')}
                      </td>
                      <td className="p-1.5 border border-gray-400 align-top text-black leading-tight">
                        {txn.createdBy || '-'}
                      </td>
                      <td className="p-1.5 border border-gray-400 align-top text-black leading-tight">
                        {txn.remarks || '-'}
                      </td>
                    </tr>
                  );
                })}
            </tbody>

            {!transaction && (
              <tfoot>
                <tr className="bg-white font-semibold">
                  <td colSpan={2} className="p-1.5 border border-gray-600 align-top text-black">Total:</td>
                  <td className="p-1.5 border border-gray-600 align-top text-right text-black">
                    ₹{transactions
                      .reduce((sum: number, txn: BillingTransaction) => sum + Number(txn.upi_amount || 0), 0)
                      .toFixed(2)}
                  </td>
                  <td className="p-1.5 border border-gray-600 align-top text-right text-black">
                    ₹{transactions
                      .reduce((sum: number, txn: BillingTransaction) => sum + Number(txn.card_amount || 0), 0)
                      .toFixed(2)}
                  </td>
                  <td className="p-1.5 border border-gray-600 align-top text-right text-black">
                    ₹{transactions
                      .reduce((sum: number, txn: BillingTransaction) => sum + Number(txn.cash_amount || 0), 0)
                      .toFixed(2)}
                  </td>
                  <td className="p-1.5 border border-gray-600 font-bold align-top text-right text-black">
                    ₹{totalReceived.toFixed(2)}
                  </td>
                  <td className="p-1.5 border border-gray-600 font-bold align-top text-right text-black">
                    ₹{remainingDue.toFixed(2)}
                  </td>
                  <td className="p-1.5 border border-gray-600 align-top"></td>
                  <td className="p-1.5 border border-gray-600 align-top"></td>
                  <td className="p-1.5 border border-gray-600 align-top"></td>
                </tr>
                <tr className="bg-white font-bold">
                  <td colSpan={9} className="p-1.5 border border-gray-600 align-top text-right text-black">Net Amount:</td>
                  <td className="p-1.5 border border-gray-600 font-bold align-top text-right text-black" colSpan={1}>
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

  const formatInvoiceDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const renderInvoicePage = (pageTests: TestList[], pageNumber: number, totalPages: number, transaction?: BillingTransaction, hideButtons: boolean = false) => {
    // Get invoice date/time from API - use billing createdAt or updatedAt or paymentDate
    const billing = patient?.visit?.billing;
    const invoiceDateTime = billing?.createdAt 
      ? formatInvoiceDateTime(billing.createdAt)
      : (billing?.updatedAt 
        ? formatInvoiceDateTime(billing.updatedAt)
        : (billing?.paymentDate
          ? formatInvoiceDateTime(billing.paymentDate)
          : formatInvoiceDateTime(new Date().toISOString())));

    return (
      <div
        key={`page-${pageNumber}${transaction ? `-txn-${transaction.id}` : ''}`}
        className="bg-white p-5 mb-6 font-sans"
        style={{
          width: '210mm',
          minHeight: '297mm',
          pageBreakAfter: pageNumber < totalPages ? 'always' : 'auto'
        }}
      >
        {/* Header Section - Compact */}
        <div className="flex justify-between items-start mb-4 border-b border-gray-600 pb-2">
          <div className="flex items-center gap-3">
            <div>
              <Image src="/CUREPLUS HOSPITALS (1).png"
                alt="Lab Logo" width={70} height={44}
                className="h-11 w-auto" priority loading="eager"
                unoptimized crossOrigin="anonymous" data-print-logo="true"
                quality={100}
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-black uppercase tracking-tight leading-tight">{currentLab?.name || 'DIAGNOSTIC CENTER'}</h1>
              <p className="text-xs text-black leading-tight">{currentLab?.address || ''}</p>
            </div>
          </div>
          <div className="text-right border border-gray-600 px-3 py-1.5 bg-white">
            <p className="text-xs font-bold text-black mb-0.5">INVOICE</p>
            <p className="text-xs text-black leading-tight"><span className="font-semibold">No:</span> {patient?.visit?.billing?.billingCode || patient?.visit?.billing?.billingId || 'N/A'}</p>
            <p className="text-xs text-black leading-tight"><span className="font-semibold">Date:</span> {invoiceDateTime}</p>
          </div>
        </div>
        
        {/* Patient & Visit Info Section - Ultra Compact */}
        <div className="mb-4 border border-gray-600 p-2">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <p className="font-semibold text-black mb-1 border-b border-gray-400 pb-0.5">Patient</p>
              <p className="text-black leading-tight"><span className="font-medium">Name:</span> {patient?.firstName || ''} {patient?.lastName || ''}</p>
              <p className="text-black leading-tight"><span className="font-medium">Age/Sex:</span> {calculateAge(patient?.dateOfBirth || '').split(' ')[0]} yrs / {patient?.gender || 'N/A'}</p>
              <p className="text-black leading-tight"><span className="font-medium">Contact:</span> {patient?.phone || 'N/A'}</p>
              <p className="text-black leading-tight"><span className="font-medium">Code:</span> {patient?.patientCode || 'N/A'}</p>
            </div>
            <div>
              <p className="font-semibold text-black mb-1 border-b border-gray-400 pb-0.5">Visit</p>
              <p className="text-black leading-tight"><span className="font-medium">Date:</span> {patient?.visit?.visitDate ? new Date(patient.visit.visitDate).toLocaleDateString('en-IN') : 'N/A'}</p>
              <p className="text-black leading-tight"><span className="font-medium">Code:</span> {patient?.visit?.visitCode || 'N/A'}</p>
              <p className="text-black leading-tight"><span className="font-medium">ID:</span> {patient?.visit?.visitId || 'N/A'}</p>
              <p className="text-black leading-tight"><span className="font-medium">Billing:</span> {patient?.visit?.billing?.billingCode || 'N/A'}</p>
            </div>
            <div>
              <p className="font-semibold text-black mb-1 border-b border-gray-400 pb-0.5">Reference</p>
              <p className="text-black leading-tight"><span className="font-medium">Referred By:</span> {doctor?.name || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Tests Table - Compact */}
        <div className="mb-4">
          <h2 className="text-xs font-bold mb-1.5 border-b border-gray-600 pb-0.5 text-black uppercase">Tests Conducted</h2>
          <table className="w-full border-collapse border border-gray-600 text-xs">
            <thead>
              <tr className="bg-white">
                <th className="text-left p-1.5 font-semibold border border-gray-600 text-black">Test Name</th>
                <th className="text-left p-1.5 font-semibold border border-gray-600 text-black">Category</th>
                <th className="text-right p-1.5 font-semibold border border-gray-600 text-black">Price</th>
                <th className="text-right p-1.5 font-semibold border border-gray-600 text-black">Discount</th>
                <th className="text-right p-1.5 font-semibold border border-gray-600 text-black">Amount</th>
              </tr>
            </thead>
            <tbody>
              {pageTests.map((test, idx) => {
                const discountInfo = getTestDiscount(test.id);
                const hasDiscount = discountInfo.discountAmount > 0;
                return (
                  <tr key={`test-${idx}`} className="bg-white">
                    <td className="p-1.5 border border-gray-400 text-black leading-tight">{test.name}</td>
                    <td className="p-1.5 border border-gray-400 text-black leading-tight">{test.category || 'General'}</td>
                    <td className="p-1.5 text-right border border-gray-400 text-black leading-tight">₹{test.price.toFixed(2)}</td>
                    <td className="p-1.5 text-right border border-gray-400 text-black leading-tight">
                      {hasDiscount ? `-₹${discountInfo.discountAmount.toFixed(2)}` : '₹0.00'}
                    </td>
                    <td className="p-1.5 text-right border border-gray-400 font-semibold text-black leading-tight">
                      ₹{hasDiscount ? discountInfo.finalPrice.toFixed(2) : test.price.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Packages Section (only on last page) - Compact */}
        {pageNumber === totalPages && healthPackage && healthPackage.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xs font-bold mb-1.5 border-b border-gray-600 pb-0.5 text-black uppercase">Health Packages</h2>
            <table className="w-full border-collapse border border-gray-600 text-xs">
              <thead>
                <tr className="bg-white">
                  <th className="text-left p-1.5 font-semibold border border-gray-600 text-black">Package Name</th>
                  <th className="text-right p-1.5 font-semibold border border-gray-600 text-black">Price</th>
                  <th className="text-right p-1.5 font-semibold border border-gray-600 text-black">Discount</th>
                  <th className="text-right p-1.5 font-semibold border border-gray-600 text-black">Amount</th>
                </tr>
              </thead>
              <tbody>
                {healthPackage.map((pkg, idx) => (
                  <React.Fragment key={`pkg-${idx}`}>
                    <tr className="bg-white">
                      <td className="p-1.5 border border-gray-400 text-black leading-tight">{pkg.packageName}</td>
                      <td className="p-1.5 text-right border border-gray-400 text-black leading-tight">₹{pkg.price.toFixed(2)}</td>
                      <td className="p-1.5 text-right border border-gray-400 text-black leading-tight">-₹{pkg.discount.toFixed(2)}</td>
                      <td className="p-1.5 text-right border border-gray-400 font-semibold text-black leading-tight">₹{(pkg.price - pkg.discount).toFixed(2)}</td>
                    </tr>
                    {pkg.tests && pkg.tests.length > 0 && (
                      <tr className="bg-white">
                        <td colSpan={4} className="p-1.5 border border-gray-400">
                          <div className="pl-1">
                            <p className="text-xs font-semibold mb-0.5 text-black">Includes:</p>
                            <div className="grid grid-cols-3 gap-0.5">
                              {pkg.tests.map((test, testIdx) => (
                                <div key={testIdx} className="text-xs bg-white p-0.5 border border-gray-300 text-black leading-tight">
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
          const summaryTxn = transaction ? transaction : undefined;
          const totalDue = summaryTxn
            ? Math.max(0, Number(summaryTxn.due_amount || 0))
            : Number(patient?.visit?.billing?.due_amount || 0);
          const dueAmount = Number(patient?.visit?.billing?.due_amount || 0);
          const isPaid = dueAmount === 0;

          return (
            <div className="border-t border-gray-600 pt-2">
              <h2 className="text-xs font-bold mb-1.5 border-b border-gray-600 pb-0.5 text-black uppercase">Payment Summary</h2>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-400">
                  <span className="font-semibold text-black">Tests Total:</span>
                  <span className="text-black">₹{tests.reduce((sum, test) => sum + (getTestDiscount(test.id).finalPrice || test.price), 0).toFixed(2)}</span>
                </div>
                {healthPackage && healthPackage.length > 0 && (
                  <div className="flex justify-between py-1 border-b border-gray-400">
                    <span className="font-semibold text-black">Packages Total:</span>
                    <span className="text-black">₹{healthPackage.reduce((sum, pkg) => sum + (pkg.price - pkg.discount), 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-gray-400 font-bold">
                  <span className="text-black">Subtotal:</span>
                  <span className="text-black">₹{calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-400">
                  <span className="text-black">Discount:</span>
                  <span className="text-black">-₹{Number(patient?.visit?.billing?.discount || 0).toFixed(2)}</span>
                </div>
                <div className="col-span-2 flex justify-between py-2 font-bold bg-white border border-gray-600 text-black px-2 mt-1">
                  <span>TOTAL AMOUNT:</span>
                  <span>
                    ₹{Number(patient?.visit?.billing?.netAmount || calculateTotal()).toFixed(2)}
                    {totalDue > 0 && (
                      <span className="ml-2 text-xs">(Due: ₹{totalDue.toFixed(2)})</span>
                    )}
                  </span>
                </div>
                <div className="col-span-2 grid grid-cols-3 gap-2 mt-1.5 pt-1.5 border-t border-gray-400 text-xs">
                  <div>
                    <span className="font-semibold text-black">Status:</span>
                    <span className="ml-1 text-black font-bold">{isPaid ? 'PAID' : (patient?.visit?.billing?.paymentStatus || 'DUE')}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-black">Method:</span>
                    <span className="ml-1 text-black">{formatPaymentMethod(summaryTxn ? summaryTxn.payment_method : (patient?.visit?.billing?.paymentMethod || 'N/A'))}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-black">Date:</span>
                    <span className="ml-1 text-black">
                      {summaryTxn
                        ? (summaryTxn.created_at ? formatInvoiceDateTime(summaryTxn.created_at) : (summaryTxn.payment_date || 'N/A'))
                        : (patient?.visit?.billing?.paymentDate
                          ? formatInvoiceDateTime(patient.visit.billing.paymentDate)
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
        {printMode === 'per-transaction' && transaction && pageNumber === totalPages && renderTransactionTable(transaction)}

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

        {/* Footer - Compact */}
        <div className="mt-4 pt-2 border-t border-gray-600 text-center text-xs">
          <p className="text-black mb-1 leading-tight">This is an electronically generated invoice. No signature required.</p>
          <p className="text-black mb-2 leading-tight">For queries, contact: {currentLab?.name || 'N/A'}</p>
          <div className="mt-2 flex justify-between items-center border-t border-gray-400 pt-1.5">
            <div className="flex items-center gap-1">
              <FaSignature className="text-black text-xs" />
              <span className="text-black font-semibold text-xs">Authorized Signatory</span>
            </div>
            <p className="text-black text-xs"><span className="font-semibold">Generated:</span> {invoiceDateTime}</p>
          </div>
          <div className="mt-2 flex justify-center items-center pt-1.5 border-t border-gray-400">
            <Image src="/tiamed1.svg" alt="TiaMeds Logo" width={14} height={14} className="h-3.5 mr-1.5" style={{ filter: 'grayscale(100%)' }} />
            <span className="text-xs font-medium text-black">Powered by TiaMeds Technologies Pvt.Ltd</span>
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
          <div className="text-sm text-black flex items-center gap-2">
            <FaFileInvoiceDollar />
            <span>Invoice for Visit Code: {patient?.visit?.visitCode || patient?.visit?.visitId || 'N/A'}</span>
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
          <div className="mb-4 p-2 bg-black text-white rounded text-sm print:hidden">
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





