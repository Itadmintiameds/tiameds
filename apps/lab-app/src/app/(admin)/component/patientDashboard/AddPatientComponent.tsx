// import { getDoctor } from '@/../services/doctorServices';
// import { getInsurance } from '@/../services/insuranceService';
// import { getPackage } from '@/../services/packageServices';
// import { addPatient, getPatient } from '@/../services/patientServices';
// import { getTests } from '@/../services/testService';
// import { useLabs } from '@/context/LabContext';
// import { patientSchema } from '@/schema/patientScheamData';
// import { Doctor } from '@/types/doctor/doctor';
// import { Insurance } from '@/types/insurance/insurance';
// import { Package as PackageType } from '@/types/package/package';
// import { Patient, PaymentMethod, PaymentStatus, VisitStatus, VisitType } from "@/types/patient/patient";
// import { TestList } from '@/types/test/testlist';
// import { Plus, XIcon } from 'lucide-react';
// import React, { useEffect, useState } from 'react';
// import { toast } from 'react-toastify';
// import Button from '../common/Button';
// import Loader from '../common/Loader';
// import PatientBilling from './component/PatientBilling';
// import PatientFrom from './component/PatientFrom';
// import PatientTestPackage from './component/PatientTestPackage';
// import PatientVisit from './component/PatientVisit';

// enum Gender {
//   Male = 'male',
//   Female = 'female',
//   Other = 'other',
// }

// const AddPatientComponent = () => {
//   const [tests, setTests] = useState<TestList[]>([]);
//   const [packages, setPackages] = useState<PackageType[]>([]);
//   const [doctors, setDoctors] = useState<Doctor[]>([]);
//   const [insurances, setInsurances] = useState<Insurance[]>([]);
//   const [patient, setPatient] = useState<Patient[]>([]);
//   const [categories, setCategories] = useState<string[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<string>('');
//   const [searchTestTerm, setSearchTestTerm] = useState<string>('');
//   const [selectedTests, setSelectedTests] = useState<TestList[]>([]);
//   const [selectedPackages, setSelectedPackages] = useState<PackageType[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [newPatient, setNewPatient] = useState<Patient>({
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
//     gender: Gender.Female,
//     visit: {
//       visitDate: new Date().toISOString().split('T')[0],
//       visitType: VisitType.OUT_PATIENT,
//       visitStatus: VisitStatus.PENDING,
//       visitDescription: '',
//       doctorId: 0,
//       testIds: [],
//       packageIds: [],
//       insuranceIds: [],
//       billing: {
//         totalAmount: 0,
//         paymentStatus: PaymentStatus.PENDING,
//         paymentMethod: PaymentMethod.CASH,
//         paymentDate: new Date().toISOString().split('T')[0],
//         discount: 0,
//         gstRate: 0,
//         gstAmount: 0,
//         cgstAmount: 0,
//         sgstAmount: 0,
//         igstAmount: 0,
//         netAmount: 0,
//         discountReason: '',
//       },
//     },
//   });
//   const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
//   const [searchTerm, setSearchTerm] = useState<string>('');
//   const { currentLab, setPatientDetails } = useLabs();
//   const [updatedocorlist, setUpdatedocorlist] = useState<boolean>(false);
//   const [isGlobalDiscountHidden, setIsGlobalDiscountHidden] = useState<boolean>(false);

//   useEffect(() => {
//     if (!currentLab || !currentLab.id) {
//       <Loader />;
//       return;
//     }
//     const fetchData = async () => {
//       try {
//         const [testData, packageData, doctorData, insuranceData, patientData] = await Promise.all([
//           getTests(currentLab.id.toString()),
//           getPackage(currentLab.id),
//           getDoctor(currentLab.id),
//           getInsurance(currentLab.id),
//           getPatient(currentLab.id),
//         ]);
//         setCategories(Array.from(new Set((testData || []).map((test) => test.category))));
//         setTests(testData || []);
//         setPackages(packageData?.data || []);
//         setDoctors(doctorData?.data || []);
//         setInsurances(insuranceData?.data || []);
//         setPatient(patientData?.data || []);
//       } catch (error) {
//         toast.error("An error occurred while fetching data.");
//       }
//     };
//     fetchData();
//   }, [currentLab, updatedocorlist]);

//   const calculateAmounts = () => {
//     // Calculate total original amount for tests (before any discounts)
//     const totalOriginalTestAmount = selectedTests.reduce((acc, test) => acc + test.price, 0);

//     // Calculate total package amount (packages don't have individual discounts in this implementation)
//     const totalPackageAmount = selectedPackages.reduce((acc, pkg) => acc + pkg.price, 0);

//     // Calculate total amount after applying test-specific discounts
//     const totalAfterTestDiscounts = selectedTests.reduce(
//       (acc, test) => acc + (test.discountedPrice || test.price),
//       0
//     ) + totalPackageAmount;

//     const globalDiscountPercent = parseFloat(newPatient.visit?.billing.discount?.toString() || '0') || 0;


//     // Calculate global discount amount (absolute value)
//     const globalDiscountAmount = parseFloat(newPatient.visit?.billing.discount?.toString() || '0') || 0;


//     // Calculate amount after applying global discount
//     const amountAfterGlobalDiscount = totalAfterTestDiscounts - globalDiscountAmount;

//     // Round to 2 decimal places for currency
//     const netAmount = parseFloat(amountAfterGlobalDiscount.toFixed(2));

//     // console.log('Net Amount:----------', netAmount);

//     return {
//       totalAmount: totalOriginalTestAmount + totalPackageAmount,
//       netAmount,
//       amountAfterTestDiscounts: totalAfterTestDiscounts,
//       globalDiscountAmount,
//       globalDiscountPercent
//     };
//   };

//   useEffect(() => {
//     const { totalAmount, netAmount } = calculateAmounts();

//     setNewPatient(prevState => ({
//       ...prevState,
//       visit: {
//         ...prevState.visit,
//         billing: {
//           ...prevState.visit.billing,
//           totalAmount,
//           netAmount,
//           gstAmount: 0,
//           cgstAmount: 0,
//           sgstAmount: 0,
//           igstAmount: 0,
//         },
//       },
//     }));
//   }, [selectedTests, selectedPackages, newPatient.visit?.billing.discount]);

//   useEffect(() => {
//     const hasTestDiscounts = selectedTests.some(test =>
//       (test.discountAmount && test.discountAmount > 0) ||
//       (test.discountPercent && test.discountPercent > 0)
//     );
//     setIsGlobalDiscountHidden(hasTestDiscounts);
//   }, [selectedTests]);

//   const handleChange = (
//     event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: string[] } }
//   ) => {
//     const { name, value } = 'target' in event ? event.target : { name: '', value: [] };

//     if (name === 'visit.insuranceIds') {
//       setNewPatient(prevState => ({
//         ...prevState,
//         visit: {
//           ...prevState.visit,
//           insuranceIds: Array.isArray(value) ? value.map(Number) : [],
//         },
//       }));
//     } else if (name.startsWith('visit.billing')) {
//       setNewPatient(prevState => ({
//         ...prevState,
//         visit: {
//           ...prevState.visit,
//           billing: {
//             ...prevState.visit.billing,
//             [name.split('.')[2]]: value,
//           },
//         },
//       }));
//     } else if (name.startsWith('visit.')) {
//       setNewPatient(prevState => ({
//         ...prevState,
//         visit: {
//           ...prevState.visit,
//           [name.split('.')[1]]: value,
//         },
//       }));
//     } else {
//       setNewPatient(prevState => ({
//         ...prevState,
//         [name]: Array.isArray(value) ? value.map(Number) : value,
//       }));
//     }
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
//     let updatedTests = [...selectedTests];
//     if (selectedTests.some((t) => t.id === test.id)) {
//       updatedTests = updatedTests.filter((t) => t.id !== test.id);
//     } else {
//       updatedTests = [...updatedTests, { ...test, discountedPrice: test.price }];
//     }
//     setSelectedTests(updatedTests);
//     setNewPatient((prevState) => ({
//       ...prevState,
//       visit: {
//         ...prevState.visit,
//         testIds: updatedTests.map((test) => test.id),
//       },
//     }));
//   };

