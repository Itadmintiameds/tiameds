// import React, { useState, useEffect } from 'react';
// import { FaUser, FaCalendarAlt, FaPhoneAlt, FaGenderless, FaClipboardList, FaStethoscope, FaIdCard, FaMoneyBillAlt, FaTimes } from 'react-icons/fa'; // Import the clear icon
// import { toast } from 'react-toastify';
// import { getTests } from '@/../services/testService';
// import { getPackage } from '@/../services/packageServices';
// import { getPatient } from '@/../services/patientServices';
// import { getDoctor } from '@/../services/doctorServices';
// import { getInsurance } from '@/../services/insuranceService';
// import Loader from '../../common/Loader';
// import { useLabs } from '@/context/LabContext';
// import { Patient } from "@/types/patient/patient";
// import { TestList } from '@/types/test/testlist';
// import { Package } from '@/types/package/package';
// import { Doctor } from '@/types/doctor/doctor';
// import { Insurance } from '@/types/insurance/insurance';
// import Button from '../../common/Button';
// import { Trash2Icon } from 'lucide-react';





// const AddPatient = () => {
//   const [tests, setTests] = useState<TestList[]>([]);
//   const [packages, setPackages] = useState<Package[]>([]);
//   const [doctors, setDoctors] = useState<Doctor[]>([]);
//   const [insurances, setInsurances] = useState<Insurance[]>([]);
//   const { currentLab } = useLabs();
//   const [patient, setPatient] = useState<Patient[]>([]);
//   const [categories, setCategories] = useState<string[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<string>('');
//   const [searchTestTerm, setSearchTestTerm] = useState<string>('');
//   const [selectedTests, setSelectedTests] = useState<TestList[]>([]);
//   const [selectedPackages, setSelectedPackages] = useState<Package[]>([]);
//   const [newPatient, setNewPatient] = useState<Patient>({
//     id: 0,
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     address: '',
//     city: '',
//     state: '',
//     zip: '',
//     bloodGroup: '',
//     dateOfBirth: '',
//     visit: {
//       visitDate: new Date().toISOString().split('T')[0],
//       visitType: '',
//       visitStatus: '',
//       visitDescription: '',
//       doctorId: 0,
//       testIds: [],
//       packageIds: [],
//       insuranceIds: [],
//       billing: {
//         totalAmount: 0,
//         paymentStatus: '',
//         paymentMethod: '',
//         paymentDate: new Date().toISOString().split('T')[0],
//         discount: 0,
//         gstRate: 0,
//         gstAmount: 0,
//         cgstAmount: 0,
//         sgstAmount: 0,
//         igstAmount: 0,
//         netAmount: 0,
//       },
//     },
//   });

//   const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
//   const [searchTerm, setSearchTerm] = useState<string>('');

//   useEffect(() => {
//     const labId = currentLab?.id;

//     const fetchData = async () => {
//       if (labId === undefined) {
//         toast.error('Lab ID is undefined.');
//         console.error(labId, 'Lab ID is undefined.');
//         return;
//       }

//       try {
//         const [testData, packageData, doctorData, insuranceData, patientData] = await Promise.all([
//           getTests(labId.toString()),
//           getPackage(labId),
//           getDoctor(labId),
//           getInsurance(labId),
//           getPatient(labId),
//         ]);

//         const uniqueCategories = Array.from(new Set((testData || []).map((test) => test.category)));
//         setCategories(uniqueCategories);

//         setTests(testData || []);
//         setPackages(packageData?.data || []);
//         setDoctors(doctorData?.data || []);
//         setInsurances(insuranceData?.data || []);
//         setPatient(patientData?.data || []);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         toast.error('An error occurred while fetching data.');
//       }
//     };

//     fetchData();
//   }, [currentLab]);

//   useEffect(() => {
//     if (searchTerm) {
//       const filtered = patient.filter(p =>
//         p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         p.phone.includes(searchTerm)
//       );
//       setFilteredPatients(filtered);
//     } else {
//       setFilteredPatients([]);
//     }
//   }, [searchTerm, patient]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setNewPatient(prevState => ({
//       ...prevState,
//       visit: {
//         ...prevState.visit,
//         billing: {
//           ...prevState.visit.billing,
//           [name]: value,
//         },
//       },
//     }));
//   };

