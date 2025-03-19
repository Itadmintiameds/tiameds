import { createDoctor, doctorDelete, getDoctor, updateDoctor } from '@/../../services/doctorServices';
import Loader from '@/app/(admin)/component/common/Loader';
import DocterProfile from '@/app/(admin)/component/doctor/DocterProfile';
import UpdateDoctor from '@/app/(admin)/component/doctor/UpdateDoctor';
import { useLabs } from '@/context/LabContext';
import { Doctor } from '@/types/doctor/doctor';
import React, { useEffect, useState } from 'react';
import { IoMdCreate, IoMdEye, IoMdTrash } from 'react-icons/io';
import { toast } from 'react-toastify';
import Button from '../common/Button';
import Modal from '../common/Model';
import Pagination from '../common/Pagination';
import AddDoctor from './AddDoctor';
import { PlusIcon } from 'lucide-react';
import TableComponent from '../common/TableComponent';


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
            //check data is comming or not
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
    const columns = [
        { header: "Name", accessor: "name" as keyof Doctor },
        { header: "Email", accessor: "email" as keyof Doctor },
        { header: "Speciality", accessor: "speciality" as keyof Doctor },
        { header: "Qualification", accessor: "qualification" as keyof Doctor },
        { header: "Phone", accessor: "phone" as keyof Doctor },
        { header: "License Number", accessor: "licenseNumber" as keyof Doctor },
    ];

    const actions = (doctor: Doctor) => (
        <div className="space-x-3 flex justify-center">
            <Button
                text=''
                onClick={() => handleView(doctor)}
                className="text-view hover:text-viewhover"
            >
                <IoMdEye size={20} />
            </Button>
            <Button
                text=''
                onClick={() => handleEdit(doctor)}
                className="text-edit hover:text-edithover"
            >
                <IoMdCreate size={20} />
            </Button>
            <Button
                text=''
                onClick={() => doctor.id && handleDelete(doctor.id.toString())}
                className="text-deletebutton hover:text-deletehover"
            >
                <IoMdTrash size={20} />
            </Button>
        </div>
    );

    if(doctors.length === 0) return <Loader />;

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
                    text="Doctor"
                    onClick={() => setAddDoctor({} as Doctor)}
                    className="px-4 py-1 flex text-xs bg-primary text-textzinc rounded-md hover:bg-button-tertiary focus:outline-none rounded "
                >
                    <PlusIcon className='mr-2' />
                </Button>
            </div>
            <div className="overflow-x-auto">
                <TableComponent
                    data={loading ? [] : currentDoctors}
                    columns={columns}
                    actions={actions}
                    noDataMessage={"No doctors found"}
                />
            </div>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
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
