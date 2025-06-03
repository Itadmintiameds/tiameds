// import { getDoctor } from '@/../services/doctorServices';
// import { getInsurance } from '@/../services/insuranceService';
// import { getPackage } from '@/../services/packageServices';
// import { updatePatient, getPatient } from '@/../services/patientServices';
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
// import EditPatientFrom from './editpatient/EditPatientFrom';
// import PatientTestPackage from './component/PatientTestPackage';
// import PatientVisit from './component/PatientVisit';

// enum Gender {
//   Male = 'male',
//   Female = 'female',
//   Other = 'other',
// }

// interface EditPatientDetailsProps {
//   setEditPatientDetailsModal: (value: boolean) => void;
//   editPatientDetails: Patient | null;
// }

// const EditPatientDetails = ({ setEditPatientDetailsModal, editPatientDetails }: EditPatientDetailsProps) => {
//   const [tests, setTests] = useState<TestList[]>([]);
//   const [packages, setPackages] = useState<PackageType[]>([]);
//   const [doctors, setDoctors] = useState<Doctor[]>([]);
//   const [insurances, setInsurances] = useState<Insurance[]>([]);
//   const [categories, setCategories] = useState<string[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<string>('');
//   const [searchTestTerm, setSearchTestTerm] = useState<string>('');
//   const [selectedTests, setSelectedTests] = useState<TestList[]>([]);
//   const [selectedPackages, setSelectedPackages] = useState<PackageType[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [updatedocorlist, setUpdatedocorlist] = useState<boolean>(false);
//   const [isGlobalDiscountHidden, setIsGlobalDiscountHidden] = useState<boolean>(false);
//   const { currentLab, setPatientDetails } = useLabs();

//   const [editedPatient, setEditedPatient] = useState<Patient>({
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
//     gender: Gender.Male,
//     visit: {
//       visitId: 0,
//       visitDate: new Date().toISOString().split('T')[0],
//       visitType: VisitType.OUT_PATIENT,
//       visitStatus: VisitStatus.PENDING,
//       visitDescription: '',
//       listofDiscounts: [],
//       doctorId: 0,
//       testIds: [],
//       packageIds: [],
//       insuranceIds: [],
//       billing: {
//         billingId: 0,
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

//   useEffect(() => {
//     if (editPatientDetails) {
//       setEditedPatient(editPatientDetails);

//       if (currentLab?.id) {
//         const fetchInitialData = async () => {
//           try {
//             setLoading(true);
//             const [testData, packageData, doctorData, insuranceData] = await Promise.all([
//               getTests(currentLab.id.toString()),
//               getPackage(currentLab.id),
//               getDoctor(currentLab.id),
//               getInsurance(currentLab.id),
//             ]);

//             // Handle test data
//             const testsFromData = testData || [];
//             setTests(testsFromData);
//             setCategories(Array.from(new Set(testsFromData.map((test) => test.category))));

//             // Handle package data - adjust based on your API response structure
//             const packagesFromData = packageData?.data || packageData || [];
//             setPackages(packagesFromData);

//             // Set selected tests
//             const selectedTestIds = editPatientDetails.visit.testIds || [];
//             const initiallySelectedTests = testsFromData
//               .filter(test => selectedTestIds.includes(test.id))
//               .map(test => ({
//                 ...test,
//                 discountedPrice: test.price,
//                 discountAmount: 0,
//                 discountPercent: 0
//               }));
//             setSelectedTests(initiallySelectedTests);

//             // Set selected packages
//             const selectedPackageIds = editPatientDetails.visit.packageIds || [];
//             const initiallySelectedPackages = packagesFromData
//               .filter((pkg: PackageType) => selectedPackageIds.includes(pkg.id));
//             setSelectedPackages(initiallySelectedPackages);

//             // Set doctors and insurances
//             setDoctors(doctorData?.data || []);
//             setInsurances(insuranceData?.data || []);

//           } catch (error) {
//             console.error("Error fetching initial data:", error);
//             toast.error("An error occurred while fetching data.");
//           } finally {
//             setLoading(false);
//           }
//         };
//         fetchInitialData();
//       }
//     }
//   }, [editPatientDetails, currentLab]);

//   const calculateAmounts = () => {
//     const totalOriginalTestAmount = selectedTests.reduce((acc, test) => acc + test.price, 0);
//     const totalPackageAmount = selectedPackages.reduce((acc, pkg) => acc + pkg.price, 0);
//     const totalAfterTestDiscounts = selectedTests.reduce(
//       (acc, test) => acc + (test.discountedPrice || test.price),
//       0
//     ) + totalPackageAmount;

//     const globalDiscountPercent = parseFloat(editedPatient.visit?.billing.discount?.toString() || '0') || 0;
//     const globalDiscountAmount = parseFloat(editedPatient.visit?.billing.discount?.toString() || '0') || 0;
//     const amountAfterGlobalDiscount = totalAfterTestDiscounts - globalDiscountAmount;
//     const netAmount = parseFloat(amountAfterGlobalDiscount.toFixed(2));

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