//   const handlePackageSelection = (pkg: PackageType) => {
//     let updatedPackages = [...selectedPackages];
//     if (selectedPackages.some((p) => p.id === pkg.id)) {
//       updatedPackages = updatedPackages.filter((p) => p.id !== pkg.id);
//     } else {
//       updatedPackages = [...updatedPackages, pkg];
//     }

//     setSelectedPackages(updatedPackages);
//     setNewPatient((prevState) => ({
//       ...prevState,
//       visit: {
//         ...prevState.visit,
//         packageIds: updatedPackages.map((pkg) => pkg.id),
//       },
//     }));
//   };

//   const removeTest = (testId: string) => {
//     const updatedTests = selectedTests.filter((test) => test.id !== Number(testId));
//     setSelectedTests(updatedTests);
//     setNewPatient((prevState) => ({
//       ...prevState,
//       visit: {
//         ...prevState.visit,
//         testIds: updatedTests.map((test) => test.id),
//       },
//     }));
//   };

//   const removePackage = (packageId: string) => {
//     const updatedPackages = selectedPackages.filter((pkg) => pkg.id !== Number(packageId));
//     setSelectedPackages(updatedPackages);
//     setNewPatient((prevState) => ({
//       ...prevState,
//       visit: {
//         ...prevState.visit,
//         packageIds: updatedPackages.map((pkg) => pkg.id),
//       },
//     }));
//   };

//   const handleTestDiscountChange = (testId: number, field: 'percent' | 'amount', value: number) => {
//     setSelectedTests(prevTests =>
//       prevTests.map(test => {
//         if (test.id === testId) {
//           const originalPrice = test.price;
//           let discountAmount = 0;
//           let discountPercent = 0;

//           if (field === 'percent') {
//             discountPercent = Math.min(100, Math.max(0, value));
//             discountAmount = (originalPrice * discountPercent) / 100;
//           } else {
//             discountAmount = Math.min(originalPrice, Math.max(0, value));
//             discountPercent = (discountAmount / originalPrice) * 100;
//           }

//           return {
//             ...test,
//             discountAmount,
//             discountPercent,
//             discountedPrice: originalPrice - discountAmount
//           };
//         }
//         return test;
//       })
//     );
//   };

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

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { value } = e.target;
//     setSearchTerm(value);
//   };

//   const handlePatientSelect = (selectedPatient: Patient) => {
//     setNewPatient({
//       ...newPatient,
//       firstName: selectedPatient.firstName,
//       lastName: '',
//       email: '',
//       phone: selectedPatient.phone,
//       address: '',
//       city: selectedPatient.city,
//       state: '',
//       zip: '',
//       bloodGroup: '',
//       dateOfBirth: selectedPatient.dateOfBirth,
//       gender: selectedPatient.gender,
//     });
//     setSearchTerm('');
//     setFilteredPatients([]);
//   };

//   const handleClearPatient = () => {
//     setNewPatient({
//       firstName: '',
//       lastName: '',
//       email: '',
//       phone: '',
//       address: '',
//       city: '',
//       state: '',
//       zip: '',
//       bloodGroup: '',
//       dateOfBirth: '',
//       gender: '',
//       visit: {
//         visitDate: new Date().toISOString().split('T')[0],
//         visitType: VisitType.OUT_PATIENT,
//         visitStatus: VisitStatus.PENDING,
//         visitDescription: '',
//         doctorId: 0,
//         testIds: [],
//         packageIds: [],
//         insuranceIds: [],
//         billing: {
//           totalAmount: 0,
//           paymentStatus: PaymentStatus.PENDING,
//           paymentMethod: PaymentMethod.CASH,
//           paymentDate: new Date().toISOString().split('T')[0],
//           discount: 0,
//           gstRate: 0,
//           gstAmount: 0,
//           cgstAmount: 0,
//           sgstAmount: 0,
//           igstAmount: 0,
//           netAmount: 0,
//           discountReason: '',
//         },
//       },
//     });
//     setSearchTerm('');
//     setFilteredPatients([]);
//     setSelectedTests([]);
//     setSelectedPackages([]);
//     setSelectedCategory('');
//   };

//   const handleAddPatient = async () => {
//     try {
//       setLoading(true);
//       const validationResult = patientSchema.safeParse(newPatient);
//       if (!validationResult.success) {
//         const error = validationResult.error;
//         toast.error(error.errors.map((err) => err.message).join(', '));
//         return;
//       }
//       const labId = currentLab?.id;
//       if (labId === undefined) {
//         toast.error('Lab ID is undefined.');
//         return;
//       }

//       const { totalAmount, netAmount, globalDiscountAmount, globalDiscountPercent } = calculateAmounts();

//       const patientData = {
//         ...newPatient,
//         visit: {
//           ...newPatient.visit,
//           billing: {
//             ...newPatient.visit.billing,
//             totalAmount,
//             netAmount,
//             discount: globalDiscountAmount.toFixed(2),
//             discountPercentage: globalDiscountPercent.toFixed(2)
//           },
//           tests: selectedTests.map(test => ({
//             id: test.id,
//             discountAmount: test.discountAmount || 0,
//             discountPercent: test.discountPercent || 0,
//             finalPrice: test.discountedPrice || test.price
//           }))
//         }
//       };

//       //==================================================================================================

//       console.log('Patient Data:', patientData);
//       // Uncomment to actually send the data
//       const response = await addPatient(labId, patientData);
//       setPatientDetails(response.data);
//       if (response.status === 'success') {
//         toast.success('Patient added successfully.', { autoClose: 2000, position: 'top-right' });
//         handleClearPatient();
//         router.push(`/dashboard/bill/`);
//       } else {
//         toast.error('An error occurred while adding the patient.');
//       }

//       // ============================================
//     } catch (error) {
//       console.error('Error adding patient:', error);
//       toast.error('An error occurred while adding the patient.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!tests || !packages || !doctors || !insurances || !currentLab?.id) {
//     return <Loader />;
//   }
//   if (loading) {
//     return <Loader />
//   }

//   return (
//     <div>
//       <div className="flex gap-4">
//         <PatientFrom
//           newPatient={newPatient}
//           handleChange={handleChange}
//           searchTerm={searchTerm}
//           handleSearchChange={handleSearchChange}
//           filteredPatients={filteredPatients}
//           handlePatientSelect={handlePatientSelect}
//         />
//         <PatientVisit
//           newPatient={newPatient}
//           handleChange={handleChange}
//           doctors={doctors}
//           updatedocorlist={updatedocorlist}
//           setUpdatedocorlist={setUpdatedocorlist}
//         />
//       </div>

//       <PatientTestPackage
//         tests={tests}
//         packages={packages}
//         selectedTests={selectedTests}
//         selectedPackages={selectedPackages}
//         setSelectedTests={setSelectedTests}
//         setSelectedPackages={setSelectedPackages}
//         selectedCategory={selectedCategory}
//         handleCategoryChange={handleCategoryChange}
//         searchTestTerm={searchTestTerm}
//         handleTestSearch={handleTestSearch}
//         filteredTests={filteredTests}
//         handleTestSelection={handleTestSelection}
//         handlePackageSelection={handlePackageSelection}
//         removeTest={removeTest}
//         removePackage={removePackage}
//         categories={categories}
//         handleTestDiscountChange={handleTestDiscountChange}
//       />

//       <PatientBilling
//         selectedPackages={selectedPackages}
//         newPatient={newPatient}
//         handleChange={handleChange}
//         isGlobalDiscountHidden={isGlobalDiscountHidden}
//       />

//       <div className="flex justify-end space-x-2 mt-3">
//         <Button
//           text=''
//           type="button"
//           onClick={handleAddPatient}
//           className="flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
//         >
//           <Plus className="h-3 w-3 mr-1.5" />
//           Patient
//         </Button>
//         <Button
//           text=''
//           type="button"
//           onClick={handleClearPatient}
//           className="flex items-center px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
//         >
//           <XIcon className="h-3 w-3 mr-1.5" />
//           Cancel
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default AddPatientComponent;










