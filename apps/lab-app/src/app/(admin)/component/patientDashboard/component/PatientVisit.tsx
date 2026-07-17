import React from 'react';
import { Patient, VisitType } from '@/types/patient/patient';
import { Doctor } from '@/types/doctor/doctor';
import { FaCalendarAlt, FaUserPlus } from 'react-icons/fa';
import Modal from '../../common/Model';
import AddDoctor from '../../doctor/AddDoctor';
import { createDoctor } from '../../../../../../services/doctorServices';
import { useLabs } from '@/context/LabContext';
import { useState } from 'react';
import { FaUserDoctor } from 'react-icons/fa6';
import { toast } from 'react-toastify';

interface PatientVisitProps {
    newPatient: Patient;
    handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: string[] } }) => void;
    doctors: Doctor[];
    mode?: 'full' | 'visitOnly' | 'doctorOnly';
}

const PatientVisit = ({ newPatient, handleChange, doctors, mode = 'full' }: PatientVisitProps) => {
    const { currentLab, refreshDocterList, setRefreshDocterList } = useLabs();
    const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);

    const handleAddDoctor = async (doctor: Doctor) => {
        if (!currentLab?.id) {
            toast.error('No lab selected!');
            return;
        }

        try {
            const res = await createDoctor(currentLab.id, doctor);
            if (res?.status === 'success') {
                setRefreshDocterList(!refreshDocterList);
                toast.success('Doctor added successfully!');
                setIsDoctorModalOpen(false);
            } else {
                throw new Error('Failed to add doctor!');
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Doctor already exists!', { autoClose: 1500 });
        }
    };

    return (
        <section className="w-full">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                {/* Visit type radio buttons — hidden when doctorOnly */}
                {mode !== 'doctorOnly' && (
                    <>
                        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <FaCalendarAlt className="text-purple-500" />
                            Visit Type
                        </h3>
                        <div className="space-y-2 mb-5">
                            {Object.values(VisitType).map((type) => {
                                const isSelected = newPatient.visit?.visitType === type;
                                return (
                                    <label
                                        key={type}
                                        className={`flex items-center gap-3 p-3 rounded-full border-2 cursor-pointer transition-all ${
                                            isSelected
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                            isSelected ? 'border-purple-600' : 'border-gray-300'
                                        }`}>
                                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                        </div>
                                        <span className={`text-sm font-medium ${isSelected ? 'text-purple-700' : 'text-gray-700'}`}>
                                            {type}
                                        </span>
                                        <input
                                            type="radio"
                                            name="visit.visitType"
                                            value={type}
                                            checked={isSelected}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                    </label>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Referring Doctor — hidden when visitOnly */}
                {mode !== 'visitOnly' && (
                    <div className={mode === 'doctorOnly' ? '' : 'pt-4 border-t border-gray-100'}>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                                <FaUserDoctor className="text-purple-500 text-xs" />
                                Referring Doctor
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsDoctorModalOpen(true)}
                                className="flex items-center text-xs text-purple-500 hover:text-purple-700"
                            >
                                <FaUserPlus className="mr-1" />
                                Add
                            </button>
                        </div>
                        <div className="relative">
                            <select
                                name="visit.doctorId"
                                value={newPatient.visit?.doctorId || ""}
                                onChange={handleChange}
                                className="w-full border rounded-full border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-white appearance-none"
                            >
                                <option value="">Select doctor</option>
                                {doctors.map((doctor) => (
                                    <option key={doctor.id} value={doctor.id}>
                                        {doctor.name}
                                    </option>
                                ))}
                            </select>
                            <FaUserDoctor className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                        </div>
                    </div>
                )}
            </div>
            {isDoctorModalOpen && (
                <Modal
                    isOpen={isDoctorModalOpen}
                    onClose={() => setIsDoctorModalOpen(false)}
                    modalClassName='max-w-2xl'
                    title="Register New Doctor">
                    <AddDoctor handleAddDoctor={handleAddDoctor} />
                </Modal>
            )}
        </section>
    );
};

export default PatientVisit;