//     setEditedPatient(prevState => ({
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
//   }, [selectedTests, selectedPackages, editedPatient.visit?.billing.discount]);

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
//       setEditedPatient(prevState => ({
//         ...prevState,
//         visit: {
//           ...prevState.visit,
//           insuranceIds: Array.isArray(value) ? value.map(Number) : [],
//         },
//       }));
//     } else if (name.startsWith('visit.billing')) {
//       setEditedPatient(prevState => ({
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
//       setEditedPatient(prevState => ({
//         ...prevState,
//         visit: {
//           ...prevState.visit,
//           [name.split('.')[1]]: value,
//         },
//       }));
//     } else {
//       setEditedPatient(prevState => ({
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
//       updatedTests = [...updatedTests, { 
//         ...test, 
//         discountedPrice: test.price,
//         discountAmount: 0,
//         discountPercent: 0
//       }];
//     }
//     setSelectedTests(updatedTests);
//     setEditedPatient((prevState) => ({
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
//     setEditedPatient((prevState) => ({
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
//     setEditedPatient((prevState) => ({
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
//     setEditedPatient((prevState) => ({
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

//   const handleUpdatePatient = async () => {
//     try {
//       setLoading(true);
//       const validationResult = patientSchema.safeParse(editedPatient);
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
//         ...editedPatient,
//         visit: {
//           ...editedPatient.visit,
//           billing: {
//             ...editedPatient.visit.billing,
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

//       // const response = await updatePatient(labId, editedPatient.id?.toString() || '', patientData);
//       // setPatientDetails(response.data);
//       // if (response.status === 'success') {
//       //   toast.success('Patient updated successfully.', { autoClose: 2000, position: 'top-right' });
//       //   setEditPatientDetailsModal(false);
//       // } else {
//       //   toast.error('An error occurred while updating the patient.');
//       // }
//     } catch (error) {
//       console.error('Error updating patient:', error);
//       toast.error('An error occurred while updating the patient.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading || !currentLab?.id) {
//     return <Loader />;
//   }

//   console.log('Edited Patient:--------------------', editedPatient);

//   return (
//     <div>
//       <div className="flex gap-4">
//         <EditPatientFrom 
//           newPatient={editedPatient}
//           handleChange={handleChange}
//           isEditMode={true}
//           searchTerm={''}
//           handleSearchChange={() => {}}
//           filteredPatients={[]}
//           handlePatientSelect={() => {}}
//         />
//         <PatientVisit
//           newPatient={editedPatient}
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
//         newPatient={editedPatient}
//         handleChange={handleChange}
//         isGlobalDiscountHidden={isGlobalDiscountHidden}
//       />

//       <div className="flex justify-end space-x-2 mt-3">
//         <Button
//           text=''
//           type="button"
//           onClick={handleUpdatePatient}
//           className="flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
//         >
//           <Plus className="h-3 w-3 mr-1.5" />
//           Update Patient
//         </Button>
//         <Button
//           text=''
//           type="button"
//           onClick={() => setEditPatientDetailsModal(false)}
//           className="flex items-center px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
//         >
//           <XIcon className="h-3 w-3 mr-1.5" />
//           Cancel
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default EditPatientDetails;










// import { getDoctor } from '@/../services/doctorServices';
// import { getInsurance } from '@/../services/insuranceService';
// import { getPackage } from '@/../services/packageServices';
// import { updatePatient, getPatient } from '@/../services/patientServices';
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
// import EditPatientFrom from './editpatient/EditPatientFrom';
// import PatientTestPackage from './component/PatientTestPackage';
// import PatientVisit from './component/PatientVisit';

// enum Gender {
//   Male = 'male',
//   Female = 'female',
//   Other = 'other',
// }

// interface EditPatientDetailsProps {
//   setEditPatientDetailsModal: (value: boolean) => void;
//   editPatientDetails: Patient | null;
// }

// const EditPatientDetails = ({ setEditPatientDetailsModal, editPatientDetails }: EditPatientDetailsProps) => {
//   const [tests, setTests] = useState<TestList[]>([]);
//   const [packages, setPackages] = useState<PackageType[]>([]);
//   const [doctors, setDoctors] = useState<Doctor[]>([]);
//   const [insurances, setInsurances] = useState<Insurance[]>([]);
//   const [categories, setCategories] = useState<string[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<string>('');
//   const [searchTestTerm, setSearchTestTerm] = useState<string>('');
//   const [selectedTests, setSelectedTests] = useState<TestList[]>([]);
//   const [selectedPackages, setSelectedPackages] = useState<PackageType[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [updatedocorlist, setUpdatedocorlist] = useState<boolean>(false);
//   const [isGlobalDiscountHidden, setIsGlobalDiscountHidden] = useState<boolean>(false);
//   const { currentLab, setPatientDetails } = useLabs();

//   const [editedPatient, setEditedPatient] = useState<Patient>({
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
//     gender: Gender.Male,
//     visit: {
//       visitId: 0,
//       visitDate: new Date().toISOString().split('T')[0],
//       visitType: VisitType.OUT_PATIENT,
//       visitStatus: VisitStatus.PENDING,
//       visitDescription: '',
//       listofeachtestdiscount: [],
//       doctorId: 0,
//       testIds: [],
//       packageIds: [],
//       insuranceIds: [],
//       billing: {
//         billingId: 0,
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

