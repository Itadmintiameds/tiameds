// 'use client';
// import {
//   PrinterIcon,
//   DownloadIcon,
//   XIcon
// } from 'lucide-react';
// import { useLabs } from '@/context/LabContext';
// import { Doctor } from '@/types/doctor/doctor';
// import { Packages } from '@/types/package/package';
// import { TestList } from '@/types/test/testlist';
// import React, { useEffect, useState, useRef } from 'react';
// import { doctorGetById } from '@/../services/doctorServices';
// import { getHealthPackageById } from '@/../services/packageServices';
// import { getTestById } from '@/../services/testService';
// import { Bill } from '@/types/patientdashboard/patientViewtypes';
// import { useReactToPrint } from 'react-to-print';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';

// const PatientDetailsViewComponent = () => {
//   const { currentLab, patientDetails } = useLabs();
//   const [tests, setTests] = useState<TestList[]>([]);
//   const [doctor, setDoctor] = useState<Doctor>();
//   const [healthPackage, setHealthPackage] = useState<Packages[]>();
//   const [billingData, setBillingData] = useState<Bill | null>(null);
//   const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
//   const invoiceRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const fetchTests = async () => {
//       try {
//         if (patientDetails?.visit?.testIds?.length && currentLab?.id) {
//           const testPromises = patientDetails.visit.testIds.map((id) =>
//             id !== undefined ? getTestById(currentLab.id.toString(), id) : Promise.resolve(null)
//           );
//           const testResults = await Promise.all(testPromises);
//           setTests(testResults.filter((test) => test !== null) as TestList[]);
//         }
//       } catch (error) {
//         console.error('Error fetching tests:', error);
//       }
//     };

//     const fetchDoctor = async () => {
//       try {
//         if (patientDetails?.visit?.doctorId && currentLab?.id) {
//           const doctorResult = await doctorGetById(currentLab.id.toString(), patientDetails.visit.doctorId);
//           setDoctor(doctorResult.data);
//         }
//       } catch (error) {
//         console.error('Error fetching doctor:', error);
//       }
//     };

//     const fetchHealthPackage = async () => {
//       try {
//         if (patientDetails?.visit?.packageIds?.length && currentLab?.id) {
//           const healthPackagePromises = patientDetails.visit.packageIds.map((id) =>
//             id !== undefined ? getHealthPackageById(currentLab.id, id) : Promise.resolve(null)
//           );
//           const healthPackageResults = await Promise.all(healthPackagePromises);
//           const healthPackageData = healthPackageResults
//             .filter((healthPackage) => healthPackage !== null)
//             .map((healthPackage) => healthPackage.data);
//           setHealthPackage(healthPackageData as Packages[]);
//         }
//       } catch (error) {
//         console.error("Error fetching health packages:", error);
//       }
//     };

//     fetchTests();
//     fetchDoctor();
//     fetchHealthPackage();
//   }, [patientDetails, currentLab]);

//   const calculateAge = (dateOfBirth: string) => {
//     if (!dateOfBirth) return 'N/A';
//     const birthDate = new Date(dateOfBirth);
//     const currentDate = new Date();
//     let age = currentDate.getFullYear() - birthDate.getFullYear();
//     if (
//       currentDate.getMonth() < birthDate.getMonth() ||
//       (currentDate.getMonth() === birthDate.getMonth() && currentDate.getDate() < birthDate.getDate())
//     ) {
//       age--;
//     }
//     return age;
//   };

//   const calculateTotal = () => {
//     let total = 0;
//     tests.forEach(test => total += test.price);
//     healthPackage?.forEach(pkg => total += (pkg.price - pkg.discount));
//     return total;
//   };

//   const handlePrint = useReactToPrint({
//     pageStyle: `
//       @page {
//         size: A4;
//         margin: 10mm;
//       }
//       @media print {
//         body {
//           -webkit-print-color-adjust: exact;
//         }
//         .no-print {
//           display: none !important;
//         }
//         .print-only {
//           display: block !important;
//         }
//       }
//     `,
//     documentTitle: `invoice_${patientDetails?.firstName}_${patientDetails?.lastName}`,
//     content: () => invoiceRef.current,
//   });

//   const handleDownloadPDF = async () => {
//     if (!invoiceRef.current) return;
    
//     const canvas = await html2canvas(invoiceRef.current, {
//       useCORS: true,
//       allowTaint: true,
//       logging: true,
//     });
    
