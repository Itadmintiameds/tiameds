import { PatientData } from '@/types/sample/sample';
import { FaCalendarAlt, FaEnvelope, FaFlask, FaPhone, FaUser, FaVenusMars, FaVial } from 'react-icons/fa';

const PatientBasicInfo = ({ patientList }: { patientList: PatientData[] }) => {
    return (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden p-4 my-4">
            <h3 className="text-sm font-semibold text-blue-900 bg-blue-200 px-3 py-1 rounded-md inline-block shadow">
                Patient Report Data
            </h3>

            {patientList.length > 0 ? (
                patientList.map((patient, index) => (
                    <div
                        key={patient.visitId}
                        className={`mt-2 p-3 rounded-lg shadow-sm border transition-all ${index % 2 === 0 ? "bg-gradient-to-r from-blue-50 to-blue-100" : "bg-white"
                            }`}
                    >
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-700">
                            <p>
                                <FaUser className="inline-block mr-1 text-blue-600" />
                                <strong>Name:</strong> {patient.patientname}
                            </p>
                            <p>
                                <FaVenusMars className="inline-block mr-1 text-purple-600" />
                                <strong>Gender:</strong> {patient.gender}
                            </p>
                            <p>
                                <FaPhone className="inline-block mr-1 text-green-600" />
                                <strong>Contact:</strong> {patient.contactNumber}
                            </p>
                            <p>
                                <FaEnvelope className="inline-block mr-1 text-red-600" />
                                <strong>Email:</strong> {patient.email}
                            </p>
                            <p>
                                <FaCalendarAlt className="inline-block mr-1 text-orange-600" />
                                <strong>DOB:</strong> {patient.dateOfBirth}
                            </p>
                            <p>
                                <FaCalendarAlt className="inline-block mr-1 text-blue-600" />
                                <strong>Visit:</strong> {patient.visitDate}
                            </p>
                            <p>
                                <FaCalendarAlt className="inline-block mr-1 text-gray-600" />
                                <strong>Status:</strong> {patient.visitStatus}
                            </p>
                            <p>
                                <FaVial className="inline-block mr-1 text-yellow-600" />
                                <strong>Samples:</strong> {patient.sampleNames.join(", ")}
                            </p>
                            <p>
                                <FaFlask className="inline-block mr-1 text-indigo-600" />
                                <strong>Tests:</strong> {patient.testIds.join(", ")}
                            </p>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-gray-500 text-center mt-3 text-xs">No patient data available.</p>
            )}
        </div>
    )
}

export default PatientBasicInfo