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
import { calculateAge } from '@/utils/ageUtils';
import { FaUser, FaEnvelope, FaTint, FaCity, FaMapMarkerAlt, FaBirthdayCake, FaPhone, FaMapPin, FaUserMd, FaShieldAlt, FaNotesMedical } from 'react-icons/fa';
import Button from '../../../common/Button';
import { IoPrintOutline } from 'react-icons/io5';
import { FaDollarSign, FaCalendarAlt } from 'react-icons/fa';

interface PatientVisitDetailsProps {
    patinetVisitDetails: Patient;
}

const PatientVisitDetails = ({ patinetVisitDetails }: PatientVisitDetailsProps) => {
    const [patientVisitDetails, setPatientVisitDetails] = useState<Patient>();
    const [tests, setTests] = useState<TestList[]>([]);
    const [doctor, setDoctor] = useState<Doctor>();
    const [healthPackage, setHealthPackage] = useState<Packages[]>();
    const [insurance, setInsurance] = useState<Insurance[]>();
    const { currentLab } = useLabs();

    useEffect(() => {
        setPatientVisitDetails(patinetVisitDetails);

        const fetchTests = async () => {
            try {
                if (patinetVisitDetails?.visit?.testIds?.length && currentLab?.id) {
                    const testPromises = patinetVisitDetails.visit.testIds.map((id) =>
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
                if (patinetVisitDetails?.visit?.doctorId && currentLab?.id) {
                    // const doctorResult = await doctorGetById(currentLab.id.toString(), patinetVisitDetails.visit.doctorId);
                    const doctorResult = await doctorGetById(currentLab.id.toString(), Number(patinetVisitDetails.visit.doctorId));
                    setDoctor(doctorResult.data);
                }
            } catch (error) {
                console.error('Error fetching doctor:', error);
            }
        };

        const fetchHealthPackage = async () => {
            try {
                if (patinetVisitDetails?.visit?.packageIds?.length && currentLab?.id) {
                    const healthPackagePromises = patinetVisitDetails.visit.packageIds.map((id) =>
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




        const fetchInsurance = async () => {
            try {
                if (patinetVisitDetails?.visit?.insuranceIds?.length && currentLab?.id) {
                    const insurancePromises = patinetVisitDetails.visit.insuranceIds.map((id) =>
                        id !== undefined ? getInsuranceById(currentLab.id, id) : Promise.resolve(null)
                    );
                    const insuranceResults = await Promise.all(insurancePromises);

                    // Extract the `data` property from each insurance object
                    const insuranceData = insuranceResults
                        .filter((insurance) => insurance !== null) // Filter out null values
                        .map((insurance) => insurance);       // Extract the `data` property

                    // Set the extracted `data` objects as the new insurance state
                    setInsurance(insuranceData as Insurance[]);
                }
            } catch (error) {
                console.error("Error fetching insurance:", error);
            }
        };


        fetchTests();
        fetchDoctor();
        fetchHealthPackage();
        fetchInsurance();
    }, [patinetVisitDetails, currentLab]);


   



    return (

        <>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 overflow-y-auto max-h-screen">
                {/* Patient Details */}
                <section className="p-6 bg-white rounded-lg shadow-md mb-6 lg:col-span-4">
                    <h1 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-3">Patient Details</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-gray-600">
                        {[
                            { icon: <FaUser className="text-blue-500" />, label: `${patientVisitDetails?.firstName} ${patientVisitDetails?.lastName}` },
                            { icon: <FaEnvelope className="text-blue-500" />, label: patientVisitDetails?.email },
                            { icon: <FaTint className="text-blue-500" />, label: patientVisitDetails?.bloodGroup },
                            { icon: <FaCity className="text-blue-500" />, label: patientVisitDetails?.city },
                            { icon: <FaMapMarkerAlt className="text-blue-500" />, label: patientVisitDetails?.address },
                            { icon: <FaBirthdayCake className="text-blue-500" />, label: `${calculateAge(patientVisitDetails?.dateOfBirth ?? '')} years` },
                            { icon: <FaPhone className="text-blue-500" />, label: patientVisitDetails?.phone },
                            { icon: <FaMapPin className="text-blue-500" />, label: patientVisitDetails?.zip },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center space-x-3">
                                {item.icon}
                                <span className="truncate">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Insurance Details */}
                <section className="p-6 bg-white rounded-lg shadow-md mb-6 lg:col-span-1">
                    <h1 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-3">Insurance Details</h1>
                    {(insurance ?? []).length > 0 ? (
                        <div className="space-y-2 text-sm text-gray-600">
                            {(insurance ?? []).map((ins) => (
                                <div key={ins.id} className="flex items-center space-x-3">
                                    <FaShieldAlt className="text-green-500" />
                                    <span className="truncate">{ins?.name}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No insurance details found</p>
                    )}
                </section>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Doctor Details */}
                <section className="col-span-1 p-4 bg-white rounded-md shadow-md">
                    <h1 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-3">Doctor Details</h1>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                            <FaUserMd className="text-green-500" />
                            <span className="truncate">{doctor?.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FaEnvelope className="text-green-500" />
                            <span className="truncate">{doctor?.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FaPhone className="text-green-500" />
                            <span className="truncate">{doctor?.phone}</span>
                        </div>
                    </div>
                </section>

                {/* Visit Details */}
                <section className="col-span-3 p-4 bg-white rounded-md shadow-md">
                    <h1 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-3">Visit Details</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                        {[
                            { icon: <FaNotesMedical className="text-blue-500" />, label: `Visit ID: ${patientVisitDetails?.visit?.visitId}` },
                            { icon: <FaCalendarAlt className="text-blue-500" />, label: `Visit Date: ${patientVisitDetails?.visit?.visitDate}` },
                            { icon: <FaCity className="text-blue-500" />, label: `Visit Type: ${patientVisitDetails?.visit?.visitType}` },
                            { icon: <FaCity className="text-blue-500" />, label: `Visit Status: ${patientVisitDetails?.visit?.visitStatus}` },
                            { icon: <FaDollarSign className="text-blue-500" />, label: `Total Amount: ₹${patientVisitDetails?.visit?.billing?.totalAmount}` },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                                {item.icon}
                                <span className="truncate">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>



            {/* Tests, Packages, and Billing */}
            <section className="p-4 bg-white rounded-md shadow-md my-6">
                <h1 className="text-lg font-semibold mb-6 text-gray-800">Tests, Packages, and Billing</h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: Tests and Packages */}
                    <div className="space-y-6">
                        {/* Tests Section */}
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="font-semibold text-xl text-gray-800 mb-6 border-b pb-3">Tests</h2>
                            <table className="w-full text-sm text-gray-700">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600">
                                        <th className="p-4 text-left">Test Name</th>
                                        <th className="p-4 text-right">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tests.map((test) => (
                                        <tr key={test.id} className="border-b hover:bg-gray-50 transition duration-300 ease-in-out">
                                            <td className="p-4">{test.name}</td>
                                            <td className="p-4 text-right text-gray-700">₹{test.price.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>


                        {/* Packages Section */}
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="font-semibold text-xl text-gray-800 mb-6 border-b pb-3">Health Packages</h2>
                            <table className="w-full text-sm text-gray-700">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600">
                                        <th className="p-4 text-left">Package Name</th>
                                        <th className="p-4 text-right">Price</th>
                                        <th className="p-4 text-right">Discount</th>
                                        <th className="p-4 text-right">Net Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {healthPackage?.map((pkg) => (
                                        <React.Fragment key={pkg.id}>
                                            <tr className="border-b hover:bg-gray-50 transition duration-300 ease-in-out">
                                                <td className="p-4">{pkg.packageName}</td>
                                                <td className="p-4 text-right text-gray-700">₹{pkg.price.toFixed(2)}</td>
                                                <td className="p-4 text-right text-red-600">- ₹{pkg.discount.toFixed(2)}</td>
                                                <td className="p-4 text-right text-green-600 font-semibold">
                                                    ₹{(pkg.price - pkg.discount).toFixed(2)}
                                                </td>
                                            </tr>

                                            {/* Tests Section */}
                                            <tr>
                                                <td colSpan={4} className="p-4 text-gray-600">
                                                    <div className="ml-8 space-y-2">
                                                        <ul className="list-decimal list-inside text-sm">
                                                            {pkg.tests.map((test, index) => (
                                                                <li key={test.id} className="flex justify-between">
                                                                    <div className="flex items-center">
                                                                        {/* Numbering of tests */}
                                                                        <span className="font-medium mr-2 text-gray-800">{index + 1}.</span>
                                                                        <span className="font-medium">{test.name}</span>
                                                                        <span className="text-gray-500"> ({test.category})</span>
                                                                    </div>
                                                                    <span className="text-gray-700">₹{test.price.toFixed(2)}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </div>

                    {/* Right Column: Billing Details */}
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h2 className="font-semibold text-lg text-gray-800 mb-4 border-b pb-2">Billing Details</h2>
                        <div className="space-y-2">
                            {[
                                { label: "Billing ID", value: patientVisitDetails?.visit?.billing?.billingId },
                                { label: "Payment Status", value: patientVisitDetails?.visit?.billing?.paymentStatus },
                                { label: "Payment Method", value: patientVisitDetails?.visit?.billing?.paymentMethod },
                                { label: "Payment Date", value: patientVisitDetails?.visit?.billing?.paymentDate },
                                { label: "Discount", value: patientVisitDetails?.visit?.billing?.discount },
                                { label: "Net Amount", value: patientVisitDetails?.visit?.billing?.netAmount },
                            ].map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-sm font-medium text-gray-800">{item.label}</span>
                                    <span className="text-sm text-gray-700">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Print Button */}
            <section className="p-2 bg-white rounded-md flex justify-end">
                <Button
                    text="Print"
                    className="bg-primary-light text-white"
                    onClick={() => window.print()}
                >
                    <IoPrintOutline className="mr-2" />
                </Button>
            </section>
        </>

    );
};

export default PatientVisitDetails;