//     const imgData = canvas.toDataURL('image/png');
//     const pdf = new jsPDF('p', 'mm', 'a4');
//     const imgWidth = 210; // A4 width in mm
//     const pageHeight = 295; // A4 height in mm
//     const imgHeight = (canvas.height * imgWidth) / canvas.width;
//     let heightLeft = imgHeight;
//     let position = 0;
    
//     pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
//     heightLeft -= pageHeight;
    
//     while (heightLeft >= 0) {
//       position = heightLeft - imgHeight;
//       pdf.addPage();
//       pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
//       heightLeft -= pageHeight;
//     }
    
//     pdf.save(`invoice_${patientDetails?.firstName}_${patientDetails?.lastName}.pdf`);
//   };

//   return (
//     <>
//       <div className="max-w-6xl mx-auto p-4">
//         {/* Action Buttons - Fixed at top right */}
//         <div className="no-print flex justify-end gap-3 mb-4 sticky top-0 z-10 bg-white p-2 rounded shadow-sm">
//           <button
//             onClick={() => handlePrint()}
//             className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             <PrinterIcon className="h-4 w-4 mr-2" />
//             Print Invoice
//           </button>
//           <button
//             onClick={handleDownloadPDF}
//             className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
//           >
//             <DownloadIcon className="h-4 w-4 mr-2" />
//             Download PDF
//           </button>
//         </div>

//         {/* Invoice Content */}
//         <div 
//           ref={invoiceRef} 
//           className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
//           style={{ minHeight: '1123px' }} // A4 height in pixels at 96dpi
//         >
//           {/* Watermark - Only shows in print */}
//           <div className="print-only absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
//             <div className="text-6xl font-bold text-gray-300 transform rotate-45">
//               {currentLab?.name || 'LAB'}
//             </div>
//           </div>

//           {/* Invoice Header */}
//           <div className="flex justify-between items-start mb-8 border-b-2 border-blue-100 pb-6">
//             <div className="flex items-center">
//               <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
//                 <span className="text-white text-xl font-bold">LAB</span>
//               </div>
//               <div>
//                 <h1 className="text-3xl font-bold text-gray-800">LAB INVOICE</h1>
//                 <p className="text-sm text-gray-500">Invoice #: {patientDetails?.visit?.billing?.billingId || 'N/A'}</p>
//                 <p className="text-xs text-gray-400 mt-1">Date: {new Date().toLocaleDateString()}</p>
//               </div>
//             </div>
//             <div className="text-right border-l-2 border-gray-200 pl-4">
//               <div className="flex flex-col items-end">
//                 <h2 className="text-xl font-bold text-gray-800">{currentLab?.name}</h2>
//                 <p className="text-xs text-gray-500">GSTIN: 22AAAAA0000A1Z5</p>
//                 <p className="text-xs text-gray-500 mt-1">License: MH-1234-5678</p>
//               </div>
//               <p className="text-xs mt-2 text-gray-600 max-w-xs">
//                 {currentLab?.address}, {currentLab?.city}, {currentLab?.state}
//                 <br />
//                 Email: info@{currentLab?.name?.toLowerCase().replace(/\s+/g, '')}.com
//               </p>
//             </div>
//           </div>

//           {/* Patient and Doctor Info */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
//             <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
//               <h3 className="text-md font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-4 flex items-center">
//                 <span className="bg-blue-600 w-4 h-4 rounded-full mr-2"></span>
//                 PATIENT DETAILS
//               </h3>
//               <div className="space-y-3 text-sm">
//                 <p className="flex justify-between">
//                   <span className="font-medium text-gray-600">Name:</span>
//                   <span className="text-gray-800">{patientDetails?.firstName} {patientDetails?.lastName}</span>
//                 </p>
//                 <p className="flex justify-between">
//                   <span className="font-medium text-gray-600">Age/Gender:</span>
//                   <span className="text-gray-800">{calculateAge(patientDetails?.dateOfBirth || '')} / {patientDetails?.gender}</span>
//                 </p>
//                 <p className="flex justify-between">
//                   <span className="font-medium text-gray-600">Phone:</span>
//                   <span className="text-gray-800">{patientDetails?.phone || 'N/A'}</span>
//                 </p>
//                 <p className="flex justify-between">
//                   <span className="font-medium text-gray-600">Email:</span>
//                   <span className="text-gray-800">{patientDetails?.email || 'N/A'}</span>
//                 </p>
//                 <p className="mt-4 text-gray-700">
//                   <span className="font-medium text-gray-600 block mb-1">Address:</span>
//                   {patientDetails?.address}, {patientDetails?.city}, {patientDetails?.state} - {patientDetails?.zip}
//                 </p>
//               </div>
//             </div>

