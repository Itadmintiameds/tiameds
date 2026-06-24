"use client";

import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { getSamples, updateVisitSample } from '../../../../../../services/sampleServices';
import { useLabs } from '@/context/LabContext';
import { HiBeaker, HiOutlineBeaker, HiPlus, HiChevronDown } from "react-icons/hi2";
import { IoClose } from "react-icons/io5";
import { Listbox } from "@headlessui/react";

interface Sample {
    id: string;
    name: string;
    createdAt?: string;
    updatedAt?: string;
}

interface UpdateSampleProps {
    visitId: number;
    sampleNames: string[];
    onClose: () => void;
}

const UpdateSample = ({ visitId, sampleNames, onClose }: UpdateSampleProps) => {
    const { currentLab } = useLabs();
    const [allSamples, setAllSamples] = useState<Sample[]>([]);
    const [editableSampleNames, setEditableSampleNames] = useState<string[]>([]);
    const [selectedSample, setSelectedSample] = useState<string>("");
    const [isUpdating, setIsUpdating] = useState<boolean>(false);

    useEffect(() => {
        setEditableSampleNames(sampleNames);
    }, [sampleNames]);

    useEffect(() => {
        const fetchSamples = async () => {
            if (!currentLab?.id) {
                setAllSamples([]);
                return;
            }
            try {
                const data = await getSamples(currentLab.id);
                const normalized: Sample[] = data.map(sample => ({
                    ...sample,
                    id: sample.id.toString(),
                }));
                setAllSamples(normalized);
            } catch (error) {
                setAllSamples([]);
            }
        };
        fetchSamples();
    }, [currentLab?.id]);

    const handleUpdateVisitSample = async () => {
        try {
            setIsUpdating(true);
            await updateVisitSample(visitId, editableSampleNames);
            toast.success("Samples updated successfully");
            onClose();
        } catch (error) {
            toast.error("Error updating samples");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAddSample = () => {
        if (selectedSample && !editableSampleNames.includes(selectedSample)) {
            setEditableSampleNames([...editableSampleNames, selectedSample]);
            setSelectedSample("");
        }
    };

    const handleDeleteSample = (index: number) => {
        setEditableSampleNames(editableSampleNames.filter((_, i) => i !== index));
    };

    const handleCancel = () => {
        setEditableSampleNames(sampleNames);
        setSelectedSample("");
        onClose();
    };

    const getAvailableSamples = () => {
        return allSamples.filter(sample => 
            !editableSampleNames.includes(sample.name)
        );
    };

    return (
        <div className="space-y-4">
            {/* Add Sample Section */}
            <div className="bg-info-50 rounded-xl p-4">
                <h4 className="flex items-center gap-2 text-label-l3 font-medium text-pneutral-900 mb-3">
                    <HiOutlineBeaker size={18} />
                    Add Sample
                </h4>

                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Listbox value={selectedSample} onChange={setSelectedSample}>
                            <div className="relative">
                                {/* Button */}
                                <Listbox.Button className="
                                    w-full
                                    h-11
                                    rounded-full
                                    border
                                    border-pneutral-300
                                    bg-white
                                    pl-4
                                    pr-10
                                    text-left
                                    text-p2
                                    text-pneutral-900
                                    focus:outline-none
                                ">
                                    {selectedSample || "Select Sample Type"}
                                </Listbox.Button>

                                {/* Icon */}
                                <HiChevronDown
                                    size={20}
                                    className="
                                        absolute
                                        right-4
                                        top-1/2
                                        -translate-y-1/2
                                        text-pneutral-900
                                        pointer-events-none
                                    "
                                />

                                {/* Options */}
                                <Listbox.Options className="
                                    absolute
                                    z-50
                                    max-h-60
                                    w-full
                                    overflow-auto
                                    rounded-xl
                                    bg-white
                                    border
                                    border-pneutral-200
                                    shadow-lg
                                ">
                                    {getAvailableSamples().length === 0 ? (
                                        <div className="px-4 py-3 text-sm text-gray-500">
                                            No available samples to add
                                        </div>
                                    ) : (
                                        getAvailableSamples().map((sample) => (
                                            <Listbox.Option
                                                key={sample.id}
                                                value={sample.name}
                                                className={({ active }) => `
                                                    cursor-pointer
                                                    px-4
                                                    py-2
                                                    text-sm
                                                    ${active ? "bg-info-100" : ""}
                                                `}
                                            >
                                                {sample.name}
                                            </Listbox.Option>
                                        ))
                                    )}
                                </Listbox.Options>
                            </div>
                        </Listbox>
                    </div>

                    <button
                        onClick={handleAddSample}
                        disabled={!selectedSample}
                        className="
                            h-11
                            px-7
                            rounded-full
                            text-pneutral-50
                            text-label-l3 
                            font-medium
                            flex
                            items-center
                            gap-2
                            disabled:cursor-not-allowed
                            bg-secondary-700
                        "
                    >
                        <HiPlus size={16} strokeWidth={3} />
                        Add
                    </button>
                </div>
            </div>

            {/* Current Samples */}
            <div className="bg-info-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="flex items-center gap-2 text-label-l3 font-medium text-pneutral-900">
                        <HiBeaker size={20} />
                        Current Samples
                    </h4>

                    <span
                        className="
                            px-3
                            py-1
                            rounded-full
                            text-label-l3
                            font-medium
                            bg-success-50
                            text-success-800
                            border
                            border-success-600
                        "
                    >
                        {editableSampleNames.length} samples
                    </span>
                </div>

                <div className="bg-white rounded-xl p-4 min-h-[80px]">
                    {editableSampleNames.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            No samples added yet. Select a sample type and click
                            &nbsp;&quot;Add&quot;&nbsp;to get started.
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {editableSampleNames.map((sample, index) => (
                                <div
                                    key={index}
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        px-3
                                        py-1.5
                                        rounded-full
                                        bg-danger-100
                                        text-pneutral-900
                                        text-p2
                                        font-medium
                                    "
                                >
                                    <span>{sample}</span>

                                    <button
                                        onClick={() => handleDeleteSample(index)}
                                        className="
                                            flex
                                            items-center
                                            justify-center
                                        "
                                    >
                                        <IoClose size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-2">
                <button
                    onClick={handleCancel}
                    disabled={isUpdating}
                    className="
                        min-w-[110px]
                        h-11
                        rounded-full
                        border-[1.5px]
                        border-pneutral-900
                        bg-white
                        text-pneutral-900
                        text-label-l3
                        font-medium
                        disabled:cursor-not-allowed
                    "
                >
                    Cancel
                </button>

                <button
                    onClick={handleUpdateVisitSample}
                    disabled={editableSampleNames.length === 0 || isUpdating}
                    className="
                        min-w-[110px]
                        h-11
                        rounded-full
                        bg-pneutral-900
                        text-pneutral-50
                        text-label-l3
                        font-medium
                        disabled:cursor-not-allowed
                        flex
                        items-center
                        justify-center
                        gap-2
                    "
                >
                    {isUpdating ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                        </>
                    ) : (
                        "Update"
                    )}
                </button>
            </div>
        </div>
    );
};

export default UpdateSample;





















// code done by abhishek................. do not change,,,,,,,,,,,,,,,

// import { useEffect, useState } from 'react';
// import { toast } from 'react-toastify';
// import { getSamples, updateVisitSample } from '../../../../../../services/sampleServices';
// import { Plus, X, Edit, Save, Trash2 } from 'lucide-react';
// import { useLabs } from '@/context/LabContext';

// interface Sample {
//     id: string;
//     name: string;
// }

// interface UpdateSampleProps {
//     visitId: number;
//     sampleNames: string[];
//     onClose: () => void;
// }

// const UpdateSample = ({ visitId, sampleNames, onClose }: UpdateSampleProps) => {
//     const { currentLab } = useLabs();
//     const [allSamples, setAllSamples] = useState<Sample[]>([]);
//     const [editableSampleNames, setEditableSampleNames] = useState<string[]>([]);
//     const [selectedSample, setSelectedSample] = useState<string>("");
//     const [editIndex, setEditIndex] = useState<number | null>(null);
//     const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
//     const [newSampleSelection, setNewSampleSelection] = useState<string>("");

//     useEffect(() => {
//         setEditableSampleNames(sampleNames);
//     }, [sampleNames]);

//     useEffect(() => {
//         const fetchSamples = async () => {
//             if (!currentLab?.id) {
//                 setAllSamples([]);
//                 return;
//             }
//             try {
//                 const data = await getSamples(currentLab.id);
//                 const normalized: Sample[] = data.map(sample => ({
//                     ...sample,
//                     id: sample.id.toString(),
//                 }));
//                 setAllSamples(normalized);
//             } catch (error) {
//                 setAllSamples([]);
//             }
//         };
//         fetchSamples();
//     }, [currentLab?.id]);

//     const handleUpdateVisitSample = async () => {
//         try {
//             // Call API to update the sample for the visit
//             await updateVisitSample(visitId, editableSampleNames);
//             onClose();
//             toast.success("Samples updated successfully");
//         } catch (error) {
//             // Handle samples update error
//             toast.error("Error updating samples");
//         }
//     };

//     const handleEditSample = (index: number) => {
//         setEditIndex(index);
//         setSelectedSample(editableSampleNames[index]);
//     };

//     const handleSaveEdit = () => {
//         if (editIndex !== null && selectedSample) {
//             const updatedSamples = [...editableSampleNames];
//             updatedSamples[editIndex] = selectedSample;
//             setEditableSampleNames(updatedSamples);
//             setEditIndex(null);
//             setSelectedSample("");
//         }
//     };

//     const handleCancelEdit = () => {
//         setEditIndex(null);
//         setSelectedSample("");
//     };

//     const handleDeleteSample = (index: number) => {
//         const updatedSamples = editableSampleNames.filter((_, i) => i !== index);
//         setEditableSampleNames(updatedSamples);
//         if (editIndex === index) {
//             setEditIndex(null);
//             setSelectedSample("");
//         }
//     };

//     const handleAddNewSample = () => {
//         if (newSampleSelection) {
//             setEditableSampleNames([...editableSampleNames, newSampleSelection]);
//             setNewSampleSelection("");
//             setIsAddingNew(false);
//         }
//     };

//     const handleCancelAdd = () => {
//         setIsAddingNew(false);
//         setNewSampleSelection("");
//     };

//     const getAvailableSamples = () => {
//         return allSamples.filter(sample => 
//             !editableSampleNames.includes(sample.name)
//         );
//     };

//     return (
//         <div className="space-y-4">
//             {/* Header */}
//             <div className="bg-blue-600 px-4 py-3 flex justify-between items-center rounded-t-lg">
//                 <div className="flex items-center">
//                     <h2 className="text-lg font-semibold text-white">Manage Samples</h2>
//                 </div>
//                 <button
//                     onClick={() => setIsAddingNew(true)}
//                     disabled={isAddingNew}
//                     className="flex items-center gap-2 bg-white text-blue-600 px-3 py-2 rounded-md hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
//                 >
//                     <Plus className="w-4 h-4" />
//                     Add Sample
//                 </button>
//             </div>

//             {/* Add New Sample Section */}
//             {isAddingNew && (
//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                     <h4 className="text-sm font-medium text-blue-800 mb-3">Add New Sample</h4>
//                     <div className="flex items-center gap-3">
//                         <select
//                             value={newSampleSelection}
//                             onChange={(e) => setNewSampleSelection(e.target.value)}
//                             className="flex-1 border border-blue-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         >
//                             <option value="">Select Sample to Add</option>
//                             {getAvailableSamples().map((sample) => (
//                                 <option key={sample.id} value={sample.name}>
//                                     {sample.name}
//                                 </option>
//                             ))}
//                         </select>
//                         <button
//                             onClick={handleAddNewSample}
//                             disabled={!newSampleSelection}
//                             className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
//                         >
//                             <Save className="w-4 h-4" />
//                             Add
//                         </button>
//                         <button
//                             onClick={handleCancelAdd}
//                             className="flex items-center gap-2 bg-gray-500 text-white px-3 py-2 rounded-md hover:bg-gray-600 transition-colors"
//                         >
//                             <X className="w-4 h-4" />
//                             Cancel
//                         </button>
//                     </div>
//                 </div>
//             )}

//             {/* Existing Samples List */}
//             <div className="space-y-2">
//                 <h4 className="text-sm font-medium text-gray-700">Current Samples</h4>
//                 {editableSampleNames.length === 0 ? (
//                     <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
//                         No samples added yet. Click &ldquo;Add Sample&rdquo; to get started.
//                     </div>
//                 ) : (
//                     <div className="space-y-2">
//                         {editableSampleNames.map((sampleName, index) => (
//                             <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
//                                 {editIndex === index ? (
//                                     <div className="flex items-center gap-3 flex-1">
//                                         <select
//                                             value={selectedSample}
//                                             onChange={(e) => setSelectedSample(e.target.value)}
//                                             className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                         >
//                                             <option value="">Select Sample</option>
//                                             {allSamples.map((sample) => (
//                                                 <option key={sample.id} value={sample.name}>
//                                                     {sample.name}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                         <button
//                                             onClick={handleSaveEdit}
//                                             disabled={!selectedSample}
//                                             className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
//                                         >
//                                             <Save className="w-3 h-3" />
//                                             Save
//                                         </button>
//                                         <button
//                                             onClick={handleCancelEdit}
//                                             className="flex items-center gap-1 bg-gray-500 text-white px-3 py-2 rounded-md hover:bg-gray-600 transition-colors"
//                                         >
//                                             <X className="w-3 h-3" />
//                                             Cancel
//                                         </button>
//                                     </div>
//                                 ) : (
//                                     <>
//                                         <span className="flex-1 text-sm font-medium text-gray-800">{sampleName}</span>
//                                         <div className="flex items-center gap-2">
//                                             <button
//                                                 onClick={() => handleEditSample(index)}
//                                                 className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
//                                                 title="Edit sample"
//                                             >
//                                                 <Edit className="w-4 h-4" />
//                                                 Edit
//                                             </button>
//                                             <button
//                                                 onClick={() => handleDeleteSample(index)}
//                                                 className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
//                                                 title="Delete sample"
//                                             >
//                                                 <Trash2 className="w-4 h-4" />
//                                                 Delete
//                                             </button>
//                                         </div>
//                                     </>
//                                 )}
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>

//             {/* Action Buttons */}
//             <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
//                 <button
//                     onClick={onClose}
//                     className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
//                 >
//                     Cancel
//                 </button>
//                 <button
//                     onClick={handleUpdateVisitSample}
//                     disabled={editableSampleNames.length === 0}
//                     className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
//                 >
//                     Save Changes
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default UpdateSample;

