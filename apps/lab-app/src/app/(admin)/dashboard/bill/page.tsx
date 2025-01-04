// 'use client';

// import React, { useState, useEffect } from 'react';
// import { getTestById } from '@/../services/testService';
// import { doctorGetById } from '@/../services/doctorServices';
// import { getHealthPackageById } from '@/../services/packageServices';
// import { getInsuranceById } from '@/../services/insuranceService';

// import { Patient } from '@/types/patient/patient';
// import { TestList } from '@/types/test/testlist';
// import { Doctor } from '@/types/doctor/doctor';
// import { Packages } from '@/types/package/package';
// import { Insurance } from '@/types/insurance/insurance';
// import { useLabs } from '@/context/LabContext';
// import {
//     FaUser, FaEnvelope, FaTint, FaMapMarkerAlt, FaBirthdayCake, FaPhone, FaMapPin, FaRegBuilding
//     , FaUserMd, FaNotesMedical, FaCalendarAlt, FaDollarSign, FaCity, FaMoneyBillWave
// } from 'react-icons/fa';

// const Page = () => {
//     const { currentLab, patientDetails } = useLabs();
//     const [tests, setTests] = useState<TestList[]>([]);
//     const [doctor, setDoctor] = useState<Doctor>();
//     const [healthPackage, setHealthPackage] = useState<Packages[]>();
//     // const [insurance, setInsurance] = useState<string[]>();


//     useEffect(() => {


//         const fetchTests = async () => {
//             try {
//                 if (patientDetails?.visit?.testIds?.length && currentLab?.id) {
//                     const testPromises = patientDetails.visit.testIds.map((id) =>
//                         id !== undefined ? getTestById(currentLab.id.toString(), id) : Promise.resolve(null)
//                     );
//                     const testResults = await Promise.all(testPromises);
//                     setTests(testResults.filter((test) => test !== null) as TestList[]);
//                 }
//             } catch (error) {
//                 console.error('Error fetching tests:', error);
//             }
//         };

//         const fetchDoctor = async () => {
//             try {
//                 if (patientDetails?.visit?.doctorId && currentLab?.id) {
//                     const doctorResult = await doctorGetById(currentLab.id.toString(), patientDetails.visit.doctorId);
//                     setDoctor(doctorResult.data);
//                 }
//             } catch (error) {
//                 console.error('Error fetching doctor:', error);
//             }
//         };

//         const fetchHealthPackage = async () => {
//             try {
//                 if (patientDetails?.visit?.packageIds?.length && currentLab?.id) {
//                     const healthPackagePromises = patientDetails.visit.packageIds.map((id) =>
//                         id !== undefined ? getHealthPackageById(currentLab.id, id) : Promise.resolve(null)
//                     );
//                     const healthPackageResults = await Promise.all(healthPackagePromises);

//                     // Extract the `data` property from each healthPackage object
//                     const healthPackageData = healthPackageResults
//                         .filter((healthPackage) => healthPackage !== null) // Filter out null values
//                         .map((healthPackage) => healthPackage.data);       // Extract the `data` property

//                     // Set the extracted `data` objects as the new healthPackage state
//                     setHealthPackage(healthPackageData as Packages[]);
//                 }
//             } catch (error) {
//                 console.error("Error fetching health packages:", error);
//             }
//         };

//         fetchTests();
//         fetchDoctor();
//         fetchHealthPackage();
//     }, [patientDetails, currentLab]);


//     // Helper function to calculate age
//     const calculateAge = (dateOfBirth: string) => {
//         const birthDate = new Date(dateOfBirth);
//         const currentDate = new Date();
//         const age = currentDate.getFullYear() - birthDate.getFullYear();
//         const month = currentDate.getMonth();
//         if (month < birthDate.getMonth() || (month === birthDate.getMonth() && currentDate.getDate() < birthDate.getDate())) {
//             return age - 1;
//         }
//         return age;
//     };


