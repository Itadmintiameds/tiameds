// import { Doctor } from '@/types/doctor/doctor';
// import { Plus } from 'lucide-react';
// import {
//     FaPhoneAlt,
//     FaStethoscope,
//     FaUser
// } from 'react-icons/fa';
// import Button from '../../common/Button';

// interface AddDoctorProps {
//     handleAddDoctor: (doctor: Doctor) => void;
//     doctor?: Doctor;
//     setDoctor: React.Dispatch<React.SetStateAction<Doctor>>;
//     errors: Record<string, string>;
//     isDoctorAddedLoading: boolean;
// }

// const DoctorSpeciality = [
//     'Physician',
//     'Surgeon',
//     'Cardiology',
//     'Neurology',
//     'Pediatrics',
//     'Orthopedics',
//     'Dermatology',
//     'Gynecology',
//     'Oncology',
//     'Ophthalmology',
//     'ENT',
//     'Psychiatry',
//     'Urology',
//     'Dentistry',
//     'General Medicine',
//     'General Surgery',
//     'Physiotherapy',
//     'Homeopathy',
//     'Ayurveda',
//     'Unani',
//     'Naturopathy',
//     'Siddha',
//     'Immunology',
//     'Nephrology',
//     'Hematology',
//     'Gastroenterology',
//     'Endocrinology',
//     'Pulmonology',
//     'Rheumatology',
//     'Anesthesiology',
//     'Radiology',
//     'Pathology',
//     'Emergency Medicine',
//     'Sports Medicine',
//     'Plastic Surgery',
//     'Rehabilitation Medicine',
//     'Infectious Disease',
//     'Occupational Medicine',
//     'Allergy and Immunology',
//     'Critical Care',
//     'Geriatrics',
//     'Palliative Care',
//     'Nuclear Medicine',
//     'Sleep Medicine',
//     'Pain Management',
//     'Clinical Pharmacology',
//     'Andrology',
//     'Genetics',
//     'Others',
// ];

// const AddDoctor = ({ handleAddDoctor, doctor, setDoctor, errors, isDoctorAddedLoading }: AddDoctorProps) => {
//     return (
//         <form className="space-y-4 p-4">
//             <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
//                 {[
//                     { label: 'Name', name: 'name', icon: FaUser, type: 'text', placeholder: 'Enter Doctor Name', required: true },
//                     { label: 'Speciality', name: 'speciality', icon: FaStethoscope, type: 'text', placeholder: 'Enter Doctor Speciality', required: true },
//                     { label: 'Phone', name: 'phone', icon: FaPhoneAlt, type: 'number', placeholder: 'Enter Doctor Phone Number', required: false },
//                 ].map(({ label, name, icon: Icon, type, placeholder, required }) => (
//                     <div key={name} className="mb-2">
//                         <label htmlFor={name} className="text-xs font-medium text-gray-700 flex items-center">
//                             <Icon className="mr-2 text-gray-500" /> {label}
//                         </label>
//                         {label === 'Speciality' ? (
//                             <>
//                                 <input
//                                     list="speciality-options"
//                                     type={type}
//                                     id={name}
//                                     name={name}
//                                     placeholder={placeholder}
//                                     value={doctor?.[name as keyof Doctor]?.toString() || ''}
//                                     onChange={(e) => {
//                                         const { name, value } = e.target;
//                                         setDoctor((prevDoctor) => ({
//                                             ...prevDoctor,
//                                             [name]: value,
//                                         }));
//                                     }}
//                                     required={required}
//                                     className={`mt-1 block w-full p-2 text-xs border ${errors[name] ? 'border-red-500' : 'border-gray-300'
//                                         } rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
//                                 />
//                                 <datalist id="speciality-options">
//                                     {DoctorSpeciality.map((speciality) => (
//                                         <option key={speciality} value={speciality} />
//                                     ))}
//                                 </datalist>
//                                 {errors[name] && (
//                                     <p className="text-xs text-red-500 mt-1">{errors[name]}</p>
//                                 )}
//                             </>
//                         ) : (
//                             <>
//                                 <input
//                                     type={type}
//                                     id={name}
//                                     name={name}
//                                     placeholder={placeholder}
//                                     value={doctor?.[name as keyof Doctor]?.toString() || ''}
//                                     onChange={(e) => {
//                                         const { name, value } = e.target;
//                                         setDoctor((prevDoctor) => ({
//                                             ...prevDoctor,
//                                             [name]: name === 'phone' ? parseInt(value) || '' : value,
//                                         }));
//                                     }}
//                                     required={required}
//                                     className={`mt-1 block w-full p-2 text-xs border ${errors[name] ? 'border-red-500' : 'border-gray-300'
//                                         } rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
//                                 />
//                                 {errors[name] && (
//                                     <p className="text-xs text-red-500 mt-1">{errors[name]}</p>
//                                 )}
//                             </>
//                         )}
//                     </div>
//                 ))}
//             </div>
//             {
//                 isDoctorAddedLoading ? (
//                     <Button
//                         text='Adding Doctor...'
//                         type="button"
//                         onClick={() => { }}
//                         className="w-full px-4 py-2 text-xs bg-primary text-textzinc rounded-md hover:bg-primarylight focus:outline-none flex items-center justify-center space-x-2"
//                         disabled
//                     >
//                         <Plus size={20} />
//                     </Button>
//                 ) : (
//                     <Button
//                         text='Add Doctor'
//                         onClick={() => { handleAddDoctor(doctor!) }}
//                         type="submit"
//                         className="w-full px-4 py-2 text-xs bg-primary text-textzinc rounded-md hover:bg-primarylight focus:outline-none flex items-center justify-center space-x-2"
//                     >
//                         <Plus size={20} />
//                     </Button>
//                 )
//             }
//         </form>
//     );
// };

