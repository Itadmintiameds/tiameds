import Button from "@/app/(admin)/component/common/Button";
import Loader from "@/app/(admin)/component/common/Loader";
import React, { useEffect, useState } from "react";
import { FaEdit, FaPlusCircle, FaTrashAlt } from "react-icons/fa";
import { TbTestPipe2Filled } from "react-icons/tb";
import { getSamples } from "../../../../../../services/sampleServices";


interface Sample {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

interface SampleCollectProps {
    visitId: number;
    samples: string[];
    setSamples: (value: string[]) => void;
    handleVititSample: () => void;
    loading: boolean;
}

const SampleCollect: React.FC<SampleCollectProps> = ({
    samples,
    setSamples,
    handleVititSample,
    loading,

}) => {
   
    const [allSamples, setAllSamples] = useState<Sample[]>([]);
    const [selectedSample, setSelectedSample] = useState<string>("");
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editedSample, setEditedSample] = useState<string>("");

    useEffect(() => {
        const fetchSamples = async () => {
            try {
                const data: Sample[] = (await getSamples()).map(sample => ({
                    ...sample,
                    id: sample.id.toString(),
                }));
                setAllSamples(data);
            } catch (error) {
                console.error("Error fetching samples:", error);
            }
        };

        fetchSamples();
    }, []);

    const handleAddSample = () => {
        if (selectedSample && !samples.includes(selectedSample)) {
            setSamples([...samples, selectedSample]);
            setSelectedSample("");

            // Trigger parent update when a sample is added
          
        }
    };

    const handleEditSample = (index: number) => {
        setEditIndex(index);
        setEditedSample(samples[index]);
    };

    const handleSaveEdit = () => {
        if (editedSample) {
            setSamples(samples.map((sample, index) => (index === editIndex ? editedSample : sample)));
            setEditIndex(null);
            setEditedSample("");
        }
    };

    const handleDeleteSample = (index: number) => {
        setSamples(samples.filter((_, i) => i !== index));
    };

    if (loading) {
        return <Loader />;
    }
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
                    {allSamples.map((sample) => (
                        <option key={sample.id} value={sample.name}>
                            {sample.name}
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
                                            {allSamples.map((sampleType) => (
                                                <option key={sampleType.id} value={sampleType.name}>
                                                    {sampleType.name}
                                                </option>
                                            ))}
                                        </select>
                                        <Button
                                            text=""
                                            onClick={handleSaveEdit}
                                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center"
                                        >
                                            <TbTestPipe2Filled className="mr-1" /> Save
                                        </Button>
                                    </div>
                                ) : (
                                    <span className="flex-1 text-gray-800">{sample}</span>
                                )}

                                {/* Action buttons */}
                                <div className="flex space-x-1">
                                    <Button
                                        text=""
                                        onClick={() => handleEditSample(index)}
                                        className="p-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 text-xs flex items-center"
                                    >
                                        <FaEdit className="mr-1" /> Edit
                                    </Button>
                                    <Button
                                        text=""
                                        onClick={() => handleDeleteSample(index)}
                                        className="p-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs flex items-center"
                                    >
                                        <FaTrashAlt className="mr-1" /> Delete
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Submit Button */}
            <div className="mt-4">
                <Button
                    text="Save Samples"
                    onClick={handleVititSample}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center"
                >
                    <TbTestPipe2Filled className="mr-2" />
                </Button>
            </div>
        </div>
    );
};
export default SampleCollect;

