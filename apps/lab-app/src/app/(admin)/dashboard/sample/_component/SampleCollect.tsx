import React, { useState } from "react";
import { FaTrashAlt, FaEdit, FaPlusCircle } from "react-icons/fa";
import { IoSave } from "react-icons/io5";

const SampleCollect: React.FC = () => {
    // Predefined sample types
    const sampleTypes = [
        "Blood",
        "Urine",
        "Saliva",
        "Sweat",
        "Sputum",
        "Stool",
        "Tissue Biopsy",
        "Bone Marrow",
        "Cerebrospinal Fluid (CSF)",
        "Semen",
    ];

    // State variables
    const [samples, setSamples] = useState<string[]>([]);
    const [selectedSample, setSelectedSample] = useState<string>("");
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editedSample, setEditedSample] = useState<string>("");

    // Add new sample
    const handleAddSample = () => {
        if (selectedSample && !samples.includes(selectedSample)) {
            setSamples([...samples, selectedSample]);
            setSelectedSample("");
        }
    };

    // Edit sample
    const handleEditSample = (index: number) => {
        setEditIndex(index);
        setEditedSample(samples[index]);
    };

    // Save edited sample
    const handleSaveEdit = () => {
        if (editedSample) {
            setSamples(samples.map((sample, index) => (index === editIndex ? editedSample : sample)));
            setEditIndex(null);
            setEditedSample("");
        }
    };

    // Delete sample
    const handleDeleteSample = (index: number) => {
        setSamples(samples.filter((_, i) => i !== index));
    };

    return (
        <div className="max-w-lg mx-auto p-5 bg-white shadow-md rounded-lg">
            <h1 className="text-xl font-semibold text-gray-700 mb-4">Patient Sample Collection</h1>

            {/* Dropdown and Add Button */}
            <div className="flex items-center space-x-2 mb-4">
                <select
                    value={selectedSample}
                    onChange={(e) => setSelectedSample(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                    <option value="">Select a Sample</option>
                    {sampleTypes.map((sample, index) => (
                        <option key={index} value={sample}>
                            {sample}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleAddSample}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center"
                >
                    <FaPlusCircle className="mr-1" /> Add
                </button>
            </div>

            {/* Collected Samples List */}
            <div>
                <h2 className="text-md font-medium text-gray-700 mb-2">Collected Samples:</h2>
                {samples.length === 0 ? (
                    <p className="text-gray-500">No samples collected yet.</p>
                ) : (
                    <ul className="space-y-2">
                        {samples.map((sample, index) => (
                            <li key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded-lg">
                                {editIndex === index ? (
                                    <div className="flex items-center space-x-2 flex-1">
                                        {/* Edit sample using dropdown */}
                                        <select
                                            value={editedSample}
                                            onChange={(e) => setEditedSample(e.target.value)}
                                            className="flex-1 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                                        >
                                            {sampleTypes.map((sampleType, i) => (
                                                <option key={i} value={sampleType}>
                                                    {sampleType}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={handleSaveEdit}
                                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center"
                                        >
                                            <IoSave className="mr-1" /> Save
                                        </button>
                                    </div>
                                ) : (
                                    <span className="flex-1 text-gray-800">{sample}</span>
                                )}

                                {/* Action buttons */}
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => handleEditSample(index)}
                                        className="p-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 text-xs flex items-center"
                                    >
                                        <FaEdit className="mr-1" /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSample(index)}
                                        className="p-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs flex items-center"
                                    >
                                        <FaTrashAlt className="mr-1" /> Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default SampleCollect;
