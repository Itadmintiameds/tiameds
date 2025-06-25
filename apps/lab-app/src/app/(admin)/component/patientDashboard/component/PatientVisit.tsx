import React from 'react';
import { Patient } from '@/types/patient/patient';
import { Doctor } from '@/types/doctor/doctor';
import { FaCalendarAlt, FaCalendar, FaUserPlus } from 'react-icons/fa';
import Modal from '../../common/Model';
import AddDoctor from './AddDoctor';
import { createDoctor } from '../../../../../../services/doctorServices';
import { useLabs } from '@/context/LabContext';
import { useState } from 'react';
import { FaUserDoctor } from 'react-icons/fa6';
import { toast } from 'react-toastify';


enum VisitType {
    INPATIENT = 'In-Patient',
    OUTPATIENT = 'Out-Patient',
}

interface PatientVisitProps {
    newPatient: Patient;
    handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: string[] } }) => void;
    doctors: Doctor[];
    

}

const PatientVisit = ({ newPatient, handleChange, doctors}: PatientVisitProps) => {
    const { currentLab, refreshDocterList,setRefreshDocterList } = useLabs();
    const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
    const [isDoctorAddedLoading, setIsDoctorAddedLoading] = useState(false);
    const [doctor, setDoctor] = useState<Doctor>({
        id: undefined,
        name: '',
        email: '',
        speciality: '',
        qualification: '',
        hospitalAffiliation: '',
        licenseNumber: '',
        phone: 0,
        address: '',
        city: '',
        state: '',
        country: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});


    // const handleAddDoctor = async (doctor: Doctor) => {
    //     setIsDoctorAddedLoading(true);
    //     if (currentLab?.id) {
    //         createDoctor(currentLab.id, doctor).then((res) => {
    //             if (res?.status === 'success') {
    //                 toast.success('Doctor added successfully!');
    //                 setUpdatedocorlist(true);
    //             } else {
    //                 toast.error('Failed to add doctor!');
    //             }
    //         });
    //     }
    //     else {
    //         toast.error('No lab selected!');
    //     }
    //     setIsDoctorModalOpen(false);
    //     setErrors({});
    //     setIsDoctorAddedLoading(false);
    //     setUpdatedocorlist(false);
    //     setDoctor({
    //         id: undefined,
    //         name: '',
    //         email: '',
    //         speciality: '',
    //         qualification: '',
    //         hospitalAffiliation: '',
    //         licenseNumber: '',
    //         phone: 0,
    //         address: '',
    //         city: '',
    //         state: '',
    //         country: '',
    //     });
    // };


    const handleAddDoctor = async (doctor: Doctor) => {
        setIsDoctorAddedLoading(true);

        try {
            if (currentLab?.id) {
                const res = await createDoctor(currentLab.id, doctor);
        
                if (res?.status === 'success') {
                    setRefreshDocterList(!refreshDocterList);
                    toast.success('Doctor added successfully!');
                } else {
                    toast.error('Failed to add doctor!');
                }
            } else {
                toast.error('No lab selected!');
            }
        } catch (error) {
            console.error('Error adding doctor:', error);
            toast.error('Doctor already exists!',{autoClose: 1000});

        
        } finally {
            setIsDoctorModalOpen(false);
            setErrors({});
            setIsDoctorAddedLoading(false);
            setRefreshDocterList(!refreshDocterList);
            setDoctor({
                id: undefined,
                name: '',
                email: '',
                speciality: '',
                qualification: '',
                hospitalAffiliation: '',
                licenseNumber: '',
                phone: 0,
                address: '',
                city: '',
                state: '',
                country: '',
            });
        }
    };




    return (
        <section className="flex space-x-4 w-full max-w-md">
            <div className="w-full p-3 border rounded-lg border-gray-200 shadow-sm bg-white">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xs font-semibold text-gray-700 flex items-center">
                        <FaCalendarAlt className="mr-1.5 text-purple-500 text-sm" />
                        Visit Details
                    </h2>
                </div>
                <div className="space-y-3">
                    <div className="flex flex-col">
                        <label className="text-xs font-medium mb-1 text-purple-500 flex items-center">
                            Visit Date <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                name="visit.visitDate"
                                value={newPatient.visit?.visitDate || ""}
                                onChange={handleChange}
                                className="border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            <FaCalendar className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-purple-500 text-xs pointer-events-none" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs font-medium mb-1 text-gray-600 flex items-center">
                            Visit Type <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <select
                            name="visit.visitType"
                            value={newPatient.visit?.visitType || ""}
                            onChange={handleChange}
                            className="border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                            required
                        >
                            {Object.values(VisitType).map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* <div className="flex flex-col">
                        <label className="text-xs font-medium mb-1 text-gray-600">Description</label>
                        <textarea
                            name="visit.visitDescription"
                            value={newPatient.visit?.visitDescription || ""}
                            onChange={handleChange}
                            rows={2}
                            className="border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter visit description"
                        />
                    </div> */}
                    <div className="flex flex-col">
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-medium text-gray-600">Doctor</label>
                            <button
                                type="button"
                                onClick={() => setIsDoctorModalOpen(true)}
                                className="flex items-center text-xs text-purple-500 hover:text-blue-800"
                            >
                                <FaUserPlus className="mr-1 text-xs text-purple-500" />
                                Add Doctor
                            </button>
                        </div>
                        <div className="relative">
                            <select
                                name="visit.doctorId"
                                value={newPatient.visit?.doctorId || ""}
                                onChange={handleChange}
                                className="border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                            >
                                <option value="">Select doctor</option>
                                {doctors.map((doctor) => (
                                    <option key={doctor.id} value={doctor.id}>
                                        {doctor.name}
                                    </option>
                                ))}
                            </select>
                            <FaUserDoctor className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-purple-500 text-xs pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>
            {isDoctorModalOpen && (
                <Modal
                    isOpen={isDoctorModalOpen}
                    onClose={() => {
                        setIsDoctorModalOpen(false);
                        setDoctor({
                            id: undefined,
                            name: '',
                            email: '',
                            speciality: '',
                            qualification: '',
                            hospitalAffiliation: '',
                            licenseNumber: '',
                            phone: 0,
                            address: '',
                            city: '',
                            state: '',
                            country: '',
                        });
                    }}
                    modalClassName='max-w-xs'
                    title="Add Doctor">
                    <AddDoctor
                        handleAddDoctor={handleAddDoctor}
                        errors={errors}
                        doctor={doctor}
                        setDoctor={setDoctor}
                        isDoctorAddedLoading={isDoctorAddedLoading}
                    />

                </Modal>
            )}
        </section>
    );
};

export default PatientVisit;