//   useEffect(() => {
//     if (editPatientDetails) {
//       setEditedPatient(editPatientDetails);

//       if (currentLab?.id) {
//         const fetchInitialData = async () => {
//           try {
//             setLoading(true);
//             const [testData, packageData, doctorData, insuranceData] = await Promise.all([
//               getTests(currentLab.id.toString()),
//               getPackage(currentLab.id),
//               getDoctor(currentLab.id),
//               getInsurance(currentLab.id),
//             ]);

//             // Handle test data
//             const testsFromData = testData || [];
//             setTests(testsFromData);
//             setCategories(Array.from(new Set(testsFromData.map((test) => test.category))));

//             // Handle package data
//             const packagesFromData = packageData?.data || packageData || [];
//             setPackages(packagesFromData);

//             // Set selected tests with their discounts
//             const selectedTestIds = editPatientDetails.visit.testIds || [];
//             const testDiscountsMap = new Map();

//             // Create a map of test discounts from the incoming data
//             if (editPatientDetails.visit.listofeachtestdiscount) {
//               editPatientDetails.visit.listofeachtestdiscount.forEach(discount => {
//                 testDiscountsMap.set(discount.id, discount);
//               });
//             }

//             const initiallySelectedTests = testsFromData
//               .filter(test => selectedTestIds.includes(test.id))
//               .map(test => {
//                 const discountInfo = testDiscountsMap.get(test.id);
//                 return {
//                   ...test,
//                   discountedPrice: discountInfo ? discountInfo.finalPrice : test.price,
//                   discountAmount: discountInfo ? discountInfo.discountAmount : 0,
//                   discountPercent: discountInfo ? discountInfo.discountPercent : 0
//                 };
//               });
//             setSelectedTests(initiallySelectedTests);

//             // Set selected packages
//             const selectedPackageIds = editPatientDetails.visit.packageIds || [];
//             const initiallySelectedPackages = packagesFromData
//               .filter((pkg: PackageType) => selectedPackageIds.includes(pkg.id));
//             setSelectedPackages(initiallySelectedPackages);

//             // Set doctors and insurances
//             setDoctors(doctorData?.data || []);
//             setInsurances(insuranceData?.data || []);

//           } catch (error) {
//             console.error("Error fetching initial data:", error);
//             toast.error("An error occurred while fetching data.");
//           } finally {
//             setLoading(false);
//           }
//         };
//         fetchInitialData();
//       }
//     }
//   }, [editPatientDetails, currentLab]);

//   const calculateAmounts = () => {
//     const totalOriginalTestAmount = selectedTests.reduce((acc, test) => acc + test.price, 0);
//     const totalPackageAmount = selectedPackages.reduce((acc, pkg) => acc + pkg.price, 0);
//     const totalAfterTestDiscounts = selectedTests.reduce(
//       (acc, test) => acc + (test.discountedPrice || test.price),
//       0
//     ) + totalPackageAmount;

//     const globalDiscountPercent = parseFloat(editedPatient.visit?.billing.discount?.toString() || '0') || 0;
//     const globalDiscountAmount = (totalAfterTestDiscounts * globalDiscountPercent) / 100;
//     const amountAfterGlobalDiscount = totalAfterTestDiscounts - globalDiscountAmount;
//     const netAmount = parseFloat(amountAfterGlobalDiscount.toFixed(2));

//     return {
//       totalAmount: totalOriginalTestAmount + totalPackageAmount,
//       netAmount,
//       amountAfterTestDiscounts: totalAfterTestDiscounts,
//       globalDiscountAmount,
//       globalDiscountPercent
//     };
//   };

//   useEffect(() => {
//     const { totalAmount, netAmount, globalDiscountAmount, globalDiscountPercent } = calculateAmounts();

//     setEditedPatient(prevState => ({
//       ...prevState,
//       visit: {
//         ...prevState.visit,
//         billing: {
//           ...prevState.visit.billing,
//           totalAmount,
//           netAmount,
//           discount: globalDiscountAmount,
//           discountPercentage: globalDiscountPercent,
//           gstAmount: 0,
//           cgstAmount: 0,
//           sgstAmount: 0,
//           igstAmount: 0,
//         },
//       },
//     }));
//   }, [selectedTests, selectedPackages, editedPatient.visit?.billing.discount]);

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
//       setEditedPatient(prevState => ({
//         ...prevState,
//         visit: {
//           ...prevState.visit,
//           insuranceIds: Array.isArray(value) ? value.map(Number) : [],
//         },
//       }));
//     } else if (name.startsWith('visit.billing')) {
//       setEditedPatient(prevState => ({
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
//       setEditedPatient(prevState => ({
//         ...prevState,
//         visit: {
//           ...prevState.visit,
//           [name.split('.')[1]]: value,
//         },
//       }));
//     } else {
//       setEditedPatient(prevState => ({
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
//       updatedTests = [...updatedTests, { 
//         ...test, 
//         discountedPrice: test.price,
//         discountAmount: 0,
//         discountPercent: 0
//       }];
//     }
//     setSelectedTests(updatedTests);
//     setEditedPatient((prevState) => ({
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
//     setEditedPatient((prevState) => ({
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
//     setEditedPatient((prevState) => ({
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
//     setEditedPatient((prevState) => ({
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