//     return (
//         <>
//             {/* Compact letterhead-style lab details */}
//             <section className="container mx-auto px-2 sm:px-4 lg:px-6 py-2">
//                 <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
//                     {/* Header Section: Logo + Lab Info */}
//                     <div className="flex items-center justify-between mb-3">
//                         <div className="flex items-center">
//                             {/* Logo Placeholder */}
//                             <div className="w-12 h-12 bg-gray-300 flex justify-center items-center rounded-full mr-3">
//                                 {/* Replace with actual logo or use a text placeholder */}
//                                 <span className="text-xs font-bold text-gray-600">Logo</span>
//                             </div>
//                             <div>
//                                 <h1 className="text-xs font-semibold text-gray-800">Lab Details</h1>
//                                 <p className="text-xxs text-gray-600">Receipt</p>
//                             </div>
//                         </div>
//                         <div className="text-xxs text-gray-600">
//                             <p>GSTN: 123456789</p>
//                         </div>
//                     </div>

//                     {/* Lab Details */}
//                     <div>
//                         {/* Lab Name */}
//                         <div className="flex justify-between items-center py-0.5">
//                             <div className="flex items-center">
//                                 <FaRegBuilding size={12} className="mr-1 text-primary" />
//                                 <p className="text-xs text-gray-800">Lab Name:</p>
//                             </div>
//                             <p className="text-xs text-gray-800">{currentLab?.name}</p>
//                         </div>

//                         {/* Address */}
//                         <div className="flex justify-between items-center py-0.5">
//                             <div className="flex items-center">
//                                 <FaMapMarkerAlt size={12} className="mr-1 text-primary" />
//                                 <p className="text-xs text-gray-800">Address:</p>
//                             </div>
//                             <p className="text-xs text-gray-800">
//                                 {currentLab?.address}, {currentLab?.city}, {currentLab?.state}
//                             </p>
//                         </div>

//                         {/* Phone */}
//                         <div className="flex justify-between items-center py-0.5">
//                             <div className="flex items-center">
//                                 <FaPhone size={12} className="mr-1 text-primary" />
//                                 <p className="text-xs text-gray-800">Phone:</p>
//                             </div>
//                             <p className="text-xs text-gray-800">+91 13212638461233</p>
//                         </div>

//                         {/* Email */}
//                         <div className="flex justify-between items-center py-0.5">
//                             <div className="flex items-center">
//                                 <FaEnvelope size={12} className="mr-1 text-primary" />
//                                 <p className="text-xs text-gray-800">Email:</p>
//                             </div>
//                             <p className="text-xs text-gray-800">lab@gmail.com</p>
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             {/* Compact letterhead-style patient details */}
//             <section className="container mx-auto px-2 sm:px-4 lg:px-6 py-2">
//                 <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">

//                     {/* Patient Info Grid */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-gray-600">
//                         {[
//                             { icon: <FaUser className="text-primary" />, label: `${patientDetails?.firstName} ${patientDetails?.lastName}` },
//                             { icon: <FaEnvelope className="text-primary" />, label: patientDetails?.email },
//                             { icon: <FaTint className="text-primary" />, label: patientDetails?.bloodGroup },
//                             { icon: <FaCity className="text-primary" />, label: patientDetails?.city },
//                             { icon: <FaMapMarkerAlt className="text-primary" />, label: patientDetails?.address },
//                             { icon: <FaBirthdayCake className="text-primary" />, label: `${calculateAge(patientDetails?.dateOfBirth ?? '')} years` },
//                             { icon: <FaPhone className="text-primary" />, label: patientDetails?.phone },
//                             { icon: <FaMapPin className="text-primary" />, label: patientDetails?.zip },
//                         ].map((item, idx) => (
//                             <div key={idx} className="flex items-center space-x-2">
//                                 {item.icon}
//                                 <span className="truncate">{item.label}</span>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </section>

//             <section className="container mx-auto px-2 sm:px-4 lg:px-6 py-2">
//                 {/* Doctor & Visit Details */}
//                 <div className="p-6 bg-white rounded-md shadow-md">
//                     <h1 className="text-sm font-semibold text-gray-800 mb-4 border-b pb-3">Doctor & Visit Details</h1>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-gray-600">
//                         {/* Doctor Info */}
//                         <div className="flex items-center space-x-3">
//                             <FaUserMd className="text-green-500" />
//                             <span className="truncate">{doctor?.name}</span>
//                         </div>
//                         <div className="flex items-center space-x-3">
//                             <FaEnvelope className="text-green-500" />
//                             <span className="truncate">{doctor?.email}</span>
//                         </div>
//                         <div className="flex items-center space-x-3">
//                             <FaPhone className="text-green-500" />
//                             <span className="truncate">{doctor?.phone}</span>
//                         </div>