//             <div className="bg-green-50 p-5 rounded-lg border border-green-100">
//               <h3 className="text-md font-semibold text-green-800 border-b border-green-200 pb-2 mb-4 flex items-center">
//                 <span className="bg-green-600 w-4 h-4 rounded-full mr-2"></span>
//                 REFERRING DOCTOR & VISIT INFO
//               </h3>
//               <div className="space-y-3 text-sm">
//                 <p className="flex justify-between">
//                   <span className="font-medium text-gray-600">Doctor Name:</span>
//                   <span className="text-gray-800">{doctor?.name || 'N/A'}</span>
//                 </p>
//                 {/* <p className="flex justify-between">
//                   <span className="font-medium text-gray-600">Specialization:</span>
//                   <span className="text-gray-800">{doctor?.specialization || 'N/A'}</span>
//                 </p> */}
//                 <p className="flex justify-between">
//                   <span className="font-medium text-gray-600">Phone:</span>
//                   <span className="text-gray-800">{doctor?.phone || 'N/A'}</span>
//                 </p>
//                 <div className="mt-4 pt-3 border-t border-green-200">
//                   <p className="flex justify-between">
//                     <span className="font-medium text-gray-600">Visit ID:</span>
//                     <span className="text-gray-800">{patientDetails?.visit?.visitId || 'N/A'}</span>
//                   </p>
//                   <p className="flex justify-between">
//                     <span className="font-medium text-gray-600">Visit Date:</span>
//                     <span className="text-gray-800">
//                       {patientDetails?.visit?.visitDate ? new Date(patientDetails.visit.visitDate).toLocaleDateString() : 'N/A'}
//                     </span>
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Tests and Packages */}
//           <div className="mb-8">
//             <h3 className="text-md font-semibold bg-gray-800 text-white p-3 rounded-t-lg flex items-center">
//               <span className="bg-white w-3 h-3 rounded-full mr-2"></span>
//               TESTS CONDUCTED
//             </h3>
//             <div className="overflow-x-auto border-x border-gray-200">
//               <table className="w-full text-sm">
//                 <thead className="bg-gray-100">
//                   <tr>
//                     <th className="p-3 text-left border-b border-gray-200 font-medium text-gray-700">Test Name</th>
//                     <th className="p-3 text-left border-b border-gray-200 font-medium text-gray-700">Category</th>
//                     <th className="p-3 text-right border-b border-gray-200 font-medium text-gray-700">Price (₹)</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {tests.map((test, index) => (
//                     <tr key={test.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
//                       <td className="p-3 border-b border-gray-200 text-gray-800">{test.name}</td>
//                       <td className="p-3 border-b border-gray-200 text-gray-600">{test.category || 'General'}</td>
//                       <td className="p-3 border-b border-gray-200 text-right text-gray-800">₹{test.price.toFixed(2)}</td>
//                     </tr>
//                   ))}
//                   {tests.length === 0 && (
//                     <tr>
//                       <td colSpan={3} className="p-3 text-center text-gray-500 border-b border-gray-200">
//                         No tests conducted
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//                 <tfoot>
//                   <tr className="bg-gray-50">
//                     <td colSpan={2} className="p-3 text-right font-medium border-t border-gray-200">Subtotal:</td>
//                     <td className="p-3 text-right font-medium border-t border-gray-200">
//                       ₹{tests.reduce((sum, test) => sum + test.price, 0).toFixed(2)}
//                     </td>
//                   </tr>
//                 </tfoot>
//               </table>
//             </div>