//   const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setSelectedCategory(e.target.value);
//   };

//   const handleTestSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchTestTerm(e.target.value);
//   };

//   const filteredTests = tests.filter(
//     (test) =>
//       (!selectedCategory || test.category === selectedCategory) &&
//       (!searchTestTerm ||
//         test.name.toLowerCase().includes(searchTestTerm.toLowerCase()))
//   );

//   const handleTestSelection = (test: TestList) => {
//     if (selectedTests.some((t) => t.id === test.id)) {
//       setSelectedTests(selectedTests.filter((t) => t.id !== test.id));
//     } else {
//       setSelectedTests([...selectedTests, test]);
//     }
//   };

//   const handlePackageSelection = (pkg: Package) => {
//     if (selectedPackages.some((p) => p.id === pkg.id)) {
//       setSelectedPackages(selectedPackages.filter((p) => p.id !== pkg.id));
//     } else {
//       setSelectedPackages([...selectedPackages, pkg]);
//     }
//   };

//   const removeTest = (testId: number) => {
//     setSelectedTests(selectedTests.filter((test) => test.id !== testId));
//   };

//   const removePackage = (packageId: number) => {
//     setSelectedPackages(selectedPackages.filter((pkg) => pkg.id !== packageId));
//   };

//   useEffect(() => {
//     const totalAmount = selectedTests.reduce((acc, test) => acc + test.price, 0);
//     const totalPackageAmount = selectedPackages.reduce((acc, pkg) => acc + pkg.price, 0);
//     const totalAmountWithPackage = totalAmount + totalPackageAmount;

//     const discount = newPatient.visit?.billing.discount ?? 0;
//     const discountedAmount = totalAmountWithPackage - discount;

//     const gstRate = newPatient.visit?.billing.gstRate ?? 0;
//     const gstAmount = (discountedAmount * gstRate) / 100;

//     const cgstAmount = gstAmount / 2;
//     const sgstAmount = gstAmount / 2;
//     const igstAmount = gstAmount;

//     const netAmount = discountedAmount + gstAmount;

//     setNewPatient(prevState => ({
//       ...prevState,
//       visit: {
//         ...prevState.visit,
//         billing: {
//           ...prevState.visit.billing,
//           totalAmount: totalAmountWithPackage,
//           gstAmount,
//           cgstAmount,
//           sgstAmount,
//           igstAmount,
//           netAmount,
//         },
//       },
//     }));
//   }, [selectedTests, selectedPackages, newPatient.visit?.billing.discount, newPatient.visit?.billing.gstRate]);

//   const handleAddPatient = async () => {
//     console.log(newPatient, 'newPatient');
//   };

//   if (!tests || !packages || !doctors || !insurances) {
//     return <Loader />;
//   }

//   return (
//     <div>
//       {/* Select Test and Package */}
//       <div>
//         {/* Filter Section */}
//         <section className="p-4 border rounded-md shadow-md mt-4">
//           <h2 className="text-xs font-bold mb-2">Filter Tests</h2>
//           <div className="flex gap-4">
//             <select
//               className="border p-2 rounded-md text-xs"
//               value={selectedCategory}
//               onChange={handleCategoryChange}
//             >
//               <option value="">All Categories</option>
//               {categories.map((category) => (
//                 <option key={category} value={category}>
//                   {category}
//                 </option>
//               ))}
//             </select>

//             <input
//               type="text"
//               className="border p-2 rounded-md text-xs"
//               placeholder="Search Tests"
//               value={searchTestTerm}
//               onChange={handleTestSearch}
//             />
//           </div>
//         </section>

