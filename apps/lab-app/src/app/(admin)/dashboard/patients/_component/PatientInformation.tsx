import React from 'react'
import { AiOutlineMail, AiOutlinePhone, AiOutlineHome } from 'react-icons/ai'
import { AiOutlineHeart, AiOutlineCalendar } from 'react-icons/ai'
import { FaTransgenderAlt } from 'react-icons/fa'

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

const PatientInformation = ({ patient }: { patient: IPatient }) => {
    return (
        <section className="mb-8  p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">Patient Information</h2>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-800 mb-2">{patient.firstName} {patient.lastName}</h1>
                    <div className="text-sm text-gray-500">
                        <div className="flex items-center mb-2">
                            <AiOutlineMail className="mr-2 text-blue-500" />
                            <p>{patient.email}</p>
                        </div>
                        <div className="flex items-center mb-2">
                            <AiOutlinePhone className="mr-2 text-green-500" />
                            <p>{patient.phone}</p>
                        </div>
                        <div className="flex items-center">
                            <AiOutlineHome className="mr-2 text-yellow-500" />
                            <p>{patient.address}, {patient.city}, {patient.state} - {patient.zip}</p>
                        </div>
                    </div>
                </div>
                <div className="md:ml-6 mt-4 md:mt-0">
                    {/* Additional Patient Information with Icons */}
                    {patient.bloodGroup && (
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                            <AiOutlineHeart className="mr-2 text-red-500" />
                            <p>{`Blood Group: ${patient.bloodGroup}`}</p>
                        </div>
                    )}
                    {patient.dateOfBirth && (
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                            <AiOutlineCalendar className="mr-2 text-blue-500" />
                            <p>{`Date of Birth: ${new Date(patient.dateOfBirth).toLocaleDateString()}`}</p>
                        </div>
                    )}
                    {patient.gender && (
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                            <FaTransgenderAlt className="mr-2 text-purple-500" />
                            <p>{`Gender: ${patient.gender}`}</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

export default PatientInformation