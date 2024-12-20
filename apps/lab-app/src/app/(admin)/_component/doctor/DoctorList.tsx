import React, { useState, useEffect } from 'react';
import { IoMdEye, IoMdCreate, IoMdTrash } from 'react-icons/io';
import { toast } from 'react-toastify';
import Loader from '@/app/(admin)/_component/Loader';
import Modal from '../Model';
import DocterProfile from '@/app/(admin)/_component/doctor/DocterProfile';
import UpdateDoctor from '@/app/(admin)/_component/doctor/UpdateDoctor';
import { getDoctor, updateDoctor, doctorDelete, createDoctor } from '@/../../services/doctorServices';
import { useLabs } from '@/context/LabContext';
import { Doctor } from '@/types/doctor/doctor';
import AddDoctor from './AddDoctor';
import Button from '../Button';
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';



const DoctorSpeciality = [
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'Dermatology',
    'Gynecology',
    'Oncology',
    'Ophthalmology',
    'ENT',
    'Psychiatry',
    'Urology',
    'Dentistry',
    'General Medicine',
    'General Surgery',
    'Physiotherapy',
    'Homeopathy',
    'Ayurveda',
    'Unani',
    'Naturopathy',
    'Siddha',
    'Others',
];


const DoctorQualification = [
    'MBBS',
    'MD',
    'DNB',
    'MS',
    'DM',
    'MCh',
    'BDS',
    'MDS',
    'BAMS',
    'BHMS',
    'BUMS',
    'BNYS',
    'BSMS',
    'Others',
];