//             {(healthPackage ?? []).length > 0 && (
//               <>
//                 <h3 className="text-md font-semibold bg-gray-800 text-white p-3 rounded-t-lg mt-8 flex items-center">
//                   <span className="bg-white w-3 h-3 rounded-full mr-2"></span>
//                   HEALTH PACKAGES
//                 </h3>
//                 <div className="overflow-x-auto border-x border-gray-200">
//                   <table className="w-full text-sm">
//                     <thead className="bg-gray-100">
//                       <tr>
//                         <th className="p-3 text-left border-b border-gray-200 font-medium text-gray-700">Package Name</th>
//                         <th className="p-3 text-right border-b border-gray-200 font-medium text-gray-700">Price (₹)</th>
//                         <th className="p-3 text-right border-b border-gray-200 font-medium text-gray-700">Discount (₹)</th>
//                         <th className="p-3 text-right border-b border-gray-200 font-medium text-gray-700">Net Price (₹)</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {healthPackage?.map((pkg) => (
//                         <React.Fragment key={pkg.id}>
//                           <tr className="bg-white">
//                             <td className="p-3 border-b border-gray-200 text-gray-800">{pkg.packageName}</td>
//                             <td className="p-3 border-b border-gray-200 text-right text-gray-800">₹{pkg.price.toFixed(2)}</td>
//                             <td className="p-3 border-b border-gray-200 text-right text-red-600">-₹{pkg.discount.toFixed(2)}</td>
//                             <td className="p-3 border-b border-gray-200 text-right font-medium text-green-600">
//                               ₹{(pkg.price - pkg.discount).toFixed(2)}
//                             </td>
//                           </tr>
//                           <tr className="bg-gray-50">
//                             <td colSpan={4} className="p-3 border-b border-gray-200">
//                               <div className="pl-4">
//                                 <p className="text-xs font-medium mb-2 text-gray-600">Includes:</p>
//                                 <div className="grid grid-cols-2 gap-2 text-xs">
//                                   {pkg.tests.map((test) => (
//                                     <div key={test.id} className="flex justify-between bg-white p-2 rounded border border-gray-100">
//                                       <span className="text-gray-700">{test.name}</span>
//                                       <span className="text-gray-800 font-medium">₹{test.price.toFixed(2)}</span>
//                                     </div>
//                                   ))}
//                                 </div>
//                               </div>
//                             </td>
//                           </tr>
//                         </React.Fragment>
//                       ))}
//                     </tbody>
//                     <tfoot>
//                       <tr className="bg-gray-50">
//                         <td colSpan={3} className="p-3 text-right font-medium border-t border-gray-200">Subtotal:</td>
//                         <td className="p-3 text-right font-medium border-t border-gray-200">
//                           ₹{healthPackage?.reduce((sum, pkg) => sum + (pkg.price - pkg.discount), 0).toFixed(2) || '0.00'}
//                         </td>
//                       </tr>
//                     </tfoot>
//                   </table>
//                 </div>
//               </>
//             )}
//           </div>

//           {/* Payment Summary */}
//           <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
//             <h3 className="text-md font-semibold border-b border-gray-300 pb-2 mb-4 text-gray-800">PAYMENT SUMMARY</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               <div>
//                 <div className="flex justify-between py-2 border-b border-gray-200">
//                   <span className="text-gray-600">Tests Subtotal:</span>
//                   <span className="text-gray-800">₹{tests.reduce((sum, test) => sum + test.price, 0).toFixed(2)}</span>
//                 </div>
//                 {(healthPackage ?? []).length > 0 && (
//                   <div className="flex justify-between py-2 border-b border-gray-200">
//                     <span className="text-gray-600">Packages Subtotal:</span>
//                     <span className="text-gray-800">
//                       ₹{healthPackage?.reduce((sum, pkg) => sum + (pkg.price - pkg.discount), 0).toFixed(2) || '0.00'}
//                     </span>
//                   </div>
//                 )}
//                 <div className="flex justify-between py-2 border-b border-gray-200">
//                   <span className="text-gray-600">Total Before Discount:</span>
//                   <span className="text-gray-800">₹{calculateTotal().toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between py-2 border-b border-gray-200">
//                   <span className="text-gray-600">Discount:</span>
//                   <span className="text-red-600">-₹{patientDetails?.visit?.billing?.discount || '0.00'}</span>
//                 </div>
//                 <div className="flex justify-between py-3 font-bold text-lg mt-2">
//                   <span className="text-gray-800">Total Amount:</span>
//                   <span className="text-blue-600">₹{patientDetails?.visit?.billing?.totalAmount || '0.00'}</span>
//                 </div>
//               </div>
//               <div>
//                 <div className="flex justify-between py-2 border-b border-gray-200">
//                   <span className="text-gray-600">Payment Status:</span>
//                   <span className={`font-medium ${
//                     String(patientDetails?.visit?.billing?.paymentStatus) === 'Paid' 
//                       ? 'text-green-600' 
//                       : 'text-red-600'
//                   }`}>
//                     {patientDetails?.visit?.billing?.paymentStatus || 'N/A'}
//                   </span>
//                 </div>
//                 <div className="flex justify-between py-2 border-b border-gray-200">
//                   <span className="text-gray-600">Payment Method:</span>
//                   <span className="text-gray-800">{patientDetails?.visit?.billing?.paymentMethod || 'N/A'}</span>
//                 </div>
//                 <div className="flex justify-between py-2 border-b border-gray-200">
//                   <span className="text-gray-600">Payment Date:</span>
//                   <span className="text-gray-800">
//                     {patientDetails?.visit?.billing?.paymentDate 
//                       ? new Date(patientDetails.visit.billing.paymentDate).toLocaleDateString() 
//                       : 'N/A'}
//                   </span>
//                 </div>
//                 {/* <div className="flex justify-between py-2 border-b border-gray-200">
//                   <span className="text-gray-600">Transaction ID:</span>
//                   <span className="text-gray-800">{patientDetails?.visit?.billing?.transactionId || 'N/A'}</span>
//                 </div> */}
//                 <div className="mt-4 pt-3 border-t border-gray-200">
//                   <p className="text-sm text-gray-600">Notes:</p>
//                   <p className="text-xs text-gray-500 mt-1">
//                     {'No additional notes provided.'}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Footer Notes */}
//           <div className="text-center text-sm text-gray-600 border-t-2 border-gray-200 pt-6">
//             <div className="mb-4">
//               <p className="font-medium text-gray-700">Thank you for choosing our lab services!</p>
//               <p className="mt-1">For any queries regarding your tests or results, please contact our customer support.</p>
//             </div>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mt-4">
//               <div className="bg-gray-50 p-2 rounded">
//                 <p className="font-medium text-gray-700">Email</p>
//                 <p>support@{currentLab?.name?.toLowerCase().replace(/\s+/g, '')}.com</p>
//               </div>
//               <div className="bg-gray-50 p-2 rounded">
//                 <p className="font-medium text-gray-700">Phone</p>
//                 <p>+91 {currentLab?.phone || 'XXXXXXXXXX'}</p>
//               </div>
//               <div className="bg-gray-50 p-2 rounded">
//                 <p className="font-medium text-gray-700">Hours</p>
//                 <p>Mon-Sat: 8AM - 8PM</p>
//               </div>
//               <div className="bg-gray-50 p-2 rounded">
//                 <p className="font-medium text-gray-700">Website</p>
//                 <p>www.{currentLab?.name?.toLowerCase().replace(/\s+/g, '')}.com</p>
//               </div>
//             </div>
//             <p className="mt-6 text-xs text-gray-400">
//               This is a computer generated invoice and does not require signature. Results are typically available within 24-48 hours.
//               <br />
//               Please bring this invoice when collecting your reports.
//             </p>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// export default PatientDetailsViewComponent;