//   const handleUpdatePatient = async () => {
//     try {
//       setLoading(true);
//       const validationResult = patientSchema.safeParse(editedPatient);
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
//         ...editedPatient,
//         visit: {
//           ...editedPatient.visit,
//           billing: {
//             ...editedPatient.visit.billing,
//             totalAmount,
//             netAmount,
//             discount: globalDiscountAmount,
//             discountPercentage: globalDiscountPercent
//           },
//           listofeachtestdiscount: selectedTests.map(test => ({
//             id: test.id,
//             discountAmount: test.discountAmount || 0,
//             discountPercent: test.discountPercent || 0,
//             finalPrice: test.discountedPrice || test.price,
//             createdBy: "system",
//             updatedBy: "system"
//           }))
//         }
//       };

//       // const response = await updatePatient(labId, editedPatient.id, patientData);
//       // setPatientDetails(response.data);
//       // if (response.status === 'success') {
//       //   toast.success('Patient updated successfully.', { autoClose: 2000, position: 'top-right' });
//       //   setEditPatientDetailsModal(false);
//       // } else {
//       //   toast.error('An error occurred while updating the patient.');
//       // }
//     } catch (error) {
//       console.error('Error updating patient:', error);
//       toast.error('An error occurred while updating the patient.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading || !currentLab?.id) {
//     return <Loader />;
//   }

//   return (
//     <div>
//       <div className="flex gap-4">
//         <EditPatientFrom 
//           newPatient={editedPatient}
//           handleChange={handleChange}
//           isEditMode={true}
//           searchTerm={''}
//           handleSearchChange={() => {}}
//           filteredPatients={[]}
//           handlePatientSelect={() => {}}
//         />
//         <PatientVisit
//           newPatient={editedPatient}
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
//         newPatient={editedPatient}
//         handleChange={handleChange}
//         isGlobalDiscountHidden={isGlobalDiscountHidden}
//       />

//       <div className="flex justify-end space-x-2 mt-3">
//         <Button
//           text=''
//           type="button"
//           onClick={handleUpdatePatient}
//           className="flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
//         >
//           <Plus className="h-3 w-3 mr-1.5" />
//           Update Patient
//         </Button>
//         <Button
//           text=''
//           type="button"
//           onClick={() => setEditPatientDetailsModal(false)}
//           className="flex items-center px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
//         >
//           <XIcon className="h-3 w-3 mr-1.5" />
//           Cancel
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default EditPatientDetails;



















// import { getDoctor } from '@/../services/doctorServices';
// import { getInsurance } from '@/../services/insuranceService';
// import { getPackage } from '@/../services/packageServices';
// import { updatePatient, getPatient,updatePatientDetails } from '@/../services/patientServices';
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
// import EditPatientFrom from './editpatient/EditPatientFrom';
// import PatientTestPackage from './component/PatientTestPackage';
// import PatientVisit from './component/PatientVisit';


// enum Gender {
//   Male = 'male',
//   Female = 'female',
//   Other = 'other',
// }

// interface EditPatientDetailsProps {
//   setEditPatientDetailsModal: (value: boolean) => void;
//   editPatientDetails: Patient | null;
// }

// const EditPatientDetails = ({ setEditPatientDetailsModal, editPatientDetails }: EditPatientDetailsProps) => {
//   const [tests, setTests] = useState<TestList[]>([]);
//   const [packages, setPackages] = useState<PackageType[]>([]);
//   const [doctors, setDoctors] = useState<Doctor[]>([]);
//   const [insurances, setInsurances] = useState<Insurance[]>([]);
//   const [categories, setCategories] = useState<string[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<string>('');
//   const [searchTestTerm, setSearchTestTerm] = useState<string>('');
//   const [selectedTests, setSelectedTests] = useState<TestList[]>([]);
//   const [selectedPackages, setSelectedPackages] = useState<PackageType[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [updatedocorlist, setUpdatedocorlist] = useState<boolean>(false);
//   const [isGlobalDiscountHidden, setIsGlobalDiscountHidden] = useState<boolean>(false);
//   const { currentLab, setPatientDetails } = useLabs();

//   const [editedPatient, setEditedPatient] = useState<Patient>({
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
//     gender: Gender.Male,
//     visit: {
//       visitId: 0,
//       visitDate: new Date().toISOString().split('T')[0],
//       visitType: VisitType.OUT_PATIENT,
//       visitStatus: VisitStatus.PENDING,
//       visitDescription: '',
//       listofeachtestdiscount: [],
//       doctorId: 0,
//       testIds: [],
//       packageIds: [],
//       insuranceIds: [],
//       billing: {
//         billingId: 0,
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
//         discountPercentage : 0,
//       },
//     },
//   });

//   useEffect(() => {
//     if (editPatientDetails) {
//       setEditedPatient(editPatientDetails);