//         {/* Test and Package Selection Section */}
//         <section className="mt-4 grid grid-cols-2 gap-4">
//           {/* Available Tests */}
//           <div>
//             <h3 className="text-xs font-bold my-2">Available Tests</h3>
//             <div className="h-40 overflow-y-auto border rounded-md text-xs">
//               <table className="w-full border-collapse border">
//                 <thead>
//                   <tr>
//                     <th className="border p-2">Select</th>
//                     <th className="border p-2">Name</th>
//                     <th className="border p-2">Category</th>
//                     <th className="border p-2">Price</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredTests.map((test) => (
//                     <tr key={test.id}>
//                       <td className="border p-2 text-center">
//                         <input
//                           type="checkbox"
//                           checked={selectedTests.some((t) => t.id === test.id)}
//                           onChange={() => handleTestSelection(test)}
//                         />
//                       </td>
//                       <td className="border p-2">{test.name}</td>
//                       <td className="border p-2">{test.category}</td>
//                       <td className="border p-2">{test.price}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* Available Packages */}
//           <div>
//             <h3 className="text-xs font-bold my-2">Available Packages</h3>
//             <div className="h-40 overflow-y-auto border rounded-md">
//               <table className="w-full border-collapse border text-xs">
//                 <thead>
//                   <tr>
//                     <th className="border p-2">Select</th>
//                     <th className="border p-2">Name</th>
//                     <th className="border p-2">Price</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {packages.map((pkg) => (
//                     <tr key={pkg.id}>
//                       <td className="border p-2 text-center">
//                         <input
//                           type="checkbox"
//                           checked={selectedPackages.some((p) => p.id === pkg.id)}
//                           onChange={() => handlePackageSelection(pkg)}
//                         />
//                       </td>
//                       <td className="border p-2">{pkg.name}</td>
//                       <td className="border p-2">{pkg.price}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </section>
//       </div>

//       {/* Billing Section */}
//       <div className="mt-6 p-4 border rounded-md shadow-md">
//         <h2 className="text-xs font-bold mb-4">Billing Details</h2>
//         <div className="space-y-4">
//           <div className="flex gap-4">
//             <input
//               type="number"
//               name="discount"
//               placeholder="Discount (%)"
//               value={newPatient.visit.billing.discount}
//               onChange={handleChange}
//               className="border p-2 rounded-md text-xs w-1/4"
//             />
//             <input
//               type="number"
//               name="gstRate"
//               placeholder="GST Rate (%)"
//               value={newPatient.visit.billing.gstRate}
//               onChange={handleChange}
//               className="border p-2 rounded-md text-xs w-1/4"
//             />
//           </div>
//           <div className="flex gap-4">
//             <div className="flex-1">
//               <p className="text-xs font-bold">Total Amount</p>
//               <p className="text-sm">{newPatient.visit.billing.totalAmount}</p>
//             </div>
//             <div className="flex-1">
//               <p className="text-xs font-bold">GST Amount</p>
//               <p className="text-sm">{newPatient.visit.billing.gstAmount}</p>
//             </div>
//             <div className="flex-1">
//               <p className="text-xs font-bold">Net Amount</p>
//               <p className="text-sm">{newPatient.visit.billing.netAmount}</p>
//             </div>
//           </div>
//           <div className="flex gap-4">
//             <div className="flex-1">
//               <input
//                 type="text"
//                 name="paymentStatus"
//                 placeholder="Payment Status"
//                 value={newPatient.visit.billing.paymentStatus}
//                 onChange={handleChange}
//                 className="border p-2 rounded-md text-xs"
//               />
//             </div>
//             <div className="flex-1">
//               <input
//                 type="text"
//                 name="paymentMethod"
//                 placeholder="Payment Method"
//                 value={newPatient.visit.billing.paymentMethod}
//                 onChange={handleChange}
//                 className="border p-2 rounded-md text-xs"
//               />
//             </div>
//           </div>
//           <div className="flex gap-4">
//             <input
//               type="date"
//               name="paymentDate"
//               value={newPatient.visit.billing.paymentDate}
//               onChange={handleChange}
//               className="border p-2 rounded-md text-xs"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Submit Button */}
//       <div className="mt-4">
//         <Button
//           text="Add Patient"
//           onClick={handleAddPatient}
//           className="w-full py-2 bg-blue-500 text-white rounded-md"
//         />
//       </div>
//     </div>
//   );
// };

// export default AddPatient;




