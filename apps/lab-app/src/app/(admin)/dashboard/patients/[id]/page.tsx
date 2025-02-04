'use client';
import { getPatientById, getVisitsByPatientId } from '@/../services/patientServices'; // Update to include patient info
import PatientVisitData from '@/app/(admin)/dashboard/patients/_component/PatientVisitData';
import { useLabs } from '@/context/LabContext';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import PatientInformation from '../_component/PatientInformation';
import Loader from '@/app/(admin)/component/common/Loader';

interface IParams {
  id: string;
}

interface IPatient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
}

interface IVisit {
  visitId: number;
  visitDate: string;
  visitType: string;
  visitStatus: string;
  visitDescription: string;
  billing: {
    totalAmount: number;
    paymentStatus: string;
    paymentMethod: string;
    paymentDate: string;
  };
}

interface VisitEntry {
  visit: {
    id: number;
    visitDate: string;
    visitType: string;
    visitStatus: string;
    visitDescription: string;
    billing: {
      totalAmount: number;
      paymentStatus: string;
      paymentMethod: string;
      paymentDate: string;
    };
  };
}

const Page = ({ params }: { params: IParams }) => {
  const [patient, setPatient] = useState<IPatient | null>(null);
  const [visits, setVisits] = useState<IVisit[]>([]);
  const { currentLab } = useLabs();

  useEffect(() => {
    const fetchPatientAndVisits = async () => {
      if (currentLab?.id) {
        try {
          const patientData = await getPatientById(currentLab.id, parseInt(params.id));
          const visitsData = await getVisitsByPatientId(currentLab.id, parseInt(params.id));

          setPatient(patientData.data);

          // Extract and map visits correctly
          const extractedVisits = visitsData.map((entry: VisitEntry) => entry.visit);
          setVisits(extractedVisits);
        } catch (error) {
          if (error instanceof Error) {
            toast.error(error.message || "Failed to fetch data", { autoClose: 2000 });
          } else {
            toast.error("Failed to fetch data", { autoClose: 2000 });
          }
        }
      }
    };

    fetchPatientAndVisits();
  }, [currentLab?.id, params.id]);

  if (!patient || !visits) {
    return <Loader />;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="flex justify-end items-center sticky top-0 z-10">
        <ArrowLeftIcon
          className="h-5 w-5 text-textwhite font-bold animate-bounce text-xl cursor-pointer bg-primary rounded-full p-1"
          onClick={() => window.history.back()}
        />
      </div>
      {/* Patient Info Section */}
      {patient && (
        <PatientInformation patient={patient} />
      )}

      {/* Visits Table */}
      <PatientVisitData visits={visits} handlePrint={handlePrint} />
    </div>
  );
};

export default Page;