// import { getDoctor } from '@/../services/doctorServices';
// import { getInsurance } from '@/../services/insuranceService';
// import { getPackage } from '@/../services/packageServices';
// import { addPatient, getPatient } from '@/../services/patientServices';
// import { getTests } from '@/../services/testService';
// import { useLabs } from '@/context/LabContext';
// import { patientSchema } from '@/schema/patientScheamData';
// import { Doctor } from '@/types/doctor/doctor';
// import { Insurance } from '@/types/insurance/insurance';
// import { Package as PackageType } from '@/types/package/package';
// import { Patient, PaymentMethod, PaymentStatus, VisitStatus, VisitType } from "@/types/patient/patient";
// import { TestList } from '@/types/test/testlist';
// import { Plus, XIcon } from 'lucide-react';
// import React, { useEffect, useState } from 'react';
// import { toast } from 'react-toastify';
// import Button from '../common/Button';
// import Loader from '../common/Loader';
// import PatientBilling from './component/PatientBilling';
// import PatientFrom from './component/PatientFrom';
// import PatientTestPackage from './component/PatientTestPackage';
// import PatientVisit from './component/PatientVisit';

// enum Gender {
//   Male = 'male',
//   Female = 'female',
//   Other = 'other',
// }

// // setAddUpdatePatientListVist={setAddUpdatePatientListVist}
// //           addUpdatePatientListVist={addUpdatePatientListVist}

// interface AddPatientComponentProps {
//   setAddPatientModal: React.Dispatch<React.SetStateAction<boolean>>;
//   setAddUpdatePatientListVist: React.Dispatch<React.SetStateAction<boolean>>;
//   addUpdatePatientListVist: boolean;
// }

// const AddPatientComponent = ({ setAddPatientModal , setAddUpdatePatientListVist, addUpdatePatientListVist}: AddPatientComponentProps) => {
//   const [tests, setTests] = useState<TestList[]>([]);
//   const [packages, setPackages] = useState<PackageType[]>([]);
//   const [doctors, setDoctors] = useState<Doctor[]>([]);
//   const [insurances, setInsurances] = useState<Insurance[]>([]);
//   const [patient, setPatient] = useState<Patient[]>([]);
//   const [categories, setCategories] = useState<string[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<string>('');
//   const [searchTestTerm, setSearchTestTerm] = useState<string>('');
//   const [selectedTests, setSelectedTests] = useState<TestList[]>([]);
//   const [selectedPackages, setSelectedPackages] = useState<PackageType[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [newPatient, setNewPatient] = useState<Patient>({
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
//     gender: Gender.Female,
//     visit: {
//       visitDate: new Date().toISOString().split('T')[0],
//       visitType: VisitType.OUT_PATIENT,
//       visitStatus: VisitStatus.PENDING,
//       visitDescription: '',
//       // listofDiscounts: [],
//       doctorId: 0,
//       testIds: [],
//       packageIds: [],
//       insuranceIds: [],
//       billing: {
//         totalAmount: 0,
//         paymentStatus: PaymentStatus.PENDING,
//         paymentMethod: PaymentMethod.CASH,
//         paymentDate: new Date().toISOString().split('T')[0],
//         discount: 0,
//         gstRate: 0,
//         gstAmount: 0,
//         cgstAmount: 0,
//         sgstAmount: 0,
//         igstAmount: 0,
//         netAmount: 0,
//         discountReason: '',
//         discountPercentage: 0,
//       },
//     },
//   });
//   const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
//   const [searchTerm, setSearchTerm] = useState<string>('');
//   const { currentLab, setPatientDetails } = useLabs();
//   const [updatedocorlist, setUpdatedocorlist] = useState<boolean>(false);
//   const [isGlobalDiscountHidden, setIsGlobalDiscountHidden] = useState<boolean>(false);

//   useEffect(() => {
//     if (!currentLab || !currentLab.id) {
//       <Loader />;
//       return;
//     }
//     const fetchData = async () => {
//       try {
//         const [testData, packageData, doctorData, insuranceData, patientData] = await Promise.all([
//           getTests(currentLab.id.toString()),
//           getPackage(currentLab.id),
//           getDoctor(currentLab.id),
//           getInsurance(currentLab.id),
//           getPatient(currentLab.id),
//         ]);
//         setCategories(Array.from(new Set((testData || []).map((test) => test.category))));
//         setTests(testData || []);
//         setPackages(packageData?.data || []);
//         setDoctors(doctorData?.data || []);
//         setInsurances(insuranceData?.data || []);
//         setPatient(patientData?.data || []);
//       } catch (error) {
//         toast.error("An error occurred while fetching data.");
//       }
//     };
//     fetchData();
//   }, [currentLab, updatedocorlist]);

//   const calculateAmounts = () => {
//     // Calculate total original amount for tests (before any discounts)
//     const totalOriginalTestAmount = selectedTests.reduce((acc, test) => acc + test.price, 0);

//     // Calculate total package amount (packages don't have individual discounts in this implementation)
//     const totalPackageAmount = selectedPackages.reduce((acc, pkg) => acc + pkg.price, 0);

//     // Calculate total amount after applying test-specific discounts
//     const totalAfterTestDiscounts = selectedTests.reduce(
//       (acc, test) => acc + (test.discountedPrice || test.price),
//       0
//     ) + totalPackageAmount;

//     const globalDiscountPercent = parseFloat(newPatient.visit?.billing.discount?.toString() || '0') || 0;

//     // Calculate global discount amount (absolute value)
//     const globalDiscountAmount = parseFloat(newPatient.visit?.billing.discount?.toString() || '0') || 0;

//     // Calculate amount after applying global discount
//     const amountAfterGlobalDiscount = totalAfterTestDiscounts - globalDiscountAmount;

//     // Round to 2 decimal places for currency
//     const netAmount = parseFloat(amountAfterGlobalDiscount.toFixed(2));

//     // console.log('Net Amount:----------', netAmount);

//     return {
//       totalAmount: totalOriginalTestAmount + totalPackageAmount,
//       netAmount,
//       amountAfterTestDiscounts: totalAfterTestDiscounts,
//       globalDiscountAmount,
//       globalDiscountPercent
//     };
//   };

//   useEffect(() => {
//     const { totalAmount, netAmount } = calculateAmounts();

//     setNewPatient(prevState => ({
//       ...prevState,
//       visit: {
//         ...prevState.visit,
//         billing: {
//           ...prevState.visit.billing,
//           totalAmount,
//           netAmount,
//           gstAmount: 0,
//           cgstAmount: 0,
//           sgstAmount: 0,
//           igstAmount: 0,
//         },
//       },
//     }));
//   }, [selectedTests, selectedPackages, newPatient.visit?.billing.discount]);

//   useEffect(() => {
//     const hasTestDiscounts = selectedTests.some(test =>
//       (test.discountAmount && test.discountAmount > 0) ||
//       (test.discountPercent && test.discountPercent > 0)
//     );
//     setIsGlobalDiscountHidden(hasTestDiscounts);
//   }, [selectedTests]);

//   const handleChange = (
//     event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: string[] } }
//   ) => {
//     const { name, value } = 'target' in event ? event.target : { name: '', value: [] };

//     if (name === 'visit.insuranceIds') {
//       setNewPatient(prevState => ({
//         ...prevState,
//         visit: {
//           ...prevState.visit,
//           insuranceIds: Array.isArray(value) ? value.map(Number) : [],
//         },
//       }));
//     } else if (name.startsWith('visit.billing')) {
//       setNewPatient(prevState => ({
//         ...prevState,
//         visit: {
//           ...prevState.visit,
//           billing: {
//             ...prevState.visit.billing,
//             [name.split('.')[2]]: value,
//           },
//         },
//       }));
//     } else if (name.startsWith('visit.')) {
//       setNewPatient(prevState => ({
//         ...prevState,
//         visit: {
//           ...prevState.visit,
//           [name.split('.')[1]]: value,
//         },
//       }));
//     } else {
//       setNewPatient(prevState => ({
//         ...prevState,
//         [name]: Array.isArray(value) ? value.map(Number) : value,
//       }));
//     }
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
//     let updatedTests = [...selectedTests];
//     if (selectedTests.some((t) => t.id === test.id)) {
//       updatedTests = updatedTests.filter((t) => t.id !== test.id);
//     } else {
//       updatedTests = [...updatedTests, { ...test, discountedPrice: test.price }];
//     }
//     setSelectedTests(updatedTests);
//     setNewPatient((prevState) => ({
//       ...prevState,
//       visit: {
//         ...prevState.visit,
//         testIds: updatedTests.map((test) => test.id),
//       },
//     }));
//   };

