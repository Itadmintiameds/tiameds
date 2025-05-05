'use client';
import {
  CalendarIcon, HashIcon,
  MailIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  PrinterIcon,
  TrashIcon,
  UserIcon
} from 'lucide-react';

import { ArrowLeftIcon } from '@heroicons/react/24/solid';

import {
  FaCalendarAlt,
  FaCity,
  FaCreditCard,
  FaFileInvoice,
  FaPercent,
  FaRegMoneyBillAlt
} from 'react-icons/fa';

import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaRegBuilding
} from 'react-icons/fa';

import { useLabs } from '@/context/LabContext';
import { GrStatusInfoSmall } from "react-icons/gr";
import Button from '../../component/common/Button';

import { Doctor } from '@/types/doctor/doctor';
import { Packages } from '@/types/package/package';
import { TestList } from '@/types/test/testlist';
import React, { useEffect, useState } from 'react';

import { doctorGetById } from '@/../services/doctorServices';
import { getHealthPackageById } from '@/../services/packageServices';
import { getTestById } from '@/../services/testService';
import { FaUserDoctor } from "react-icons/fa6";
import Modal from '../../component/common/Model';
import PrintBill from '../patients/_component/PrintBill';


interface Test {
  name: string;
  category: string;
  price: number;
}
// Type for a single health package
interface HealthPackage {
  packageName: string;
  price: number;
  discount: number;
  netPrice: number;
  tests: Test[];
}

// Type for lab details
interface LabDetails {
  logo: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  gstn: string;
  invoiceId: string;
}

// Type for patient details
interface PatientDetails {
  name: string;
  age: number;
  email: string;
  phone: string;
  address: string;
  bloodGroup: string;
  patientId: string;
  Gender: string;
}

// Type for the bill object
interface Bill {
  lab: LabDetails;
  totalAmount: number;
  discount: number;
  gstRate: number;
  gstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  netAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  paymentDate: string;
  tests: Test[];
  healthPackages: HealthPackage[] | undefined; // Since `healthPackage` may be undefined
  patient: PatientDetails;
}



