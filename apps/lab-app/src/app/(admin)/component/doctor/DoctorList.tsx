'use client';

import { createDoctor, doctorDelete, getDoctor, updateDoctor } from '@/../../services/doctorServices';
import { getAllVisits } from '@/../../services/patientServices';
import Loader from '@/app/(admin)/component/common/Loader';
import DocterProfile from '@/app/(admin)/component/doctor/DocterProfile';
import UpdateDoctor from '@/app/(admin)/component/doctor/UpdateDoctor';
import { useLabs } from '@/context/LabContext';
import { Doctor } from '@/types/doctor/doctor';
import { Patient } from '@/types/patient/patient';
import { Edit, Eye, Plus, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { HiOutlineTrash } from 'react-icons/hi2';
import { toast } from 'react-toastify';

// Components
import NewCommonTable from '@/app/(admin)/dashboard/newcommoncomponent/NewCommonTable';
import NewModal from '@/app/(admin)/dashboard/newcommoncomponent/NewModal';
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
    // Referral counts keyed by doctorId, derived from all patient visits. Used to block
    // deleting a doctor who is still referenced by a patient before the DELETE is sent.
    const [referralCounts, setReferralCounts] = useState<Record<number, number>>({});

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

    // Use useMemo to create a reset key based on filter changes
    const resetPageKey = useMemo(
        () => JSON.stringify({ searchQuery, specialityFilter, qualificationFilter, sortOrder }),
        [searchQuery, specialityFilter, qualificationFilter, sortOrder]
    );

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

    const specialityCount = useMemo(
        () => new Set(doctors.map(d => d.speciality).filter(Boolean)).size,
        [doctors]
    );
    const qualificationCount = useMemo(
        () => new Set(doctors.map(d => d.qualification).filter(Boolean)).size,
        [doctors]
    );

    // Table Columns with new UI styling
    const columns = [
        {
            header: 'Name',
            accessor: 'name',
            render: (row: Doctor) => (
                <p className="font-semibold text-p3 text-pneutral-900">{row.name}</p>
            ),
        },
        {
            header: 'Email',
            accessor: 'email',
            render: (row: Doctor) => (
                <p className="text-p3 text-pneutral-700">{row.email || '—'}</p>
            ),
        },
        {
            header: 'Speciality',
            accessor: 'speciality',
            render: (row: Doctor) =>
                row.speciality ? (
                    <span className="inline-flex items-center rounded-full bg-info-50 px-3 py-1 text-p2 font-medium text-info-700">
                        {row.speciality}
                    </span>
                ) : (
                    <span className="text-p3 text-pneutral-400">—</span>
                ),
        },
        {
            header: 'Qualification',
            accessor: 'qualification',
            render: (row: Doctor) => (
                <p className="text-p3 text-pneutral-700">{row.qualification || '—'}</p>
            ),
        },
        {
            header: 'Phone',
            accessor: 'phone',
            render: (row: Doctor) => (
                <p className="text-p3 text-pneutral-700">{row.phone || '—'}</p>
            ),
        },
        {
            header: 'License Number',
            accessor: 'licenseNumber',
            render: (row: Doctor) => (
                <p className="text-p3 text-pneutral-700">{row.licenseNumber || '—'}</p>
            ),
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (row: Doctor) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEditDoctor(row)}
                        className="flex h-[28px] w-[28px] items-center border border-info-700 justify-center rounded-full text-info-700 hover:bg-info-50 transition-colors"
                        title="Edit Doctor"
                    >
                        <Edit size={12} />
                    </button>
                    <button
                        onClick={() => handleViewDoctor(row)}
                        className="flex h-[28px] w-[28px] items-center border border-secondary-500 justify-center rounded-full text-secondary-600 hover:bg-secondary-50 transition-colors"
                        title="View Doctor"
                    >
                        <Eye size={12} />
                    </button>
                    <button
                        onClick={() => handleDeleteClick(row)}
                        className="flex h-[28px] w-[28px] items-center justify-center border border-warning-500 rounded-full text-warning-500 hover:bg-warning-50 transition-colors"
                        title="Delete Doctor"
                    >
                        <HiOutlineTrash size={12} />
                    </button>
                </div>
            ),
        },
    ];

    const clearFilters = () => {
        setSearchQuery('');
        setSpecialityFilter('');
        setQualificationFilter('');
    };

    if (isLoading && doctors.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader type="progress" fullScreen={false} text="Loading doctors..." />
                <p className="mt-4 text-sm text-gray-500">Please wait while we fetch the doctor data.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-6 bg-red-50 rounded-xl border border-red-100">
                <div className="text-red-600 font-semibold text-lg mb-2">{error}</div>
                <button
                    onClick={fetchDoctors}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Header Section */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-h3 font-semibold text-pneutral-900">
                            Doctor Management
                        </h1>
                        <p className="mt-1 text-p3 text-pneutral-500">
                            View and manage all registered doctors
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setDoctorToAdd({} as Doctor)}
                            className="flex items-center gap-2 rounded-full bg-secondary-700 px-4 py-2 text-label-l3 font-medium text-pneutral-50"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add New Doctor</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Section */}
            <div className="mb-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-xl border border-pneutral-100 bg-white p-5 text-left">
                        <h3 className="text-sm font-medium text-pneutral-900">Total Doctors</h3>
                        <p className="mt-4 text-3xl font-semibold text-pneutral-900">{doctors.length}</p>
                    </div>

                    <div className="rounded-xl border border-pneutral-100 bg-white p-5 text-left">
                        <h3 className="text-sm font-medium text-pneutral-900">Specialities</h3>
                        <p className="mt-4 text-3xl font-semibold text-info-500">{specialityCount}</p>
                    </div>

                    <div className="rounded-xl border border-pneutral-100 bg-white p-5 text-left">
                        <h3 className="text-sm font-medium text-pneutral-900">Qualifications</h3>
                        <p className="mt-4 text-3xl font-semibold text-danger-600">{qualificationCount}</p>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="mb-6 rounded-xl bg-white border border-pneutral-200 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative flex-1 max-w-xl">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-sneutral-700"
                        />
                        <input
                            type="text"
                            placeholder="Search doctors by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 w-full rounded-lg border border-pneutral-200 pl-10 pr-4 text-sm outline-none focus:border-pneutral-500"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-p3 text-pneutral-500">Speciality:</span>
                            <select
                                value={specialityFilter}
                                onChange={(e) => setSpecialityFilter(e.target.value)}
                                className="h-10 rounded-md border border-pneutral-200 px-3 text-p3 focus:border-pneutral-500"
                            >
                                <option value="">All Specialities</option>
                                {DOCTOR_SPECIALITIES.map((speciality) => (
                                    <option key={speciality} value={speciality}>
                                        {speciality}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-p3 text-pneutral-500">Qualification:</span>
                            <select
                                value={qualificationFilter}
                                onChange={(e) => setQualificationFilter(e.target.value)}
                                className="h-10 rounded-md border border-pneutral-200 px-3 text-p3 focus:border-pneutral-500"
                            >
                                <option value="">All Qualifications</option>
                                {DOCTOR_QUALIFICATIONS.map((qualification) => (
                                    <option key={qualification} value={qualification}>
                                        {qualification}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-pneutral-500">Sort by:</span>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as 'new' | 'old')}
                                className="h-10 rounded-md border border-pneutral-200 px-3 text-sm focus:border-pneutral-500"
                            >
                                <option value="new">Newest First</option>
                                <option value="old">Oldest First</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section - NewCommonTable handles pagination internally */}
            <div className="relative">
                {filteredDoctors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-pneutral-200 bg-white py-16">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-16 w-16 text-pneutral-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <p className="mt-4 text-sm font-medium text-pneutral-500">
                            {searchQuery || specialityFilter || qualificationFilter
                                ? 'No results found'
                                : 'No doctors available'}
                        </p>
                        {(searchQuery || specialityFilter || qualificationFilter) && (
                            <>
                                <p className="mt-1 text-xs text-pneutral-400">
                                    Try adjusting your search or filter criteria
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 flex items-center gap-2 rounded-full bg-secondary-700 px-4 py-2 text-label-l3 font-medium text-pneutral-50"
                                >
                                    Clear filters
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <NewCommonTable
                        columns={columns}
                        data={filteredDoctors}
                        pageSize={10}
                        showPagination={true}
                        resetPageKey={resetPageKey}
                    />
                )}
            </div>

            {/* Add Doctor Modal */}
            {doctorToAdd && (
                <NewModal
                    isOpen={!!doctorToAdd}
                    onClose={() => setDoctorToAdd(null)}
                    title="Add New Doctor"
                    modalClassName="max-w-2xl"
                >
                    <AddDoctor handleAddDoctor={handleAddNewDoctor} closeModal={() => setDoctorToAdd(null)} />
                </NewModal>
            )}

            {/* Edit Doctor Modal */}
            {doctorToEdit && (
                <NewModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setDoctorToEdit(null);
                    }}
                    title="Edit Doctor"
                    modalClassName="max-w-2xl"
                >
                    <UpdateDoctor
                        editDoctor={doctorToEdit}
                        handleUpdate={handleUpdateDoctor}
                        closeModal={() => {
                            setIsModalOpen(false);
                            setDoctorToEdit(null);
                        }}
                    />
                </NewModal>
            )}

            {/* Doctor Profile Modal */}
            {selectedDoctor && (
                <NewModal
                    isOpen={!!selectedDoctor}
                    onClose={() => setSelectedDoctor(null)}
                    title="Doctor Profile"
                    modalClassName="max-w-2xl"
                >
                    <DocterProfile selectedDoctor={selectedDoctor} />
                </NewModal>
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