const DoctorList = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);
    const [addDoctor, setAddDoctor] = useState<Doctor | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const { currentLab } = useLabs();

    const [searchQuery, setSearchQuery] = useState<string>('');
    const [specialityFilter, setSpecialityFilter] = useState<string>('');
    const [qualificationFilter, setQualificationFilter] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(5); // Number of doctors per page

    useEffect(() => {
        const labId = currentLab?.id;
        if (labId !== undefined) {
            setLoading(true);
            getDoctor(labId)
                .then((data) => {
                    if (data?.status === 'success') {
                        setDoctors(data.data);
                    } else {
                        toast.error(data?.message || 'Failed to fetch doctors');
                    }
                })
                .catch((error) => {
                    toast.error(error.message);
                })
                .finally(() => setLoading(false));
        }
    }, [currentLab]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to first page when search query changes
    };

    const handleView = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
    };

    const handleDelete = (doctorId: string) => {
        if (currentLab?.id) {
            doctorDelete(currentLab.id, Number(doctorId))
                .then((data) => {
                    if (data?.status === 'success') {
                        setDoctors((prev) => prev.filter((doctor) => doctor.id !== Number(doctorId)));
                        toast.success('Doctor deleted successfully', { position: 'top-right', autoClose: 2000 });
                    } else {
                        toast.error('Failed to delete doctor');
                    }
                })
                .catch((error) => {
                    toast.error(error.message);
                });
        }
    };

    const handleEdit = (doctor: Doctor) => {
        setEditDoctor(doctor);
        setShowModal(true);
    };

    const handleAddDoctor = (doctor: Doctor) => {
        if (currentLab?.id) {
            createDoctor(currentLab.id, doctor)
                .then((data) => {
                    if (data?.status === 'success') {
                        setDoctors((prev) => [...prev, data.data]);
                        toast.success('Doctor added successfully', { position: 'top-right', autoClose: 2000 });
                        setAddDoctor(null);
                    } else {
                        toast.error('Failed to add doctor');
                    }
                })
                .catch((error) => {
                    toast.error(error.message);
                });
        }
    };

    // Filter and paginate doctors
    const filteredDoctors = doctors.filter((doctor) =>
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        doctor.speciality.toLowerCase().includes(specialityFilter.toLowerCase()) &&
        doctor.qualification.toLowerCase().includes(qualificationFilter.toLowerCase())
    );

    const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
    const currentDoctors = filteredDoctors.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="flex flex-col">
            <div className="flex items-center mb-4 gap-x-2">
                <input
                    type="text"
                    placeholder="Search by Name"
                    value={searchQuery}
                    onChange={handleSearch}
                    className="px-4 py-1 text-sm border rounded-md flex-grow sm:w-auto"
                />
                <select
                    value={specialityFilter}
                    onChange={(e) => setSpecialityFilter(e.target.value)}
                    className="px-4 py-1 text-sm border rounded-md w-full sm:w-auto"
                >
                    <option value="">Speciality</option>
                    {DoctorSpeciality.map((speciality) => (
                        <option key={speciality} value={speciality}>
                            {speciality}
                        </option>
                    ))}
                </select>
                <select
                    value={qualificationFilter}
                    onChange={(e) => setQualificationFilter(e.target.value)}
                    className="px-4 py-1 text-sm border rounded-md w-full sm:w-auto"
                >
                    <option value="">Qualification</option>
                    {DoctorQualification.map((qualification) => (
                        <option key={qualification} value={qualification}>
                            {qualification}
                        </option>
                    ))}
                </select>
                <Button
                    text="Add Doctor"
                    onClick={() => setAddDoctor({} as Doctor)}
                    className="px-4 py-1 text-xs bg-button-tertiary text-white rounded-md hover:bg-button-tertiary focus:outline-none rounded"
                />
            </div>



            <div className="overflow-x-auto">
                <table className="min-w-full text-sm shadow-md rounded-md">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="text-left px-6 py-1">Name</th>
                            <th className="text-left px-6 py-1">Email</th>
                            <th className="text-left px-6 py-1">Speciality</th>
                            <th className="text-left px-6 py-1">Qualification</th>
                            <th className="text-left px-6 py-1">Phone</th>
                            <th className="text-left px-6 py-1">License Number</th>
                            <th className="text-center px-6 py-1">Actions</th>
                        </tr>
                    </thead>

                    {loading ? (
                        <tbody>
                            <tr>
                                <td colSpan={7} className="text-center py-4">
                                    <Loader />
                                </td>
                            </tr>
                        </tbody>
                    ) : currentDoctors.length === 0 ? (
                        <tbody>
                            <tr>
                                <td colSpan={7} className="text-center py-4">
                                    No doctors found
                                </td>
                            </tr>
                        </tbody>
                    ) : (
                        <tbody>
                            {currentDoctors.map((doctor) => (
                                <tr key={doctor.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-1 font-thin">{doctor.name}</td>
                                    <td className="px-6 py-1 font-thin">{doctor.email}</td>
                                    <td className="px-6 py-1 font-thin">{doctor.speciality}</td>
                                    <td className="px-6 py-1 font-thin">{doctor.qualification}</td>
                                    <td className="px-6 py-1 font-thin">{doctor.phone}</td>
                                    <td className="px-6 py-1 font-thin">{doctor.licenseNumber}</td>
                                    <td className="px-6 py-1 text-center space-x-3">
                                        <button
                                            onClick={() => handleView(doctor)}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            <IoMdEye size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(doctor)}
                                            className="text-green-500 hover:text-green-700"
                                        >
                                            <IoMdCreate size={20} />
                                        </button>
                                        <button
                                            onClick={() => doctor.id && handleDelete(doctor.id.toString())}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <IoMdTrash size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    )}
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-4">
                <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 text-xs flex items-center gap-2"
                >
                    <FaSortAmountDown className="text-gray-600" /> Previous
                </button>
                <span className="mx-4 text-xs">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 text-xs flex items-center gap-2"
                >
                    Next <FaSortAmountUp className="text-gray-600" />
                </button>
            </div>

            {selectedDoctor && (
                <Modal
                    isOpen={!!selectedDoctor}
                    onClose={() => setSelectedDoctor(null)}
                    title="Doctor Profile"
                    modalClassName="bg-gradient-to-r from-white via-gray-100 to-gray-200 max-w-2xl"
                >
                    <DocterProfile selectedDoctor={selectedDoctor} />
                </Modal>
            )}

            {editDoctor && (
                <Modal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title="Edit Doctor"
                    modalClassName="bg-gradient-to-r from-white via-gray-100 to-gray-200 max-w-2xl"
                >
                    <UpdateDoctor
                        editDoctor={editDoctor}
                        handleUpdate={(doctor: Doctor) => {
                            if (currentLab?.id && editDoctor?.id) {
                                updateDoctor(currentLab.id, editDoctor.id, doctor)
                                    .then(() => {
                                        toast.success('Doctor updated successfully', { autoClose: 1000, position: 'top-right' });
                                        setShowModal(false);
                                        setEditDoctor(null);
                                        // update the doctor in the list
                                        setDoctors((prev) => prev.map((d) => (d.id === doctor.id ? doctor : d)));
                                    })
                                    .catch((error) => {
                                        toast.error(error.message);
                                    });
                            }
                        }}
                    />
                </Modal>
            )}

            {addDoctor && (
                <Modal
                    isOpen={!!addDoctor}
                    onClose={() => setAddDoctor(null)}
                    title="Add Doctor"
                    modalClassName="bg-gradient-to-r from-white via-gray-100 to-gray-200 max-w-2xl"
                >
                    <AddDoctor handleAddDoctor={handleAddDoctor} />
                </Modal>
            )}
        </div>
    );
};

export default DoctorList;