// 'use client';
// import {PrinterIcon} from 'lucide-react';
// import { useLabs } from '@/context/LabContext';
// import { Doctor } from '@/types/doctor/doctor';
// import { Packages } from '@/types/package/package';
// import { TestList } from '@/types/test/testlist';
// import React, { useEffect, useState } from 'react';

// import { doctorGetById } from '@/../services/doctorServices';
// import { getHealthPackageById } from '@/../services/packageServices';
// import { getTestById } from '@/../services/testService';
// import { Bill } from '@/types/patientdashboard/patientViewtypes';

// const PatientDetailsViewComponent = () => {
//   const { currentLab, patientDetails } = useLabs();
//   const [tests, setTests] = useState<TestList[]>([]);
//   const [doctor, setDoctor] = useState<Doctor>();
//   const [healthPackage, setHealthPackage] = useState<Packages[]>();
//   const [billingData, setBillingData] = useState<Bill | null>(null);
//   const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

//   useEffect(() => {
//     const fetchTests = async () => {
//       try {
//         if (patientDetails?.visit?.testIds?.length && currentLab?.id) {
//           const testPromises = patientDetails.visit.testIds.map((id) =>
//             id !== undefined ? getTestById(currentLab.id.toString(), id) : Promise.resolve(null)
//           );
//           const testResults = await Promise.all(testPromises);
//           setTests(testResults.filter((test) => test !== null) as TestList[]);
//         }
//       } catch (error) {
//         console.error('Error fetching tests:', error);
//       }
//     };

//     const fetchDoctor = async () => {
//       try {
//         if (patientDetails?.visit?.doctorId && currentLab?.id) {
//           const doctorResult = await doctorGetById(currentLab.id.toString(), patientDetails.visit.doctorId);
//           setDoctor(doctorResult.data);
//         }
//       } catch (error) {
//         console.error('Error fetching doctor:', error);
//       }
//     };

