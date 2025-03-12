import { deletePatient, getPatient, updatePatient } from '@/../services/patientServices';
import Model from '@/app/(admin)/component/common/Model';
import Pagination from '@/app/(admin)/component/common/Pagination';
import UpdatePatient from '@/app/(admin)/component/dashboard/patient/UpdatePatient';
import { useLabs } from '@/context/LabContext';
import { Patient } from '@/types/patient/patient';
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from 'react';
import { FaEdit, FaEye, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../../common/Loader';
import TableComponent from '../../common/TableComponent';

const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [updatePatientDetails, setUpdatePatientDetails] = useState<Patient | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const router = useRouter(); 
  const { currentLab } = useLabs();
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

  useEffect(() => {
    if (currentLab?.id) {
      getPatient(currentLab.id)
        .then((data) => {
          if (data.status === 'success') {
            setPatients(data.data || []);
          } else {
            toast.error(data.message || 'Failed to fetch patients', { autoClose: 2000 });
          }
        })
        .catch((error) => {
          toast.error(error.message || 'Failed to fetch patients', { autoClose: 2000 });
        });
    }
  }, [currentLab?.id]);

  useEffect(() => {
    const results = patients.filter((patient) =>
      Object.values(patient)
        .join(' ')
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    setFilteredPatients(results);
    setCurrentPage(1); // Reset to first page on new search
  }, [searchQuery, patients]);

 

  // Handle Update Patient
  const handleUpdate = async (updatedPatient: Patient) => {
    if (!currentLab?.id || !updatePatientDetails) return;

    try {
      if (updatePatientDetails.id !== undefined) {
        const response = await updatePatient(currentLab.id, updatePatientDetails.id, updatedPatient);
        if (response.status === 'success') {
          toast.success('Patient updated successfully!', { autoClose: 2000 });
          setPatients((prev) =>
            prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
          );
          setIsUpdating(false);
        } else {
          toast.error(response.message || 'Failed to update patient.');
        }
      } else {
        toast.error('Patient ID is undefined.', { autoClose: 2000 });
      }
    } catch (error) {
      toast.error('Failed to update patient. Please try again.', { autoClose: 2000 });
    }
  };

  // Handle Delete Patient
  const handleDelete = (patient: Patient) => {
    if (!currentLab?.id) return;

    if (window.confirm('Are you sure you want to delete this patient?')) {
      const patientId = Number(patient?.id);
      deletePatient(currentLab.id, patientId)
        .then((response) => {
          if (response.status === 'success') {
            setPatients((prev) => prev.filter((p) => p.id !== patient.id));
            toast.success('Patient deleted successfully!');
          } else {
            toast.error(response.message || 'Failed to delete patient.', { autoClose: 2000 });
          }
        })
        .catch((error) => {
          toast.error(error.message || 'Failed to delete patient.', { autoClose: 2000 });
        });
    }
  };

  //rendering  the page get all data of particular patient visits
  const handleVisits = (patient: Patient) => {
    router.push(`/dashboard/patients/${patient.id}`);
  };

  const columns = [
    { header: 'First Name', accessor: 'firstName' as keyof Patient },
    { header: 'Last Name', accessor: 'lastName' as keyof Patient },
    { header: 'Gender', accessor: 'gender' as keyof Patient },
    { header: 'Email', accessor: 'email' as keyof Patient },
    { header: 'Phone', accessor: 'phone' as keyof Patient },
    { header: 'City', accessor: 'city' as keyof Patient },
    { header: 'Blood Group', accessor: 'bloodGroup' as keyof Patient },
  ];

  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!currentLab?.id || !patients) {
    return <Loader />;
  }
  return (
    <div className=''>
      <input
        type="text"
        placeholder="Search Patient"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-1 border border-gray-300 rounded-md mb-4"
      />
      <TableComponent
        data={paginatedPatients}
        columns={columns}
        actions={(patient) => (
          <div className="flex space-x-2 ">
            <button className="text-blue-500 hover:text-blue-700" onClick={() => handleVisits(patient)}>
              <FaEye />
            </button>
            <button
              className="text-green-500 hover:text-green-700"
              onClick={() => {
                setUpdatePatientDetails(patient);
                setIsUpdating(true);
              }}
            >
              <FaEdit />
            </button>
            <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(patient)}>
              <FaTrash />
            </button>
            {/* <button className="text-blue-500 hover:text-blue-700" onClick={() => handleVisits(patient)}>
              Visits
            </button> */}
          </div>
        )}
        noDataMessage="No patients found"
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* {isViewing && viewPatient && (
        <Model
          isOpen={isViewing}
          onClose={() => setIsViewing(false)}
          title="Patient Details"
          modalClassName="bg-gradient-to-r from-white via-gray-100 to-gray-200 max-w-2xl"
        >
          <ViewPatientDetails patient={viewPatient} />
        </Model>
      )} */}

      {isUpdating && updatePatientDetails && (
        <Model
          isOpen={isUpdating}
          onClose={() => setIsUpdating(false)}
          title="Update Patient"
          modalClassName="bg-gradient-to-r from-white via-gray-100 to-gray-200 max-w-2xl"
        >
          <UpdatePatient handleUpdate={handleUpdate} patient={updatePatientDetails} />
        </Model>
      )}
    </div>
  );
};
export default PatientList;
