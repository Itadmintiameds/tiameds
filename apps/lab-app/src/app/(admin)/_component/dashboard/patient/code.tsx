import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getTests } from '@/../services/testService';
import { getPackage } from '@/../services/packageServices';
import { getPatient } from '@/../services/patientServices';
import { getDoctor } from '@/../services/doctorServices';
import { getInsurance } from '@/../services/insuranceService';
import { useLabs } from '@/context/LabContext';
import { Patient } from "@/types/patient/patient";
import { TestList } from '@/types/test/testlist';
import { Package } from '@/types/package/package';
import { Doctor } from '@/types/doctor/doctor';
import { Insurance } from '@/types/insurance/insurance';
import Loader from '../../common/Loader';

import { FaUser, FaEnvelope, FaPhone, FaHome, FaCity, FaMapMarkerAlt, FaGlobe, FaTint, FaCalendarAlt } from 'react-icons/fa';

const AddPatient = () => {

  const [tests, setTests] = useState<TestList[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const { currentLab } = useLabs();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [newPatient, setNewPatient] = useState<Patient>({
    id: 0,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    bloodGroup: '',
    dateOfBirth: '',
    visit: {
      visitDate: '',
      visitType: '',
      visitStatus: '',
      visitDescription: '',
      doctorId: 0,
      testIds: [],
      packageIds: [],
      insuranceIds: [],
      billing: {
        totalAmount: 0,
        paymentStatus: '',
        paymentMethod: '',
        paymentDate: '',
        discount: 0,
        gstRate: 0,
        gstAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        netAmount: 0,
      },
    },
  });


  useEffect(() => {
    const labId = currentLab?.id;

    const fetchData = async () => {
      if (labId === undefined) {
        toast.error('Lab ID is undefined.');
        return;
      }

      try {
        const patientData = await getPatient(labId);
        setPatients(patientData?.data || []);

        const testData = await getTests(labId.toString());
        setTests(testData || []);

        const packageData = await getPackage(labId);
        setPackages(packageData?.data || []);

        const doctorData = await getDoctor(labId);
        setDoctors(doctorData?.data || []);

        const insuranceData = await getInsurance(labId);
        setInsurances(insuranceData?.data || []);

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('An error occurred while fetching data.');
      }
    };

    fetchData();
  }, [currentLab]);

  console.log('patients:', patients);
  console.log('tests:', tests);
  console.log('packages:', packages);
  console.log('doctors:', doctors);
  console.log('insurances:', insurances);

  if (!tests || !packages || !doctors || !insurances) {
    return <Loader />;
  }

  return (
    <div>
      {/* patient details  */}
      <div className='flex flex-col gap-4'>
        {/*------------- Patient Details ---------------------------------- */}
        <section className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="bg-white border border-gray-300 rounded-lg shadow-lg  max-w-4xl w-full">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center mb-6">
              <FaUser className="mr-2 text-blue-600" /> Patient Details
            </h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  First Name
                </label>
                <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                  <FaUser className="text-gray-400 mx-3" />
                  <input
                    type="text"
                    className="w-full py-2 px-3 text-sm text-gray-800 focus:outline-none rounded-lg"
                    placeholder="Enter first name"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Last Name
                </label>
                <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                  <FaUser className="text-gray-400 mx-3" />
                  <input
                    type="text"
                    className="w-full py-2 px-3 text-sm text-gray-800 focus:outline-none rounded-lg"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Email
                </label>
                <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                  <FaEnvelope className="text-gray-400 mx-3" />
                  <input
                    type="email"
                    className="w-full py-2 px-3 text-sm text-gray-800 focus:outline-none rounded-lg"
                    placeholder="Enter email"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Phone
                </label>
                <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                  <FaPhone className="text-gray-400 mx-3" />
                  <input
                    type="tel"
                    className="w-full py-2 px-3 text-sm text-gray-800 focus:outline-none rounded-lg"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="relative md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Address
                </label>
                <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                  <FaMapMarkerAlt className="text-gray-400 mx-3" />
                  <input
                    type="text"
                    className="w-full py-2 px-3 text-sm text-gray-800 focus:outline-none rounded-lg"
                    placeholder="Enter address"
                  />
                </div>
              </div>

              {/* Blood Group */}
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Blood Group
                </label>
                <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                  <FaTint className="text-gray-400 mx-3" />
                  <input
                    type="text"
                    className="w-full py-2 px-3 text-sm text-gray-800 focus:outline-none rounded-lg"
                    placeholder="Enter blood group"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Date of Birth
                </label>
                <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                  <FaCalendarAlt className="text-gray-400 mx-3" />
                  <input
                    type="date"
                    className="w-full py-2 px-3 text-sm text-gray-800 focus:outline-none rounded-lg"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2 text-right">
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </section>

        {/*------------- Visit Details ---------------------------------- */}
        <section className=' border rounded-md border-gray-300 p-2 shadow-md'>
          <h2 className="text-xs font-bold mb-2 text-gray-800">Visit Details</h2>
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col'>
              <label className='text-xs font-semibold mb-1 text-gray-700'>Visit Date</label>
              <input type='date' className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500' />
            </div>
            <div className='flex flex-col'>
              <label className='text-xs font-semibold mb-1 text-gray-700'>Visit Type</label>
              <select className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500'>
                <option value=''>Select visit type</option>
                <option value=''>In-Patient </option>
                <option value=''>Out-Patient</option>
              </select>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4 mt-4'>
            <div className='flex flex-col'>
              <label className='text-xs font-semibold mb-1 text-gray-700'>Visit Status</label>
              <select className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500'>
                <option value=''>Select visit status</option>
                <option value=''>Pending</option>
                <option value=''>Completed</option>
                <option value=''>Cancelled</option>
              </select>
            </div>
            <div className='flex flex-col'>
              <label className='text-xs font-semibold mb-1 text-gray-700'>Visit Description</label>
              <textarea className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Enter visit description'></textarea>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4 mt-4'>
            <div className='flex flex-col'>
              <label className='text-xs font-semibold mb-1 text-gray-700'>Doctor</label>
              <select className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500'>
                <option value=''>Select doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>{doctor?.name}</option>
                ))}
              </select>

              <label className='text-xs font-semibold mb-1 text-gray-700 mt-4'>Tests</label>
              <select className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500' multiple>
                {tests.map((test) => (
                  <option key={test.id} value={test.id}>{test.name}</option>
                ))}
              </select>

              <label className='text-xs font-semibold mb-1 text-gray-700 mt-4'>Packages</label>
              <select className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500' multiple>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>{pkg.packageName}</option>
                ))}

              </select>

              <label className='text-xs font-semibold mb-1 text-gray-700 mt-4'>Insurance</label>
              <select className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500' multiple>
                {insurances.map((insurance) => (
                  <option key={insurance.id} value={insurance.id}>{insurance.name}</option>
                ))}
              </select>
            </div>
          </div>
        </section>


        {/* billing  */}

      </div>

      <section className=' border rounded-md border-gray-300 p-2 shadow-md'>
        <h2 className="text-xs font-bold mb-2 text-gray-800">Billing</h2>
        <div className='grid grid-cols-2 gap-4'>
          <div className='flex flex-col'>
            <label className='text-xs font-semibold mb-1 text-gray-700'>Total Amount</label>
            <input type='number' className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Enter total amount' />
          </div>
          <div className='flex flex-col'>
            <label className='text-xs font-semibold mb-1 text-gray-700'>Payment Status</label>
            <select className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500'>
              <option value=''>Select payment status</option>
              <option value=''>Paid</option>
              <option value=''>Unpaid</option>
            </select>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4 mt-4'>
          <div className='flex flex-col'>
            <label className='text-xs font-semibold mb-1 text-gray-700'>Payment Method</label>
            <select className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500'>
              <option value=''>Select payment method</option>
              <option value=''>Cash</option>
              <option value=''>Card</option>
              <option value=''>Net Banking</option>
            </select>
          </div>
          <div className='flex flex-col'>
            <label className='text-xs font-semibold mb-1 text-gray-700'>Payment Date</label>
            <input type='date' className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500' />
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4 mt-4'>
          <div className='flex flex-col'>
            <label className='text-xs font-semibold mb-1 text-gray-700'>Discount</label>
            <input type='number' className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Enter discount' />

            <label className='text-xs font-semibold mb-1 text-gray-700 mt-4'>GST Rate</label>
            <input type='number' className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Enter GST rate' />

            <label className='text-xs font-semibold mb-1 text-gray-700 mt-4'>GST Amount</label>
            <input type='number' className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Enter GST amount' />

            <label className='text-xs font-semibold mb-1 text-gray-700 mt-4'>CGST Amount</label>
            <input type='number' className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Enter CGST amount' />

            <label className='text-xs font-semibold mb-1 text-gray-700 mt-4'>SGST Amount</label>
            <input type='number' className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Enter SGST amount' />

            <label className='text-xs font-semibold mb-1 text-gray-700 mt-4'>IGST Amount</label>
            <input type='number' className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Enter IGST amount' />

            <label className='text-xs font-semibold mb-1 text-gray-700 mt-4'>Net Amount</label>
            <input type='number' className='border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Enter net amount' />

            <button className='bg-blue-500 text-white rounded-md p-2 mt-4'>Add Patient</button>

            <button className='bg-red-500 text-white rounded-md p-2 mt-4'>Cancel</button>

          </div>
        </div>
      </section>

    </div>


  );
};

export default AddPatient;