//                         {/* Visit Info */}
//                         <div className="flex items-center space-x-3">
//                             <FaNotesMedical className="text-blue-500" />
//                             <span className="truncate">Visit ID: {patientDetails?.visit?.visitId}</span>
//                         </div>
//                         <div className="flex items-center space-x-3">
//                             <FaCalendarAlt className="text-blue-500" />
//                             <span className="truncate">Visit Date: {patientDetails?.visit?.visitDate}</span>
//                         </div>
//                         <div className="flex items-center space-x-3">
//                             <FaCity className="text-blue-500" />
//                             <span className="truncate">Visit Type: {patientDetails?.visit?.visitType}</span>
//                         </div>
//                         <div className="flex items-center space-x-3">
//                             <FaCity className="text-blue-500" />
//                             <span className="truncate">Visit Status: {patientDetails?.visit?.visitStatus}</span>
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             <section className="container mx-auto px-2 sm:px-4 lg:px-6 py-2">
//                 <div className="bg-white p-6 rounded-lg shadow-lg">
//                     {/* Tests Section */}
//                     <div className="mb-8">
//                         <h2 className="font-semibold text-lg text-gray-800 mb-4 border-b pb-2">Tests</h2>
//                         <table className="w-full text-sm">
//                             <thead>
//                                 <tr className="bg-primary-light text-white">
//                                     <th className="p-3 text-left">Test Name</th>
//                                     <th className="p-3 text-right">Price</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {tests.map((test) => (
//                                     <tr key={test.id} className="border-b hover:bg-gray-50 transition duration-300">
//                                         <td className="p-3">{test.name}</td>
//                                         <td className="p-3 text-right text-gray-700">₹{test.price.toFixed(2)}</td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>

//                     {/* Packages Section */}
//                     <div>
//                         <h2 className="font-semibold text-lg text-gray-800 mb-4 border-b pb-2">Health Packages</h2>
//                         <table className="w-full text-sm">
//                             <thead>
//                                 <tr className="bg-primary-light text-white">
//                                     <th className="p-3 text-left">Package Name</th>
//                                     <th className="p-3 text-right">Price</th>
//                                     <th className="p-3 text-right">Discount</th>
//                                     <th className="p-3 text-right">Net Price</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {healthPackage?.map((pkg) => (
//                                     <React.Fragment key={pkg.id}>
//                                         <tr className="border-b hover:bg-gray-50 transition duration-300">
//                                             <td className="p-3">{pkg.packageName}</td>
//                                             <td className="p-3 text-right text-gray-700">₹{pkg.price.toFixed(2)}</td>
//                                             <td className="p-3 text-right text-red-600">- ₹{pkg.discount.toFixed(2)}</td>
//                                             <td className="p-3 text-right text-green-600 font-semibold">
//                                                 ₹{(pkg.price - pkg.discount).toFixed(2)}
//                                             </td>
//                                         </tr>
//                                         {/* Tests in Package */}
//                                         <tr>
//                                             <td colSpan={4} className="p-3 bg-gray-50">
//                                                 <ul className="list-decimal list-inside space-y-2">
//                                                     {pkg.tests.map((test, index) => (
//                                                         <li
//                                                             key={test.id}
//                                                             className="flex justify-between items-center text-gray-600"
//                                                         >
//                                                             <div className="flex items-center space-x-2">
//                                                                 <span className="font-medium">{index + 1}.</span>
//                                                                 <span className="font-medium">{test.name}</span>
//                                                                 <span className="text-gray-500">({test.category})</span>
//                                                             </div>
//                                                             <span className="text-gray-700">₹{test.price.toFixed(2)}</span>
//                                                         </li>
//                                                     ))}
//                                                 </ul>
//                                             </td>
//                                         </tr>
//                                     </React.Fragment>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </section>


//             <section className="container mx-auto px-2 sm:px-4 lg:px-6 py-2">
//                 <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
//                     {/* Billing Details Title */}
//                     <h2 className="text-sm font-semibold text-gray-800 mb-4 border-b pb-2">Billing Details</h2>