// ====================================


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
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTestTerm, setSearchTestTerm] = useState<string>('');
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
      visitDate: new Date().toISOString().split('T')[0],
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
        paymentDate: new Date().toISOString().split('T')[0],
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

  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const labId = currentLab?.id;

    const fetchData = async () => {
      if (labId === undefined) {
        toast.error('Lab ID is undefined.');
        console.error(labId, 'Lab ID is undefined.');
        return;
      }

      try {
        const [testData, packageData, doctorData, insuranceData, patientData] = await Promise.all([
          getTests(labId.toString()),
          getPackage(labId),
          getDoctor(labId),
          getInsurance(labId),
          getPatient(labId),
        ]);

        const uniqueCategories = Array.from(new Set((testData || []).map((test) => test.category)));
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
      visit: {
        ...prevState.visit,
        billing: {
          ...prevState.visit.billing,
          [name]: value,
        },
      },
    }));
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

  useEffect(() => {
    const totalAmount = selectedTests.reduce((acc, test) => acc + test.price, 0);
    const totalPackageAmount = selectedPackages.reduce((acc, pkg) => acc + pkg.price, 0);
    const totalAmountWithPackage = totalAmount + totalPackageAmount;

    const discount = newPatient.visit?.billing.discount ?? 0;
    const discountedAmount = totalAmountWithPackage - discount;

    const gstRate = newPatient.visit?.billing.gstRate ?? 0;
    const gstAmount = (discountedAmount * gstRate) / 100;

    const cgstAmount = gstAmount / 2;
    const sgstAmount = gstAmount / 2;
    const igstAmount = gstAmount;

    const netAmount = discountedAmount + gstAmount;

    setNewPatient(prevState => ({
      ...prevState,
      visit: {
        ...prevState.visit,
        billing: {
          ...prevState.visit.billing,
          totalAmount: totalAmountWithPackage,
          gstAmount,
          cgstAmount,
          sgstAmount,
          igstAmount,
          netAmount,
        },
      },
    }));
  }, [selectedTests, selectedPackages, newPatient.visit?.billing.discount, newPatient.visit?.billing.gstRate]);

  const handleAddPatient = async () => {
    console.log(newPatient, 'newPatient');
  };

  if (!tests || !packages || !doctors || !insurances) {
    return <Loader />;
  }

  return (
    <div>
      {/* Select Test and Package */}
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
                      <td className="border p-2">{pkg.name}</td>
                      <td className="border p-2">{pkg.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* Billing Section */}
      <div className="mt-6 p-4 border rounded-md shadow-md">
        <h2 className="text-xs font-bold mb-4">Billing Details</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <label htmlFor="discount" className="text-xs font-bold"> Discount (%)</label>
            <input
              type="number"
              name="discount"
              placeholder="Discount (%)"
              value={newPatient.visit?.billing.discount ?? 0}
              onChange={handleChange}
              className="border p-2 rounded-md text-xs w-1/4"
            />
            <label htmlFor="gstRate" className="text-xs font-bold">GST Rate (%)</label>
            <input
              type="number"
              name="gstRate"
              placeholder="GST Rate (%)"
              value={newPatient.visit.billing.gstRate}
              onChange={handleChange}
              className="border p-2 rounded-md text-xs w-1/4"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-xs font-bold">Total Amount</p>
              <p className="text-sm">{newPatient.visit.billing.totalAmount}</p>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold">GST Amount</p>
              <p className="text-sm">{newPatient.visit.billing.gstAmount}</p>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold">Net Amount</p>
              <p className="text-sm">{newPatient.visit.billing.netAmount}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              {/* <input
                type="text"
                name="paymentStatus"
                placeholder="Payment Status"
                value={newPatient.visit.billing.paymentStatus}
                onChange={handleChange}
                className="border p-2 rounded-md text-xs"
              /> */}

              <select name="paymentStatus" value={newPatient.visit.billing.paymentStatus} onChange={handleChange} className="border p-2 rounded-md text-xs">
                <option value="">Select Payment Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="flex-1">
            
              <select name="paymentMethod" value={newPatient.visit.billing.paymentMethod} onChange={handleChange} className="border p-2 rounded-md text-xs">
                <option value="">Select Payment Method</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="online">Online</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <input
              type="date"
              name="paymentDate"
              value={newPatient.visit.billing.paymentDate}
              onChange={handleChange}
              className="border p-2 rounded-md text-xs"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-4">
        <Button
          text="Add Patient"
          onClick={handleAddPatient}
          className="w-full py-2 bg-blue-500 text-white rounded-md"
        />
      </div>
    </div>
  );
};

export default AddPatient;