//       if (currentLab?.id) {
//         const fetchInitialData = async () => {
//           try {
//             setLoading(true);
//             const [testData, packageData, doctorData, insuranceData] = await Promise.all([
//               getTests(currentLab.id.toString()),
//               getPackage(currentLab.id),
//               getDoctor(currentLab.id),
//               getInsurance(currentLab.id),
//             ]);

//             // Handle test data
//             const testsFromData = testData || [];
//             setTests(testsFromData);
//             setCategories(Array.from(new Set(testsFromData.map((test) => test.category))));

//             // Handle package data
//             const packagesFromData = packageData?.data || packageData || [];
//             setPackages(packagesFromData);

//             // Set selected tests with their discounts
//             const selectedTestIds = editPatientDetails.visit.testIds || [];
//             const testDiscountsMap = new Map();

//             // Create a map of test discounts from the incoming data
//             if (editPatientDetails.visit.listofeachtestdiscount) {
//               editPatientDetails.visit.listofeachtestdiscount.forEach(discount => {
//                 testDiscountsMap.set(discount.id, discount);
//               });
//             }

//             const initiallySelectedTests = testsFromData
//               .filter(test => selectedTestIds.includes(test.id))
//               .map(test => {
//                 const discountInfo = testDiscountsMap.get(test.id);
//                 return {
//                   ...test,
//                   discountedPrice: discountInfo ? discountInfo.finalPrice : test.price,
//                   discountAmount: discountInfo ? discountInfo.discountAmount : 0,
//                   discountPercent: discountInfo ? discountInfo.discountPercent : 0
//                 };
//               });
//             setSelectedTests(initiallySelectedTests);

//             // Set selected packages
//             const selectedPackageIds = editPatientDetails.visit.packageIds || [];
//             const initiallySelectedPackages = packagesFromData
//               .filter((pkg: PackageType) => selectedPackageIds.includes(pkg.id));
//             setSelectedPackages(initiallySelectedPackages);

//             // Set doctors and insurances
//             setDoctors(doctorData?.data || []);
//             setInsurances(insuranceData?.data || []);

//           } catch (error) {
//             console.error("Error fetching initial data:", error);
//             toast.error("An error occurred while fetching data.");
//           } finally {
//             setLoading(false);
//           }
//         };
//         fetchInitialData();
//       }
//     }
//   }, [editPatientDetails, currentLab]);

//   const calculateAmounts = () => {
//     const totalOriginalTestAmount = selectedTests.reduce((acc, test) => acc + test.price, 0);
//     const totalPackageAmount = selectedPackages.reduce((acc, pkg) => acc + pkg.price, 0);
//     const totalAfterTestDiscounts = selectedTests.reduce(
//       (acc, test) => acc + (test.discountedPrice || test.price),
//       0
//     ) + totalPackageAmount;

//     const globalDiscountPercent = parseFloat(editedPatient.visit?.billing.discount?.toString() || '0') || 0;
//     const globalDiscountAmount = (totalAfterTestDiscounts * globalDiscountPercent) / 100;
//     const amountAfterGlobalDiscount = totalAfterTestDiscounts - globalDiscountAmount;
//     const netAmount = parseFloat(amountAfterGlobalDiscount.toFixed(2));

//     return {
//       totalAmount: totalOriginalTestAmount + totalPackageAmount,
//       netAmount,
//       amountAfterTestDiscounts: totalAfterTestDiscounts,
//       globalDiscountAmount,
//       globalDiscountPercent
//     };
//   };

//   useEffect(() => {
//     const { totalAmount, netAmount, globalDiscountAmount, globalDiscountPercent } = calculateAmounts();

//     setEditedPatient(prevState => ({
//       ...prevState,
//       visit: {
//         ...prevState.visit,
//         billing: {
//           ...prevState.visit.billing,
//           totalAmount,
//           netAmount,
//           discount: globalDiscountAmount,
//           discountPercentage: globalDiscountPercent,
//           gstAmount: 0,
//           cgstAmount: 0,
//           sgstAmount: 0,
//           igstAmount: 0,
//         },
//       },
//     }));
//   }, [selectedTests, selectedPackages, editedPatient.visit?.billing.discount]);

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
//       setEditedPatient(prevState => ({
//         ...prevState,
//         visit: {
//           ...prevState.visit,
//           insuranceIds: Array.isArray(value) ? value.map(Number) : [],
//         },
//       }));
//     } else if (name.startsWith('visit.billing')) {
//       setEditedPatient(prevState => ({
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
//       setEditedPatient(prevState => ({
//         ...prevState,
//         visit: {
//           ...prevState.visit,
//           [name.split('.')[1]]: value,
//         },
//       }));
//     } else {
//       setEditedPatient(prevState => ({
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
//       updatedTests = [...updatedTests, { 
//         ...test, 
//         discountedPrice: test.price,
//         discountAmount: 0,
//         discountPercent: 0
//       }];
//     }
//     setSelectedTests(updatedTests);
//     setEditedPatient((prevState) => ({
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
//     setEditedPatient((prevState) => ({
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
//     setEditedPatient((prevState) => ({
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
//     setEditedPatient((prevState) => ({
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