//     const fetchHealthPackage = async () => {
//       try {
//         if (patientDetails?.visit?.packageIds?.length && currentLab?.id) {
//           const healthPackagePromises = patientDetails.visit.packageIds.map((id) =>
//             id !== undefined ? getHealthPackageById(currentLab.id, id) : Promise.resolve(null)
//           );
//           const healthPackageResults = await Promise.all(healthPackagePromises);
//           const healthPackageData = healthPackageResults
//             .filter((healthPackage) => healthPackage !== null)
//             .map((healthPackage) => healthPackage.data);
//           setHealthPackage(healthPackageData as Packages[]);
//         }
//       } catch (error) {
//         console.error("Error fetching health packages:", error);
//       }
//     };

//     fetchTests();
//     fetchDoctor();
//     fetchHealthPackage();
//   }, [patientDetails, currentLab]);

//   const calculateAge = (dateOfBirth: string) => {
//     const birthDate = new Date(dateOfBirth);
//     const currentDate = new Date();
//     let age = currentDate.getFullYear() - birthDate.getFullYear();
//     if (
//       currentDate.getMonth() < birthDate.getMonth() ||
//       (currentDate.getMonth() === birthDate.getMonth() && currentDate.getDate() < birthDate.getDate())
//     ) {
//       age--;
//     }
//     return age;
//   };

//   const handlePrint = () => {
//     setIsPrintModalOpen(true);
//   };

//   const calculateTotal = () => {
//     let total = 0;
//     tests.forEach(test => total += test.price);
//     healthPackage?.forEach(pkg => total += (pkg.price - pkg.discount));
//     return total;
//   };

//   return (
//     <>
//       <section className="max-w-6xl mx-auto p-4">
//         {/* Invoice Header */}
//         <div className="flex justify-between items-start mb-6 border-b pb-4">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-800">LAB INVOICE</h1>
//             <p className="text-xs text-gray-500">Invoice #: {patientDetails?.visit?.billing?.billingId || 'N/A'}</p>
//           </div>
//           <div className="text-right">
//             <div className="flex items-center justify-end space-x-2">
//               <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center">
//                 <span className="text-white text-xs font-medium">LAB</span>
//               </div>
//               <div>
//                 <h2 className="text-sm font-bold">{currentLab?.name}</h2>
//                 <p className="text-xs text-gray-500">GSTIN: 22AAAAA0000A1Z5</p>
//               </div>
//             </div>
//             <p className="text-xs mt-2 text-gray-600">
//               {currentLab?.address}, {currentLab?.city}, {currentLab?.state}
//             </p>
//           </div>
//         </div>

//         {/* Patient and Doctor Info */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//           <div className="bg-blue-50 p-4 rounded-lg">
//             <h3 className="text-sm font-semibold text-blue-800 border-b border-blue-200 pb-1 mb-3">PATIENT DETAILS</h3>
//             <div className="space-y-2 text-sm">
//               <p><span className="font-medium">Name:</span> {patientDetails?.firstName} {patientDetails?.lastName}</p>
//               <p><span className="font-medium">Age/Gender:</span> {calculateAge(patientDetails?.dateOfBirth || '')} / {patientDetails?.gender}</p>
//               <p><span className="font-medium">Phone:</span> {patientDetails?.phone}</p>
//               <p><span className="font-medium">Address:</span> {patientDetails?.address}, {patientDetails?.city}, {patientDetails?.state} - {patientDetails?.zip}</p>
//             </div>
//           </div>

//           <div className="bg-green-50 p-4 rounded-lg">
//             <h3 className="text-sm font-semibold text-green-800 border-b border-green-200 pb-1 mb-3">REFERRING DOCTOR</h3>
//             <div className="space-y-2 text-sm">
//               <p><span className="font-medium">Name:</span> {doctor?.name || 'N/A'}</p>
//               <p><span className="font-medium">Phone:</span> {doctor?.phone || 'N/A'}</p>
//               <p><span className="font-medium">Visit ID:</span> {patientDetails?.visit?.visitId || 'N/A'}</p>
//               <p><span className="font-medium">Visit Date:</span> {patientDetails?.visit?.visitDate || 'N/A'}</p>
//             </div>
//           </div>
//         </div>

