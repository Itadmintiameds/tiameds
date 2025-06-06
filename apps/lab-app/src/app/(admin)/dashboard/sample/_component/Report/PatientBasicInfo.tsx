import { PatientData } from '@/types/sample/sample';
import { FaCalendarAlt, FaEnvelope, FaFlask, FaPhone, FaUser, FaVenusMars, FaVial } from 'react-icons/fa';

interface PatientBasicInfoProps {
    patient: PatientData;
}


const PatientBasicInfo = ({ patient }: PatientBasicInfoProps) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 my-4 shadow-xs">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-md inline-flex items-center">
                    <FaUser className="mr-2 text-blue-500" />
                    Patient Report Data
                    <span className="ml-2 text-xs font-normal text-blue-600 bg-white px-2 py-0.5 rounded-full">
                        {patient ? 1 : 0} record
                    </span>
                </h3>
            </div>

            {patient ? (
                <div className="space-y-2">
                    <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                            <InfoItem icon={<FaUser className="text-blue-500" />} label="Name" value={patient.patientname} />
                            <InfoItem icon={<FaVenusMars className="text-purple-500" />} label="Gender" value={patient.gender} />
                            <InfoItem icon={<FaPhone className="text-green-500" />} label="Contact" value={patient.contactNumber} />
                            <InfoItem icon={<FaEnvelope className="text-red-500" />} label="Email" value={patient.email} />
                            <InfoItem icon={<FaCalendarAlt className="text-orange-500" />} label="DOB" value={patient.dateOfBirth ?? ''} />
                            <InfoItem icon={<FaCalendarAlt className="text-blue-400" />} label="Visit" value={patient.visitDate} />
                            <InfoItem icon={<FaCalendarAlt className="text-gray-500" />} label="Status" value={patient.visitStatus} />
                            <InfoItem icon={<FaVial className="text-yellow-500" />} label="Samples" value={patient.sampleNames?.join(", ") ?? ''} />
                            <InfoItem icon={<FaFlask className="text-indigo-500" />} label="Tests" value={patient.testIds?.join(", ") ?? ''} />
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-gray-400 text-xs text-center py-3 bg-gray-50 rounded">No patient data available</p>
            )}
        </div>
    )
}

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className="flex items-start space-x-1.5 truncate">
        <span className="mt-0.5">{icon}</span>
        <div className="truncate">
            <span className="font-medium text-gray-600">{label}: </span>
            <span className="text-gray-700 truncate">{value}</span>
        </div>
    </div>
);

export default PatientBasicInfo;