//   const handlePackageSelection = (pkg: PackageType) => {
//     let updatedPackages = [...selectedPackages];
//     if (selectedPackages.some((p) => p.id === pkg.id)) {
//       updatedPackages = updatedPackages.filter((p) => p.id !== pkg.id);
//     } else {
//       updatedPackages = [...updatedPackages, pkg];
//     }

//     setSelectedPackages(updatedPackages);
//     setNewPatient((prevState) => ({
//       ...prevState,
//       visit: {
//         ...prevState.visit,
//         packageIds: updatedPackages.map((pkg) => pkg.id),
//       },
//     }));
//   };

//   const removeTest = (testId: string) => {
//     const updatedTests = selectedTests.filter((test) => test.id !== Number(testId));
//     setSelectedTests(updatedTests);
//     setNewPatient((prevState) => ({
//       ...prevState,
//       visit: {
//         ...prevState.visit,
//         testIds: updatedTests.map((test) => test.id),
//       },
//     }));
//   };

//   const removePackage = (packageId: string) => {
//     const updatedPackages = selectedPackages.filter((pkg) => pkg.id !== Number(packageId));
//     setSelectedPackages(updatedPackages);
//     setNewPatient((prevState) => ({
//       ...prevState,
//       visit: {
//         ...prevState.visit,
//         packageIds: updatedPackages.map((pkg) => pkg.id),
//       },
//     }));
//   };

//   const handleTestDiscountChange = (testId: number, field: 'percent' | 'amount', value: number) => {
//     setSelectedTests(prevTests =>
//       prevTests.map(test => {
//         if (test.id === testId) {
//           const originalPrice = test.price;
//           let discountAmount = 0;
//           let discountPercent = 0;

//           if (field === 'percent') {
//             discountPercent = Math.min(100, Math.max(0, value));
//             discountAmount = (originalPrice * discountPercent) / 100;
//           } else {
//             discountAmount = Math.min(originalPrice, Math.max(0, value));
//             discountPercent = (discountAmount / originalPrice) * 100;
//           }

//           return {
//             ...test,
//             discountAmount,
//             discountPercent,
//             discountedPrice: originalPrice - discountAmount
//           };
//         }
//         return test;
//       })
//     );
//   };

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

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { value } = e.target;
//     setSearchTerm(value);
//   };

//   const handlePatientSelect = (selectedPatient: Patient) => {
//     setNewPatient({
//       ...newPatient,
//       firstName: selectedPatient.firstName,
//       lastName: '',
//       email: '',
//       phone: selectedPatient.phone,
//       address: '',
//       city: selectedPatient.city,
//       state: '',
//       zip: '',
//       bloodGroup: '',
//       dateOfBirth: selectedPatient.dateOfBirth,
//       gender: selectedPatient.gender,
//     });
//     setSearchTerm('');
//     setFilteredPatients([]);
//   };

//   const handleClearPatient = () => {
//     setNewPatient({
//       firstName: '',
//       lastName: '',
//       email: '',
//       phone: '',
//       address: '',
//       city: '',
//       state: '',
//       zip: '',
//       bloodGroup: '',
//       dateOfBirth: '',
//       gender: '',
//       visit: {
//         visitDate: new Date().toISOString().split('T')[0],
//         visitType: VisitType.OUT_PATIENT,
//         visitStatus: VisitStatus.PENDING,
//         visitDescription: '',
//         // listofDiscounts: [],
//         doctorId: 0,
//         testIds: [],
//         packageIds: [],
//         insuranceIds: [],
//         billing: {
//           totalAmount: 0,
//           paymentStatus: PaymentStatus.PENDING,
//           paymentMethod: PaymentMethod.CASH,
//           paymentDate: new Date().toISOString().split('T')[0],
//           discount: 0,
//           gstRate: 0,
//           gstAmount: 0,
//           cgstAmount: 0,
//           sgstAmount: 0,
//           igstAmount: 0,
//           netAmount: 0,
//           discountReason: '',
//           discountPercentage: 0,
//         },
//       },
//     });
//     setSearchTerm('');
//     setFilteredPatients([]);
//     setSelectedTests([]);
//     setSelectedPackages([]);
//     setSelectedCategory('');
//   };

//   const handleAddPatient = async () => {
//     try {
//       setLoading(true);
//       const validationResult = patientSchema.safeParse(newPatient);

//       if (!validationResult.success) {
//         const error = validationResult.error;
//         toast.error(error.errors.map((err) => err.message).join(', '));
//         return;
//       }
//       const labId = currentLab?.id;
//       if (labId === undefined) {
//         toast.error('Lab ID is undefined.');
//         return;
//       }

//       const { totalAmount, netAmount, globalDiscountAmount, globalDiscountPercent } = calculateAmounts();

//       const patientData = {
//         ...newPatient,
//         visit: {
//           ...newPatient.visit,
//           billing: {
//             ...newPatient.visit.billing,
//             totalAmount,
//             netAmount,
//             discount: Number(globalDiscountAmount),
//             discountPercentage: Number(globalDiscountPercent)
//           },
//           listofeachtestdiscount: selectedTests.map(test => ({
//             id: test.id,
//             discountAmount: test.discountAmount || 0,
//             discountPercent: test.discountPercent || 0,
//             finalPrice: test.discountedPrice || test.price

//           }))
//         }
//       };

//       console.log('Patient Data:', patientData);

//       //==================================================================================================

//       // console.log('Patient Data:', patientData);
//       // Uncomment to actually send the data
//       // const response = await addPatient(labId, patientData);
//       // setPatientDetails(response.data);
//       // if (response.status === 'success') {
//       //   toast.success('Patient added successfully.', { autoClose: 2000, position: 'top-right' });
//       //   handleClearPatient();
//       //   setAddUpdatePatientListVist(!addUpdatePatientListVist);
//       //   setAddPatientModal(false);
//       // } else {
//       //   toast.error('An error occurred while adding the patient.');
//       // }
//       // ============================================
//     } catch (error) {
//       console.error('Error adding patient:', error);
//       toast.error('An error occurred while adding the patient.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!tests || !packages || !doctors || !insurances || !currentLab?.id) {
//     return <Loader />;
//   }
//   if (loading) {
//     return <Loader />
//   }

//   return (
//     <div>
//       <div className="flex gap-4 bg-gray-50 p-4 rounded-lg shadow-md">
//         <PatientFrom
//           newPatient={newPatient}
//           handleChange={handleChange}
//           searchTerm={searchTerm}
//           handleSearchChange={handleSearchChange}
//           filteredPatients={filteredPatients}
//           handlePatientSelect={handlePatientSelect}
//         />
//         <PatientVisit
//           newPatient={newPatient}
//           handleChange={handleChange}
//           doctors={doctors}
//           updatedocorlist={updatedocorlist}
//           setUpdatedocorlist={setUpdatedocorlist}
//         />
//       </div>

//       <PatientTestPackage
//         tests={tests}
//         packages={packages}
//         selectedTests={selectedTests}
//         selectedPackages={selectedPackages}
//         setSelectedTests={setSelectedTests}
//         setSelectedPackages={setSelectedPackages}
//         selectedCategory={selectedCategory}
//         handleCategoryChange={handleCategoryChange}
//         searchTestTerm={searchTestTerm}
//         handleTestSearch={handleTestSearch}
//         filteredTests={filteredTests}
//         handleTestSelection={handleTestSelection}
//         handlePackageSelection={handlePackageSelection}
//         removeTest={removeTest}
//         removePackage={removePackage}
//         categories={categories}
//         handleTestDiscountChange={handleTestDiscountChange}
//       />

//       <PatientBilling
//         selectedPackages={selectedPackages}
//         newPatient={newPatient}
//         handleChange={handleChange}
//         isGlobalDiscountHidden={isGlobalDiscountHidden}
//       />

//       <div className="flex justify-end space-x-2 mt-3">
//         <Button
//           text=''
//           type="button"
//           onClick={handleAddPatient}
//           className="flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
//         >
//           <Plus className="h-3 w-3 mr-1.5" />
//           Patient
//         </Button>
//         <Button
//           text=''
//           type="button"
//           onClick={handleClearPatient}
//           className="flex items-center px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
//         >
//           <XIcon className="h-3 w-3 mr-1.5" />
//           Cancel
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default AddPatientComponent;








//=============================================================




