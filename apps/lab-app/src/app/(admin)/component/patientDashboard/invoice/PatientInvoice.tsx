'use client';
import { useLabs } from '@/context/LabContext';
import { Doctor } from '@/types/doctor/doctor';
import { Packages } from '@/types/package/package';
import { TestList } from '@/types/test/testlist';
import { PrinterIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { doctorGetById } from '@/../services/doctorServices';
import { getHealthPackageById } from '@/../services/packageServices';
import { getTestById } from '@/../services/testService';

interface PatientDetails {
  viewPatientDetails: {
    id: number;
    firstName: string;
    lastName: string;
    city: string;
    dateOfBirth: string;
    gender: string;
    visitDetailDto: {
      visitId: number;
      visitDate: string;
      visitType: string;
      visitStatus: string;
      doctorId: number | null;
      testIds: number[];
      packageIds: number[];
      bellingDetailsDto: {
        billingId: number;
        totalAmount: number;
        paymentStatus: string;
        paymentMethod: string;
        paymentDate: string;
        discount: number;
        netAmount: number;
        discountReason: string;
        discountPercentage: number;
      };
      listofeachtestdiscount: string[];
    };
  };
}

const PatientInvoice = ({ viewPatientDetails }: PatientDetails) => {
  const { currentLab } = useLabs();
  const [tests, setTests] = useState<TestList[]>([]);
  const [doctor, setDoctor] = useState<Doctor>();
  const [healthPackage, setHealthPackage] = useState<Packages[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tests
        if (viewPatientDetails?.visitDetailDto?.testIds?.length && currentLab?.id) {
          const testPromises = viewPatientDetails.visitDetailDto.testIds.map(id => 
            getTestById(currentLab.id.toString(), id)
          );
          const testResults = await Promise.all(testPromises);
          setTests(testResults.filter(test => test !== null) as TestList[]);
        }

        // Fetch doctor
        if (viewPatientDetails?.visitDetailDto?.doctorId && currentLab?.id) {
          const doctorResult = await doctorGetById(
            currentLab.id.toString(), 
            viewPatientDetails.visitDetailDto.doctorId
          );
          setDoctor(doctorResult.data);
        }

        // Fetch health packages
        if (viewPatientDetails?.visitDetailDto?.packageIds?.length && currentLab?.id) {
          const healthPackagePromises = viewPatientDetails.visitDetailDto.packageIds.map(id => 
            getHealthPackageById(currentLab.id, id)
          );
          const healthPackageResults = await Promise.all(healthPackagePromises);
          const healthPackageData = healthPackageResults
            .filter(pkg => pkg !== null)
            .map(pkg => pkg.data);
          setHealthPackage(healthPackageData as Packages[]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [viewPatientDetails, currentLab]);

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

  const handlePrint = () => {
    const printContent = document.getElementById('printable-content');
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow && printContent) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Lab Invoice - ${viewPatientDetails?.firstName} ${viewPatientDetails?.lastName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
              .invoice-header { display: flex; justify-content: space-between; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #e2e8f0; }
              .section-title { font-size: 14px; font-weight: 600; color: #1e40af; border-bottom: 1px solid #dbeafe; padding-bottom: 5px; margin-bottom: 10px; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
              .info-card { background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
              th { text-align: left; background: #f1f5f9; padding: 8px; font-size: 13px; }
              td { padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
              .total-section { background: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
              .watermark { position: fixed; bottom: 50%; right: 50%; transform: translate(50%, 50%); opacity: 0.1; font-size: 80px; color: #2563eb; pointer-events: none; z-index: -1; font-weight: bold; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
            <div class="watermark">${currentLab?.name?.toUpperCase() || 'LAB'}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const calculateTotal = () => {
    let total = 0;
    tests.forEach(test => total += test.price);
    healthPackage?.forEach(pkg => total += (pkg.price - pkg.discount));
    return total;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <section className="max-w-4xl mx-auto p-4 bg-white">
      <div id="printable-content">
        {/* Invoice Header */}
        <div className="flex justify-between items-start mb-6 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">LABORATORY INVOICE</h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="text-sm">
                <span className="font-medium">Invoice #:</span> {viewPatientDetails?.visitDetailDto?.bellingDetailsDto?.billingId || 'N/A'}
              </div>
              <div className="text-sm">
                <span className="font-medium">Date:</span> {formatDate(viewPatientDetails?.visitDetailDto?.visitDate)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              {currentLab?.name?.substring(0, 2).toUpperCase() || 'LAB'}
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold">{currentLab?.name}</h2>
              <p className="text-xs text-gray-600">
                {currentLab?.address}, {currentLab?.city}, {currentLab?.state}
              </p>
              <p className="text-xs text-gray-600">GSTIN: 22AAAAA0000A1Z5</p>
            </div>
          </div>
        </div>

        {/* Patient and Doctor Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <h3 className="text-sm font-semibold text-blue-800 mb-3">PATIENT DETAILS</h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">
                {viewPatientDetails?.firstName} {viewPatientDetails?.lastName}
              </p>
              <p>
                <span className="text-gray-600">Age/Gender:</span> {calculateAge(viewPatientDetails?.dateOfBirth)} / {viewPatientDetails?.gender}
              </p>
              <p><span className="text-gray-600">City:</span> {viewPatientDetails?.city || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
            <h3 className="text-sm font-semibold text-green-800 mb-3">VISIT DETAILS</h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">
                {doctor?.name || 'Self-referred'}
              </p>
              <p><span className="text-gray-600">Visit Type:</span> {viewPatientDetails?.visitDetailDto?.visitType || 'N/A'}</p>
              <p><span className="text-gray-600">Status:</span> {viewPatientDetails?.visitDetailDto?.visitStatus || 'N/A'}</p>
              <p><span className="text-gray-600">Visit ID:</span> {viewPatientDetails?.visitDetailDto?.visitId || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Tests and Packages */}
        <div className="mb-6">
          {tests.length > 0 && (
            <>
              <h3 className="text-sm font-semibold bg-gray-100 p-2 rounded-t-lg border-b">TESTS CONDUCTED</h3>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">Test Code</th>
                    <th className="p-3 text-left">Test Name</th>
                    <th className="p-3 text-right">Price (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test, index) => (
                    <tr key={test.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 border-b">T-{String(test.id).substring(0, 6).toUpperCase()}</td>
                      <td className="p-3 border-b">{test.name}</td>
                      <td className="p-3 text-right border-b">₹{test.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {healthPackage.length > 0 && (
            <>
              <h3 className="text-sm font-semibold bg-gray-100 p-2 mt-6 rounded-t-lg border-b">HEALTH PACKAGES</h3>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">Package Code</th>
                    <th className="p-3 text-left">Package Name</th>
                    <th className="p-3 text-right">Price (₹)</th>
                    <th className="p-3 text-right">Discount (₹)</th>
                    <th className="p-3 text-right">Net Price (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {healthPackage.map((pkg) => (
                    <React.Fragment key={pkg.id}>
                      <tr className="bg-white">
                        <td className="p-3 border-b">P-{String(pkg.id).substring(0, 6).toUpperCase()}</td>
                        <td className="p-3 border-b">{pkg.packageName}</td>
                        <td className="p-3 text-right border-b">₹{pkg.price.toFixed(2)}</td>
                        <td className="p-3 text-right text-red-600 border-b">-₹{pkg.discount.toFixed(2)}</td>
                        <td className="p-3 text-right font-medium text-green-600 border-b">
                          ₹{(pkg.price - pkg.discount).toFixed(2)}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold mb-4 text-gray-700">BILL SUMMARY</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span>Subtotal:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span>Additional Discount:</span>
                <span className="text-red-600">
                  -₹{(viewPatientDetails?.visitDetailDto?.bellingDetailsDto?.discount || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-2 font-bold text-lg mt-2">
                <span>Total Amount:</span>
                <span>₹{(viewPatientDetails?.visitDetailDto?.bellingDetailsDto?.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span>Payment Status:</span>
                <span className={`font-medium ${
                  viewPatientDetails?.visitDetailDto?.bellingDetailsDto?.paymentStatus === 'paid' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {viewPatientDetails?.visitDetailDto?.bellingDetailsDto?.paymentStatus || 'Pending'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span>Payment Method:</span>
                <span>{viewPatientDetails?.visitDetailDto?.bellingDetailsDto?.paymentMethod || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Payment Date:</span>
                <span>{formatDate(viewPatientDetails?.visitDetailDto?.bellingDetailsDto?.paymentDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t">
          <p className="mb-1">Thank you for choosing {currentLab?.name}. For any queries regarding your tests, please contact our support team.</p>
          <p className="mt-3 text-gray-400 italic">This is a computer generated invoice and does not require a physical signature.</p>
        </div>
      </div>

      {/* Print Button */}
      <div className="flex justify-end mt-6 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <PrinterIcon className="h-4 w-4 mr-2" />
          Print Invoice
        </button>
      </div>
    </section>
  );
}

export default PatientInvoice;