// export default AddDoctor;








import { Doctor } from '@/types/doctor/doctor';
import { Plus } from 'lucide-react';
import {
    FaPhoneAlt,
    FaStethoscope,
    FaUser
} from 'react-icons/fa';
import Button from '../../common/Button';

interface AddDoctorProps {
    handleAddDoctor: (doctor: Doctor) => void;
    doctor?: Doctor;
    setDoctor: React.Dispatch<React.SetStateAction<Doctor>>;
    errors: Record<string, string>;
    isDoctorAddedLoading: boolean;
}

const DoctorSpeciality = [
    'Physician',
    'Surgeon',
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
    'Immunology',
    'Nephrology',
    'Hematology',
    'Gastroenterology',
    'Endocrinology',
    'Pulmonology',
    'Rheumatology',
    'Anesthesiology',
    'Radiology',
    'Pathology',
    'Emergency Medicine',
    'Sports Medicine',
    'Plastic Surgery',
    'Rehabilitation Medicine',
    'Infectious Disease',
    'Occupational Medicine',
    'Allergy and Immunology',
    'Critical Care',
    'Geriatrics',
    'Palliative Care',
    'Nuclear Medicine',
    'Sleep Medicine',
    'Pain Management',
    'Clinical Pharmacology',
    'Andrology',
    'Genetics',
    'Others',
];


const AddDoctor = ({ handleAddDoctor, doctor, setDoctor, errors, isDoctorAddedLoading }: AddDoctorProps) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!doctor?.name?.trim()) {
            return;
        }
        if (!doctor?.speciality?.trim()) {
            return;
        }
        handleAddDoctor(doctor!);
    };

    return (
        <form className="space-y-4 p-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                {[
                    { label: 'Name', name: 'name', icon: FaUser, type: 'text', placeholder: 'Enter Doctor Name', required: true },
                    { label: 'Speciality', name: 'speciality', icon: FaStethoscope, type: 'text', placeholder: 'Enter Doctor Speciality', required: true },
                    { label: 'Phone', name: 'phone', icon: FaPhoneAlt, type: 'number', placeholder: 'Enter Doctor Phone Number', required: false },
                ].map(({ label, name, icon: Icon, type, placeholder, required }) => (
                    <div key={name} className="mb-2">
                        <label htmlFor={name} className="text-xs font-medium text-gray-700 flex items-center">
                            <Icon className="mr-2 text-gray-500" /> {label}
                            {required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {label === 'Speciality' ? (
                            <>
                                <input
                                    list="speciality-options"
                                    type={type}
                                    id={name}
                                    name={name}
                                    placeholder={placeholder}
                                    value={doctor?.[name as keyof Doctor]?.toString() || ''}
                                    onChange={(e) => {
                                        const { name, value } = e.target;
                                        setDoctor((prevDoctor) => ({
                                            ...prevDoctor,
                                            [name]: value,
                                        }));
                                    }}
                                    required={required}
                                    className={`mt-1 block w-full p-2 text-xs border ${errors[name] ? 'border-red-500' : 'border-gray-300'
                                        } rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
                                />
                                <datalist id="speciality-options">
                                    {DoctorSpeciality.map((speciality) => (
                                        <option key={speciality} value={speciality} />
                                    ))}
                                </datalist>
                                {errors[name] && (
                                    <p className="text-xs text-red-500 mt-1">{errors[name]}</p>
                                )}
                            </>
                        ) : (
                            <>
                                <input
                                    type={type}
                                    id={name}
                                    name={name}
                                    placeholder={placeholder}
                                    value={doctor?.[name as keyof Doctor]?.toString() || ''}
                                    onChange={(e) => {
                                        const { name, value } = e.target;
                                        setDoctor((prevDoctor) => ({
                                            ...prevDoctor,
                                            [name]: name === 'phone' ? parseInt(value) || '' : value,
                                        }));
                                    }}
                                    required={required}
                                    className={`mt-1 block w-full p-2 text-xs border ${errors[name] ? 'border-red-500' : 'border-gray-300'
                                        } rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
                                />
                                {errors[name] && (
                                    <p className="text-xs text-red-500 mt-1">{errors[name]}</p>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
            {
                isDoctorAddedLoading ? (
                    <Button
                        text='Adding Doctor...'
                        type="submit"
                        onClick={() => {}}
                        className="w-full px-4 py-2 text-xs bg-primary text-textzinc rounded-md hover:bg-primarylight focus:outline-none flex items-center justify-center space-x-2"
                        disabled
                    >
                        <Plus size={20} />
                    </Button>
                ) : (
                    <Button
                        text='Add Doctor'
                        type="submit"
                        onClick={() => {}}
                        className="w-full px-4 py-2 text-xs bg-primary text-textzinc rounded-md hover:bg-primarylight focus:outline-none flex items-center justify-center space-x-2"
                    >
                        <Plus size={20} />
                    </Button>
                )
            }
        </form>
    );
};

export default AddDoctor;