// import { getDoctor } from '@/../services/doctorServices';
// import { getInsurance } from '@/../services/insuranceService';
// import { getPackage } from '@/../services/packageServices';
// import { addPatient, getPatient } from '@/../services/patientServices';
// import { getTests } from '@/../services/testService';
// import { useLabs } from '@/context/LabContext';
// import { patientSchema } from '@/schema/patientScheamData';
// import { Doctor } from '@/types/doctor/doctor';
// import { Insurance } from '@/types/insurance/insurance';
// import { Package as PackageType } from '@/types/package/package';
// import { Patient, PaymentMethod, PaymentStatus, VisitStatus, VisitType } from "@/types/patient/patient";
// import { TestList } from '@/types/test/testlist';
// import { Plus, XIcon } from 'lucide-react';
// import React, { useEffect, useState } from 'react';
// import { toast } from 'react-toastify';
// import Button from '../common/Button';
// import Loader from '../common/Loader';
// import PatientBilling from './component/PatientBilling';
// import PatientFrom from './component/PatientFrom';
// import PatientTestPackage from './component/PatientTestPackage';
// import PatientVisit from './component/PatientVisit';

// enum Gender {
//   Male = 'male',
//   Female = 'female',
//   Other = 'other',
// }

// // setAddUpdatePatientListVist={setAddUpdatePatientListVist}
// //           addUpdatePatientListVist={addUpdatePatientListVist}

// interface AddPatientComponentProps {
//   setAddPatientModal: React.Dispatch<React.SetStateAction<boolean>>;
//   setAddUpdatePatientListVist: React.Dispatch<React.SetStateAction<boolean>>;
//   addUpdatePatientListVist: boolean;
// }

// const AddPatientComponent = ({ setAddPatientModal, setAddUpdatePatientListVist, addUpdatePatientListVist }: AddPatientComponentProps) => {
//   const [tests, setTests] = useState<TestList[]>([]);
//   const [packages, setPackages] = useState<PackageType[]>([]);
//   const [doctors, setDoctors] = useState<Doctor[]>([]);
//   const [insurances, setInsurances] = useState<Insurance[]>([]);
//   const [patient, setPatient] = useState<Patient[]>([]);
//   const [categories, setCategories] = useState<string[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<string>('');
//   const [searchTestTerm, setSearchTestTerm] = useState<string>('');
//   const [selectedTests, setSelectedTests] = useState<TestList[]>([]);
//   const [selectedPackages, setSelectedPackages] = useState<PackageType[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [newPatient, setNewPatient] = useState<Patient>({
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
//     gender: Gender.Female,
//     visit: {
//       visitDate: new Date().toISOString().split('T')[0],
//       visitType: VisitType.OUT_PATIENT,
//       visitStatus: VisitStatus.PENDING,
//       visitDescription: '',
//       // listofDiscounts: [],
//       doctorId: 0,
//       testIds: [],
//       packageIds: [],
//       insuranceIds: [],
//       billing: {
//         totalAmount: 0,
//         paymentStatus: PaymentStatus.PENDING,
//         paymentMethod: PaymentMethod.CASH,
//         paymentDate: new Date().toISOString().split('T')[0],
//         discount: 0,
//         gstRate: 0,
//         gstAmount: 0,
//         cgstAmount: 0,
//         sgstAmount: 0,
//         igstAmount: 0,
//         netAmount: 0,
//         discountReason: '',
//         discountPercentage: 0,
//       },
//     },
//   });
//   const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
//   const [searchTerm, setSearchTerm] = useState<string>('');
//   const { currentLab, setPatientDetails } = useLabs();
//   const [updatedocorlist, setUpdatedocorlist] = useState<boolean>(false);
//   const [isGlobalDiscountHidden, setIsGlobalDiscountHidden] = useState<boolean>(false);

//   useEffect(() => {
//     if (!currentLab || !currentLab.id) {
//       <Loader />;
//       return;
//     }
//     const fetchData = async () => {
//       try {
//         const [testData, packageData, doctorData, insuranceData, patientData] = await Promise.all([
//           getTests(currentLab.id.toString()),
//           getPackage(currentLab.id),
//           getDoctor(currentLab.id),
//           getInsurance(currentLab.id),
//           getPatient(currentLab.id),
//         ]);
//         setCategories(Array.from(new Set((testData || []).map((test) => test.category))));
//         setTests(testData || []);
//         setPackages(packageData?.data || []);
//         setDoctors(doctorData?.data || []);
//         setInsurances(insuranceData?.data || []);
//         setPatient(patientData?.data || []);
//       } catch (error) {
//         toast.error("An error occurred while fetching data.");
//       }
//     };
//     fetchData();
//   }, [currentLab, updatedocorlist]);


//   const calculateAmounts = () => {
//     // 1. Calculate original test prices (no discounts)
//     const totalOriginalTestAmount = selectedTests.reduce((acc, test) => acc + test.price, 0);

//     // 2. Calculate package prices (no discounts)
//     const totalPackageAmount = selectedPackages.reduce((acc, pkg) => acc + pkg.price, 0);

//     // 3. Apply test-specific discounts first
//     const testsAfterDiscount = selectedTests.map(test => {
//       const discountAmount = test.discountPercent
//         ? (test.price * test.discountPercent) / 100
//         : test.discountAmount || 0;

//       return {
//         ...test,
//         finalPrice: Math.max(0, test.price - discountAmount)
//       };
//     });

//     // 4. Sum all test prices after discounts
//     const totalAfterTestDiscounts = testsAfterDiscount.reduce(
//       (acc, test) => acc + test.finalPrice,
//       0
//     ) + totalPackageAmount;

//     // 5. Apply global discount (if any)
//     const globalDiscountAmount = newPatient.visit?.billing.discount || 0;
//     const netAmount = Math.max(0, totalAfterTestDiscounts - globalDiscountAmount);

//     return {
//       totalAmount: totalOriginalTestAmount + totalPackageAmount,
//       netAmount: parseFloat(netAmount.toFixed(2)),
//       amountAfterTestDiscounts: totalAfterTestDiscounts,
//       globalDiscountAmount,
//       listofeachtestdiscount: testsAfterDiscount.map(test => ({
//         id: test.id,
//         discountAmount: test.price - test.finalPrice,
//         discountPercent: test.discountPercent ||
//           ((test.price - test.finalPrice) / test.price * 100),
//         finalPrice: test.finalPrice
//       }))
//     };
//   };


//   useEffect(() => {
//     const { totalAmount, netAmount } = calculateAmounts();

//     setNewPatient(prevState => ({
//       ...prevState,
//       visit: {
//         ...prevState.visit,
//         billing: {
//           ...prevState.visit.billing,
//           totalAmount,
//           netAmount,
//           gstAmount: 0,
//           cgstAmount: 0,
//           sgstAmount: 0,
//           igstAmount: 0,
//         },
//       },
//     }));
//   }, [selectedTests, selectedPackages, newPatient.visit?.billing.discount]);

//   useEffect(() => {
//     const hasTestDiscounts = selectedTests.some(test =>
//       (test.discountAmount && test.discountAmount > 0) ||
//       (test.discountPercent && test.discountPercent > 0)
//     );
//     setIsGlobalDiscountHidden(hasTestDiscounts);
//   }, [selectedTests]);

//   const handleChange = (
//     event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: string[] } }
//   ) => {
//     const { name, value } = 'target' in event ? event.target : { name: '', value: [] };

//     if (name === 'visit.insuranceIds') {
//       setNewPatient(prevState => ({
//         ...prevState,
//         visit: {
//           ...prevState.visit,
//           insuranceIds: Array.isArray(value) ? value.map(Number) : [],
//         },
//       }));
//     } else if (name.startsWith('visit.billing')) {
//       setNewPatient(prevState => ({
//         ...prevState,
//         visit: {
//           ...prevState.visit,
//           billing: {
//             ...prevState.visit.billing,
//             [name.split('.')[2]]: value,
//           },
//         },
//       }));
//     } else if (name.startsWith('visit.')) {
//       setNewPatient(prevState => ({
//         ...prevState,
//         visit: {
//           ...prevState.visit,
//           [name.split('.')[1]]: value,
//         },
//       }));
//     } else {
//       setNewPatient(prevState => ({
//         ...prevState,
//         [name]: Array.isArray(value) ? value.map(Number) : value,
//       }));
//     }
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
//     let updatedTests = [...selectedTests];
//     if (selectedTests.some((t) => t.id === test.id)) {
//       updatedTests = updatedTests.filter((t) => t.id !== test.id);
//     } else {
//       updatedTests = [...updatedTests, { ...test, discountedPrice: test.price }];
//     }
//     setSelectedTests(updatedTests);
//     setNewPatient((prevState) => ({
//       ...prevState,
//       visit: {
//         ...prevState.visit,
//         testIds: updatedTests.map((test) => test.id),
//       },
//     }));
//   };