//   const handleUpdatePatient = async () => {
//     try {
//       setLoading(true);
//       const validationResult = patientSchema.safeParse(editedPatient);
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
//         ...editedPatient,
//         visit: {
//           ...editedPatient.visit,
//           billing: {
//             ...editedPatient.visit.billing,
//             totalAmount,
//             netAmount,
//             discount: globalDiscountAmount,
//             discountPercentage: globalDiscountPercent
//           },
//           listofeachtestdiscount: selectedTests.map(test => ({
//             id: test.id,
//             discountAmount: test.discountAmount || 0,
//             discountPercent: test.discountPercent || 0,
//             finalPrice: test.discountedPrice || test.price,
//           }))
//         }
//       };

//       console.log('Patient Data to Update:', patientData);

//       // const response = await updatePatientDetails(labId, patientData);
//       // setPatientDetails(response.data);
//       // if (response.status === 'success') {
//       //   toast.success('Patient updated successfully.', { autoClose: 2000, position: 'top-right' });
//       //   setEditPatientDetailsModal(false);
//       // } else {
//       //   toast.error('An error occurred while updating the patient.');
//       // }
//     } catch (error) {
//       console.error('Error updating patient:', error);
//       toast.error('An error occurred while updating the patient.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading || !currentLab?.id) {
//     return <Loader />;
//   }

//   console.log('Edited Patient:', editedPatient);

//   return (
//     <div>
//       <div className="flex gap-4">
//         <EditPatientFrom 
//           newPatient={editedPatient}
//           handleChange={handleChange}
//           isEditMode={true}
//           searchTerm={''}
//           handleSearchChange={() => {}}
//           filteredPatients={[]}
//           handlePatientSelect={() => {}}
//         />
//         <PatientVisit
//           newPatient={editedPatient}
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
//         newPatient={editedPatient}
//         handleChange={handleChange}
//         isGlobalDiscountHidden={isGlobalDiscountHidden}
//       />
//       <div className="flex justify-end space-x-2 mt-3">
//         <Button
//           text=''
//           type="button"
//           onClick={handleUpdatePatient}
//           className="flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
//         >
//           <Plus className="h-3 w-3 mr-1.5" />
//           Update Patient
//         </Button>
//         <Button
//           text=''
//           type="button"
//           onClick={() => setEditPatientDetailsModal(false)}
//           className="flex items-center px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
//         >
//           <XIcon className="h-3 w-3 mr-1.5" />
//           Cancel
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default EditPatientDetails;






import { getDoctor } from '@/../services/doctorServices';
import { getInsurance } from '@/../services/insuranceService';
import { getPackage } from '@/../services/packageServices';
import { updatePatientDetails } from '@/../services/patientServices';
import { getTests } from '@/../services/testService';
import { useLabs } from '@/context/LabContext';
// import { patientSchema } from '@/schema/patientScheamData';
import { EditPatientSchema } from '@/schema/editPatientSchema';
import { Doctor } from '@/types/doctor/doctor';
// import { Insurance } from '@/types/insurance/insurance';
import { Package as PackageType } from '@/types/package/package';
import { Patient, PaymentMethod, PaymentStatus, VisitStatus, VisitType } from "@/types/patient/patient";
import { TestList } from '@/types/test/testlist';
import { Plus, XIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Button from '../common/Button';
import Loader from '../common/Loader';
import PatientBilling from './component/PatientBilling';
import PatientTestPackage from './component/PatientTestPackage';
import PatientVisit from './component/PatientVisit';
import EditPatientFrom from './editpatient/EditPatientFrom';


enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}


interface EditPatientDetailsProps {
  setEditPatientDetailsModal: (value: boolean) => void;
  editPatientDetails: Patient | null;
  setUpdatePatientListVist: (value: boolean) => void;
  updatePatientListVist: boolean;
}

