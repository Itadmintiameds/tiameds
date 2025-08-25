import { getDoctor } from '@/../services/doctorServices';
import { getInsurance } from '@/../services/insuranceService';
import { getPackage } from '@/../services/packageServices';
import { addPatient, getPatient, searchPatientByPhone } from '@/../services/patientServices';
import { getTests } from '@/../services/testService';
import { useLabs } from '@/context/LabContext';
import { patientSchema } from '@/schema/patientScheamData';
import { Doctor } from '@/types/doctor/doctor';
import { Insurance } from '@/types/insurance/insurance';
import { Package as PackageType } from '@/types/package/package';
import { Patient, PaymentMethod, PaymentStatus, VisitStatus, VisitType } from "@/types/patient/patient";
import { TestList } from '@/types/test/testlist';
import { Plus, XIcon } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import Button from '../common/Button';
import Loader from '../common/Loader';
import PatientBilling from './component/PatientBilling';
import PatientFrom from './component/PatientFrom';
import PatientTestPackage from './component/PatientTestPackage';
import PatientVisit from './component/PatientVisit';
import { Gender, DiscountReason } from '@/types/patient/patient';


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
    age: '',
    gender: Gender.Female,
    visit: {
      visitDate: new Date().toISOString().split('T')[0],
      visitType: VisitType.OUT_PATIENT,
      visitStatus: VisitStatus.PENDING,
      visitDescription: '',
      visitCancellationReason: '',
      visitCancellationDate: '',
      visitCancellationBy: '',
      visitCancellationTime: '',
      // visitTime:
      // listofDiscounts: [],
      doctorId: '',
      testIds: [],
      packageIds: [],
      insuranceIds: [],
      billing: {
        totalAmount: null,
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: PaymentMethod.CASH,
        paymentDate: new Date().toISOString().split('T')[0],
        discount: null,
        netAmount: null,
        discountReason: DiscountReason.None,
        discountPercentage: null,
        upi_id: '',
        received_amount: null,
        refund_amount: null,
        upi_amount: null,
        card_amount: null,
        cash_amount: null,
        due_amount: null,
      },
    },
  });
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { currentLab, setPatientDetails, refreshDocterList, loginedUser } = useLabs();
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
  }, [currentLab, refreshDocterList]);


  const calculateAmounts = useCallback(() => {
    
    // 1. Calculate original test prices (no discounts)
    // const totalOriginalTestAmount = selectedTests.reduce((acc, test) => acc + test.price, 0);

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

    const result = {
      totalAmount: totalAfterTestDiscounts, // Amount after individual test discounts but before global discount
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
    
    return result;
  }, [selectedTests, selectedPackages, newPatient.visit?.billing.discount]);

  useEffect(() => {
    const { totalAmount, netAmount } = calculateAmounts();

    setNewPatient(prevState => {
      const updatedState = {
        ...prevState,
        visit: {
          ...prevState.visit,
          billing: {
            ...prevState.visit.billing,
            totalAmount,
            netAmount,
         
          },
        },
      };
      return updatedState;
    });
  }, [calculateAmounts]);



  useEffect(() => {
    const hasTestDiscounts = selectedTests.some(test =>
      (test.discountAmount && test.discountAmount > 0) ||
      (test.discountPercent && test.discountPercent > 0)
    );
    setIsGlobalDiscountHidden(hasTestDiscounts);
  }, [selectedTests]);

  const handleChange = useCallback((
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: string[] } }
  ) => {
 
    const target = (event && 'target' in event) ? event.target : null;
    const name = (target && typeof target === 'object' && 'name' in target) ? (target.name || '') : '';
    
    let value: string | string[];
    if (target && typeof target === 'object' && 'value' in target) {
      value = (target as { value: string | string[] }).value; 
    } else {
      value = ''; 
    }

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
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleTestSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTestTerm(e.target.value);
  };


  // Simple prefix test search function - only show tests that start with the typed characters
  const isTestMatchingSearch = (testName: string, searchTerm: string): boolean => {
    if (!searchTerm.trim()) return true;
    
    const testNameLower = testName.toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    
    // Only show tests that start with the search term
    return testNameLower.startsWith(searchTermLower);
  };

  const filteredTests = tests.filter(
    (test) =>
      (!selectedCategory || test.category === selectedCategory) &&
      isTestMatchingSearch(test.name, searchTestTerm)
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
    setSelectedTests(prevTests => {
      const updatedTests = prevTests.map(test => {
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

          const updatedTest = {
            ...test,
            discountAmount,
            discountPercent,
            discountedPrice: originalPrice - discountAmount
          };
          
          return updatedTest;
        }
        return test;
      });
      
      return updatedTests;
    });

    // Clear global discount when test-level discount is applied
    if (value > 0) {
      setNewPatient(prevState => ({
        ...prevState,
        visit: {
          ...prevState.visit,
          billing: {
            ...prevState.visit?.billing,
            discount: 0,
            discountPercentage: 0
          }
        }
      }));
    }
  };



  useEffect(() => {
    if (searchTerm && currentLab?.id !== undefined) {
      const fetchFilteredPatients = async () => {
        try {
          const response = await searchPatientByPhone(currentLab.id, searchTerm);
          setFilteredPatients(response.data);
        } catch (error) {
          toast.error('An error occurred while searching for patients.');
        }
      };
      fetchFilteredPatients();
    }

  }, [searchTerm, patient, currentLab?.id]);

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
      dateOfBirth: selectedPatient.dateOfBirth || '',
      age: selectedPatient.age || '',
      gender: selectedPatient.gender,
    });
    setSearchTerm('');
    setFilteredPatients([]);
  };

  const handleClearPatient = () => {
    setSearchTerm('');
    setFilteredPatients([]);
    setSelectedTests([]);
    setSelectedPackages([]);
    setSelectedCategory('');
    setSearchTestTerm('');
    
    // Reset the patient state to initial values
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
      age: '',
      gender: Gender.Female,
      visit: {
        visitDate: new Date().toISOString().split('T')[0],
        visitType: VisitType.OUT_PATIENT,
        visitStatus: VisitStatus.PENDING,
        visitDescription: '',
                 visitCancellationReason: '',
         visitCancellationDate: '',
         visitCancellationBy: '',
         visitCancellationTime: '',
        doctorId: '',
        testIds: [],
        packageIds: [],
        insuranceIds: [],
        billing: {
          totalAmount: null,
          paymentStatus: PaymentStatus.PAID,
          paymentMethod: PaymentMethod.CASH,
          paymentDate: new Date().toISOString().split('T')[0],
          discount: null,
          netAmount: null,
          discountReason: DiscountReason.None,
          discountPercentage: null,
          upi_id: '',
          received_amount: null,
          refund_amount: null,
          upi_amount: null,
          card_amount: null,
          cash_amount: null,
          due_amount: null,
        },
      },
    });
  };



  const handleAddPatient = async () => {
    try {
      setLoading(true);
      
      // Ensure phone number is synchronized from searchTerm to newPatient before validation
      const patientToValidate = {
        ...newPatient,
        phone: searchTerm || newPatient.phone
      };
      
      const validationResult = patientSchema.safeParse(patientToValidate);

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
      const billing = newPatient.visit.billing || {};

      // Normalize amounts from state; treat empty/undefined as 0
      const cashAmount = Number(billing.cash_amount ?? 0);
      const cardAmount = Number(billing.card_amount ?? 0);
      const upiAmount = Number(billing.upi_amount ?? 0);
      const receivedAmount = Number(billing.received_amount ?? 0);

      // Derive refund/due from netAmount and received amount to guarantee correctness
      const computedDueAmount = Math.max(0, Number(netAmount ?? 0) - receivedAmount);
      const computedRefundAmount = Math.max(0, receivedAmount - Number(netAmount ?? 0));

      const paymentDate = billing.paymentDate || new Date().toISOString().split("T")[0];

      const transactions = [];
       transactions.push({
        payment_method: billing.paymentMethod || PaymentMethod.CASH,
         received_amount: receivedAmount,
        date: paymentDate,
        upi_id: billing.upi_id || '',
        card_amount: cardAmount,
        cash_amount: cashAmount,
        upi_amount: upiAmount,
         refund_amount: computedRefundAmount,
         due_amount: computedDueAmount,
        remarks: "paid by " + (billing.paymentMethod || PaymentMethod.CASH)
      });

      // Extract test IDs - only individual tests go to testIds, package tests are handled separately
      const individualTestIds = selectedTests.map(test => test.id);
      
      // Get all test IDs for testResult (both individual and from packages)
      const allTestIds = new Set<number>();
      
      // Add individual test IDs
      selectedTests.forEach(test => {
        allTestIds.add(test.id);
      });
      
      // Add test IDs from packages
      selectedPackages.forEach(pkg => {
        pkg.tests.forEach(test => {
          allTestIds.add(test.id);
        });
      });

      // Convert Set to Array for testResult
      const finalTestIds = Array.from(allTestIds);

      // Create testResult array for all tests (both individual and from packages)
      const allTestResults = finalTestIds.map(testId => ({
        testId: testId,
        isFilled: false,
        reportStatus: VisitStatus.PENDING,
        createdBy: loginedUser?.firstName || '',
        updatedBy: loginedUser?.firstName || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      // Create listofeachtestdiscount for all tests
      const allTestDiscounts = finalTestIds.map(testId => {
        // Check if this test is in selectedTests (individual selection)
        const individualTest = selectedTests.find(test => test.id === testId);
        if (individualTest) {
          return {
            id: testId,
            discountAmount: individualTest.discountAmount || 0,
            discountPercent: individualTest.discountPercent || 0,
            finalPrice: individualTest.discountedPrice || individualTest.price
          };
        }
        
        // If not in selectedTests, it's from a package - get test details from packages
        for (const pkg of selectedPackages) {
          const packageTest = pkg.tests.find(test => test.id === testId);
          if (packageTest) {
            return {
              id: testId,
              discountAmount: 0, // Package tests don't have individual discounts
              discountPercent: 0,
              finalPrice: packageTest.price
            };
          }
        }
        
        // Fallback
        return {
          id: testId,
          discountAmount: 0,
          discountPercent: 0,
          finalPrice: 0
        };
      });

                   const patientData = {
        ...patientToValidate, 
        visit: {
          ...newPatient.visit,
          testIds: individualTestIds, // Only individual test IDs
          packageIds: selectedPackages.map(pkg => pkg.id), // Keep package IDs for reference
          testResult: allTestResults,
          billing: {
            ...billing,
            totalAmount,
            netAmount,
            discount: Number(globalDiscountAmount),
            // Ensure backend always receives explicit amounts, even if user didn't type them
            received_amount: receivedAmount,
            refund_amount: computedRefundAmount,
            due_amount: computedDueAmount,
            transactions: transactions
          },
          listofeachtestdiscount: allTestDiscounts
        }
      };

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
      toast.error('An error occurred while adding the patient.');
    } finally {
      setLoading(false);
    }
  };


  if (!tests || !packages || !doctors || !insurances || !currentLab?.id) {
    return <Loader type="progress" fullScreen={true} text='Loading...' />;
  }
  if (loading) {
    return <Loader type="progress" fullScreen={true} text='Adding Patient...' />;
  }

  return (
    <div>
      <div className="flex gap-4 bg-gray-50">
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
        setSelectedTests={setSelectedTests}
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
          Clear
        </Button>
      </div>
    </div>
  );
};

export default AddPatientComponent;



