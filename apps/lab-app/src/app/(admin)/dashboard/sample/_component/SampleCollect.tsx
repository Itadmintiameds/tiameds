import Loader from "@/app/(admin)/component/common/Loader";
import React, { useEffect, useState } from "react";
import { FaPlusCircle, FaTrashAlt, FaTimes } from "react-icons/fa";
import { TbTestPipe2Filled } from "react-icons/tb";
import { getSamples } from "../../../../../../services/sampleServices";
import { useLabs } from "@/context/LabContext";

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
    const { currentLab } = useLabs();
    const handleCancel = () => {
        // Clear any selected samples when canceling
        setSamples([]);
        setSelectedSample("");
        // Call the onClose function if provided
        if (onClose) {
            onClose();
        }
    };
    const [allSamples, setAllSamples] = useState<Sample[]>([]);
    const [selectedSample, setSelectedSample] = useState<string>("");

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
            <div className="flex flex-col items-center justify-center p-6">
                <Loader type="progress" fullScreen={false} text="Loading sample types..." />
                <p className="mt-4 text-sm text-gray-600">Fetching available samples...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 text-sm">
            {/* Add Sample Section */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <TbTestPipe2Filled className="mr-2 text-blue-500" size={16} />
                    Add Sample
                </h4>
                <div className="flex items-center gap-2">
                    <select
                        value={selectedSample}
                        onChange={(e) => setSelectedSample(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        style={{
                            background: !selectedSample 
                                ? '#9CA3AF' 
                                : `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
                        }}
                    >
                        <FaPlusCircle className="w-4 h-4 mr-2" />
                        Add
                    </button>
                </div>
            </div>

            {/* Collected Samples List */}
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-green-800 flex items-center">
                        <TbTestPipe2Filled className="mr-2 text-green-500" size={16} />
                        Collected Samples
                    </h4>
                    <span className="text-xs font-medium text-green-600 bg-white px-2 py-1 rounded-full border border-green-200">
                        {samples.length} collected
                    </span>
                </div>
                {samples.length === 0 ? (
                    <div className="text-center py-4 text-gray-600 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs">No samples added yet. Select a sample type and click &ldquo;Add&rdquo; to get started.</p>
                    </div>
                ) : (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                        {samples.map((sample, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex items-center flex-1 min-w-0">
                                    <TbTestPipe2Filled className="text-green-500 mr-2 text-sm flex-shrink-0" />
                                    <span className="text-xs font-medium text-gray-900 truncate">{sample}</span>
                                </div>
                                <button
                                    onClick={() => handleDeleteSample(index)}
                                    className="text-red-600 hover:text-red-800 p-1 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0 ml-2"
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
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                {samples.length > 0 && (
                    <button
                        onClick={handleClearAll}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 border border-gray-200"
                    >
                        Clear All
                    </button>
                )}
                <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
                >
                    Cancel
                </button>
                <button
                    onClick={handleVititSample}
                    disabled={samples.length === 0}
                    className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    style={{
                        background: samples.length === 0 
                            ? '#9CA3AF' 
                            : `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
                    }}
                >
                    Submit Samples
                </button>
            </div>
        </div>
    );
};

export default SampleCollect;