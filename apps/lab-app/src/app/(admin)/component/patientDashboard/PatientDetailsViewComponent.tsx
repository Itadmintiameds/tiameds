'use client';
import { doctorGetById } from '@/../services/doctorServices';
import { getHealthPackageById } from '@/../services/packageServices';
import { getTestById } from '@/../services/testService';
import { useLabs } from '@/context/LabContext';
import { Doctor } from '@/types/doctor/doctor';
import { Packages } from '@/types/package/package';
import { TestList } from '@/types/test/testlist';
import { Button } from '@headlessui/react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React, { useEffect, useRef, useState } from 'react';
import { FaFilePdf, FaPrint, FaRupeeSign, FaFileInvoiceDollar } from 'react-icons/fa';

const A4_WIDTH = 210; // mm
const A4_HEIGHT = 297; // mm

const PatientDetailsViewComponent = () => {
  const { currentLab, patientDetails } = useLabs();
  const [tests, setTests] = useState<TestList[]>([]);
  const [doctor, setDoctor] = useState<Doctor>();
  const [healthPackage, setHealthPackage] = useState<Packages[]>();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tests
        if (patientDetails?.visit?.testIds?.length && currentLab?.id) {
          const testPromises = patientDetails.visit.testIds.map((id) =>
            id !== undefined ? getTestById(currentLab.id.toString(), id) : Promise.resolve(null)
          );
          const testResults = await Promise.all(testPromises);
          setTests(testResults.filter((test) => test !== null) as TestList[]);
        }

        // Fetch doctor
        if (patientDetails?.visit?.doctorId && currentLab?.id) {
          const doctorResult = await doctorGetById(currentLab.id.toString(), patientDetails.visit.doctorId);
          setDoctor(doctorResult.data);
        }

        // Fetch health packages
        if (patientDetails?.visit?.packageIds?.length && currentLab?.id) {
          const healthPackagePromises = patientDetails.visit.packageIds.map((id) =>
            id !== undefined ? getHealthPackageById(currentLab.id, id) : Promise.resolve(null)
          );
          const healthPackageResults = await Promise.all(healthPackagePromises);
          const healthPackageData = healthPackageResults
            .filter((healthPackage) => healthPackage !== null)
            .map((healthPackage) => healthPackage.data);
          setHealthPackage(healthPackageData as Packages[]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [patientDetails, currentLab]);

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 'N/A';
    const birthDate = new Date(dateOfBirth);
    const currentDate = new Date();
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    if (
      currentDate.getMonth() < birthDate.getMonth() ||
      (currentDate.getMonth() === birthDate.getMonth() && currentDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const calculateTotal = () => {
    let total = 0;
    tests.forEach(test => total += test.price);
    healthPackage?.forEach(pkg => total += (pkg.price - pkg.discount));
    return total;
  };

  const handlePrint = async () => {
    if (!invoiceRef.current) return;

    setIsGeneratingPDF(true);
    try {
      // Create a clone of the invoice element for printing
      const printElement = invoiceRef.current.cloneNode(true) as HTMLDivElement;
      printElement.style.position = 'absolute';
      printElement.style.left = '-9999px';
      document.body.appendChild(printElement);

      const canvas = await html2canvas(printElement, {
        logging: false,
        useCORS: true,
        allowTaint: true
      });

      document.body.removeChild(printElement);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Calculate dimensions to fit the page
      const imgWidth = A4_WIDTH - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      
      // Open PDF in new tab for printing
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    
    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const scale = 2; // Higher quality

      const canvas = await html2canvas(invoiceRef.current, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        background: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = A4_WIDTH;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Add watermark
      pdf.setFontSize(60);
      pdf.setTextColor(200, 200, 200);
      pdf.text(currentLab?.name || 'LAB', 105, 150, { angle: 45, align: 'center' });
      
      pdf.save(`invoice_${patientDetails?.firstName}_${patientDetails?.lastName}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-4 print:hidden">
        <div className="text-sm text-gray-600">
          <FaFileInvoiceDollar className="inline mr-2" />
          Invoice for visit #{patientDetails?.visit?.visitId || 'N/A'}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            disabled={isGeneratingPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
          >
            <FaPrint className="mr-2" />
            {isGeneratingPDF ? 'Generating...' : 'Print Invoice'}
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
          >
            <FaFilePdf className="mr-2" />
            {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Invoice Container */}
      <div
        ref={invoiceRef}
        className="bg-white p-8 border border-gray-200 rounded-lg mb-6 shadow-sm"
        style={{
          width: '210mm',
          minHeight: '297mm',
        }}
      >
        {/* Watermark Background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="h-full w-full bg-[url('/tiamed1.svg')] bg-center bg-no-repeat bg-contain"></div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start border-b border-blue-100 pb-6 mb-6">
          <div className="flex items-center">
            <img src="/tiamed1.svg" alt="Lab Logo" className="h-14 mr-4" />
            <div>
              <h1 className="text-2xl font-bold text-blue-800">{currentLab?.name || 'DIAGNOSTIC LABORATORY'}</h1>
              <p className="text-xs text-gray-600 mt-1">Accredited by NABL | ISO 15189:2012 Certified</p>
            </div>
          </div>
          <div className="text-right bg-blue-50 p-3 rounded-lg">
            <h2 className="text-lg font-bold text-blue-800 mb-1">INVOICE</h2>
            <p className="text-xs font-medium text-blue-700">Invoice #: <span className="font-bold">{patientDetails?.visit?.billing?.billingId || 'N/A'}</span></p>
            <p className="text-xs font-medium text-blue-700">Date: <span className="font-bold">{new Date().toLocaleDateString()}</span></p>
          </div>
        </div>

        {/* Patient Info */}
        <div className="grid grid-cols-4 gap-4 mb-8 bg-blue-50 p-4 rounded-lg">
          <div>
            <p className="text-sm font-medium text-blue-800">Patient Name</p>
            <p className="text-lg font-semibold text-gray-900">{patientDetails?.firstName} {patientDetails?.lastName}</p>
            <p className="text-xs text-gray-600">{patientDetails?.phone || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800">Age/Gender</p>
            <p className="text-lg font-semibold text-gray-900">
              {calculateAge(patientDetails?.dateOfBirth || '')} / {patientDetails?.gender || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800">Referred By</p>
            <p className="text-lg font-semibold text-gray-900">{doctor?.name || 'N/A'}</p>
            <p className="text-xs text-gray-600">{doctor?.phone || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800">Visit Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {patientDetails?.visit?.visitDate ? new Date(patientDetails.visit.visitDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Test Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-blue-800 mb-2">TESTS & PACKAGES DETAILS</h2>
          <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-100 rounded-full"></div>
        </div>

        {/* Test Results Table */}
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="text-left p-3 font-medium">Test/Package Name</th>
              <th className="text-left p-3 font-medium">Category</th>
              <th className="text-left p-3 font-medium">Price (₹)</th>
              <th className="text-left p-3 font-medium">Discount (₹)</th>
              <th className="text-left p-3 font-medium">Net Price (₹)</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((test, idx) => (
              <tr key={`test-${idx}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                <td className="p-3 border-b border-gray-100 font-medium">{test.name}</td>
                <td className="p-3 border-b border-gray-100">{test.category || 'General'}</td>
                <td className="p-3 border-b border-gray-100 font-bold">{test.price.toFixed(2)}</td>
                <td className="p-3 border-b border-gray-100 text-red-600">0.00</td>
                <td className="p-3 border-b border-gray-100 font-bold">{test.price.toFixed(2)}</td>
              </tr>
            ))}
            {healthPackage?.map((pkg, idx) => (
              <React.Fragment key={`pkg-${idx}`}>
                <tr className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                  <td className="p-3 border-b border-gray-100 font-medium">{pkg.packageName}</td>
                  <td className="p-3 border-b border-gray-100">Package</td>
                  <td className="p-3 border-b border-gray-100 font-bold">{pkg.price.toFixed(2)}</td>
                  <td className="p-3 border-b border-gray-100 text-red-600">-{pkg.discount.toFixed(2)}</td>
                  <td className="p-3 border-b border-gray-100 font-bold text-green-600">{(pkg.price - pkg.discount).toFixed(2)}</td>
                </tr>
                {pkg.tests?.length > 0 && (
                  <tr className="bg-gray-50">
                    <td colSpan={5} className="p-3 border-b border-gray-100">
                      <div className="pl-4">
                        <p className="text-xs font-medium mb-1 text-gray-600">Includes:</p>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          {pkg.tests.map((test, testIdx) => (
                            <div key={testIdx} className="flex justify-between bg-white p-1 px-2 rounded border border-gray-100">
                              <span className="text-gray-700">{test.name}</span>
                              <span className="text-gray-800 font-medium">₹{test.price.toFixed(2)}</span>
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

        {/* Payment Summary */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-bold text-yellow-800 mb-4 text-lg">PAYMENT SUMMARY</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-700">Tests Subtotal:</span>
                <span className="text-gray-800">₹{tests.reduce((sum, test) => sum + test.price, 0).toFixed(2)}</span>
              </div>
              {(healthPackage ?? []).length > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-700">Packages Subtotal:</span>
                  <span className="text-gray-800">
                    ₹{healthPackage?.reduce((sum, pkg) => sum + (pkg.price - pkg.discount), 0).toFixed(2) || '0.00'}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-yellow-200 mt-2">
                <span className="text-gray-700 font-medium">Total Before Discount:</span>
                <span className="text-gray-800 font-medium">₹{calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-700">Additional Discount:</span>
                <span className="text-red-600">-₹{patientDetails?.visit?.billing?.discount || '0.00'}</span>
              </div>
              <div className="flex justify-between py-3 text-lg font-bold mt-2 border-t border-yellow-200 pt-2">
                <span className="text-gray-800">Net Amount Payable:</span>
                <span className="text-blue-600 flex items-center">
                  <FaRupeeSign className="mr-1" />
                  {patientDetails?.visit?.billing?.netAmount || calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-700">Payment Status:</span>
                <span className={`font-medium ${
                  String(patientDetails?.visit?.billing?.paymentStatus) === 'Paid' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {patientDetails?.visit?.billing?.paymentStatus || 'Pending'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-700">Payment Method:</span>
                <span className="text-gray-800">{patientDetails?.visit?.billing?.paymentMethod || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-700">Payment Date:</span>
                <span className="text-gray-800">
                  {patientDetails?.visit?.billing?.paymentDate 
                    ? new Date(patientDetails.visit.billing.paymentDate).toLocaleDateString() 
                    : 'N/A'}
                </span>
              </div>
              <div className="mt-4 p-2 bg-blue-50 rounded border border-blue-100">
                <p className="text-xs text-blue-800">
                  <span className="font-bold">Note:</span> Please bring this invoice for any future reference or claims.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">This is an electronically generated invoice. No physical signature required.</p>
            <p className="text-xs text-gray-600">
              For queries: help@{currentLab?.name?.toLowerCase()?.replace(/\s+/g, '') || 'lab'}.com | 
              {/* {currentLab?.createdByName ? ` +91 ${currentLab.city}` : ' +91 XXXXXXXX'} |  */}
              {currentLab?.createdByName ? ` +91 ${currentLab.address}` : ' +91 XXXXXXXX'} | 
              www.{currentLab?.name?.toLowerCase()?.replace(/\s+/g, '') || 'lab'}.com
            </p>
            <p className="text-sm font-medium text-blue-600 mt-2">Thank you for choosing {currentLab?.name || 'OUR LAB SERVICES'}</p>
          </div>
        </div>

        {/* Powered by */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center">
            <img src="/tiamed1.svg" alt="Tiamed Logo" className="h-6 mr-2 opacity-80" />
            <span className="text-xs font-medium text-gray-600">Powered by Tiameds Technology</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Generated on: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientDetailsViewComponent;