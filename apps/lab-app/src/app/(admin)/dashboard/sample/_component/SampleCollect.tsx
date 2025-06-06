import Button from "@/app/(admin)/component/common/Button";
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
        <div className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 px-4 py-3 flex justify-between items-center">
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

            {/* Body */}
            <div className="p-4">
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Add Sample</label>
                    <div className="flex gap-2">
                        <select
                            value={selectedSample}
                            onChange={(e) => setSelectedSample(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        >
                            <option value="">Select sample type</option>
                            {allSamples.map((sample) => (
                                <option key={sample.id} value={sample.name}>
                                    {sample.name}
                                </option>
                            ))}
                        </select>
                        <Button
                            text=""
                            onClick={handleAddSample}
                            disabled={!selectedSample}
                            className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            <FaPlusCircle className="text-lg" />
                        </Button>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-gray-700">Collected Samples</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {samples.length} collected
                            </span>
                            {samples.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    className="text-xs text-red-600 hover:text-red-800 hover:underline"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                    </div>

                    {samples.length === 0 ? (
                        <div className="text-center py-6 bg-gray-50 rounded-md border border-gray-200">
                            <p className="text-sm text-gray-500">No samples added yet</p>
                        </div>
                    ) : (
                        <div className="border border-gray-200 rounded-md overflow-hidden shadow-inner">
                            <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                                {samples.map((sample, index) => (
                                    <li 
                                        key={index} 
                                        className="px-3 py-3 hover:bg-gray-50 flex justify-between items-center transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <TbTestPipe2Filled className="text-blue-500 mr-3 text-sm" />
                                            <span className="text-sm text-gray-800 font-medium">{sample}</span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteSample(index)}
                                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                                            aria-label="Delete sample"
                                        >
                                            <FaTrashAlt className="text-sm" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
                    {samples.length > 0 && (
                        <Button
                            text="Clear"
                            onClick={handleClearAll}
                            className="px-4 py-2 text-sm rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                        />
                    )}
                    <Button
                        text="Submit Samples"
                        onClick={handleVititSample}
                        disabled={samples.length === 0}
                        className={`px-4 py-2 text-sm rounded-md flex items-center justify-center transition-colors ${
                            samples.length > 0
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                        <TbTestPipe2Filled className="mr-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SampleCollect;