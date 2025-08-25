"use client";
import { getDoctor } from '@/../services/doctorServices';
import { getInsurance } from '@/../services/insuranceService';
import { getPackage } from '@/../services/packageServices';
import { updatePatientDetails } from '@/../services/patientServices';
import { getTests } from '@/../services/testService';
import { useLabs } from '@/context/LabContext';
import { EditPatientSchema } from '@/schema/editPatientSchema';
import { Doctor } from '@/types/doctor/doctor';
import { Package as PackageType } from '@/types/package/package';
import { Patient, PaymentMethod, PaymentStatus, VisitStatus, VisitType } from "@/types/patient/patient";
import { TestList } from '@/types/test/testlist';
import { Plus, XIcon } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import Button from '../common/Button';
import Loader from '../common/Loader';
import PatientBilling from './component/PatientBilling';
import PatientTestPackage from './component/PatientTestPackage';
import PatientVisit from './component/PatientVisit';
import PatientForm from './component/PatientFrom';

enum Gender {
  Male = 'male',
  Female = 'female',
}

enum DiscountReason {
  None = 'None',
  SeniorCitizen = 'Senior Citizen',
  Student = 'Student',
  HealthcareWorker = 'Healthcare Worker',
  CorporateTieUp = 'Corporate Tie-up',
  Referral = 'Referral',
  PreventiveCheckupCamp = 'Preventive Checkup Camp',
  Loyalty = 'Loyalty',
  DisabilitySupport = 'Disability Support',
  BelowPovertyLine = 'Below Poverty Line (BPL)',
  FestiveOffer = 'Festive or Seasonal Offer',
  PackageDiscount = 'Package Discount + Additional Test Discount',
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
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTestTerm, setSearchTestTerm] = useState<string>('');
  const [selectedTests, setSelectedTests] = useState<TestList[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isGlobalDiscountHidden, setIsGlobalDiscountHidden] = useState<boolean>(false);
  const { currentLab, setPatientDetails, refreshDocterList, loginedUser } = useLabs();
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
    age: '',
    gender: Gender.Male,
    visit: {
      visitId: 0,
      visitDate: new Date().toISOString().split('T')[0],
      visitType: editPatientDetails?.visit?.visitType || VisitType.OUT_PATIENT,
      visitStatus: editPatientDetails?.visit?.visitStatus || VisitStatus.PENDING,
      visitDescription: '',
      listofeachtestdiscount: [],
      doctorId: editPatientDetails?.visit?.doctorId || null,
      testIds: [],
      packageIds: [],
      insuranceIds: [],
      billing: {
        billingId: 0,
        totalAmount: 0,
        paymentStatus: editPatientDetails?.visit?.billing?.paymentStatus || PaymentStatus.DUE,
        paymentMethod: editPatientDetails?.visit?.billing?.paymentMethod || PaymentMethod.CASH,
        paymentDate: editPatientDetails?.visit?.billing?.paymentDate || new Date().toISOString().split('T')[0],
        discount: 0,
        netAmount: 0,
        discountReason: editPatientDetails?.visit?.billing?.discountReason || DiscountReason.None,
        discountPercentage: 0,
      },
    },
  });

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
    const globalDiscountAmount = editedPatient.visit?.billing.discount || 0;
    const netAmount = Math.max(0, totalAfterTestDiscounts - globalDiscountAmount);

    return {
      totalAmount: totalAfterTestDiscounts,
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
  }, [selectedTests, selectedPackages, editedPatient.visit?.billing.discount]);

  useEffect(() => {
    const { totalAmount, netAmount } = calculateAmounts();

    setEditedPatient(prev => ({
      ...prev,
      visit: {
        ...prev.visit,
        billing: {
          ...prev.visit.billing,
          totalAmount,
          netAmount,
        },
      },
    }));
  }, [calculateAmounts]);

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

          } catch (error) {

            toast.error("Failed to load initial data");
          } finally {
            setLoading(false);
          }
        };
        fetchInitialData();
      }
    }
  }, [editPatientDetails, currentLab, refreshDocterList]);

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
          (newState as Patient)[name as keyof Patient] = value as never;
        }
        return newState;
      });
    } else {
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
    const duplicateCheck = checkForDuplicateTests(selectedPackages, selectedTests, pkg);

    if (duplicateCheck.isDuplicate) {
      toast.warn(duplicateCheck.message, { autoClose: 5000 });
      return;
    }

    let updatedPackages = [...selectedPackages];
    if (selectedPackages.some((p) => p.id === pkg.id)) {
      updatedPackages = updatedPackages.filter((p) => p.id !== pkg.id);
    } else {
      updatedPackages = [...updatedPackages, pkg];
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

    // Clear global discount when test-level discount is applied
    if (value > 0) {
      setEditedPatient(prevState => ({
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


  const handleDiscountChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: string[] } }
  ) => {
    const { name, value } = 'target' in event ? event.target : { name: '', value: [] };

    if (name === 'visit.insuranceIds') {
      setEditedPatient(prevState => ({
        ...prevState,
        visit: {
          ...prevState.visit,
          insuranceIds: Array.isArray(value) ? value.map(Number) : [],
        },
      }));
    } else if (name.startsWith('visit.billing')) {
      setEditedPatient(prevState => ({
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
      setEditedPatient(prevState => ({
        ...prevState,
        visit: {
          ...prevState.visit,
          [name.split('.')[1]]: value,
        },
      }));
    } else {
      setEditedPatient(prevState => ({
        ...prevState,
        [name]: Array.isArray(value) ? value.map(Number) : value,
      }));
    }
  };

  const handleUpdatePatient = async () => {
    try {
      setLoading(true);



      const validationResult = EditPatientSchema.safeParse(editedPatient);

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => err.message).join(', ');

        toast.error(`Validation failed: ${errors}`);
        return;
      }
      if (!currentLab?.id) {
        toast.error('Lab ID is missing');
        return;
      }
      if (editedPatient.visit.testIds.length === 0 && editedPatient.visit.packageIds.length === 0) {
        toast.error('Please select at least one test or package.');
        return;
      }

      const { totalAmount, netAmount, globalDiscountAmount } = calculateAmounts();

      // Build transactions similar to AddPatient flow
      const billing = editedPatient.visit.billing || ({} as typeof editedPatient.visit.billing);
      const cashAmount = Number(billing.cash_amount || 0);
      const cardAmount = Number(billing.card_amount || 0);
      const upiAmount = Number(billing.upi_amount || 0);
      const receivedAmount = Number(billing.received_amount || 0);
      const refundAmount = Number(billing.refund_amount || 0);
      const dueAmount = Number(billing.due_amount || 0);
      const paymentDate = billing.paymentDate || new Date().toISOString().split('T')[0];

      const transactions: Array<{
        payment_method: PaymentMethod;
        received_amount: number;
        date: string;
        upi_id: string;
        card_amount: number;
        cash_amount: number;
        upi_amount: number;
        refund_amount: number;
        due_amount: number;
        remarks: string;
      }> = [];
      transactions.push({
        payment_method: billing.paymentMethod || PaymentMethod.CASH,
        received_amount: receivedAmount,
        date: paymentDate,
        upi_id: billing.upi_id || '',
        card_amount: cardAmount,
        cash_amount: cashAmount,
        upi_amount: upiAmount,
        refund_amount: refundAmount,
        due_amount: dueAmount,
        remarks: 'paid by ' + (billing.paymentMethod || PaymentMethod.CASH),
      });

      const patientData = {
        ...editedPatient,
        visit: {
          ...editedPatient.visit,
          //  doctorId: editedPatient.visit.doctorId || null,
          testResult: selectedTests.map(test => ({
            testId: test.id,
            isFilled: false,
            reportStatus: VisitStatus.PENDING,
            createdBy: loginedUser?.firstName || '',
            updatedBy: loginedUser?.firstName || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })),
          billing: {
            ...editedPatient.visit.billing,
            totalAmount,
            netAmount,
            discount: Number(globalDiscountAmount),
            transactions: transactions,
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
    } catch (error: unknown) {
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
        <PatientForm
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
        handleChange={handleDiscountChange}
        setSelectedTests={setSelectedTests}
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















