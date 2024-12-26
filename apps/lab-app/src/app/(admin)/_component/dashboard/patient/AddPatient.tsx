import React, { useState, useEffect } from 'react';
import { FaUser, FaCalendarAlt, FaPhoneAlt, FaGenderless, FaClipboardList, FaStethoscope, FaIdCard, FaMoneyBillAlt, FaTimes } from 'react-icons/fa'; // Import the clear icon
import { toast } from 'react-toastify';
import { getTests } from '@/../services/testService';
import { getPackage } from '@/../services/packageServices';
import { getPatient } from '@/../services/patientServices';
import { getDoctor } from '@/../services/doctorServices';
import { getInsurance } from '@/../services/insuranceService';
import Loader from '../../common/Loader';
import { useLabs } from '@/context/LabContext';
import { Patient } from "@/types/patient/patient";
import { TestList } from '@/types/test/testlist';
import { Package } from '@/types/package/package';
import { Doctor } from '@/types/doctor/doctor';
import { Insurance } from '@/types/insurance/insurance';
import Button from '../../common/Button';
import { Trash2Icon } from 'lucide-react';


const AddPatient = () => {
  const [tests, setTests] = useState<TestList[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const { currentLab } = useLabs();
  const [patient, setPatient] = useState<Patient[]>([]);

  //   const [tests, setTests] = useState<TestList[]>([]);
  // const [packages, setPackages] = useState<Package[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTestTerm, setSearchTestTerm] = useState<string>("");
  const [selectedTests, setSelectedTests] = useState<TestList[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<Package[]>([]);


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
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]); // State to hold filtered patients
  const [searchTerm, setSearchTerm] = useState<string>(''); // State to hold search term

  useEffect(() => {
    const labId = currentLab?.id;

    const fetchData = async () => {
      if (labId === undefined) {
        toast.error('Lab ID is undefined.');
        console.error(labId, 'Lab ID is undefined.');
        return;
      }

      try {
        // Fetching tests, packages, doctors, insurance, and patient data
        const [testData, packageData, doctorData, insuranceData, patientData] = await Promise.all([
          getTests(labId.toString()),
          getPackage(labId),
          getDoctor(labId),
          getInsurance(labId),
          getPatient(labId),
        ]);

        const uniqueCategories = Array.from(
          new Set((testData || []).map((test) => test.category))
        );
        setCategories(uniqueCategories);

        setTests(testData || []);
        setPackages(packageData?.data || []);
        setDoctors(doctorData?.data || []);
        setInsurances(insuranceData?.data || []);
        setPatient(patientData?.data || []);

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('An error occurred while fetching data.');
      }
    };

    fetchData();
  }, [currentLab]);

  useEffect(() => {
    // Filter patients based on the search term (name, email, or phone)
    if (searchTerm) {
      const filtered = patient.filter(p =>
        p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm)
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients([]);
    }
  }, [searchTerm, patient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewPatient(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchTerm(value);
  };

  const handlePatientSelect = (selectedPatient: Patient) => {
    setNewPatient({
      ...newPatient,
      firstName: selectedPatient.firstName,
      lastName: selectedPatient.lastName,
      email: selectedPatient.email,
      phone: selectedPatient.phone,
      address: selectedPatient.address,
      city: selectedPatient.city,
      state: selectedPatient.state,
      zip: selectedPatient.zip,
      bloodGroup: selectedPatient.bloodGroup,
      dateOfBirth: selectedPatient.dateOfBirth,
    });
    setSearchTerm(''); // Clear search term after selecting a patient
    setFilteredPatients([]); // Clear filtered list
  };

  const handleClearPatient = () => {
    setNewPatient({
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
    setSearchTerm(''); // Reset the search term
    setFilteredPatients([]); // Reset the filtered patients list
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleTestSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTestTerm(e.target.value);
  };


  const filteredTests = tests.filter(
    (test) =>
      (!selectedCategory || test.category === selectedCategory) &&
      (!searchTestTerm ||
        test.name.toLowerCase().includes(searchTestTerm.toLowerCase()))
  );

  const handleTestSelection = (test: TestList) => {
    if (selectedTests.some((t) => t.id === test.id)) {
      setSelectedTests(selectedTests.filter((t) => t.id !== test.id));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const handlePackageSelection = (pkg: Package) => {
    if (selectedPackages.some((p) => p.id === pkg.id)) {
      setSelectedPackages(selectedPackages.filter((p) => p.id !== pkg.id));
    } else {
      setSelectedPackages([...selectedPackages, pkg]);
    }
  };

  const removeTest = (testId: number) => {
    setSelectedTests(selectedTests.filter((test) => test.id !== testId));
  };

  const removePackage = (packageId: number) => {
    setSelectedPackages(selectedPackages.filter((pkg) => pkg.id !== packageId));
  };

  if (!tests || !packages || !doctors || !insurances) {
    return <Loader />;
  }

  const handleAddPatient = async () => {
    console.log(newPatient, 'newPatient');
  };

  return (

    <div>
      <div className="flex gap-4">
        {/* Patient Details Section */}
        <section className="flex space-x-6 w-1/2">
          <div className="w-full p-4 border rounded-md border-gray-300 shadow-md">
            <h2 className="text-xs font-bold mb-2 text-gray-800">Patient Details</h2>
            <div className='flex gap-4 items-center'>
              <div className="grid grid-cols-1 gap-4 w-full">
                {/* Search Patient Section */}
                <div className="flex flex-col">
                  <label className="text-xs font-medium mb-1 text-gray-700">Search Patient (Name, Email, Phone)</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="border w-full rounded-md border-gray-300 p-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search by name, email, or phone"
                  />
                  {filteredPatients.length > 0 && (
                    <div className="mt-2 bg-white border border-gray-300 rounded-md shadow-sm">
                      {filteredPatients.map((patientItem) => (
                        <div
                          key={patientItem.id}
                          className="p-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => handlePatientSelect(patientItem)}
                        >
                          <p className="text-xs font-medium text-gray-700">{patientItem.firstName} {patientItem.lastName}</p>
                          <p className="text-xs text-gray-500">{patientItem.phone}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Clear Patient Button */}
              <div className="flex items-center">
                <Button
                  text="Clear"
                  onClick={handleClearPatient}
                  className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-md px-4 py-2 mt-4"
                >
                  <FaTimes className="mr-1" />
                </Button>
              </div>
            </div>
            {/* Patient Form */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold mb-1 text-gray-700">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={newPatient.firstName}
                  onChange={handleChange}
                  className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter first name"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold mb-1 text-gray-700">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={newPatient.lastName}
                  onChange={handleChange}
                  className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold mb-1 text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={newPatient.email}
                  onChange={handleChange}
                  className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold mb-1 text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={newPatient.phone}
                  onChange={handleChange}
                  className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold mb-1 text-gray-700">Address</label>
                <input
                  type="text"
                  name="address"
                  value={newPatient.address}
                  onChange={handleChange}
                  className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter address"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold mb-1 text-gray-700">City</label>
                <input
                  type="text"
                  name="city"
                  value={newPatient.city}
                  onChange={handleChange}
                  className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter city"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold mb-1 text-gray-700">State</label>
                <input
                  type="text"
                  name="state"
                  value={newPatient.state}
                  onChange={handleChange}
                  className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter state"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold mb-1 text-gray-700">Zip</label>
                <input
                  type="text"
                  name="zip"
                  value={newPatient.zip}
                  onChange={handleChange}
                  className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter zip code"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold mb-1 text-gray-700">Blood Group</label>
                <input
                  type="text"
                  name="bloodGroup"
                  value={newPatient.bloodGroup}
                  onChange={handleChange}
                  className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter blood group"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold mb-1 text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={newPatient.dateOfBirth}
                  onChange={handleChange}
                  className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Visit Details Section */}

        <section className="flex space-x-6 w-1/2">
          <div className="w-full p-4 border rounded-md border-gray-300 shadow-md">
            <h2 className="text-xs font-bold mb-2 text-gray-800">Visit Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold mb-1 text-gray-700">Visit Date</label>
                <input
                  type="date"
                  name="visitDate"
                  value={newPatient.visit?.visitDate}
                  onChange={handleChange}
                  className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold mb-1 text-gray-700">Visit Type</label>
                <select
                  name="visitType"
                  value={newPatient.visit?.visitType}
                  onChange={handleChange}
                  className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select visit type</option>
                  <option value="In-Person">In-Person</option>
                  <option value="Tele-Consultation">Tele-Consultation</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold mb-1 text-gray-700">Visit Status</label>
                <select
                  name="visitStatus"
                  value={newPatient.visit?.visitStatus}
                  onChange={handleChange}
                  className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select visit status</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold mb-1 text-gray-700">Visit Description</label>
                <textarea
                  name="visitDescription"
                  value={newPatient.visit?.visitDescription}
                  onChange={handleChange}
                  className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter visit description"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold mb-1 text-gray-700">Select Doctor</label>
                <select
                  name="doctorId"
                  value={newPatient.visit?.doctorId}
                  onChange={handleChange}
                  className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold mb-1 text-gray-700">Select Insrance</label>
                <select
                  name="insuranceIds"
                  value={newPatient.visit?.insuranceIds?.map(String)}
                  onChange={handleChange}
                  className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  multiple
                >
                  {insurances.map((insurance) => (
                    <option key={insurance.id} value={insurance.id}>{insurance.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* select test and package  */}
      <div>
        {/* Filter Section */}
        <section className="p-4 border rounded-md shadow-md mt-4">
          <h2 className="text-xs font-bold mb-2">Filter Tests</h2>
          <div className="flex gap-4">
            <select
              className="border p-2 rounded-md text-xs"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <input
              type="text"
              className="border p-2 rounded-md text-xs"
              placeholder="Search Tests"
              value={searchTestTerm}
              onChange={handleTestSearch}
            />
          </div>
        </section>

        {/* Test and Package Selection Section */}
        <section className="mt-4 grid grid-cols-2 gap-4">
          {/* Available Tests */}
          <div>
            <h3 className="text-xs font-bold my-2">Available Tests</h3>
            <div className="h-40 overflow-y-auto border rounded-md text-xs">
              <table className="w-full border-collapse border">
                <thead>
                  <tr>
                    <th className="border p-2">Select</th>
                    <th className="border p-2">Name</th>
                    <th className="border p-2">Category</th>
                    <th className="border p-2">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTests.map((test) => (
                    <tr key={test.id}>
                      <td className="border p-2 text-center">
                        <input
                          type="checkbox"
                          checked={selectedTests.some((t) => t.id === test.id)}
                          onChange={() => handleTestSelection(test)}
                        />
                      </td>
                      <td className="border p-2">{test.name}</td>
                      <td className="border p-2">{test.category}</td>
                      <td className="border p-2">{test.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Available Packages */}
          <div>
            <h3 className="text-xs font-bold my-2">Available Packages</h3>
            <div className="h-40 overflow-y-auto border rounded-md">
              <table className="w-full border-collapse border text-xs">
                <thead>
                  <tr>
                    <th className="border p-2">Select</th>
                    <th className="border p-2">Name</th>
                    <th className="border p-2">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg) => (
                    <tr key={pkg.id}>
                      <td className="border p-2 text-center">
                        <input
                          type="checkbox"
                          checked={selectedPackages.some((p) => p.id === pkg.id)}
                          onChange={() => handlePackageSelection(pkg)}
                        />
                      </td>
                      <td className="border p-2">{pkg.packageName}</td>
                      <td className="border p-2">{pkg.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Selected Tests and Packages */}
        <section className="mt-4 grid grid-cols-2 gap-4">
          {/* Selected Tests */}
          <div>
            <h3 className="text-xs font-bold my-2">Selected Tests</h3>
            <table className="w-full border-collapse border text-xs">
              <thead>
                <tr>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Category</th>
                  <th className="border p-2">Price</th>
                  <th className="border p-2">Remove</th>
                </tr>
              </thead>
              <tbody>
                {selectedTests.map((test) => (
                  <tr key={test.id}>
                    <td className="border p-2">{test.name}</td>
                    <td className="border p-2">{test.category}</td>
                    <td className="border p-2">{test.price}</td>
                    <td className="border p-2 text-center">
                      <button
                        className="text-red-500"
                        onClick={() => removeTest(test.id)}
                      >
                        <Trash2Icon size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Selected Packages */}
          <div>
            <h3 className="text-xs font-bold my-2">Selected Packages</h3>
            <table className="w-full border-collapse border text-xs">
              <thead>
                <tr>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Price</th>
                  <th className="border p-2">Remove</th>
                </tr>
              </thead>
              <tbody>
                {selectedPackages.map((pkg) => (
                  <tr key={pkg.id}>
                    <td className="border p-2">{pkg.packageName}</td>
                    <td className="border p-2">{pkg.price}</td>
                    <td className="border p-2 text-center">
                      <button
                        className="text-red-500"
                        onClick={() => removePackage(pkg.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* Billing Section */}
      <section className="mt-4 p-4 border rounded-md shadow-md">
        <h2 className="text-xs font-bold mb-2 text-gray-800">Billing Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold mb-1 text-gray-700">Total Amount</label>
            <input
              type="number"
              name="totalAmount"
              value={newPatient.visit?.billing.totalAmount}
              onChange={handleChange}
              className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter total amount"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold mb-1 text-gray-700">Payment Status</label>
            <select
              name="paymentStatus"
              value={newPatient.visit?.billing.paymentStatus}
              onChange={handleChange}
              className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select payment status</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold mb-1 text-gray-700">Payment Method</label>
            <select
              name="paymentMethod"
              value={newPatient.visit?.billing.paymentMethod}
              onChange={handleChange}
              className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select payment method</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Net Banking">Net Banking</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold mb-1 text-gray-700">Payment Date</label>
            <input
              type="date"
              name="paymentDate"
              value={newPatient.visit?.billing.paymentDate}
              onChange={handleChange}
              className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold mb-1 text-gray-700">Discount</label>
                <input
                  type="number"
                  name="discount"
                  value={newPatient.visit?.billing.discount}
                  onChange={handleChange}
                  className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter discount"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold mb-1 text-gray-700">GST Rate</label>
                <input
                  type="number"
                  name="gstRate"
                  value={newPatient.visit?.billing.gstRate}
                  onChange={handleChange}
                  className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter GST rate"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold mb-1 text-gray-700">GST Amount</label>
                <input
                  type="number"
                  name="gstAmount"
                  value={newPatient.visit?.billing.gstAmount}
                  onChange={handleChange}
                  className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter GST amount"
                />

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold mb-1 text-gray-700">CGST Amount</label>
                    <input
                      type="number"
                      name="cgstAmount"
                      value={newPatient.visit?.billing.cgstAmount}
                      onChange={handleChange}
                      className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter CGST amount"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold mb-1 text-gray-700">SGST Amount</label>
                    <input
                      type="number"
                      name="sgstAmount"
                      value={newPatient.visit?.billing.sgstAmount}
                      onChange={handleChange}
                      className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter SGST amount"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="flex justify-end mt-4">
        <Button
          text="Add Patient"
          onClick={handleAddPatient}
          className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-md px-4 py-2"
        />
      </div>

    </div>
  )
}

export default AddPatient;