//   const handlePackageSelection = (pkg: PackageType) => {
//     let updatedPackages = [...selectedPackages];
//     if (selectedPackages.some((p) => p.id === pkg.id)) {
//       updatedPackages = updatedPackages.filter((p) => p.id !== pkg.id);
//     } else {
//       updatedPackages = [...updatedPackages, pkg];
//     }
//     setSelectedPackages(updatedPackages);
//     setNewPatient((prevState) => ({
//       ...prevState,
//       visit: {
//         ...prevState.visit,
//         packageIds: updatedPackages.map((pkg) => pkg.id),
//       },
//     }));
//   };

//   const removeTest = (testId: string) => {
//     const updatedTests = selectedTests.filter((test) => test.id !== Number(testId));
//     setSelectedTests(updatedTests);
//     setNewPatient((prevState) => ({
//       ...prevState,
//       visit: {
//         ...prevState.visit,
//         testIds: updatedTests.map((test) => test.id),
//       },
//     }));
//   };

//   const removePackage = (packageId: string) => {
//     const updatedPackages = selectedPackages.filter((pkg) => pkg.id !== Number(packageId));
//     setSelectedPackages(updatedPackages);
//     setNewPatient((prevState) => ({
//       ...prevState,
//       visit: {
//         ...prevState.visit,
//         packageIds: updatedPackages.map((pkg) => pkg.id),
//       },
//     }));
//   };

//   const handleTestDiscountChange = (testId: number, field: 'percent' | 'amount', value: number) => {
//     setSelectedTests(prevTests =>
//       prevTests.map(test => {
//         if (test.id === testId) {
//           const originalPrice = test.price;
//           let discountAmount = 0;
//           let discountPercent = 0;

//           if (field === 'percent') {
//             discountPercent = Math.min(100, Math.max(0, value));
//             discountAmount = (originalPrice * discountPercent) / 100;
//           } else {
//             discountAmount = Math.min(originalPrice, Math.max(0, value));
//             discountPercent = (discountAmount / originalPrice) * 100;
//           }

//           return {
//             ...test,
//             discountAmount,
//             discountPercent,
//             discountedPrice: originalPrice - discountAmount
//           };
//         }
//         return test;
//       })
//     );
//   };

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

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { value } = e.target;
//     setSearchTerm(value);
//   };

//   const handlePatientSelect = (selectedPatient: Patient) => {
//     setNewPatient({
//       ...newPatient,
//       firstName: selectedPatient.firstName,
//       lastName: '',
//       email: '',
//       phone: selectedPatient.phone,
//       address: '',
//       city: selectedPatient.city,
//       state: '',
//       zip: '',
//       bloodGroup: '',
//       dateOfBirth: selectedPatient.dateOfBirth,
//       gender: selectedPatient.gender,
//     });
//     setSearchTerm('');
//     setFilteredPatients([]);
//   };

//   const handleClearPatient = () => {
//     setNewPatient({
//       firstName: '',
//       lastName: '',
//       email: '',
//       phone: '',
//       address: '',
//       city: '',
//       state: '',
//       zip: '',
//       bloodGroup: '',
//       dateOfBirth: '',
//       gender: '',
//       visit: {
//         visitDate: new Date().toISOString().split('T')[0],
//         visitType: VisitType.OUT_PATIENT,
//         visitStatus: VisitStatus.PENDING,
//         visitDescription: '',
//         // listofDiscounts: [],
//         doctorId: 0,
//         testIds: [],
//         packageIds: [],
//         insuranceIds: [],
//         billing: {
//           totalAmount: 0,
//           paymentStatus: PaymentStatus.PENDING,
//           paymentMethod: PaymentMethod.CASH,
//           paymentDate: new Date().toISOString().split('T')[0],
//           discount: 0,
//           gstRate: 0,
//           gstAmount: 0,
//           cgstAmount: 0,
//           sgstAmount: 0,
//           igstAmount: 0,
//           netAmount: 0,
//           discountReason: '',
//           discountPercentage: 0,
//         },
//       },
//     });
//     setSearchTerm('');
//     setFilteredPatients([]);
//     setSelectedTests([]);
//     setSelectedPackages([]);
//     setSelectedCategory('');
//   };

//   const handleAddPatient = async () => {
//     try {
//       setLoading(true);
//       const validationResult = patientSchema.safeParse(newPatient);

//       // check if it contains any test id or package id
//       if (newPatient.visit.testIds.length === 0 && newPatient.visit.packageIds.length === 0) {
//         toast.error('Please select at least one test or package.');
//         return;
//       }

//       if (!validationResult.success) {
//         const error = validationResult.error;
//         toast.error(error.errors.map((err) => err.message).join(', '));
//         return;
//       }
//       const labId = currentLab?.id;
//       if (labId === undefined) {
//         toast.error('Lab ID is undefined.');
//         return;
//       }

//       const { totalAmount, netAmount, globalDiscountAmount } = calculateAmounts();

//       const patientData = {
//         ...newPatient,
//         visit: {
//           ...newPatient.visit,
//           billing: {
//             ...newPatient.visit.billing,
//             totalAmount,
//             netAmount,
//             discount: Number(globalDiscountAmount),
//             // discountPercentage: Number(globalDiscountPercent)
//           },
//           listofeachtestdiscount: selectedTests.map(test => ({
//             id: test.id,
//             discountAmount: test.discountAmount || 0,
//             discountPercent: test.discountPercent || 0,
//             finalPrice: test.discountedPrice || test.price

//           }))
//         }
//       };

//       // console.log('Patient Data:', patientData);
//       const response = await addPatient(labId, patientData);
//       setPatientDetails(response.data);
//       if (response.status === 'success') {
//         toast.success('Patient added successfully.', { autoClose: 2000, position: 'top-right' });
//         handleClearPatient();
//         setAddUpdatePatientListVist(!addUpdatePatientListVist);
//         setAddPatientModal(false);
//       } else {
//         toast.error('An error occurred while adding the patient.');
//       }
//     } catch (error) {
//       console.error('Error adding patient:', error);
//       toast.error('An error occurred while adding the patient.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!tests || !packages || !doctors || !insurances || !currentLab?.id) {
//     return <Loader />;
//   }
//   if (loading) {
//     return <Loader />
//   }

//   return (
//     <div>
//       <div className="flex gap-4 bg-gray-50 p-4 rounded-lg shadow-md">
//         <PatientFrom
//           newPatient={newPatient}
//           handleChange={handleChange}
//           searchTerm={searchTerm}
//           handleSearchChange={handleSearchChange}
//           filteredPatients={filteredPatients}
//           handlePatientSelect={handlePatientSelect}
//         />
//         <PatientVisit
//           newPatient={newPatient}
//           handleChange={handleChange}
//           doctors={doctors}
//           updatedocorlist={updatedocorlist}
//           setUpdatedocorlist={setUpdatedocorlist}
//         />
//       </div>

//       <PatientTestPackage
//         tests={tests}
//         packages={packages}
//         selectedTests={selectedTests}
//         selectedPackages={selectedPackages}
//         setSelectedTests={setSelectedTests}
//         setSelectedPackages={setSelectedPackages}
//         selectedCategory={selectedCategory}
//         handleCategoryChange={handleCategoryChange}
//         searchTestTerm={searchTestTerm}
//         handleTestSearch={handleTestSearch}
//         filteredTests={filteredTests}
//         handleTestSelection={handleTestSelection}
//         handlePackageSelection={handlePackageSelection}
//         removeTest={removeTest}
//         removePackage={removePackage}
//         categories={categories}
//         handleTestDiscountChange={handleTestDiscountChange}
//       />

//       <PatientBilling
//         selectedPackages={selectedPackages}
//         newPatient={newPatient}
//         handleChange={handleChange}
//         isGlobalDiscountHidden={isGlobalDiscountHidden}
//       />

