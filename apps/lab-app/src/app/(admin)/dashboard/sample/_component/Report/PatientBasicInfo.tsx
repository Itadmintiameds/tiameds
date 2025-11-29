import { PatientData } from '@/types/sample/sample';
import { FaCalendarAlt, FaFlask, FaUser } from 'react-icons/fa';

interface PatientBasicInfoProps {
    patient: PatientData;
}


const PatientBasicInfo = ({ patient }: PatientBasicInfoProps) => {
    // Format date to DD-MM-YYYY format
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        } catch (error) {
            return dateString; // Return original if parsing fails
        }
    };

    if (!patient) {
        return (
            <div className="bg-white p-3 rounded-lg border border-gray-200 mb-4">
                <p className="text-gray-600 text-xs text-center py-3">No patient data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 mb-4">
            {/* Patient Information Section */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <FaUser className="mr-2 text-blue-500" size={16} />
                    Patient Information
                    <span className="ml-2 text-xs font-normal text-blue-600 bg-white px-2 py-0.5 rounded-full">
                        {patient ? 1 : 0} record
                    </span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                        <span className="font-medium text-gray-600">Name:</span>
                        <span className="ml-2 text-gray-900">{patient.patientname || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="font-medium text-gray-600">Gender:</span>
                        <span className="ml-2 text-gray-900 capitalize">{patient.gender || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="font-medium text-gray-600">Contact:</span>
                        <span className="ml-2 text-gray-900">{patient.contactNumber || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="font-medium text-gray-600">Email:</span>
                        <span className="ml-2 text-gray-900">{patient.email || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="font-medium text-gray-600">Date of Birth:</span>
                        <span className="ml-2 text-gray-900">{formatDate(patient.dateOfBirth)}</span>
                    </div>
                </div>
            </div>

            {/* Visit Information Section */}
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                    <FaCalendarAlt className="mr-2 text-purple-500" size={16} />
                    Visit Information
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                        <span className="font-medium text-gray-600">Visit Date:</span>
                        <span className="ml-2 text-gray-900">{formatDate(patient.visitDate)}</span>
                    </div>
                    <div>
                        <span className="font-medium text-gray-600">Status:</span>
                        <span className="ml-2 text-gray-900 capitalize">{patient.visitStatus?.toLowerCase().replace('_', ' ') || 'N/A'}</span>
                    </div>
                </div>
            </div>

            {/* Sample & Test Information Section */}
            {(patient.sampleNames?.length > 0 || patient.testIds?.length > 0) && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                        <FaFlask className="mr-2 text-green-500" size={16} />
                        Sample & Test Information
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        {patient.sampleNames && patient.sampleNames.length > 0 && (
                            <div className="col-span-2">
                                <span className="font-medium text-gray-600">Samples:</span>
                                <span className="ml-2 text-gray-900">{patient.sampleNames.join(", ") || 'N/A'}</span>
                            </div>
                        )}
                        {patient.testIds && patient.testIds.length > 0 && (
                            <div className="col-span-2">
                                <span className="font-medium text-gray-600">Tests:</span>
                                <span className="ml-2 text-gray-900">{patient.testIds.length} test(s)</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default PatientBasicInfo;