const Page = () => {
  const { currentLab, patientDetails } = useLabs();
  const [tests, setTests] = useState<TestList[]>([]);
  const [doctor, setDoctor] = useState<Doctor>();
  const [healthPackage, setHealthPackage] = useState<Packages[]>();
  const [billingData, setBillingData] = useState<Bill | null>(null);

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

  // const bill = {
  //   // Lab Details
  //   lab: {
  //     logo: currentLab?.logo ?? 'N/A',
  //     name: currentLab?.name || 'N/A',
  //     address: `${currentLab?.address || 'N/A'}, ${currentLab?.city || 'N/A'}, ${currentLab?.state || 'N/A'}`,
  //     //hardcoded value 
  //     phone: 'N/A',
  //     email: 'N/A',
  //     gstn: 'N/A',
  //     invoiceId: (patientDetails?.visit?.visitId || 'N/A').toString(),
  //   },

  //   // Billing Details
  //   billingId: patientDetails?.visit?.billing?.billingId || 'N/A',
  //   paymentStatus: patientDetails?.visit?.billing?.paymentStatus || 'N/A',
  //   paymentMethod: patientDetails?.visit?.billing?.paymentMethod || 'N/A',
  //   paymentDate: patientDetails?.visit?.billing?.paymentDate || 'N/A',
  //   discount: patientDetails?.visit?.billing?.discount || '0%',
  //   gstRate: patientDetails?.visit?.billing?.gstRate || 'N/A',
  //   gstAmount: patientDetails?.visit?.billing?.gstAmount || '₹0.00',
  //   cgstAmount: patientDetails?.visit?.billing?.cgstAmount || '₹0.00',
  //   sgstAmount: patientDetails?.visit?.billing?.sgstAmount || '₹0.00',
  //   igstAmount: patientDetails?.visit?.billing?.igstAmount || '₹0.00',
  //   netAmount: patientDetails?.visit?.billing?.netAmount || '₹0.00',
  //   totalAmount: patientDetails?.visit?.billing?.totalAmount || '₹0.00',

  //   // Tests
  //   tests: tests.map((test) => ({
  //     name: test.name,
  //     price: test.price.toFixed(2),
  //   })),

  //   // Health Packages
  //   healthPackages: healthPackage?.map((pkg) => ({
  //     packageName: pkg.packageName,
  //     price: pkg.price.toFixed(2),
  //     discount: pkg.discount.toFixed(2),
  //     netPrice: (pkg.price - pkg.discount).toFixed(2),
  //     tests: pkg.tests.map((test) => ({
  //       name: test.name,
  //       category: test.category,
  //       price: test.price.toFixed(2),
  //     })),
  //   })),

  //   // Patient Details
  //   patient: {
  //     name: `${patientDetails?.firstName || ''} ${patientDetails?.lastName || ''}`,
  //     age: calculateAge(patientDetails?.dateOfBirth || ''),
  //     email: patientDetails?.email || 'N/A',
  //     phone: patientDetails?.phone || 'N/A',
  //     address: `${patientDetails?.address || 'N/A'}, ${patientDetails?.city || 'N/A'}, ${patientDetails?.state || 'N/A'}, ${patientDetails?.zip || 'N/A'}`,
  //     bloodGroup: patientDetails?.bloodGroup || 'N/A',
  //     patientId: (patientDetails?.id || 'N/A').toString(),
  //     Gender: patientDetails?.gender || 'N/A',
  //   },
  // };

  const handlePrint = () => {
    setBillingData({
      lab: {
        name: currentLab?.name || 'N/A',
        address: `${currentLab?.address || 'N/A'}, ${currentLab?.city || 'N/A'}, ${currentLab?.state || 'N/A'}`,
        phone: 'N/A',
        email: 'N/A',
        gstn: 'N/A',
        invoiceId: (patientDetails?.visit?.visitId || 'N/A').toString(),
        logo: currentLab?.logo || 'N/A',
      },
      totalAmount: patientDetails?.visit?.billing?.totalAmount || 0,
      discount: patientDetails?.visit?.billing?.discount || 0,
      gstRate: patientDetails?.visit?.billing?.gstRate || 0,
      gstAmount: patientDetails?.visit?.billing?.gstAmount || 0,
      cgstAmount: patientDetails?.visit?.billing?.cgstAmount || 0,
      sgstAmount: patientDetails?.visit?.billing?.sgstAmount || 0,
      netAmount: patientDetails?.visit?.billing?.netAmount || 0,
      paymentStatus: patientDetails?.visit?.billing?.paymentStatus || 'N/A',
      paymentMethod: patientDetails?.visit?.billing?.paymentMethod || 'N/A',
      paymentDate: patientDetails?.visit?.billing?.paymentDate || 'N/A',
      tests: tests.map((test) => ({
        name: test.name,
        price: test.price,
        category: test.category,

      })),
      healthPackages: healthPackage?.map((pkg) => ({
        packageName: pkg.packageName,
        price: pkg.price,
        discount: pkg.discount,
        netPrice: pkg.price - pkg.discount,
        tests: pkg.tests.map((test) => ({
          name: test.name,
          category: test.category,
          price: test.price,
        })),
      })),
      patient: {
        name: `${patientDetails?.firstName || ''} ${patientDetails?.lastName || ''}`,
        age: calculateAge(patientDetails?.dateOfBirth || ''),
        email: patientDetails?.email || 'N/A',
        phone: patientDetails?.phone || 'N/A',
        address: `${patientDetails?.address || 'N/A'}, ${patientDetails?.city || 'N/A'}, ${patientDetails?.state || 'N/A'}, ${patientDetails?.zip || 'N/A'}`,
        bloodGroup: patientDetails?.bloodGroup || 'N/A',
        patientId: (patientDetails?.id || 'N/A').toString(),
        Gender: patientDetails?.gender || 'N/A',
    }
    });
  };
  return (
    <>
      <div className="flex justify-end items-center sticky top-0 z-10 ">
        <ArrowLeftIcon
          className="h-5 w-5 text-textwhite font-bold animate-bounce text-xl cursor-pointer bg-primary rounded-full p-1"
          onClick={() => window.history.back()}
        />
      </div>
      <section className="container mx-auto py-8 px-6">
        <section className="container mx-auto my-2  rounded-lg shadow-lg">
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

        {/* Patient Information */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-white p-6 rounded-lg shadow-lg">
          {/* Name */}
          <div className="flex items-center space-x-4">
            <UserIcon size={24} className="text-blue-600" />
            <div>
              <p className="text-xs font-semibold text-gray-600">Patient Name</p>
              <p className="text-sm font-medium text-gray-900">{`${patientDetails?.firstName || ''} ${patientDetails?.lastName || ''}`}</p>
            </div>
          </div>
          {/* Age */}
          <div className="flex items-center space-x-4">
            <CalendarIcon size={24} className="text-yellow-600" />
            <div>
              <p className="text-xs font-semibold text-gray-600">Age</p>
              <p className="text-sm font-medium text-gray-900">{calculateAge(patientDetails?.dateOfBirth || '')}</p>
            </div>
          </div>

          {/* Gender */}
          <div className="flex items-center space-x-4">
            <UserIcon size={24} className="text-pink-600" />
            <div>
              <p className="text-xs font-semibold text-gray-600">Gender</p>
              <p className="text-sm font-medium text-gray-900">{patientDetails?.gender}</p>
            </div>
          </div>

          {/* Patient ID */}
          <div className="flex items-center space-x-4">
            <HashIcon size={24} className="text-purple-600" />
            <div>
              <p className="text-xs font-semibold text-gray-600">Patient ID</p>
              <p className="text-sm font-medium text-gray-900">{patientDetails?.id}</p>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-center space-x-4">
            <MapPinIcon size={24} className="text-green-600" />
            <div>
              <p className="text-xs font-semibold text-gray-600">Address</p>
              <p className="text-sm font-medium text-gray-900">{`${patientDetails?.address}, ${patientDetails?.city}, ${patientDetails?.state}, ${patientDetails?.zip}`}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center space-x-4">
            <PhoneIcon size={24} className="text-red-600" />
            <div>
              <p className="text-xs font-semibold text-gray-600">Phone</p>
              <p className="text-sm font-medium text-gray-900">{patientDetails?.phone}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center space-x-4">
            <MailIcon size={24} className="text-indigo-600" />
            <div>
              <p className="text-xs font-semibold text-gray-600">Email</p>
              <p className="text-sm font-medium text-gray-900">{patientDetails?.email}</p>
            </div>
          </div>

          {/* Blood Group */}
          <div className="flex items-center space-x-4">
            <UserIcon size={24} className="text-yellow-600" />
            <div>
              <p className="text-xs font-semibold text-gray-600">Blood Group</p>
              <p className="text-sm font-medium text-gray-900">{patientDetails?.bloodGroup}</p>
            </div>
          </div>
        </section>

        {/* Visit Details */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-white p-6 rounded-lg shadow-lg my-2">
          {/* Doctor Name */}
          <div className="flex items-center space-x-4">
            <FaUserDoctor size={24} className="text-green-600" />
            <div>
              <p className="text-xs font-semibold text-gray-600">Doctor Name</p>
              <p className="text-sm font-medium text-gray-900">{doctor?.name || ''}</p>
            </div>
          </div>

          {/* Doctor Email */}
          <div className="flex items-center space-x-4">
            <MailIcon size={24} className="text-green-600" />
            <div>
              <p className="text-xs font-semibold text-gray-600">Email</p>
              <p className="text-sm font-medium text-gray-900">{doctor?.email || ''}</p>
            </div>
          </div>

          {/* Doctor Phone */}
          <div className="flex items-center space-x-4">
            <PhoneIcon size={24} className="text-green-600" />
            <div>
              <p className="text-xs font-semibold text-gray-600">Phone</p>
              <p className="text-sm font-medium text-gray-900">{doctor?.phone || ''}</p>
            </div>
          </div>

          {/* Visit ID */}
          <div className="flex items-center space-x-4">
            <HashIcon size={24} className="text-blue-600" />
            <div>
              <p className="text-xs font-semibold text-gray-600">Visit ID</p>
              <p className="text-sm font-medium text-gray-900">{patientDetails?.visit?.visitId || ''}</p>
            </div>
          </div>

          {/* Visit Date */}
          <div className="flex items-center space-x-4">
            <CalendarIcon size={24} className="text-blue-600" />
            <div>
              <p className="text-xs font-semibold text-gray-600">Visit Date</p>
              <p className="text-sm font-medium text-gray-900">{patientDetails?.visit?.visitDate || ''}</p>
            </div>
          </div>

          {/* Visit Type */}
          <div className="flex items-center space-x-4">
            <MapPinIcon size={24} className="text-blue-600" />
            <div>
              <p className="text-xs font-semibold text-gray-600">Visit Type</p>
              <p className="text-sm font-medium text-gray-900">{patientDetails?.visit?.visitType || ''}</p>
            </div>
          </div>

          {/* Visit Status */}
          <div className="flex items-center space-x-4">
            <GrStatusInfoSmall size={24} className="text-blue-600" />
            <div>
              <p className="text-xs font-semibold text-gray-600">Visit Status</p>
              <p className="text-sm font-medium text-gray-900">{patientDetails?.visit?.visitStatus || ''}</p>
            </div>
          </div>
        </section>

        {/* Test Details */}
        <section className="grid grid-cols-1 gap-6 bg-white p-6 rounded-lg shadow-lg">
          {/* Tests Section */}
          <div>
            <h2 className="text-sm font-semibold text-gray-600 border-b pb-2 mb-4">Tests</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary text-slate-100">
                  <th className="p-3 text-left font-medium">Test Name</th>
                  <th className="p-3 text-right font-medium">Price (₹)</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test) => (
                  <tr key={test.id} className="border-b hover:bg-gray-50 transition duration-300">
                    <td className="p-3 text-gray-800">{test.name}</td>
                    <td className="p-3 text-right text-gray-700">₹{test.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Health Packages Section */}
          <div className=''>
            <h2 className="text-sm font-semibold text-gray-600 border-b pb-2 mb-4">Health Packages</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary text-slate-100">
                  <th className="p-3 text-left font-medium">Package Name</th>
                  <th className="p-3 text-right font-medium">Price (₹)</th>
                  <th className="p-3 text-right font-medium">Discount (₹)</th>
                  <th className="p-3 text-right font-medium">Net Price (₹)</th>
                </tr>
              </thead>
              <tbody>
                {healthPackage?.map((pkg) => (
                  <React.Fragment key={pkg.id}>
                    <tr className="border-b hover:bg-gray-50 transition duration-300">
                      <td className="p-3 text-gray-800">{pkg.packageName}</td>
                      <td className="p-3 text-right text-gray-700">₹{pkg.price.toFixed(2)}</td>
                      <td className="p-3 text-right text-red-600">-₹{pkg.discount.toFixed(2)}</td>
                      <td className="p-3 text-right text-green-600 font-semibold">
                        ₹{(pkg.price - pkg.discount).toFixed(2)}
                      </td>
                    </tr>
                    {/* Tests in Package */}
                    <tr>
                      <td colSpan={4} className="p-3 bg-gray-50">
                        <ul className="space-y-2">
                          {pkg.tests.map((test, index) => (
                            <li key={test.id} className="flex justify-between items-center text-gray-600">
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
        </section>

        {/* Payment Summary */}
        <section className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 my-4">
          {/* Billing Details Title */}
          <h2 className="text-sm font-semibold text-gray-600 mb-4 border-b pb-2">Billing Details</h2>

          {/* Billing Details Content in Two Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: <FaFileInvoice className="text-blue-600" />,
                label: 'Billing ID',
                value: patientDetails?.visit?.billing?.billingId || 'N/A',
              },
              {
                icon: <FaRegMoneyBillAlt className="text-blue-600" />,
                label: 'Payment Status',
                value: patientDetails?.visit?.billing?.paymentStatus || 'N/A',
              },
              {
                icon: <FaCreditCard className="text-blue-600" />,
                label: 'Payment Method',
                value: patientDetails?.visit?.billing?.paymentMethod || 'N/A',
              },
              {
                icon: <FaCalendarAlt className="text-blue-600" />,
                label: 'Payment Date',
                value: patientDetails?.visit?.billing?.paymentDate || 'N/A',
              },
              {
                icon: <FaPercent className="text-blue-600" />,
                label: 'Discount',
                value: patientDetails?.visit?.billing?.discount || '0%',
              },
              {
                icon: <FaPercent className="text-blue-600" />,
                label: 'GST Rate',
                value: patientDetails?.visit?.billing?.gstRate || 'N/A',
              },
              {
                icon: <FaCity className="text-blue-600" />,
                label: 'GST Amount',
                value: patientDetails?.visit?.billing?.gstAmount || '₹0.00',
              },
              {
                icon: <FaCity className="text-blue-600" />,
                label: 'CGST Amount',
                value: patientDetails?.visit?.billing?.cgstAmount || '₹0.00',
              },
              {
                icon: <FaCity className="text-blue-600" />,
                label: 'SGST Amount',
                value: patientDetails?.visit?.billing?.sgstAmount || '₹0.00',
              },
              {
                icon: <FaCity className="text-blue-600" />,
                label: 'IGST Amount',
                value: patientDetails?.visit?.billing?.igstAmount || '₹0.00',
              },
              {
                icon: <FaCity className="text-blue-600" />,
                label: 'Net Amount',
                value: patientDetails?.visit?.billing?.netAmount || '₹0.00',
              },
              {
                icon: <FaCity className="text-blue-600" />,
                label: 'Total Amount',
                value: patientDetails?.visit?.billing?.totalAmount || '₹0.00',
              },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-2">
                <div className="flex items-center space-x-2">
                  {item.icon}
                  <span className="text-sm font-medium text-gray-600">{item.label}</span>
                </div>
                <span className="text-sm text-gray-800 font-semibold">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Footer Section */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>
              For inquiries, please contact us at{' '}
              <a href="mailto:support@company.com" className="font-medium text-blue-600">
                support@company.com
              </a>
            </p>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="mt-6 flex gap-4 text-xs">
          <Button text="Delete" onClick={() => alert('Deleted!')} className="bg-red-500 hover:bg-red-600 text-white">
            <TrashIcon size={16} className="mr-2" />
          </Button>
          <Button text="Edit" onClick={() => alert('Edit Order!')} className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <PencilIcon size={16} className="mr-2" />
          </Button>
          <Button text="Print Bill"
            onClick={() => handlePrint()}
            className="bg-primary hover:bg-secondary text-white">
            <PrinterIcon size={16} className="mr-2" />
          </Button>
        </section>
        {billingData &&
          <Modal
            isOpen={true}
            title="Print Bill"
            modalClassName='max-w-4xl h-[90vh] overflow-y-auto'
            onClose={() => setBillingData(null)}>
            <PrintBill billingData={billingData} />
          </Modal>}
      </section>
    </>
  );
}

export default Page;






