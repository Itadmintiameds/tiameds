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
import { XIcon } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import Loader from '../common/Loader';
import ConfirmationDialog from '../common/ConfirmationDialog';
import PatientBilling from './component/PatientBilling';
import PatientFrom from './component/PatientFrom';
import PatientTestPackage from './component/PatientTestPackage';
import PatientVisit from './component/PatientVisit';
import { Gender, DiscountReason } from '@/types/patient/patient';
import useAuthStore from '@/context/userStore';


interface AddPatientComponentProps {
  setAddPatientModal: React.Dispatch<React.SetStateAction<boolean>>;
  setAddUpdatePatientListVist: React.Dispatch<React.SetStateAction<boolean>>;
  addUpdatePatientListVist: boolean;
}

const AddPatientComponent = ({ setAddPatientModal, setAddUpdatePatientListVist, addUpdatePatientListVist }: AddPatientComponentProps) => {
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
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
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
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
      visitDate: getLocalDateString(),
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
        paymentDate: getLocalDateString(),
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
  const { currentLab, setPatientDetails, refreshDocterList } = useLabs();
  const { user: loginedUser } = useAuthStore();
  const [isGlobalDiscountHidden, setIsGlobalDiscountHidden] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [forceFormValidation, setForceFormValidation] = useState<boolean>(false);

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
  // const isTestMatchingSearch = (testName: string, searchTerm: string): boolean => {
  //   if (!searchTerm.trim()) return true;

  //   const testNameLower = testName.toLowerCase();
  //   const searchTermLower = searchTerm.toLowerCase();

  //   // Only show tests that start with the search term
  //   return testNameLower.startsWith(searchTermLower);
  // };

  // const filteredTests = tests.filter(
  //   (test) =>
  //     (!selectedCategory || test.category === selectedCategory) &&
  //     isTestMatchingSearch(test.name, searchTestTerm)
  // );


  const fuzzyScore = (text: string, pattern: string): number => {
    if (!pattern.trim()) return 1;
    const textLower = text.toLowerCase();
    const patternLower = pattern.toLowerCase();

    if (textLower === patternLower) return 100;
    if (textLower.startsWith(patternLower)) return 80;
    if (textLower.includes(patternLower)) return 60;

    // Check all characters appear in order (e.g. "cbc" matches "Complete Blood Count")
    let pi = 0;
    for (let i = 0; i < textLower.length && pi < patternLower.length; i++) {
      if (textLower[i] === patternLower[pi]) pi++;
    }
    return pi === patternLower.length ? 30 : 0;
  };

  const filteredTests = tests
    .filter((test) => !selectedCategory || test.category === selectedCategory)
    .map((test) => ({ test, score: fuzzyScore(test.name, searchTestTerm) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ test }) => test);


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
      lastName: selectedPatient.lastName || '',
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
        visitDate: getLocalDateString(),
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
          paymentDate: getLocalDateString(),
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



  const handleConfirmAdd = () => {
    setShowConfirmDialog(false);
    handleAddPatient();
  };

  const handleCancelAdd = () => {
    setShowConfirmDialog(false);
  };

  const handleProceed = () => {
    if (currentStep === 1) {
      const phone = searchTerm || newPatient.phone;
      const actualFirstName = (newPatient.firstName || '')
        .replace(/^(Mr\.|Mrs\.|Ms\.|M\/S)\s*/i, '')
        .trim();

      if (!actualFirstName) {
        setForceFormValidation(true);
        toast.error('Please enter patient first name.');
        return;
      }
      if (!phone || !/^\d{10}$/.test(phone)) {
        setForceFormValidation(true);
        toast.error('Please enter a valid 10-digit mobile number.');
        return;
      }
      if (!newPatient.city?.trim()) {
        setForceFormValidation(true);
        toast.error('Please enter the city.');
        return;
      }
      if (!newPatient.dateOfBirth) {
        setForceFormValidation(true);
        toast.error('Please enter the date of birth.');
        return;
      }
      setForceFormValidation(false);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (newPatient.visit.testIds.length === 0 && newPatient.visit.packageIds.length === 0) {
        toast.error('Please select at least one test or package.');
        return;
      }
      setCurrentStep(3);
    } else {
      handleAddPatient();
    }
  };

  const handleGoBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
  };

  const handleAddPatient = async () => {
    try {
      setLoading(true);

      // Validate payment fields based on payment method
      const paymentMethod = newPatient.visit?.billing?.paymentMethod;
      const missingFields: string[] = [];

      if (paymentMethod) {
        switch (paymentMethod) {
          case PaymentMethod.UPI:
          case PaymentMethod.CARD:
            const receivedAmount = Number(newPatient.visit?.billing?.received_amount || 0);
            if (receivedAmount <= 0) {
              missingFields.push('Received Amount');
            }
            break;

          case PaymentMethod.UPI_CASH:
            const upiAmount = Number(newPatient.visit?.billing?.upi_amount || 0);
            const cashAmountUPI = Number(newPatient.visit?.billing?.cash_amount || 0);
            if (upiAmount <= 0) {
              missingFields.push('UPI Amount');
            }
            if (cashAmountUPI <= 0) {
              missingFields.push('Cash Amount');
            }
            break;

          case PaymentMethod.CARD_CASH:
            const cardAmount = Number(newPatient.visit?.billing?.card_amount || 0);
            const cashAmountCard = Number(newPatient.visit?.billing?.cash_amount || 0);
            if (cardAmount <= 0) {
              missingFields.push('Card Amount');
            }
            if (cashAmountCard <= 0) {
              missingFields.push('Cash Amount');
            }
            break;
        }
      }

      if (missingFields.length > 0) {
        toast.error(`Please fill the required payment fields: ${missingFields.join(', ')}`);
        return;
      }

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

      const appliedDiscount = Number(newPatient.visit?.billing?.discount || 0);
      const appliedDiscountReason = newPatient.visit?.billing?.discountReason;
      if (appliedDiscount > 0 && (!appliedDiscountReason || appliedDiscountReason === DiscountReason.None)) {
        toast.error('Please select a reason for applying the discount.');
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

      const paymentDate = billing.paymentDate || getLocalDateString();

      const transactions = [];
      transactions.push({
        payment_method: billing.paymentMethod || PaymentMethod.CASH,
        received_amount: receivedAmount,
        date: paymentDate,
        upi_id: billing.upi_id?.trim() || 'N/A',
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

  const steps = [
    { n: 1 as const, label: 'Register Patient' },
    { n: 2 as const, label: 'Test & Billing' },
    { n: 3 as const, label: 'Confirm Bill' },
  ];

  return (
    <div className="bg-gray-50">

      {/* ── Stepper ── */}
      <div className="bg-white border-b border-gray-100 px-2 py-3 mb-5 rounded-xl">
        <div className="flex items-center gap-2">
          {steps.map(({ n, label }, i) => (
            <React.Fragment key={n}>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                currentStep === n
                  ? 'bg-purple-600 text-white'
                  : currentStep > n
                    ? 'bg-white border border-purple-200 text-purple-600'
                    : 'text-gray-400'
              }`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  currentStep === n ? 'bg-white text-purple-600' :
                  currentStep > n ? 'bg-purple-600 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > n ? '✓' : n}
                </span>
                {label}
              </div>
              {i < 2 && (
                <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Page header ── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {currentStep === 1 ? 'Register Patient' : currentStep === 2 ? 'Test & Package Selection' : 'Confirm Bill'}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {currentStep === 1
              ? 'Create a new patient record'
              : `Patient: ${newPatient.firstName} ${newPatient.lastName || ''}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {currentStep === 1 ? (
            <button
              type="button"
              onClick={() => setAddPatientModal(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              ← Cancel
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGoBack}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
          )}
          <button
            type="button"
            onClick={handleProceed}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-purple-600 rounded-full hover:bg-purple-700 transition-colors"
          >
            {currentStep === 3 ? 'Confirm' : 'Save & Proceed →'}
          </button>
        </div>
      </div>

      {/* ── Step 1: Register Patient ── */}
      {currentStep === 1 && (
        <div className="flex gap-5 items-start">
          <div className="flex-1 min-w-0 space-y-3">
            <PatientFrom
              newPatient={newPatient}
              handleChange={handleChange}
              searchTerm={searchTerm}
              handleSearchChange={handleSearchChange}
              filteredPatients={filteredPatients}
              handlePatientSelect={handlePatientSelect}
              forceValidation={forceFormValidation}
            />
            <PatientVisit
              newPatient={newPatient}
              handleChange={handleChange}
              doctors={doctors}
              mode="doctorOnly"
            />
          </div>
          <div className="w-72 flex-shrink-0">
            <PatientVisit
              newPatient={newPatient}
              handleChange={handleChange}
              doctors={doctors}
              mode="visitOnly"
            />
          </div>
        </div>
      )}

      {/* ── Step 2: Test & Package Selection ── */}
      {currentStep === 2 && (
        <div className="flex gap-5 items-start">
          <div className="flex-1 min-w-0">
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
              showSelectedSummary={false}
            />
          </div>
          <div className="w-72 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Billing Summary</h3>
              {selectedTests.length === 0 && selectedPackages.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No tests selected yet</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {selectedTests.map((test) => (
                      <div key={test.id} className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 leading-tight">{test.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{test.testCode || `T${String(test.id).padStart(3,'0')}`} · {test.category}</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <p className="text-sm font-semibold text-gray-800">₹{Number(test.discountedPrice ?? test.price).toFixed(0)}</p>
                          <button onClick={() => removeTest(test.id.toString())} className="text-gray-300 hover:text-red-500 transition-colors">
                            <XIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {selectedPackages.map((pkg) => (
                      <div key={pkg.id} className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 leading-tight">{pkg.packageName}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{pkg.tests?.length || 0} tests included</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <p className="text-sm font-semibold text-purple-700">₹{Number(pkg.price).toFixed(0)}</p>
                          <button onClick={() => removePackage(pkg.id.toString())} className="text-gray-300 hover:text-red-500 transition-colors">
                            <XIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 pt-3 space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal ({selectedTests.length + selectedPackages.length} tests)</span>
                      <span className="font-medium text-gray-800">₹{Number(newPatient.visit?.billing?.totalAmount ?? 0).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Discount</span>
                      <span className="font-medium text-green-600">-₹{Number(newPatient.visit?.billing?.discount ?? 0).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between font-bold mt-1 pt-2 border-t border-gray-100">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">₹{Number(newPatient.visit?.billing?.netAmount ?? 0).toFixed(0)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleProceed}
                    className="w-full mt-4 bg-purple-600 text-white text-sm font-semibold py-2.5 rounded-full hover:bg-purple-700 transition-colors"
                  >
                    → Proceed to Billing
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Confirm Bill ── */}
      {currentStep === 3 && (
        <div className="flex gap-5 items-start">
          <div className="flex-1 min-w-0 space-y-4">
            {/* Order Summary */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">Order Summary</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Test Name</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Code</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {selectedTests.map((test) => (
                    <tr key={test.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-800">{test.name}</td>
                      <td className="px-3 py-3 font-mono text-xs text-gray-500">{test.testCode || '—'}</td>
                      <td className="px-3 py-3 text-right font-medium text-gray-800">₹{Number(test.discountedPrice ?? test.price).toFixed(0)}</td>
                    </tr>
                  ))}
                  {selectedPackages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-purple-50/40">
                      <td className="px-5 py-3 font-medium text-gray-800">{pkg.packageName}</td>
                      <td className="px-3 py-3 text-xs text-purple-500">Package</td>
                      <td className="px-3 py-3 text-right font-medium text-purple-700">₹{Number(pkg.price).toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-gray-100 space-y-1.5 bg-gray-50">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{Number(newPatient.visit?.billing?.totalAmount ?? 0).toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Discount ({newPatient.visit?.billing?.discountPercentage ?? 0}%)</span>
                  <span>-₹{Number(newPatient.visit?.billing?.discount ?? 0).toFixed(0)}</span>
                </div>
                <div className="flex justify-between font-bold pt-1.5 border-t border-gray-200">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">₹{Number(newPatient.visit?.billing?.netAmount ?? 0).toFixed(0)}</span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <PatientBilling
              selectedPackages={selectedPackages}
              setSelectedTests={setSelectedTests}
              newPatient={newPatient}
              handleChange={handleChange}
              isGlobalDiscountHidden={isGlobalDiscountHidden}
            />
          </div>

          {/* Patient Info Card */}
          <div className="w-72 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-base font-bold text-gray-900 mb-4">
                {newPatient.firstName} {newPatient.lastName || ''}
              </h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Age / Gender</span>
                  <span className="font-semibold text-gray-800 capitalize">{newPatient.age || '—'}, {newPatient.gender || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Doctor</span>
                  <span className="font-semibold text-gray-800">
                    {newPatient.visit?.doctorId
                      ? doctors.find(d => d.id === Number(newPatient.visit.doctorId))?.name || '—'
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Visit Type</span>
                  <span className="font-semibold text-gray-800">{newPatient.visit?.visitType?.replace(/_/g, ' ') || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Contact</span>
                  <span className="font-semibold text-gray-800">{searchTerm || newPatient.phone || '—'}</span>
                </div>
                {(selectedTests.length > 0 || selectedPackages.length > 0) && (
                  <div className="pt-1">
                    <span className="text-gray-500">
                      Tests Ordered ({selectedTests.length + selectedPackages.length})
                    </span>
                    <ul className="mt-1.5 space-y-1">
                      {selectedTests.map((t) => (
                        <li key={`ordered-test-${t.id}`} className="flex items-start gap-1.5">
                          <span className="mt-[6px] w-1 h-1 rounded-full bg-purple-400 flex-shrink-0" />
                          <span className="font-medium text-gray-800 leading-snug">{t.name}</span>
                        </li>
                      ))}
                      {selectedPackages.map((p) => (
                        <li key={`ordered-pkg-${p.id}`} className="flex items-start gap-1.5">
                          <span className="mt-[6px] w-1 h-1 rounded-full bg-purple-400 flex-shrink-0" />
                          <span className="font-medium text-gray-800 leading-snug">{p.packageName}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {newPatient.visit?.visitDate && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Visit Information</span>
                      <span className="text-gray-500">
                        {new Date(newPatient.visit.visitDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className="capitalize text-gray-700">{newPatient.visit.visitStatus?.toLowerCase().replace(/_/g, ' ') || '—'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={handleCancelAdd}
        onConfirm={handleConfirmAdd}
        title="Confirm Add Patient"
        message="Please review all the information before proceeding."
        confirmText="Add Patient"
        cancelText="Cancel"
        isLoading={loading}
      >
        <div className="space-y-4 text-sm">
          {/* Patient Information */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Patient Information</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium text-gray-600">Name:</span>
                <span className="ml-2 text-gray-900">{newPatient.firstName} {newPatient.lastName || ''}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Phone:</span>
                <span className="ml-2 text-gray-900">{newPatient.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Email:</span>
                <span className="ml-2 text-gray-900">{newPatient.email || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Gender:</span>
                <span className="ml-2 text-gray-900 capitalize">{newPatient.gender || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Age:</span>
                <span className="ml-2 text-gray-900">{newPatient.age || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Date of Birth:</span>
                <span className="ml-2 text-gray-900">{newPatient.dateOfBirth ? new Date(newPatient.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">City:</span>
                <span className="ml-2 text-gray-900">{newPatient.city || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Address:</span>
                <span className="ml-2 text-gray-900">{newPatient.address || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Visit Information */}
          <div className="bg-purple-50 p-3 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">Visit Information</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium text-gray-600">Visit Date:</span>
                <span className="ml-2 text-gray-900">{newPatient.visit?.visitDate ? new Date(newPatient.visit.visitDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Visit Type:</span>
                <span className="ml-2 text-gray-900">{newPatient.visit?.visitType?.replace('_', ' ') || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Doctor:</span>
                <span className="ml-2 text-gray-900">
                  {newPatient.visit?.doctorId ? doctors.find(d => d.id === Number(newPatient.visit.doctorId))?.name || 'N/A' : 'N/A'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Visit Status:</span>
                <span className="ml-2 text-gray-900 capitalize">{newPatient.visit?.visitStatus?.toLowerCase().replace('_', ' ') || 'N/A'}</span>
              </div>
              {newPatient.visit?.visitDescription && (
                <div className="col-span-2">
                  <span className="font-medium text-gray-600">Description:</span>
                  <span className="ml-2 text-gray-900">{newPatient.visit.visitDescription}</span>
                </div>
              )}
            </div>
          </div>

          {/* Selected Tests */}
          {selectedTests.length > 0 && (
            <div className="bg-green-50 p-3 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Selected Tests ({selectedTests.length})</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {selectedTests.map((test) => (
                  <div key={test.id} className="flex justify-between items-center text-xs">
                    <span className="text-gray-700">{test.name}</span>
                    <span className="text-gray-900 font-medium">
                      ₹{test.discountedPrice || test.price}
                      {(test.discountAmount || test.discountPercent) && (
                        <span className="text-green-600 ml-1">
                          (Disc: ₹{test.discountAmount || (test.price * (test.discountPercent || 0) / 100).toFixed(2)})
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Packages */}
          {selectedPackages.length > 0 && (
            <div className="bg-orange-50 p-3 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">Selected Packages ({selectedPackages.length})</h4>
              <div className="space-y-1">
                {selectedPackages.map((pkg) => (
                  <div key={pkg.id} className="flex justify-between items-center text-xs">
                    <span className="text-gray-700">{pkg.packageName}</span>
                    <span className="text-gray-900 font-medium">₹{pkg.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Billing Information */}
          <div className="bg-yellow-50 p-3 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2">Billing Information</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Total Amount:</span>
                <span className="text-gray-900 font-semibold">₹{newPatient.visit?.billing?.totalAmount?.toFixed(2) || '0.00'}</span>
              </div>
              {newPatient.visit?.billing?.discount && Number(newPatient.visit.billing.discount) > 0 && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Global Discount:</span>
                  <span className="text-red-600 font-semibold">-₹{Number(newPatient.visit.billing.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-yellow-200 pt-1 mt-1">
                <span className="font-bold text-gray-900">Net Amount:</span>
                <span className="text-gray-900 font-bold text-base">₹{newPatient.visit?.billing?.netAmount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-medium text-gray-600">Payment Method:</span>
                <span className="text-gray-900 capitalize">{newPatient.visit?.billing?.paymentMethod?.replace('_', ' ') || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Payment Status:</span>
                <span className="text-gray-900 capitalize">{newPatient.visit?.billing?.paymentStatus?.toLowerCase() || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </ConfirmationDialog>
    </div>
  );
};

export default AddPatientComponent;