//                     {/* Billing Details Content in Two Columns */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         {[
//                             { label: "Billing ID", value: patientDetails?.visit?.billing?.billingId },
//                             { label: "Payment Status", value: patientDetails?.visit?.billing?.paymentStatus },
//                             { label: "Payment Method", value: patientDetails?.visit?.billing?.paymentMethod },
//                             { label: "Payment Date", value: patientDetails?.visit?.billing?.paymentDate },
//                             { label: "Discount", value: patientDetails?.visit?.billing?.discount },
//                             { label: "GST Rate", value: patientDetails?.visit?.billing?.gstRate },
//                             { label: "GST Amount", value: patientDetails?.visit?.billing?.gstAmount },
//                             { label: "CGST Amount", value: patientDetails?.visit?.billing?.cgstAmount },
//                             { label: "SGST Amount", value: patientDetails?.visit?.billing?.sgstAmount },
//                             { label: "IGST Amount", value: patientDetails?.visit?.billing?.igstAmount },
//                             { label: "Net Amount", value: patientDetails?.visit?.billing?.netAmount },
//                         ].map((item, idx) => (
//                             <div key={idx} className="flex justify-between items-center py-2">
//                                 <span className="text-xs font-medium text-gray-600">{item.label}</span>
//                                 <span className="text-xs text-gray-800">{item.value}</span>
//                             </div>
//                         ))}
//                     </div>

//                     {/* Footer Section */}
//                     <div className="mt-6 text-center text-xs text-gray-500">
//                         <p>For inquiries, please contact us at <span className="font-medium text-blue-600">support@company.com</span></p>
//                     </div>
//                 </div>
//             </section>



//             {/*  */}
//         </>
//     );
// };

// export default Page;
















'use client';

import React, { useState, useEffect } from 'react';
import { getTestById } from '@/../services/testService';
import { doctorGetById } from '@/../services/doctorServices';
import { getHealthPackageById } from '@/../services/packageServices';
import { getInsuranceById } from '@/../services/insuranceService';

import { Patient } from '@/types/patient/patient';
import { TestList } from '@/types/test/testlist';
import { Doctor } from '@/types/doctor/doctor';
import { Packages } from '@/types/package/package';
import { Insurance } from '@/types/insurance/insurance';
import { useLabs } from '@/context/LabContext';
import {
    FaUser, FaEnvelope, FaTint, FaMapMarkerAlt, FaBirthdayCake, FaPhone, FaMapPin, FaRegBuilding
    , FaUserMd, FaNotesMedical, FaDollarSign, FaMoneyBillWave,FaFileInvoice, FaCreditCard, FaRegMoneyBillAlt, FaCalendarAlt, FaPercent, FaCity
} from 'react-icons/fa';

