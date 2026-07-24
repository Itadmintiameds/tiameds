'use client';

import { createDoctor, doctorDelete, getDoctor, updateDoctor } from '@/../../services/doctorServices';
import { getAllVisits } from '@/../../services/patientServices';
import Loader from '@/app/(admin)/component/common/Loader';
import DocterProfile from '@/app/(admin)/component/doctor/DocterProfile';
import UpdateDoctor from '@/app/(admin)/component/doctor/UpdateDoctor';
import { useLabs } from '@/context/LabContext';
import { Doctor } from '@/types/doctor/doctor';
import { Patient } from '@/types/patient/patient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaEdit, FaEye, FaSearch, FaSortAmountDown, FaSortAmountUp, FaTrash } from 'react-icons/fa';
import { FaUserDoctor } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon } from 'lucide-react';
import Modal from '../common/Model';
import Pagination from '../common/Pagination';
import ConfirmationDialog from '../common/ConfirmationDialog';
import AddDoctor from './AddDoctor';

const DOCTOR_SPECIALITIES = [
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

const DOCTOR_QUALIFICATIONS = [
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
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [doctorToEdit, setDoctorToEdit] = useState<Doctor | null>(null);
    const [doctorToAdd, setDoctorToAdd] = useState<Doctor | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const { currentLab } = useLabs();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [specialityFilter, setSpecialityFilter] = useState<string>('');
    const [qualificationFilter, setQualificationFilter] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'new' | 'old'>('new');
    const [currentPage, setCurrentPage] = useState<number>(1);
    // Referral counts keyed by doctorId, derived from all patient visits. Used to block
    // deleting a doctor who is still referenced by a patient before the DELETE is sent.
    const [referralCounts, setReferralCounts] = useState<Record<number, number>>({});
    const itemsPerPage = 5;

    const fetchDoctors = useCallback(async () => {
        if (currentLab?.id === undefined) return;

        setIsLoading(true);
        setError(null);
        try {
            const response = await getDoctor(currentLab.id);
            if (response?.status === 'success') {
                setDoctors(response.data);
            } else {
                setError(response?.message || 'Failed to fetch doctors');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch doctors');
        } finally {
            setIsLoading(false);
        }
    }, [currentLab]);

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    // Best-effort load of how many patient visits reference each doctor. There is no
    // dedicated "referral count" endpoint, so we derive it from the lab's visits (each
    // visit carries a doctorId). If this lookup fails we simply fall back to the backend
    // guard on delete, so the failure is swallowed silently.
    const fetchReferralCounts = useCallback(async () => {
        if (currentLab?.id === undefined) return;
        try {
            const response = await getAllVisits(currentLab.id);
            const visits: Patient[] = response?.data || [];
            const counts: Record<number, number> = {};
            visits.forEach((patient) => {
                const rawDoctorId = patient?.visit?.doctorId;
                const doctorId = typeof rawDoctorId === 'string' ? Number(rawDoctorId) : rawDoctorId;
                if (doctorId != null && !Number.isNaN(doctorId)) {
                    counts[doctorId] = (counts[doctorId] || 0) + 1;
                }
            });
            setReferralCounts(counts);
        } catch {
            // Non-fatal: deletion is still guarded server-side.
        }
    }, [currentLab]);

    useEffect(() => {
        fetchReferralCounts();
    }, [fetchReferralCounts]);

    const getReferralCount = (doctor: Doctor | null): number =>
        doctor?.id != null ? referralCounts[doctor.id] ?? 0 : 0;

    // Same wording used by the backend fallback (DOCTOR_REFERRAL_DELETE_MESSAGE), but with
    // the concrete patient count the client-side pre-check knows about.
    const buildReferralError = (count: number) =>
        `Cannot delete doctor: this doctor is referred to ${count} patient${count === 1 ? '' : 's'}. Please reassign those patients first.`;

    const handleViewDoctor = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
    };

    const handleDeleteClick = (doctor: Doctor) => {
        // Client-side validation: never send the DELETE for a doctor that still has
        // referrals -- show the actionable error up front instead of letting it fail.
        const count = getReferralCount(doctor);
        if (count > 0) {
            toast.error(buildReferralError(count), { className: 'bg-red-50 text-red-800' });
            return;
        }
        setDoctorToDelete(doctor);
    };

    const handleCancelDelete = () => {
        if (isDeleting) return;
        setDoctorToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!currentLab?.id || !doctorToDelete?.id) return;

        // Defensive re-check in case referral data changed while the dialog was open.
        const count = getReferralCount(doctorToDelete);
        if (count > 0) {
            toast.error(buildReferralError(count), { className: 'bg-red-50 text-red-800' });
            setDoctorToDelete(null);
            return;
        }

        setIsDeleting(true);
        try {
            const response = await doctorDelete(currentLab.id, doctorToDelete.id);
            if (response?.status === 'success') {
                setDoctors(prev => prev.filter(doctor => doctor.id !== doctorToDelete.id));
                toast.success('Doctor deleted successfully', {
                    position: 'top-right',
                    autoClose: 2000,
                    className: 'bg-green-50 text-green-800'
                });
                setDoctorToDelete(null);
                // Keep referral counts in sync so re-deletes reflect the current state.
                fetchReferralCounts();
            } else {
                throw new Error(response?.message || 'Failed to delete doctor');
            }
        } catch (error) {
            // Backend referral rejections (DOCTOR_REFERRAL_DELETE_MESSAGE) and any other
            // server error already carry a friendly message from the service layer.
            toast.error(error instanceof Error ? error.message : 'Deletion failed', {
                className: 'bg-red-50 text-red-800'
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEditDoctor = (doctor: Doctor) => {
        setDoctorToEdit(doctor);
        setIsModalOpen(true);
    };

    const handleAddNewDoctor = async (doctor: Doctor) => {
        if (!currentLab?.id) return;

        try {
            const response = await createDoctor(currentLab.id, doctor);
            if (response?.status === 'success') {
                setDoctors(prev => [...prev, response.data]);
                toast.success('Doctor added successfully', {
                    position: 'top-right',
                    autoClose: 2000,
                    className: 'bg-green-50 text-green-800'
                });
                setDoctorToAdd(null);
            } else {
                throw new Error(response?.message || 'Failed to add doctor');
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Addition failed', {
                className: 'bg-red-50 text-red-800'
            });
        }
    };

    const handleUpdateDoctor = async (doctor: Doctor) => {
        if (!currentLab?.id || !doctorToEdit?.id) return;

        try {
            await updateDoctor(currentLab.id, doctorToEdit.id, doctor);
            setDoctors(prev => prev.map(d => d.id === doctor.id ? doctor : d));
            toast.success('Doctor updated successfully', {
                autoClose: 1000,
                position: 'top-right',
                className: 'bg-green-50 text-green-800'
            });
            setIsModalOpen(false);
            setDoctorToEdit(null);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Update failed', {
                className: 'bg-red-50 text-red-800'
            });
        }
    };

    const filteredDoctors = useMemo(() => {
        let result = [...doctors];

        if (searchQuery) {
            result = result.filter(doctor =>
                doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (specialityFilter) {
            result = result.filter(doctor => (doctor.speciality ?? '') === specialityFilter);
        }

        if (qualificationFilter) {
            result = result.filter(doctor => (doctor.qualification ?? '') === qualificationFilter);
        }

        result.sort((a, b) => (sortOrder === 'new' ? (b.id ?? 0) - (a.id ?? 0) : (a.id ?? 0) - (b.id ?? 0)));

        return result;
    }, [doctors, searchQuery, specialityFilter, qualificationFilter, sortOrder]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, specialityFilter, qualificationFilter, sortOrder]);

    const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
    const paginatedDoctors = filteredDoctors.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const clearFilters = () => {
        setSearchQuery('');
        setSpecialityFilter('');
        setQualificationFilter('');
    };

    if (isLoading && doctors.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-6">
                <Loader type="progress" fullScreen={false} text="Loading doctors..." />
                <p className="mt-4 text-sm text-gray-600">Please wait while we fetch the doctor data.</p>
            </div>
        );
    }

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center p-6 bg-red-50 rounded-xl border border-red-100"
            >
                <div className="text-red-600 font-semibold text-lg mb-2">
                    {error}
                </div>
                <button
                    onClick={fetchDoctors}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200"
                >
                    Retry
                </button>
            </motion.div>
        );
    }

    return (
        <div className="p-6 space-y-4 bg-gray-50 rounded-xl shadow-lg">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-2"
            >
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Doctor Management</h1>
                    <p className="text-sm text-gray-500">View and manage all registered doctors</p>
                </div>
                <button
                    onClick={() => setDoctorToAdd({} as Doctor)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-full transition-all duration-200"
                    style={{
                        background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
                    }}
                >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add New Doctor
                </button>
            </motion.div>

            {/* Table Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Doctor List</h2>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400 text-sm" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search doctors..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm bg-gray-50 hover:border-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 focus:outline-none transition-colors"
                            />
                        </div>

                        <select
                            value={specialityFilter}
                            onChange={(e) => setSpecialityFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-full text-sm bg-gray-50 hover:border-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 focus:outline-none transition-colors"
                        >
                            <option value="">All Specialities</option>
                            {DOCTOR_SPECIALITIES.map(speciality => (
                                <option key={speciality} value={speciality}>
                                    {speciality}
                                </option>
                            ))}
                        </select>

                        <select
                            value={qualificationFilter}
                            onChange={(e) => setQualificationFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-full text-sm bg-gray-50 hover:border-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 focus:outline-none transition-colors"
                        >
                            <option value="">All Qualifications</option>
                            {DOCTOR_QUALIFICATIONS.map(qualification => (
                                <option key={qualification} value={qualification}>
                                    {qualification}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={() => setSortOrder(prev => (prev === 'new' ? 'old' : 'new'))}
                            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-full text-sm bg-gray-50 hover:bg-purple-50 hover:border-purple-300 transition-colors"
                        >
                            {sortOrder === 'new' ? <FaSortAmountDown className="text-gray-500" /> : <FaSortAmountUp className="text-gray-500" />}
                            {sortOrder === 'new' ? 'New to Old' : 'Old to New'}
                        </button>
                    </div>
                </div>

                {/* Table */}
                {paginatedDoctors.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-sm text-gray-500 border-b border-gray-100">
                                    <th className="px-6 py-3 font-medium">Name</th>
                                    <th className="px-6 py-3 font-medium">Email</th>
                                    <th className="px-6 py-3 font-medium">Speciality</th>
                                    <th className="px-6 py-3 font-medium">Qualification</th>
                                    <th className="px-6 py-3 font-medium">Phone</th>
                                    <th className="px-6 py-3 font-medium">License Number</th>
                                    <th className="px-6 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {paginatedDoctors.map((doctor) => (
                                        <motion.tr
                                            key={doctor.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="border-b border-gray-50 last:border-none hover:bg-purple-50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 flex items-center justify-center rounded-full bg-purple-50 shrink-0">
                                                        <FaUserDoctor className="text-purple-500 text-sm" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-800">{doctor.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{doctor.email || '—'}</td>
                                            <td className="px-6 py-4">
                                                {doctor.speciality ? (
                                                    <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                                                        {doctor.speciality}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{doctor.qualification || '—'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{doctor.phone || '—'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{doctor.licenseNumber || '—'}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditDoctor(doctor)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-full border border-purple-300 text-purple-600 hover:bg-purple-50 transition-colors"
                                                        title="Edit doctor"
                                                    >
                                                        <FaEdit className="text-sm" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewDoctor(doctor)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors"
                                                        title="View doctor"
                                                    >
                                                        <FaEye className="text-sm" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(doctor)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-full border border-red-300 text-red-500 hover:bg-red-50 transition-colors"
                                                        title="Delete doctor"
                                                    >
                                                        <FaTrash className="text-sm" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center p-8"
                    >
                        <FaUserDoctor className="mx-auto text-4xl text-gray-300 mb-3" />
                        <h3 className="text-lg font-semibold text-gray-800">No doctors found</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {searchQuery || specialityFilter || qualificationFilter
                                ? 'Try a different search term or filter'
                                : 'Register your first doctor to get started'}
                        </p>
                        {(searchQuery || specialityFilter || qualificationFilter) && (
                            <button
                                onClick={clearFilters}
                                className="mt-3 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200"
                                style={{
                                    background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
                                }}
                            >
                                Clear filters
                            </button>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Pagination */}
            {filteredDoctors.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center"
                >
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </motion.div>
            )}

            {/* Doctor Profile Modal */}
            {selectedDoctor && (
                <Modal
                    isOpen={!!selectedDoctor}
                    onClose={() => setSelectedDoctor(null)}
                    title="Doctor Profile"
                    modalClassName="max-w-2xl"
                >
                    <DocterProfile selectedDoctor={selectedDoctor} />
                </Modal>
            )}

            {/* Edit Doctor Modal */}
            {doctorToEdit && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setDoctorToEdit(null);
                    }}
                    title="Update Doctor Details"
                    modalClassName="max-w-2xl"
                >
                    <UpdateDoctor
                        editDoctor={doctorToEdit}
                        handleUpdate={handleUpdateDoctor}
                    />
                </Modal>
            )}

            {/* Add Doctor Modal */}
            {doctorToAdd && (
                <Modal
                    isOpen={!!doctorToAdd}
                    onClose={() => setDoctorToAdd(null)}
                    title="Register New Doctor"
                    modalClassName="max-w-2xl"
                >
                    <AddDoctor handleAddDoctor={handleAddNewDoctor} />
                </Modal>
            )}

            {/* Delete Doctor Confirmation */}
            <ConfirmationDialog
                isOpen={!!doctorToDelete}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Delete Doctor"
                message={`Are you sure you want to delete ${doctorToDelete?.name || 'this doctor'}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                isLoading={isDeleting}
            />
        </div>
    );
};

export default DoctorList;