const EditPatientDetails = ({ setEditPatientDetailsModal, editPatientDetails, setUpdatePatientListVist, updatePatientListVist }: EditPatientDetailsProps) => {
  const [tests, setTests] = useState<TestList[]>([]);
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  // const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTestTerm, setSearchTestTerm] = useState<string>('');
  const [selectedTests, setSelectedTests] = useState<TestList[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [updatedocorlist, setUpdatedocorlist] = useState<boolean>(false);
  const [isGlobalDiscountHidden, setIsGlobalDiscountHidden] = useState<boolean>(false);
  const { currentLab, setPatientDetails } = useLabs();

  const [editedPatient, setEditedPatient] = useState<Patient>({
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
    gender: Gender.Male,
    visit: {
      visitId: 0,
      visitDate: new Date().toISOString().split('T')[0],
      visitType: VisitType.OUT_PATIENT,
      visitStatus: VisitStatus.PENDING,
      visitDescription: '',
      listofeachtestdiscount: [],
      doctorId: 0,
      testIds: [],
      packageIds: [],
      insuranceIds: [],
      billing: {
        billingId: 0,
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

  useEffect(() => {
    if (editPatientDetails) {
      setEditedPatient(editPatientDetails);

      if (currentLab?.id) {
        const fetchInitialData = async () => {
          try {
            setLoading(true);
            const [testData, packageData, doctorData] = await Promise.all([
              getTests(currentLab.id.toString()),
              getPackage(currentLab.id),
              getDoctor(currentLab.id),
              getInsurance(currentLab.id),
            ]);

            const testsFromData = testData || [];
            setTests(testsFromData);
            setCategories(Array.from(new Set(testsFromData.map((test) => test.category))));

            const packagesFromData = packageData?.data || packageData || [];
            setPackages(packagesFromData);

            const selectedTestIds = editPatientDetails.visit.testIds || [];
            const testDiscountsMap = new Map();

            if (editPatientDetails.visit.listofeachtestdiscount) {
              editPatientDetails.visit.listofeachtestdiscount.forEach(discount => {
                testDiscountsMap.set(discount.id, discount);
              });
            }

            const initiallySelectedTests = testsFromData
              .filter(test => selectedTestIds.includes(test.id))
              .map(test => ({
                ...test,
                discountedPrice: testDiscountsMap.get(test.id)?.finalPrice || test.price,
                discountAmount: testDiscountsMap.get(test.id)?.discountAmount || 0,
                discountPercent: testDiscountsMap.get(test.id)?.discountPercent || 0
              }));
            setSelectedTests(initiallySelectedTests);

            const selectedPackageIds = editPatientDetails.visit.packageIds || [];
            const initiallySelectedPackages = packagesFromData
              .filter((pkg: PackageType) => selectedPackageIds.includes(pkg.id));
            setSelectedPackages(initiallySelectedPackages);

            setDoctors(doctorData?.data || []);
            // setInsurances(insuranceData?.data || []);

          } catch (error) {
            console.error("Error fetching initial data:", error);
            toast.error("Failed to load initial data");
          } finally {
            setLoading(false);
          }
        };
        fetchInitialData();
      }
    }
  }, [editPatientDetails, currentLab]);

  const calculateAmounts = () => {
    const totalOriginalTestAmount = selectedTests.reduce((acc, test) => acc + test.price, 0);
    const totalPackageAmount = selectedPackages.reduce((acc, pkg) => acc + pkg.price, 0);
    const totalAfterTestDiscounts = selectedTests.reduce(
      (acc, test) => acc + (test.discountedPrice || test.price),
      0
    ) + totalPackageAmount;

    const globalDiscountPercent = parseFloat(editedPatient.visit?.billing.discount?.toString() || '0') || 0;
    const globalDiscountAmount = (totalAfterTestDiscounts * globalDiscountPercent) / 100;
    const amountAfterGlobalDiscount = totalAfterTestDiscounts - globalDiscountAmount;
    const netAmount = parseFloat(amountAfterGlobalDiscount.toFixed(2));

    return {
      totalAmount: totalOriginalTestAmount + totalPackageAmount,
      netAmount,
      amountAfterTestDiscounts: totalAfterTestDiscounts,
      globalDiscountAmount,
      globalDiscountPercent
    };
  };

  useEffect(() => {
    const { totalAmount, netAmount, globalDiscountAmount, globalDiscountPercent } = calculateAmounts();

    setEditedPatient(prev => ({
      ...prev,
      visit: {
        ...prev.visit,
        billing: {
          ...prev.visit.billing,
          totalAmount,
          netAmount,
          discount: globalDiscountAmount,
          discountPercentage: globalDiscountPercent,
          gstAmount: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
        },
      },
    }));
  }, [selectedTests, selectedPackages, editedPatient.visit?.billing.discount]);

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
    if ('target' in event && Array.isArray(event.target.value)) {
      // Handle multi-select or custom object
      const { name, value } = event.target;
      setEditedPatient(prev => {
        const newState = { ...prev };
        const keys = name.split('.');
        if (keys[0] === 'visit') {
          newState.visit = {
            ...newState.visit,
            [keys[1]]: value.map(Number),
          };
        } else {
          // (newState as any)[name] = value;
           (newState as Patient)[name as keyof Patient] = value as never;
        }
        return newState;
      });
    } else {
      // Handle normal React change event
      const e = event as React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
      const { name, value, type } = e.target;
      const isCheckbox = type === 'checkbox';
      const val = isCheckbox ? (e.target as HTMLInputElement).checked : value;

      setEditedPatient(prev => {
        const newState = { ...prev };
        const keys = name.split('.');

        if (keys[0] === 'visit' && keys[1] === 'billing') {
          newState.visit.billing = {
            ...newState.visit.billing,
            [keys[2]]: type === 'number' ? Number(val) : val
          };
        } else if (keys[0] === 'visit') {
          newState.visit = {
            ...newState.visit,
            [keys[1]]: type === 'number' ? Number(val) : val
          };
        } else {
          newState[name as keyof Patient] = val as never;
        }

        return newState;
      });
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

  const handleTestSelection = (test: TestList) => {
    const isSelected = selectedTests.some(t => t.id === test.id);
    let updatedTests: TestList[];

    if (isSelected) {
      updatedTests = selectedTests.filter(t => t.id !== test.id);
    } else {
      updatedTests = [
        ...selectedTests,
        {
          ...test,
          discountedPrice: test.price,
          discountAmount: 0,
          discountPercent: 0
        }
      ];
    }

    setSelectedTests(updatedTests);
    updatePatientTests(updatedTests);
  };

  const updatePatientTests = (tests: TestList[]) => {
    setEditedPatient(prev => ({
      ...prev,
      visit: {
        ...prev.visit,
        testIds: tests.map(t => t.id),
        listofeachtestdiscount: tests.map(t => ({
          id: t.id,
          discountAmount: t.discountAmount || 0,
          discountPercent: t.discountPercent || 0,
          finalPrice: t.discountedPrice || t.price,

        }))
      }
    }));
  };

  const handlePackageSelection = (pkg: PackageType) => {
    const isSelected = selectedPackages.some(p => p.id === pkg.id);
    let updatedPackages: PackageType[];

    if (isSelected) {
      updatedPackages = selectedPackages.filter(p => p.id !== pkg.id);
    } else {
      updatedPackages = [...selectedPackages, pkg];
    }

    setSelectedPackages(updatedPackages);
    setEditedPatient(prev => ({
      ...prev,
      visit: {
        ...prev.visit,
        packageIds: updatedPackages.map(p => p.id),
      },
    }));
  };

  const removeTest = (testId: number) => {
    const updatedTests = selectedTests.filter(t => t.id !== testId);
    setSelectedTests(updatedTests);
    updatePatientTests(updatedTests);
  };

  const removePackage = (packageId: number) => {
    const updatedPackages = selectedPackages.filter(p => p.id !== packageId);
    setSelectedPackages(updatedPackages);
    setEditedPatient(prev => ({
      ...prev,
      visit: {
        ...prev.visit,
        packageIds: updatedPackages.map(p => p.id),
      },
    }));
  };

  const handleTestDiscountChange = (
    testId: number,
    field: 'percent' | 'amount',
    value: number
  ) => {
    setSelectedTests(prev =>
      prev.map(test => {
        if (test.id !== testId) return test;

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
      })
    );

    // Update the patient state with new discounts
    setEditedPatient(prev => ({
      ...prev,
      visit: {
        ...prev.visit,
        listofeachtestdiscount: selectedTests.map(test => ({
          id: test.id,
          discountAmount: test.discountAmount || 0,
          discountPercent: test.discountPercent || 0,
          finalPrice: test.discountedPrice || test.price,
          createdBy: "system",
          updatedBy: "system"
        }))
      }
    }));
  };


  const handleUpdatePatient = async () => {
    try {
      setLoading(true);
      // Zod schema validation
      const validationResult = EditPatientSchema.safeParse(editedPatient);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => err.message).join(', ');
        console.error('Validation errors:', validationResult.error.errors);
        toast.error(`Validation failed: ${errors}`);
        return;
      }
      if (!currentLab?.id) {
        toast.error('Lab ID is missing');
        return;
      }

      const { totalAmount, netAmount } = calculateAmounts();

      const patientData = {
        ...editedPatient,
        visit: {
          ...editedPatient.visit,
          billing: {
            ...editedPatient.visit.billing,
            totalAmount,
            netAmount
          },
          listofeachtestdiscount: selectedTests.map(test => ({
            id: test.id,
            discountAmount: test.discountAmount || 0,
            discountPercent: test.discountPercent || 0,
            finalPrice: test.discountedPrice || test.price,
          }))
        }
      };

      const response = await updatePatientDetails(currentLab.id, patientData);
      if (response.status === 'success') {
        toast.success('Patient updated successfully');
        setPatientDetails(response.data);
        setUpdatePatientListVist(!updatePatientListVist);
        setEditPatientDetailsModal(false);
      } else {
        toast.error(response.message || 'Failed to update patient');
      }
      // For testing - remove this when API is ready
      // toast.success('Patient data validated successfully (API call commented out)');
      setEditPatientDetailsModal(false);

    } catch (error:unknown) {
      // console.error('Update error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        toast.error((error as { message: string }).message || 'Failed to update patient');
      } else {
        toast.error('Failed to update patient');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading || !currentLab?.id) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <EditPatientFrom
          newPatient={editedPatient}
          handleChange={handleChange}
          isEditMode={true}
          searchTerm={''}
          handleSearchChange={() => { }}
          filteredPatients={[]}
          handlePatientSelect={() => { }}
        />
        <PatientVisit
          newPatient={editedPatient}
          handleChange={handleChange}
          doctors={doctors}
          updatedocorlist={updatedocorlist}
          setUpdatedocorlist={setUpdatedocorlist}
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
        removeTest={(testId: string) => removeTest(Number(testId))}
        removePackage={(packageId: string) => removePackage(Number(packageId))}
        categories={categories}
        handleTestDiscountChange={handleTestDiscountChange}
      />

      <PatientBilling
        selectedPackages={selectedPackages}
        newPatient={editedPatient}
        handleChange={handleChange}
        isGlobalDiscountHidden={isGlobalDiscountHidden}
      />

      <div className="flex justify-end space-x-2 mt-3">
        <Button
          text=''
          type="button"
          onClick={handleUpdatePatient}
          className="flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-3 w-3 mr-1.5" />
          Update Patient
        </Button>
        <Button
          text=''
          type="button"
          onClick={() => setEditPatientDetailsModal(false)}
          className="flex items-center px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        >
          <XIcon className="h-3 w-3 mr-1.5" />
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default EditPatientDetails;