import { getDoctor } from '@/../services/doctorServices';
import { getInsurance } from '@/../services/insuranceService';
import { getPackage } from '@/../services/packageServices';
import { getPatient } from '@/../services/patientServices';
import { getTests } from '@/../services/testService';
import { useLabs } from '@/context/LabContext';
import { Doctor } from '@/types/doctor/doctor';
import { Insurance } from '@/types/insurance/insurance';
import { Package as PackageType } from '@/types/package/package';
import { Patient } from "@/types/patient/patient";
import { TestList } from '@/types/test/testlist';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Button from '../../common/Button';
import Loader from '../../common/Loader';
import { PaymentMethod, PaymentStatus, VisitStatus, VisitType } from '@/types/patient/patient';
import { Plus, XIcon } from 'lucide-react';
import PatientBilling from './_components/PatientBilling';
import PatientFrom from './_components/PatientFrom';
import PatientTestPackage from './_components/PatientTestPackage';
import PatientVisit from './_components/PatientVisit';
import { addPatient } from '@/../services/patientServices';
import { patientSchema } from '@/schema/patientScheamData';
import { useRouter } from 'next/navigation';



enum BloodGroup {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}


const AddPatient = () => {
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
    //phone number comes from the user selected patient
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    bloodGroup: BloodGroup.O_POSITIVE,
    dateOfBirth: '',
    gender: Gender.Female,
    visit: {
      visitDate: new Date().toISOString().split('T')[0], // Ensure default date format
      visitType: VisitType.OUT_PATIENT,
      visitStatus: VisitStatus.PENDING,
      visitDescription: '',
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
        discountReason: '',
        discountPercentage: 0,
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

  // const [selectedInsurances, setSelectedInsurances] = useState<string[]>(newPatient.visit?.insuranceIds?.map(String) || []);

  const router = useRouter();
  const { currentLab, setPatientDetails } = useLabs();

  useEffect(() => {
    if (!currentLab || !currentLab.id) {
      <Loader />;
      return;
    }

    const fetchData = async () => {
      try {
        // console.log("Fetching data for Lab ID:", currentLab.id);

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
        // console.error("Error fetching data:", error);
        toast.error("An error occurred while fetching data.");
      }
    };

    fetchData();
  }, [currentLab]); // Ensure it only runs when currentLab is set

  useEffect(() => {
    if (searchTerm) {
      const filtered = patient.filter(p =>
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm)
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients([]);
    }
  }, [searchTerm, patient]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: string[] } }
  ) => {
    const { name, value } = 'target' in event ? event.target : { name: '', value: [] };

    // If it's related to insurance IDs, we handle it differently
    if (name === 'visit.insuranceIds') {
      setNewPatient(prevState => ({
        ...prevState,
        visit: {
          ...prevState.visit,
          insuranceIds: Array.isArray(value) ? value.map(Number) : [],
        },
      }));
    } else if (name.startsWith('visit.billing')) {
      // Handle nested billing fields (totalAmount, gstAmount, etc.)
      setNewPatient(prevState => ({
        ...prevState,
        visit: {
          ...prevState.visit,
          billing: {
            ...prevState.visit.billing,
            [name.split('.')[2]]: value, // Split to handle nested fields
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

  const handleTestSelection = (test: TestList) => {
    let updatedTests = [...selectedTests];
    if (selectedTests.some((t) => t.id === test.id)) {
      updatedTests = updatedTests.filter((t) => t.id !== test.id);
    } else {
      updatedTests = [...updatedTests, test];
    }

    // Update the selected tests
    setSelectedTests(updatedTests);

    // Update the newPatient state with selected test IDs
    setNewPatient((prevState) => ({
      ...prevState,
      visit: {
        ...prevState.visit,
        testIds: updatedTests.map((test) => test.id),
      },
    }));
  };

  const handlePackageSelection = (pkg: PackageType) => {
    let updatedPackages = [...selectedPackages];
    if (selectedPackages.some((p) => p.id === pkg.id)) {
      updatedPackages = updatedPackages.filter((p) => p.id !== pkg.id);
    } else {
      updatedPackages = [...updatedPackages, pkg];
    }

    // Update the selected packages
    setSelectedPackages(updatedPackages);

    // Update the newPatient state with selected package IDs
    setNewPatient((prevState) => ({
      ...prevState,
      visit: {
        ...prevState.visit,
        packageIds: updatedPackages.map((pkg) => pkg.id),
      },
    }));
  };


  const removeTest = (testId: string) => {
    setSelectedTests(selectedTests.filter((test) => test.id !== Number(testId)));
  };

  const removePackage = (packageId: string) => {
    setSelectedPackages(selectedPackages.filter((pkg) => pkg.id !== Number(packageId)));
  };

  useEffect(() => {

    const totalAmount = selectedTests.reduce((acc, test) => acc + test.price, 0);
    const totalPackageAmount = selectedPackages.reduce((acc, pkg) => acc + pkg.price, 0);
    const totalAmountWithPackage = totalAmount + totalPackageAmount;

    const discount = newPatient.visit?.billing.discount ?? 0;
    const discountedAmount = totalAmountWithPackage - (totalAmountWithPackage * discount / 100);

    const gstRate = newPatient.visit?.billing.gstRate ?? 0;
    const gstAmount = parseFloat(((discountedAmount * gstRate) / 100).toFixed(2));

    let cgstAmount = 0, sgstAmount = 0, igstAmount = 0;
    const isIntraState = true; // or set this based on your logic
    if (isIntraState) {
      cgstAmount = parseFloat((gstAmount / 2).toFixed(2));
      sgstAmount = parseFloat((gstAmount / 2).toFixed(2));
    } else {
      igstAmount = gstAmount;
    }

    const netAmount = parseFloat((discountedAmount + gstAmount).toFixed(2));

    setNewPatient(prevState => ({
      ...prevState,
      visit: {
        ...prevState.visit,
        billing: {
          ...prevState.visit?.billing,
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
      gender: selectedPatient.gender,
    });
    setSearchTerm(''); // Clear search term after selecting a patient
    setFilteredPatients([]); // Clear filtered list
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
    setSearchTerm(''); // Reset the search term
    setFilteredPatients([]); // Reset the filtered patients list
    setSelectedTests([]); // Reset the selected tests
    setSelectedPackages([]); // Reset the selected packages
    setSelectedCategory(''); // Reset the selected category
    // setSelectedInsurances([]); // Reset the selected insurances

  };

  const handleAddPatient = async () => {
    try {
      setLoading(true);

      const validationResult = patientSchema.safeParse(newPatient);
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

      const response = await addPatient(labId, newPatient);
      setPatientDetails(response.data);

      if (response.status === 'success') {
        toast.success('Patient added successfully.', { autoClose: 2000, position: 'top-right' });
        handleClearPatient();
        router.push(`/dashboard/bill/`);
      } else {
        toast.error('An error occurred while adding the patient.');
      }
    } catch (error) {
      console.error('Error adding patient:', error);
      toast.error('An error occurred while adding the patient.');
    } finally {
      setLoading(false); // Ensures loading state is always reset
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
      <div className="flex gap-4">
        <PatientFrom
          newPatient={newPatient}
          handleChange={handleChange}
          searchTerm={searchTerm}
          handleSearchChange={handleSearchChange}
          filteredPatients={filteredPatients}
          handlePatientSelect={handlePatientSelect}
          handleClearPatient={handleClearPatient}
        />

        <PatientVisit
          newPatient={newPatient}
          handleChange={handleChange}
          doctors={doctors}
        // insurances={insurances}
        // selectedInsurances={selectedInsurances}
        // setSelectedInsurances={setSelectedInsurances}
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
      />

      <PatientBilling
        newPatient={newPatient}
        handleChange={handleChange}
      />

      <div className="mt-4 flex justify-end space-x-4">
        {/* Add Patient Button */}
        <Button
          text='Patient'
          onClick={handleAddPatient}
          className="flex items-center py-2 px-3 bg-savebutton  hover:bg-savehover text-white rounded-md text-xs hover:bg-primarylight"
        >
          <Plus size={16} className="mr-2" /> {/* Check Icon */}

        </Button>

        {/* Cancel Button */}
        <Button
          text='Cancel'
          onClick={handleClearPatient}
          className="flex items-center py-2 px-3 bg-clear hover:bg-clearhover text-white rounded-md text-xs"
        >
          <XIcon size={16} className="mr-2" /> {/* X Icon */}

        </Button>
      </div>
    </div>
  );
};

export default AddPatient;





