import Loader from "@/app/(admin)/component/common/Loader";
import React, { useEffect, useState } from "react";
import { FaPlusCircle, FaTrashAlt, FaTimes } from "react-icons/fa";
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
    setShowModal?: (value: boolean) => void;
    onClose?: () => void;
}

const SampleCollect: React.FC<SampleCollectProps> = ({
    samples,
    setSamples,
    handleVititSample,
    loading,
    onClose,
}) => {
    const [allSamples, setAllSamples] = useState<Sample[]>([]);
    const [selectedSample, setSelectedSample] = useState<string>("");

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
        }
    };

    const handleDeleteSample = (index: number) => {
        setSamples(samples.filter((_, i) => i !== index));
    };

    const handleClearAll = () => {
        setSamples([]);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-40">
                <Loader />
                <span className="ml-3 text-sm text-gray-600">Loading sample types...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-blue-600 px-4 py-3 flex justify-between items-center rounded-t-lg">
                <div className="flex items-center">
                    <TbTestPipe2Filled className="text-xl text-white mr-2" />
                    <h2 className="text-lg font-semibold text-white">Sample Collection</h2>
                </div>
                {onClose && (
                    <button 
                        onClick={onClose}
                        className="text-white hover:text-blue-200 transition-colors"
                    >
                        <FaTimes className="text-lg" />
                    </button>
                )}
            </div>

            {/* Add Sample Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <select
                        value={selectedSample}
                        onChange={(e) => setSelectedSample(e.target.value)}
                        className="flex-1 border border-blue-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select sample type</option>
                        {allSamples.map((sample) => (
                            <option key={sample.id} value={sample.name}>
                                {sample.name}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleAddSample}
                        disabled={!selectedSample}
                        className="flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <FaPlusCircle className="w-4 h-4" />
                        Add
                    </button>
                </div>
            </div>

            {/* Collected Samples List */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-700">Collected Samples</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {samples.length} collected
                    </span>
                </div>
                {samples.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                        No samples added yet. Click &ldquo;Add Sample&rdquo; to get started.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {samples.map((sample, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex items-center">
                                    <TbTestPipe2Filled className="text-blue-500 mr-3 text-sm" />
                                    <span className="text-sm font-medium text-gray-800">{sample}</span>
                                </div>
                                <button
                                    onClick={() => handleDeleteSample(index)}
                                    className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                                    title="Delete sample"
                                >
                                    <FaTrashAlt className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                {samples.length > 0 && (
                    <button
                        onClick={handleClearAll}
                        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Clear All
                    </button>
                )}
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleVititSample}
                    disabled={samples.length === 0}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                    Submit Samples
                </button>
            </div>
        </div>
    );
};

export default SampleCollect;