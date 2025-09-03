import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getSamples, updateVisitSample } from '../../../../../../services/sampleServices';
import { Plus, X, Edit, Save, Trash2 } from 'lucide-react';

interface Sample {
    id: string;
    name: string;
}

interface UpdateSampleProps {
    visitId: number;
    sampleNames: string[];
    onClose: () => void;
}

const UpdateSample = ({ visitId, sampleNames, onClose }: UpdateSampleProps) => {
    const [allSamples, setAllSamples] = useState<Sample[]>([]);
    const [editableSampleNames, setEditableSampleNames] = useState<string[]>([]);
    const [selectedSample, setSelectedSample] = useState<string>("");
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
    const [newSampleSelection, setNewSampleSelection] = useState<string>("");

    useEffect(() => {
        setEditableSampleNames(sampleNames);
    }, [sampleNames]);

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

    const handleUpdateVisitSample = async () => {
        try {
            // Call API to update the sample for the visit
            await updateVisitSample(visitId, editableSampleNames);
            onClose();
            toast.success("Samples updated successfully");
        } catch (error) {
            console.error("Error updating samples:", error);
            toast.error("Error updating samples");
        }
    };

    const handleEditSample = (index: number) => {
        setEditIndex(index);
        setSelectedSample(editableSampleNames[index]);
    };

    const handleSaveEdit = () => {
        if (editIndex !== null && selectedSample) {
            const updatedSamples = [...editableSampleNames];
            updatedSamples[editIndex] = selectedSample;
            setEditableSampleNames(updatedSamples);
            setEditIndex(null);
            setSelectedSample("");
        }
    };

    const handleCancelEdit = () => {
        setEditIndex(null);
        setSelectedSample("");
    };

    const handleDeleteSample = (index: number) => {
        const updatedSamples = editableSampleNames.filter((_, i) => i !== index);
        setEditableSampleNames(updatedSamples);
        if (editIndex === index) {
            setEditIndex(null);
            setSelectedSample("");
        }
    };

    const handleAddNewSample = () => {
        if (newSampleSelection) {
            setEditableSampleNames([...editableSampleNames, newSampleSelection]);
            setNewSampleSelection("");
            setIsAddingNew(false);
        }
    };

    const handleCancelAdd = () => {
        setIsAddingNew(false);
        setNewSampleSelection("");
    };

    const getAvailableSamples = () => {
        return allSamples.filter(sample => 
            !editableSampleNames.includes(sample.name)
        );
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-blue-600 px-4 py-3 flex justify-between items-center rounded-t-lg">
                <div className="flex items-center">
                    <h2 className="text-lg font-semibold text-white">Manage Samples</h2>
                </div>
                <button
                    onClick={() => setIsAddingNew(true)}
                    disabled={isAddingNew}
                    className="flex items-center gap-2 bg-white text-blue-600 px-3 py-2 rounded-md hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Add Sample
                </button>
            </div>

            {/* Add New Sample Section */}
            {isAddingNew && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-3">Add New Sample</h4>
                    <div className="flex items-center gap-3">
                        <select
                            value={newSampleSelection}
                            onChange={(e) => setNewSampleSelection(e.target.value)}
                            className="flex-1 border border-blue-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Sample to Add</option>
                            {getAvailableSamples().map((sample) => (
                                <option key={sample.id} value={sample.name}>
                                    {sample.name}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={handleAddNewSample}
                            disabled={!newSampleSelection}
                            className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            Add
                        </button>
                        <button
                            onClick={handleCancelAdd}
                            className="flex items-center gap-2 bg-gray-500 text-white px-3 py-2 rounded-md hover:bg-gray-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Existing Samples List */}
            <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Current Samples</h4>
                {editableSampleNames.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                        No samples added yet. Click &ldquo;Add Sample&rdquo; to get started.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {editableSampleNames.map((sampleName, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                {editIndex === index ? (
                                    <div className="flex items-center gap-3 flex-1">
                                        <select
                                            value={selectedSample}
                                            onChange={(e) => setSelectedSample(e.target.value)}
                                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Sample</option>
                                            {allSamples.map((sample) => (
                                                <option key={sample.id} value={sample.name}>
                                                    {sample.name}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={handleSaveEdit}
                                            disabled={!selectedSample}
                                            className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <Save className="w-3 h-3" />
                                            Save
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="flex items-center gap-1 bg-gray-500 text-white px-3 py-2 rounded-md hover:bg-gray-600 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="flex-1 text-sm font-medium text-gray-800">{sampleName}</span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEditSample(index)}
                                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                                                title="Edit sample"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSample(index)}
                                                className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
                                                title="Delete sample"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleUpdateVisitSample}
                    disabled={editableSampleNames.length === 0}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default UpdateSample;