const Page = () => {
    const { currentLab, patientDetails } = useLabs();
    const [tests, setTests] = useState<TestList[]>([]);
    const [doctor, setDoctor] = useState<Doctor>();
    const [healthPackage, setHealthPackage] = useState<Packages[]>();
    // const [insurance, setInsurance] = useState<string[]>();


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

                    // Extract the `data` property from each healthPackage object
                    const healthPackageData = healthPackageResults
                        .filter((healthPackage) => healthPackage !== null) // Filter out null values
                        .map((healthPackage) => healthPackage.data);       // Extract the `data` property

                    // Set the extracted `data` objects as the new healthPackage state
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


    // Helper function to calculate age
    const calculateAge = (dateOfBirth: string) => {
        const birthDate = new Date(dateOfBirth);
        const currentDate = new Date();
        const age = currentDate.getFullYear() - birthDate.getFullYear();
        const month = currentDate.getMonth();
        if (month < birthDate.getMonth() || (month === birthDate.getMonth() && currentDate.getDate() < birthDate.getDate())) {
            return age - 1;
        }
        return age;
    };


    return (
        <>
            {/* Compact letterhead-style lab details */}
            <section className="container mx-auto px-4 py-4">
                <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                    {/* Header Section: Logo + Lab Info */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            {/* Logo Placeholder */}
                            <div className="w-12 h-12 bg-primary-light flex justify-center items-center rounded-full mr-3">
                                <span className="text-xs font-bold text-white">Logo</span>
                            </div>
                            <div>
                                <h1 className="text-sm font-semibold text-gray-800">Lab Details</h1>
                                <p className="text-xs text-gray-600">Receipt</p>
                            </div>
                        </div>
                        <div className="text-xs text-gray-600">
                            <p>GSTN: 123456789</p>
                        </div>
                    </div>

                    {/* Lab Details */}
                    <div className="space-y-2">
                        {/* Lab Name */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <FaRegBuilding size={12} className="text-primary-light" />
                                <p className="text-xs text-gray-800">Lab Name:</p>
                            </div>
                            <p className="text-xs text-gray-800">{currentLab?.name}</p>
                        </div>

                        {/* Address */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <FaMapMarkerAlt size={12} className="text-primary-light" />
                                <p className="text-xs text-gray-800">Address:</p>
                            </div>
                            <p className="text-xs text-gray-800">
                                {currentLab?.address}, {currentLab?.city}, {currentLab?.state}
                            </p>
                        </div>

                        {/* Phone */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <FaPhone size={12} className="text-primary-light" />
                                <p className="text-xs text-gray-800">Phone:</p>
                            </div>
                            <p className="text-xs text-gray-800">+91 13212638461233</p>
                        </div>

                        {/* Email */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <FaEnvelope size={12} className="text-primary-light" />
                                <p className="text-xs text-gray-800">Email:</p>
                            </div>
                            <p className="text-xs text-gray-800">lab@gmail.com</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Compact letterhead-style patient details */}
            <section className="container mx-auto px-4 py-4">
                <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                    {/* Patient Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-gray-600">
                        {[
                            { icon: <FaUser className="text-primary-light" />, label: `${patientDetails?.firstName} ${patientDetails?.lastName}` },
                            { icon: <FaEnvelope className="text-primary-light" />, label: patientDetails?.email },
                            { icon: <FaTint className="text-primary-light" />, label: patientDetails?.bloodGroup },
                            { icon: <FaCity className="text-primary-light" />, label: patientDetails?.city },
                            { icon: <FaMapMarkerAlt className="text-primary-light" />, label: patientDetails?.address },
                            { icon: <FaBirthdayCake className="text-primary-light" />, label: `${calculateAge(patientDetails?.dateOfBirth ?? '')} years` },
                            { icon: <FaPhone className="text-primary-light" />, label: patientDetails?.phone },
                            { icon: <FaMapPin className="text-primary-light" />, label: patientDetails?.zip },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                                {item.icon}
                                <span className="truncate">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Doctor & Visit Details */}
            <section className="container mx-auto px-4 py-4">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h1 className="text-sm font-semibold text-gray-800 mb-4 border-b pb-3">Doctor & Visit Details</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-gray-600">
                        {/* Doctor Info */}
                        <div className="flex items-center space-x-2">
                            <FaUserMd className="text-green-500" />
                            <span>{doctor?.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FaEnvelope className="text-green-500" />
                            <span>{doctor?.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FaPhone className="text-green-500" />
                            <span>{doctor?.phone}</span>
                        </div>

                        {/* Visit Info */}
                        <div className="flex items-center space-x-2">
                            <FaNotesMedical className="text-blue-500" />
                            <span>Visit ID: {patientDetails?.visit?.visitId}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FaCalendarAlt className="text-blue-500" />
                            <span>Visit Date: {patientDetails?.visit?.visitDate}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FaCity className="text-blue-500" />
                            <span>Visit Type: {patientDetails?.visit?.visitType}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FaCity className="text-blue-500" />
                            <span>Visit Status: {patientDetails?.visit?.visitStatus}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tests & Packages Section */}
            <section className="container mx-auto px-4 py-4">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    {/* Tests Section */}
                    <div className="mb-8">
                        <h2 className="font-semibold text-lg text-gray-800 mb-4 border-b pb-2">Tests</h2>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-primary-light text-white">
                                    <th className="p-3 text-left">Test Name</th>
                                    <th className="p-3 text-right">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tests.map((test) => (
                                    <tr key={test.id} className="border-b hover:bg-gray-50 transition duration-300">
                                        <td className="p-3">{test.name}</td>
                                        <td className="p-3 text-right text-gray-700">₹{test.price.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Packages Section */}
                    <div>
                        <h2 className="font-semibold text-lg text-gray-800 mb-4 border-b pb-2">Health Packages</h2>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-primary-light text-white">
                                    <th className="p-3 text-left">Package Name</th>
                                    <th className="p-3 text-right">Price</th>
                                    <th className="p-3 text-right">Discount</th>
                                    <th className="p-3 text-right">Net Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {healthPackage?.map((pkg) => (
                                    <React.Fragment key={pkg.id}>
                                        <tr className="border-b hover:bg-gray-50 transition duration-300">
                                            <td className="p-3">{pkg.packageName}</td>
                                            <td className="p-3 text-right text-gray-700">₹{pkg.price.toFixed(2)}</td>
                                            <td className="p-3 text-right text-red-600">- ₹{pkg.discount.toFixed(2)}</td>
                                            <td className="p-3 text-right text-green-600 font-semibold">
                                                ₹{(pkg.price - pkg.discount).toFixed(2)}
                                            </td>
                                        </tr>
                                        {/* Tests in Package */}
                                        <tr>
                                            <td colSpan={4} className="p-3 bg-gray-50">
                                                <ul className="list-decimal list-inside space-y-2">
                                                    {pkg.tests.map((test, index) => (
                                                        <li
                                                            key={test.id}
                                                            className="flex justify-between items-center text-gray-600"
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                <span className="font-medium">{index + 1}.</span>
                                                                <span className="font-medium">{test.name}</span>
                                                                <span className="text-gray-500">({test.category})</span>
                                                            </div>
                                                            <span className="text-gray-700">₹{test.price.toFixed(2)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Billing Details */}
            <section className="container mx-auto px-2 sm:px-4 lg:px-6 py-2">
                <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                    {/* Billing Details Title */}
                    <h2 className="text-sm font-semibold text-gray-800 mb-4 border-b pb-2">Billing Details</h2>

                    {/* Billing Details Content in Two Columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            {
                                icon: <FaFileInvoice className="text-primary-light" />,
                                label: 'Billing ID',
                                value: patientDetails?.visit?.billing?.billingId,
                            },
                            {
                                icon: <FaRegMoneyBillAlt className="text-primary-light" />,
                                label: 'Payment Status',
                                value: patientDetails?.visit?.billing?.paymentStatus,
                            },
                            {
                                icon: <FaCreditCard className="text-primary-light" />,
                                label: 'Payment Method',
                                value: patientDetails?.visit?.billing?.paymentMethod,
                            },
                            {
                                icon: <FaCalendarAlt className="text-primary-light" />,
                                label: 'Payment Date',
                                value: patientDetails?.visit?.billing?.paymentDate,
                            },
                            {
                                icon: <FaPercent className="text-primary-light" />,
                                label: 'Discount',
                                value: patientDetails?.visit?.billing?.discount,
                            },
                            {
                                icon: <FaPercent className="text-primary-light" />,
                                label: 'GST Rate',
                                value: patientDetails?.visit?.billing?.gstRate,
                            },
                            {
                                icon: <FaCity className="text-primary-light" />,
                                label: 'GST Amount',
                                value: patientDetails?.visit?.billing?.gstAmount,
                            },
                            {
                                icon: <FaCity className="text-primary-light" />,
                                label: 'CGST Amount',
                                value: patientDetails?.visit?.billing?.cgstAmount,
                            },
                            {
                                icon: <FaCity className="text-primary-light" />,
                                label: 'SGST Amount',
                                value: patientDetails?.visit?.billing?.sgstAmount,
                            },
                            {
                                icon: <FaCity className="text-primary-light" />,
                                label: 'IGST Amount',
                                value: patientDetails?.visit?.billing?.igstAmount,
                            },
                            {
                                icon: <FaCity className="text-primary-light" />,
                                label: 'Net Amount',
                                value: patientDetails?.visit?.billing?.netAmount,
                            },
                            {
                                icon: <FaCity className="text-primary-light" />,
                                label: 'Total Amount',
                                value: patientDetails?.visit?.billing?.totalAmount,
                            },
                            

                        ].map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center py-2">
                                <div className="flex items-center space-x-2">
                                    {item.icon}
                                    <span className="text-xs font-medium text-gray-600">{item.label}</span>
                                </div>
                                <span className="text-xs text-gray-800">{item.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Footer Section */}
                    <div className="mt-6 text-center text-xs text-gray-500">
                        <p>
                            For inquiries, please contact us at{' '}
                            <span className="font-medium text-blue-600">support@company.com</span>
                        </p>
                    </div>
                </div>
            </section>
        </>



    );
};

export default Page;

