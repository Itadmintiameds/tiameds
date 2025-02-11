import React, { useState } from 'react';
import { FaTrashAlt, FaEdit, FaPlusCircle } from 'react-icons/fa';
import { IoSave } from 'react-icons/io5';

const SampleCollect: React.FC = () => {
    // Predefined list of sample types
    const sampleTypes: string[] = [
        'Blood',
        'Urine',
        'Saliva',
        'Sweat',
        'Sputum',
        'Stool',
        'Tissue Biopsy',
        'Bone Marrow',
        'Cerebrospinal Fluid (CSF)',
        'Semen',
    ];

    // State to hold the collected samples
    const [samples, setSamples] = useState<string[]>([]);
    const [selectedSample, setSelectedSample] = useState<string>('');
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editedSample, setEditedSample] = useState<string>('');

    // Function to add a new sample to the list
    const handleAddSample = () => {
        if (selectedSample && !samples.includes(selectedSample)) {
            setSamples([...samples, selectedSample]);
            setSelectedSample(''); // Reset the dropdown after adding the sample
        }
    };

    // Function to edit a sample in the list
    const handleEditSample = (index: number) => {
        setEditIndex(index);
        setEditedSample(samples[index]);
    };

    // Function to save the edited sample
    const handleSaveEdit = () => {
        if (editedSample) {
            const updatedSamples = samples.map((sample, index) =>
                index === editIndex ? editedSample : sample
            );
            setSamples(updatedSamples);
            setEditIndex(null);
            setEditedSample('');
        }
    };

    // Function to delete a sample from the list
    const handleDeleteSample = (index: number) => {
        const updatedSamples = samples.filter((_, i) => i !== index);
        setSamples(updatedSamples);
    };

    return (
        <div className="container p-4">
            <h1 className="text-xl font-semibold mb-4">Patient Sample Collection</h1>

            {/* Dropdown to select a sample */}
            <div className="mb-4 flex items-center">
                <select
                    value={selectedSample}
                    onChange={(e) => setSelectedSample(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm mr-2"
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
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center"
                >
                    <FaPlusCircle className="mr-2" /> Add Sample
                </button>
            </div>

            {/* Display the list of collected samples */}
            <div>
                <h2 className="font-medium text-lg">Collected Samples:</h2>
                <ul className="list-disc pl-5">
                    {samples.length === 0 ? (
                        <li>No samples collected yet.</li>
                    ) : (
                        samples.map((sample, index) => (
                            <li key={index} className="flex justify-between items-center text-gray-800 my-2">
                                {editIndex === index ? (
                                    <div className="flex items-center">
                                        {/* Edit sample: Replace the input with a dropdown */}
                                        <select
                                            value={editedSample}
                                            onChange={(e) => setEditedSample(e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm mr-2"
                                        >
                                            {sampleTypes.map((sampleType, i) => (
                                                <option key={i} value={sampleType}>
                                                    {sampleType}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={handleSaveEdit}
                                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center"
                                        >
                                            <IoSave className="mr-2" /> Save
                                        </button>
                                    </div>
                                ) : (
                                    <span>{sample}</span>
                                )}

                                <div className="ml-2 flex items-center space-x-2">
                                    <button
                                        onClick={() => handleEditSample(index)}
                                        className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 text-xs flex items-center"
                                    >
                                        <FaEdit className="mr-1" /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSample(index)}
                                        className="ml-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs flex items-center"
                                    >
                                        <FaTrashAlt className="mr-1" /> Delete
                                    </button>
                                </div>


                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default SampleCollect;
