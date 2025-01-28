import React from 'react';
import { Patient } from '@/types/patient/patient';
import { Insurance } from '@/types/insurance/insurance';
import { Doctor } from '@/types/doctor/doctor';
import { Trash2Icon } from 'lucide-react';

enum VisitType {
    UNKNOWN = 'Unknown',
    INPATIENT = 'In-Patient',
    OUTPATIENT = 'Out-Patient',
}

// enum VisitStatus {
//     UNKNOWN = 'Unknown',
//     PENDING = 'Pending',
//     COMPLETED = 'Completed',
//     CANCELLED = 'Cancelled',
// }

interface PatientVisitProps {
    newPatient: Patient;
    handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: string[] } }) => void;
    doctors: Doctor[];
    insurances: Insurance[];
    selectedInsurances: string[];
    setSelectedInsurances: (selectedInsurances: string[]) => void;

}

const PatientVisit = ({ newPatient, handleChange, doctors, insurances 
    , selectedInsurances, setSelectedInsurances
}: PatientVisitProps) => {
    // Initialize selected insurances with the existing data from the patient's visit
    // const [selectedInsurances, setSelectedInsurances] = useState<string[]>(newPatient.visit?.insuranceIds?.map(String) || []);

    // Handle changes in the insurance checkboxes
    const handleInsuranceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const insuranceId = event.target.value;
        const updatedInsurances = selectedInsurances.includes(insuranceId)
            ? selectedInsurances.filter(id => id !== insuranceId) // Remove insurance ID
            : [...selectedInsurances, insuranceId]; // Add insurance ID

        setSelectedInsurances(updatedInsurances);

        // Ensure that you update the correct `insuranceIds` inside the `visit` object
        handleChange({
            target: {
                name: 'visit.insuranceIds',  // Update 'insuranceIds' inside 'visit'
                value: updatedInsurances,
            }
        });
    };



    return (
        <section className="flex space-x-6 w-1/2">
            <div className="w-full p-4 border rounded-md border-gray-300 shadow-md">
                <h2 className="text-xs font-bold mb-2 text-gray-800">Visit Details</h2>
                <div className="grid grid-cols-2 gap-4">
                    {/* Visit Date */}
                    <div className="flex flex-col">
                        <label className="text-xs font-semibold mb-1 text-gray-700">Visit Date</label>
                        <input
                            type="date"
                            name="visit.visitDate"
                            value={newPatient.visit?.visitDate || ""}
                            onChange={handleChange}
                            className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Visit Type */}
                    <div className="flex flex-col">
                        <label className="text-xs font-semibold mb-1 text-gray-700">Visit Type</label>
                        <select
                            name="visit.visitType"
                            value={newPatient.visit?.visitType || ""}
                            onChange={handleChange}
                            className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {
                                Object.values(VisitType).map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    {/* Visit Status */}
                    {/* <div className="flex flex-col">
                        <label className="text-xs font-semibold mb-1 text-gray-700">Visit Status</label>
                        <select
                            name="visit.visitStatus"
                            value={newPatient.visit?.visitStatus || ""}
                            onChange={handleChange}
                            className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {
                                Object.values(VisitStatus).map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))
                            }
                        </select>
                    </div> */}

                    {/* Visit Description */}
                    <div className="flex flex-col">
                        <label className="text-xs font-semibold mb-1 text-gray-700">Visit Description</label>
                        <textarea
                            name="visit.visitDescription"
                            value={newPatient.visit?.visitDescription || ""}
                            onChange={handleChange}
                            className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter visit description"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    {/* Select Doctor */}
                    <div className="flex flex-col">
                        <label className="text-xs font-semibold mb-1 text-gray-700">Select Doctor</label>
                        <select
                            name="visit.doctorId"
                            value={newPatient.visit?.doctorId || ""}
                            onChange={handleChange}
                            className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select doctor</option>
                            {doctors.map((doctor) => (
                                <option key={doctor.id} value={doctor.id}>
                                    {doctor.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Select Insurance (Checkboxes for multiple selection) */}
                    <div className="flex flex-col">
                        <label className="text-xs font-semibold mb-1 text-gray-700">Select Insurance</label>
                        <div className="border rounded-md border-gray-300 p-2 h-20 overflow-y-auto space-y-2">
                            {insurances.map((insurance) => (
                                <div key={insurance.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        value={insurance.id}
                                        checked={selectedInsurances.includes((insurance.id ?? '').toString())}
                                        onChange={handleInsuranceChange}
                                        className="h-4 w-4 text-blue-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 text-xs text-gray-700">{insurance.name}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Display selected insurances */}
                {selectedInsurances.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-xs font-semibold mb-2 text-gray-700">Selected Insurances</h3>
                        <div className="border rounded-md border-gray-300 p-2 h-20 overflow-y-auto">
                            <ul className="text-xs">
                                {insurances
                                    .filter(
                                        insurance => insurance.id && selectedInsurances.includes(insurance.id.toString())
                                    )
                                    .map(selectedInsurance => (
                                        <li key={selectedInsurance.id} className="flex items-center justify-between">
                                            <span className='my-1'>{selectedInsurance.id}</span>
                                            <span className='my-1'>{selectedInsurance.name}</span>
                                            <button
                                                onClick={() =>
                                                    setSelectedInsurances(
                                                        selectedInsurances.filter(
                                                            id => id !== (selectedInsurance.id ?? '').toString()
                                                        )
                                                    )
                                                }
                                                className="ml-2 text-xs text-red-500"
                                            >
                                                <Trash2Icon size={16} />
                                            </button>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Clear All button */}
                {selectedInsurances.length > 0 && (
                    <button
                        onClick={() => {
                            setSelectedInsurances([]);
                            handleChange({ target: { name: 'insuranceIds', value: [] } });
                        }}
                        className="text-xs text-blue-500 mt-2"
                    >
                        Clear All
                    </button>
                )}
            </div>
        </section>
    );
};

export default PatientVisit;