//       <div className="flex justify-end space-x-2 mt-3">
//         <Button
//           text=''
//           type="button"
//           onClick={handleAddPatient}
//           className="flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
//         >
//           <Plus className="h-3 w-3 mr-1.5" />
//           Patient
//         </Button>
//         <Button
//           text=''
//           type="button"
//           onClick={handleClearPatient}
//           className="flex items-center px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
//         >
//           <XIcon className="h-3 w-3 mr-1.5" />
//           Cancel
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default AddPatientComponent;






///=======================================================================================







import { getDoctor } from '@/../services/doctorServices';
import { getInsurance } from '@/../services/insuranceService';
import { getPackage } from '@/../services/packageServices';
import { addPatient, getPatient } from '@/../services/patientServices';
import { getTests } from '@/../services/testService';
import { useLabs } from '@/context/LabContext';
import { patientSchema } from '@/schema/patientScheamData';
import { Doctor } from '@/types/doctor/doctor';
import { Insurance } from '@/types/insurance/insurance';
import { Package as PackageType } from '@/types/package/package';
import { Patient, PaymentMethod, PaymentStatus, VisitStatus, VisitType } from "@/types/patient/patient";
import { TestList } from '@/types/test/testlist';
import { Plus, XIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Button from '../common/Button';
import Loader from '../common/Loader';
import PatientBilling from './component/PatientBilling';
import PatientFrom from './component/PatientFrom';
import PatientTestPackage from './component/PatientTestPackage';
import PatientVisit from './component/PatientVisit';

enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

interface AddPatientComponentProps {
  setAddPatientModal: React.Dispatch<React.SetStateAction<boolean>>;
  setAddUpdatePatientListVist: React.Dispatch<React.SetStateAction<boolean>>;
  addUpdatePatientListVist: boolean;
}

const AddPatientComponent = ({ setAddPatientModal, setAddUpdatePatientListVist, addUpdatePatientListVist }: AddPatientComponentProps) => {
  const [tests, setTests] = useState<TestList[]>([]);
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [patient, setPatient] = useState<Patient[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTestTerm, setSearchTestTerm] = useState<string>('');
  const [selectedTests, setSelectedTests] = useState<TestList[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [newPatient, setNewPatient] = useState<Patient>({
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
    gender: Gender.Female,
    visit: {
      visitDate: new Date().toISOString().split('T')[0],
      visitType: VisitType.OUT_PATIENT,
      visitStatus: VisitStatus.PENDING,
      visitDescription: '',
      // listofDiscounts: [],
      doctorId: 0,
      testIds: [],
      packageIds: [],
      insuranceIds: [],
      billing: {
        totalAmount: 0,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.CASH,
        paymentDate: new Date().toISOString().split('T')[0],
        discount: 0,
        gstRate: 0,
        gstAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        netAmount: 0,
        discountReason: '',
        discountPercentage: 0,
      },
    },
  });
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { currentLab, setPatientDetails, refreshDocterList } = useLabs();
  const [isGlobalDiscountHidden, setIsGlobalDiscountHidden] = useState<boolean>(false);

  useEffect(() => {
    if (!currentLab || !currentLab.id) {
      <Loader />;
      return;
    }
    const fetchData = async () => {
      try {
        const [testData, packageData, doctorData, insuranceData, patientData] = await Promise.all([
          getTests(currentLab.id.toString()),
          getPackage(currentLab.id),
          getDoctor(currentLab.id),
          getInsurance(currentLab.id),
          getPatient(currentLab.id),
        ]);
        setCategories(Array.from(new Set((testData || []).map((test) => test.category))));
        setTests(testData || []);
        setPackages(packageData?.data || []);
        setDoctors(doctorData?.data || []);
        setInsurances(insuranceData?.data || []);
        setPatient(patientData?.data || []);
      } catch (error) {
        toast.error("An error occurred while fetching data.");
      }
    };
    fetchData();
  }, [currentLab,  refreshDocterList]);


  const calculateAmounts = () => {
    // 1. Calculate original test prices (no discounts)
    const totalOriginalTestAmount = selectedTests.reduce((acc, test) => acc + test.price, 0);

    // 2. Calculate package prices (no discounts)
    const totalPackageAmount = selectedPackages.reduce((acc, pkg) => acc + pkg.price, 0);

    // 3. Apply test-specific discounts first
    const testsAfterDiscount = selectedTests.map(test => {
      const discountAmount = test.discountPercent
        ? (test.price * test.discountPercent) / 100
        : test.discountAmount || 0;

      return {
        ...test,
        finalPrice: Math.max(0, test.price - discountAmount)
      };
    });

    // 4. Sum all test prices after discounts
    const totalAfterTestDiscounts = testsAfterDiscount.reduce(
      (acc, test) => acc + test.finalPrice,
      0
    ) + totalPackageAmount;

    // 5. Apply global discount (if any)
    const globalDiscountAmount = newPatient.visit?.billing.discount || 0;
    const netAmount = Math.max(0, totalAfterTestDiscounts - globalDiscountAmount);

    return {
      totalAmount: totalOriginalTestAmount + totalPackageAmount,
      netAmount: parseFloat(netAmount.toFixed(2)),
      amountAfterTestDiscounts: totalAfterTestDiscounts,
      globalDiscountAmount,
      listofeachtestdiscount: testsAfterDiscount.map(test => ({
        id: test.id,
        discountAmount: test.price - test.finalPrice,
        discountPercent: test.discountPercent ||
          ((test.price - test.finalPrice) / test.price * 100),
        finalPrice: test.finalPrice
      }))
    };
  };


  useEffect(() => {
    const { totalAmount, netAmount } = calculateAmounts();

    setNewPatient(prevState => ({
      ...prevState,
      visit: {
        ...prevState.visit,
        billing: {
          ...prevState.visit.billing,
          totalAmount,
          netAmount,
          gstAmount: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
        },
      },
    }));
  }, [selectedTests, selectedPackages, newPatient.visit?.billing.discount]);

  useEffect(() => {
    const hasTestDiscounts = selectedTests.some(test =>
      (test.discountAmount && test.discountAmount > 0) ||
      (test.discountPercent && test.discountPercent > 0)
    );
    setIsGlobalDiscountHidden(hasTestDiscounts);
  }, [selectedTests]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: string[] } }
  ) => {
    const { name, value } = 'target' in event ? event.target : { name: '', value: [] };

    if (name === 'visit.insuranceIds') {
      setNewPatient(prevState => ({
        ...prevState,
        visit: {
          ...prevState.visit,
          insuranceIds: Array.isArray(value) ? value.map(Number) : [],
        },
      }));
    } else if (name.startsWith('visit.billing')) {
      setNewPatient(prevState => ({
        ...prevState,
        visit: {
          ...prevState.visit,
          billing: {
            ...prevState.visit.billing,
            [name.split('.')[2]]: value,
          },
        },
      }));
    } else if (name.startsWith('visit.')) {
      setNewPatient(prevState => ({
        ...prevState,
        visit: {
          ...prevState.visit,
          [name.split('.')[1]]: value,
        },
      }));
    } else {
      setNewPatient(prevState => ({
        ...prevState,
        [name]: Array.isArray(value) ? value.map(Number) : value,
      }));
    }
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

  // Updated utility function
  const checkForDuplicateTests = (
    selectedPackages: PackageType[],
    selectedTests: TestList[],
    newItem: PackageType | TestList
  ): { isDuplicate: boolean; message: string } => {
    // Case 1: When adding a new test
    if ('category' in newItem) {
      const test = newItem;
      const packageContainingTest = selectedPackages.find(pkg =>
        pkg.tests.some(t => t.id === test.id)
      );

      if (packageContainingTest) {
        return {
          isDuplicate: true,
          message: `"${test.name}" is already included in the "${packageContainingTest.packageName}" package.`
        };
      }
    }
    // Case 2: When adding a new package
    else {
      const pkg = newItem;
      for (const pkgTest of pkg.tests) {
        const existingTest = selectedTests.find(t => t.id === pkgTest.id);
        if (existingTest) {
          return {
            isDuplicate: true,
            message: `Cannot add package "${pkg.packageName}" because it contains "${pkgTest.name}" which you've already selected individually.`
          };
        }
      }
    }

    return { isDuplicate: false, message: '' };
  };

  // Updated handleTestSelection
  const handleTestSelection = (test: TestList) => {
    const duplicateCheck = checkForDuplicateTests(selectedPackages, selectedTests, test);

    if (duplicateCheck.isDuplicate) {
      toast.warn(duplicateCheck.message, { autoClose: 5000 });
      return;
    }

    let updatedTests = [...selectedTests];
    if (selectedTests.some((t) => t.id === test.id)) {
      updatedTests = updatedTests.filter((t) => t.id !== test.id);
    } else {
      updatedTests = [...updatedTests, { ...test, discountedPrice: test.price }];
    }
    setSelectedTests(updatedTests);
    setNewPatient((prevState) => ({
      ...prevState,
      visit: {
        ...prevState.visit,
        testIds: updatedTests.map((test) => test.id),
      },
    }));
  };

  // Updated handlePackageSelection
  const handlePackageSelection = (pkg: PackageType) => {
    // First check if we're removing the package
    const isRemoving = selectedPackages.some((p) => p.id === pkg.id);

    // Only check for duplicates when adding a package, not removing
    if (!isRemoving) {
      const duplicateCheck = checkForDuplicateTests(selectedPackages, selectedTests, pkg);

      if (duplicateCheck.isDuplicate) {
        toast.warn(duplicateCheck.message, { autoClose: 5000 });
        return;
      }
    }

    let updatedPackages = [...selectedPackages];
    if (isRemoving) {
      updatedPackages = updatedPackages.filter((p) => p.id !== pkg.id);
    } else {
      updatedPackages = [...updatedPackages, pkg];
    }
    setSelectedPackages(updatedPackages);
    setNewPatient((prevState) => ({
      ...prevState,
      visit: {
        ...prevState.visit,
        packageIds: updatedPackages.map((pkg) => pkg.id),
      },
    }));
  };

  const removeTest = (testId: string) => {
    const updatedTests = selectedTests.filter((test) => test.id !== Number(testId));
    setSelectedTests(updatedTests);
    setNewPatient((prevState) => ({
      ...prevState,
      visit: {
        ...prevState.visit,
        testIds: updatedTests.map((test) => test.id),
      },
    }));
  };

  const removePackage = (packageId: string) => {
    const updatedPackages = selectedPackages.filter((pkg) => pkg.id !== Number(packageId));
    setSelectedPackages(updatedPackages);
    setNewPatient((prevState) => ({
      ...prevState,
      visit: {
        ...prevState.visit,
        packageIds: updatedPackages.map((pkg) => pkg.id),
      },
    }));
  };

  const handleTestDiscountChange = (testId: number, field: 'percent' | 'amount', value: number) => {
    setSelectedTests(prevTests =>
      prevTests.map(test => {
        if (test.id === testId) {
          const originalPrice = test.price;
          let discountAmount = 0;
          let discountPercent = 0;

          if (field === 'percent') {
            discountPercent = Math.min(100, Math.max(0, value));
            discountAmount = (originalPrice * discountPercent) / 100;
          } else {
            discountAmount = Math.min(originalPrice, Math.max(0, value));
            discountPercent = (discountAmount / originalPrice) * 100;
          }

          return {
            ...test,
            discountAmount,
            discountPercent,
            discountedPrice: originalPrice - discountAmount
          };
        }
        return test;
      })
    );
  };

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchTerm(value);
  };

  const handlePatientSelect = (selectedPatient: Patient) => {
    setNewPatient({
      ...newPatient,
      firstName: selectedPatient.firstName,
      lastName: '',
      email: '',
      phone: selectedPatient.phone,
      address: '',
      city: selectedPatient.city,
      state: '',
      zip: '',
      bloodGroup: '',
      dateOfBirth: selectedPatient.dateOfBirth,
      gender: selectedPatient.gender,
    });
    setSearchTerm('');
    setFilteredPatients([]);
  };

  const handleClearPatient = () => {
    setNewPatient({
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
      gender: '',
      visit: {
        visitDate: new Date().toISOString().split('T')[0],
        visitType: VisitType.OUT_PATIENT,
        visitStatus: VisitStatus.PENDING,
        visitDescription: '',
        // listofDiscounts: [],
        doctorId: 0,
        testIds: [],
        packageIds: [],
        insuranceIds: [],
        billing: {
          totalAmount: 0,
          paymentStatus: PaymentStatus.PENDING,
          paymentMethod: PaymentMethod.CASH,
          paymentDate: new Date().toISOString().split('T')[0],
          discount: 0,
          gstRate: 0,
          gstAmount: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          netAmount: 0,
          discountReason: '',
          discountPercentage: 0,
        },
      },
    });
    setSearchTerm('');
    setFilteredPatients([]);
    setSelectedTests([]);
    setSelectedPackages([]);
    setSelectedCategory('');
  };

  const handleAddPatient = async () => {
    try {
      setLoading(true);
      const validationResult = patientSchema.safeParse(newPatient);

      // check if it contains any test id or package id
      if (newPatient.visit.testIds.length === 0 && newPatient.visit.packageIds.length === 0) {
        toast.error('Please select at least one test or package.');
        return;
      }

      if (!validationResult.success) {
        const error = validationResult.error;
        toast.error(error.errors.map((err) => err.message).join(', '));
        return;
      }
      const labId = currentLab?.id;
      if (labId === undefined) {
        toast.error('Lab ID is undefined.');
        return;
      }

      const { totalAmount, netAmount, globalDiscountAmount } = calculateAmounts();

      const patientData = {
        ...newPatient,
        visit: {
          ...newPatient.visit,
          billing: {
            ...newPatient.visit.billing,
            totalAmount,
            netAmount,
            discount: Number(globalDiscountAmount),
            // discountPercentage: Number(globalDiscountPercent)
          },
          listofeachtestdiscount: selectedTests.map(test => ({
            id: test.id,
            discountAmount: test.discountAmount || 0,
            discountPercent: test.discountPercent || 0,
            finalPrice: test.discountedPrice || test.price

          }))
        }
      };

      // console.log('Patient Data:', patientData);
      const response = await addPatient(labId, patientData);
      setPatientDetails(response.data);
      if (response.status === 'success') {
        toast.success('Patient added successfully.', { autoClose: 2000, position: 'top-right' });
        handleClearPatient();
        setAddUpdatePatientListVist(!addUpdatePatientListVist);
        setAddPatientModal(false);
      } else {
        toast.error('An error occurred while adding the patient.');
      }
    } catch (error) {
      console.error('Error adding patient:', error);
      toast.error('An error occurred while adding the patient.');
    } finally {
      setLoading(false);
    }
  };



  if (!tests || !packages || !doctors || !insurances || !currentLab?.id) {
    return <Loader />;
  }
  if (loading) {
    return <Loader />

  }



  return (
    <div>
      <div className="flex gap-4 bg-gray-50 p-4 rounded-lg shadow-md">
        <PatientFrom
          newPatient={newPatient}
          handleChange={handleChange}
          searchTerm={searchTerm}
          handleSearchChange={handleSearchChange}
          filteredPatients={filteredPatients}
          handlePatientSelect={handlePatientSelect}
        />
        <PatientVisit
          newPatient={newPatient}
          handleChange={handleChange}
          doctors={doctors}
        />
      </div>

      <PatientTestPackage
        tests={tests}
        packages={packages}
        selectedTests={selectedTests}
        selectedPackages={selectedPackages}
        setSelectedTests={setSelectedTests}
        setSelectedPackages={setSelectedPackages}
        selectedCategory={selectedCategory}
        handleCategoryChange={handleCategoryChange}
        searchTestTerm={searchTestTerm}
        handleTestSearch={handleTestSearch}
        filteredTests={filteredTests}
        handleTestSelection={handleTestSelection}
        handlePackageSelection={handlePackageSelection}
        removeTest={removeTest}
        removePackage={removePackage}
        categories={categories}
        handleTestDiscountChange={handleTestDiscountChange}
      />

      <PatientBilling
        selectedPackages={selectedPackages}
        newPatient={newPatient}
        handleChange={handleChange}
        isGlobalDiscountHidden={isGlobalDiscountHidden}
      />

      <div className="flex justify-end space-x-2 mt-3">
        <Button
          text=''
          type="button"
          onClick={handleAddPatient}
          className="flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-3 w-3 mr-1.5" />
          Patient
        </Button>
        <Button
          text=''
          type="button"
          onClick={handleClearPatient}
          className="flex items-center px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        >
          <XIcon className="h-3 w-3 mr-1.5" />
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default AddPatientComponent;
