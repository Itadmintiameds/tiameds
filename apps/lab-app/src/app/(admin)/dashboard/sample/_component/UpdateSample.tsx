import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getSamples, updateVisitSample } from '../../../../../../services/sampleServices';

interface Sample {
    id: string;
    name: string;
}

interface UpdateSampleProps {
    visitId: number;
    sampleNames: string[];
    onClose: () => void;
}

const UpdateSample = ({ visitId, sampleNames,onClose}: UpdateSampleProps) => {
    const [allSamples, setAllSamples] = useState<Sample[]>([]);
    const [editableSampleNames, setEditableSampleNames] = useState<string[]>([]);
    const [selectedSample, setSelectedSample] = useState<string>("");
    const [editIndex, setEditIndex] = useState<number | null>(null);

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

    const handleupdateVisitSample = async () => {
        if (editIndex !== null) {
            try {
                const updatedSamples = [...editableSampleNames];
               
                updatedSamples[editIndex] = selectedSample;

               

                setEditableSampleNames(updatedSamples);
                setEditIndex(null);
                setSelectedSample("");

                // Call API to update the sample for the visit
                await updateVisitSample(visitId, updatedSamples);
                onClose();
                toast.success("Sample updated successfully");
            } catch (error) {
                console.error("Error updating sample:", error);
                toast.error("Error updating sample");
            }
        }
    };

    return (
        <div>
            {editableSampleNames.map((sampleName, index) => (
                <div key={index} className="flex items-center justify-between p-2 border-b">
                    {editIndex === index ? (
                        <>
                            <select
                                value={selectedSample}
                                onChange={(e) => setSelectedSample(e.target.value)}
                                className="border rounded p-1 w-full mr-2"
                            >
                                <option value="">Select Sample</option>
                                {allSamples.map((sample) => (
                                    <option key={sample.id} value={sample.name}>
                                        {sample.name}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleupdateVisitSample}
                                className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => {
                                    setEditIndex(null);
                                    setSelectedSample("");
                                }}
                                className="bg-red-500 text-white px-3 py-1 rounded"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <p>{sampleName}</p>
                            <button
                                onClick={() => {
                                    setEditIndex(index);
                                    setSelectedSample(sampleName);
                                }}
                                className="text-blue-500"
                            >
                                Edit
                            </button>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};

export default UpdateSample;