//         {/* Tests and Packages */}
//         <div className="mb-6">
//           <h3 className="text-sm font-semibold bg-gray-100 p-2 rounded-t-lg">TESTS CONDUCTED</h3>
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm border">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="p-2 text-left border-b">Test Name</th>
//                   <th className="p-2 text-right border-b">Price (₹)</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {tests.map((test, index) => (
//                   <tr key={test.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
//                     <td className="p-2 border-b">{test.name}</td>
//                     <td className="p-2 text-right border-b">₹{test.price.toFixed(2)}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {(healthPackage ?? []).length > 0 && (
//             <>
//               <h3 className="text-sm font-semibold bg-gray-100 p-2 mt-4 rounded-t-lg">HEALTH PACKAGES</h3>
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm border">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="p-2 text-left border-b">Package Name</th>
//                       <th className="p-2 text-right border-b">Price (₹)</th>
//                       <th className="p-2 text-right border-b">Discount (₹)</th>
//                       <th className="p-2 text-right border-b">Net Price (₹)</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {healthPackage?.map((pkg) => (
//                       <React.Fragment key={pkg.id}>
//                         <tr className="bg-white">
//                           <td className="p-2 border-b">{pkg.packageName}</td>
//                           <td className="p-2 text-right border-b">₹{pkg.price.toFixed(2)}</td>
//                           <td className="p-2 text-right text-red-600 border-b">-₹{pkg.discount.toFixed(2)}</td>
//                           <td className="p-2 text-right font-medium text-green-600 border-b">
//                             ₹{(pkg.price - pkg.discount).toFixed(2)}
//                           </td>
//                         </tr>
//                         <tr className="bg-gray-50">
//                           <td colSpan={4} className="p-2 border-b">
//                             <div className="pl-4">
//                               <p className="text-xs font-medium mb-1">Includes:</p>
//                               <ul className="grid grid-cols-2 gap-1 text-xs">
//                                 {pkg.tests.map((test) => (
//                                   <li key={test.id} className="flex justify-between">
//                                     <span>{test.name}</span>
//                                     <span>₹{test.price.toFixed(2)}</span>
//                                   </li>
//                                 ))}
//                               </ul>
//                             </div>
//                           </td>
//                         </tr>
//                       </React.Fragment>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </>
//           )}
//         </div>

//         {/* Payment Summary */}
//         <div className="bg-gray-50 p-4 rounded-lg mb-6">
//           <h3 className="text-sm font-semibold border-b border-gray-200 pb-1 mb-3">PAYMENT SUMMARY</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <div className="flex justify-between py-1 border-b border-gray-200">
//                 <span>Subtotal:</span>
//                 <span>₹{calculateTotal().toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between py-1 border-b border-gray-200">
//                 <span>Discount:</span>
//                 <span className="text-red-600">-₹{patientDetails?.visit?.billing?.discount || '0.00'}</span>
//               </div>
//               <div className="flex justify-between py-1 font-bold">
//                 <span>Total Amount:</span>
//                 <span>₹{patientDetails?.visit?.billing?.totalAmount || '0.00'}</span>
//               </div>
//             </div>
//             <div>
//               <div className="flex justify-between py-1 border-b border-gray-200">
//                 <span>Payment Status:</span>
//                 <span className={`font-medium ${
//                   String(patientDetails?.visit?.billing?.paymentStatus) === 'Paid' 
//                     ? 'text-green-600' 
//                     : 'text-red-600'
//                 }`}>
//                   {patientDetails?.visit?.billing?.paymentStatus || 'N/A'}
//                 </span>
//               </div>
//               <div className="flex justify-between py-1 border-b border-gray-200">
//                 <span>Payment Method:</span>
//                 <span>{patientDetails?.visit?.billing?.paymentMethod || 'N/A'}</span>
//               </div>
//               <div className="flex justify-between py-1">
//                 <span>Payment Date:</span>
//                 <span>{patientDetails?.visit?.billing?.paymentDate || 'N/A'}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer Notes */}
//         <div className="text-center text-xs text-gray-500 border-t pt-4">
//           <p>Thank you for choosing our lab services. For any queries, please contact our customer support.</p>
//           <p className="mt-1">Email: support@{currentLab?.name?.toLowerCase().replace(/\s+/g, '')}.com | Phone: +91 {currentLab?.phone || 'XXXXXXXXXX'}</p>
//           <p className="mt-2 text-gray-400">This is a computer generated invoice and does not require signature.</p>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex justify-end gap-3 mt-6">
//           <button
//             onClick={handlePrint}
//             className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
//           >
//             <PrinterIcon className="h-3 w-3 mr-1" />
//             Print Invoice
//           </button>
//         </div>
//       </section>

     
//     </>
//   );
// }

// export default PatientDetailsViewComponent;








// ==============================================================================================================


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

const PatientDetailsViewComponent = () => {
  const { currentLab, patientDetails } = useLabs();
  const [tests, setTests] = useState<TestList[]>([]);
  const [doctor, setDoctor] = useState<Doctor>();
  const [healthPackage, setHealthPackage] = useState<Packages[]>();
  // const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        if (patientDetails?.visit?.testIds?.length && currentLab?.id) {
          const testPromises = patientDetails.visit.testIds.map((id) =>
            id !== undefined ? getTestById(currentLab.id.toString(), id) : Promise.resolve(null)
          );
          const testResults = await Promise.all(testPromises);
          setTests(testResults.filter((test) => test !== null) as TestList[]);
        }
      } catch (error) {
        console.error('Error fetching tests:', error);
      }
    };

    const fetchDoctor = async () => {
      try {
        if (patientDetails?.visit?.doctorId && currentLab?.id) {
          const doctorResult = await doctorGetById(currentLab.id.toString(), patientDetails.visit.doctorId);
          setDoctor(doctorResult.data);
        }
      } catch (error) {
        console.error('Error fetching doctor:', error);
      }
    };

    const fetchHealthPackage = async () => {
      try {
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
        console.error("Error fetching health packages:", error);
      }
    };

    fetchTests();
    fetchDoctor();
    fetchHealthPackage();
  }, [patientDetails, currentLab]);

  const calculateAge = (dateOfBirth: string) => {
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
            <title>Lab Invoice - ${patientDetails?.firstName} ${patientDetails?.lastName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
              .invoice-header { display: flex; justify-content: space-between; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #e2e8f0; }
              .lab-logo { width: 80px; height: 80px; background: #2563eb; color: white; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-weight: bold; }
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
    <>
      <section className="max-w-4xl mx-auto p-4 bg-white">
        <div id="printable-content">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-6 border-b pb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">LABORATORY INVOICE</h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="text-sm">
                  <span className="font-medium">Invoice #:</span> {patientDetails?.visit?.billing?.billingId || 'N/A'}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Date:</span> {formatDate(patientDetails?.visit?.visitDate)}
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
                <p className="font-medium text-gray-900">{patientDetails?.firstName} {patientDetails?.lastName}</p>
                <p>
                  <span className="text-gray-600">Age/Gender:</span> {calculateAge(patientDetails?.dateOfBirth || '')} / {patientDetails?.gender}
                </p>
                <p><span className="text-gray-600">Phone:</span> {patientDetails?.phone}</p>
                <p><span className="text-gray-600">Address:</span> {patientDetails?.address}, {patientDetails?.city}</p>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <h3 className="text-sm font-semibold text-green-800 mb-3">REFERRING PHYSICIAN</h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-900">{doctor?.name || 'N/A'}</p>
                <p><span className="text-gray-600">Phone:</span> {doctor?.phone || 'N/A'}</p>
                <p><span className="text-gray-600">License:</span> {doctor?.licenseNumber || 'N/A'}</p>
                <p><span className="text-gray-600">Visit ID:</span> {patientDetails?.visit?.visitId || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Tests and Packages */}
          <div className="mb-6">
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

            {(healthPackage ?? []).length > 0 && (
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
                    {healthPackage?.map((pkg) => (
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
                        <tr className="bg-gray-50">
                          <td colSpan={5} className="p-3 border-b">
                            <div className="pl-2">
                              <p className="text-xs font-medium mb-1 text-gray-600">Includes Tests:</p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {pkg.tests.map((test) => (
                                  <div key={test.id} className="flex justify-between">
                                    <span>T-{String(test.id).substring(0, 6).toUpperCase()}</span>
                                    <span className="font-medium">{test.name}</span>
                                    <span>₹{test.price.toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
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
                  <span className="text-red-600">-₹{(patientDetails?.visit?.billing?.discount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 font-bold text-lg mt-2">
                  <span>Total Amount:</span>
                  <span>₹{(patientDetails?.visit?.billing?.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span>Payment Status:</span>
                  <span className={`font-medium ${
                    String(patientDetails?.visit?.billing?.paymentStatus) === 'Paid' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {patientDetails?.visit?.billing?.paymentStatus || 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span>Payment Method:</span>
                  <span>{patientDetails?.visit?.billing?.paymentMethod || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Payment Date:</span>
                  <span>{formatDate(patientDetails?.visit?.billing?.paymentDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t">
            <p className="mb-1">Thank you for choosing {currentLab?.name}. For any queries regarding your tests, please contact:</p>
            <p className="mb-1">
              {/* <span className="font-medium">Customer Support:</span> {currentLab?.contactNumber || 'XXXXXXXXXX'} |  */}
              <span className="font-medium ml-2">Email:</span> support@{currentLab?.name?.toLowerCase().replace(/\s+/g, '')}.com
            </p>
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
    </>
  );
}

export default PatientDetailsViewComponent;








