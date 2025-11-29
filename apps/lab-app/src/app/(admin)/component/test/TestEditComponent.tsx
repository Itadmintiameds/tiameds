import { updateTest } from '@/../../services/testService';
import { useLabs } from '@/context/LabContext';
import { TestList } from '@/types/test/testlist';
import { Plus } from 'lucide-react';
import React from 'react';
import { FaClipboardList, FaRupeeSign, FaTag, FaVial, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
// import Button from '../common/Button';
import Loader from '../common/Loader';

interface TestEditComponentProps {
    updateList: boolean;
    setUpdateList: (value: boolean) => void;
    closeModal: () => void;
    test: TestList | undefined;
}

const TestEditComponent = ({ updateList, setUpdateList, closeModal, test }: TestEditComponentProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [formData, setFormData] = React.useState({
        id: test?.id || 0,
        category: test?.category || '',
        name: test?.name || '',
        price: test?.price?.toString() || undefined, // Store as string
    });
    const { currentLab } = useLabs();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        if (name === 'price') {
            // Only allow numbers with max 2 digits after decimal
            if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
                setFormData((prev) => ({
                    ...prev,
                    [name]: value === '' ? undefined : value
                }));
            }
        } else if (name === 'category' || name === 'name') {
            // Allow letters, numbers, spaces, and hyphens only (no underscores, periods, or special chars)
            // Allow spaces to be typed freely, will be cleaned up on submit
            if (/^[a-zA-Z0-9\s\-]*$/.test(value)) {
                setFormData((prev) => ({
                    ...prev,
                    [name]: value.toUpperCase()
                }));
            }
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Clean up and validate input
        const cleanedCategory = formData.category.trim().replace(/\s+/g, ' '); // Remove extra spaces
        const cleanedName = formData.name.trim().replace(/\s+/g, ' '); // Remove extra spaces
        
        if (!cleanedCategory) {
            toast.error('Category is required');
            return;
        }
        if (!cleanedName) {
            toast.error('Test name is required');
            return;
        }
        if (formData.price === undefined || Number(formData.price) < 0) {
            toast.error('Price must be a valid positive number');
            return;
        }
        
        if (currentLab) {
            setIsLoading(true);
            const updatedData = {
                ...formData,
                category: cleanedCategory,
                name: cleanedName,
                price: Number(formData.price) || 0 // Convert string to number when submitting
            };
            updateTest(currentLab.id.toString(), test?.id.toString() || '', updatedData)
                .then(() => {
                    toast.success("Test updated successfully");
                    setUpdateList(!updateList);
                    closeModal();
                })
                .catch((err) => {
                    toast.error(err.message || "Failed to update test");
                })
                .finally(() => setIsLoading(false));
        }
    }

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Test Information Section */}
                <div className="bg-green-50 p-3 rounded-lg border border-green-100 space-y-3">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                        <FaVial className="mr-2 text-green-600" /> Test Information
                    </h4>
                    
                    {/* Category Input */}
                    <div className="relative">
                        <label htmlFor="category" className="block text-sm font-medium text-gray-600 mb-1">
                            Category
                        </label>
                        <div className="relative">
                            <FaTag className="absolute top-2.5 left-3 text-gray-400" />
                            <input
                                id="category"
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="border border-green-300 rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-green-500 focus:outline-none bg-white text-sm"
                                placeholder="Enter category"
                            />
                        </div>
                    </div>

                    {/* Name Input */}
                    <div className="relative">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">
                            Test Name
                        </label>
                        <div className="relative">
                            <FaClipboardList className="absolute top-2.5 left-3 text-gray-400" />
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="border border-green-300 rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-green-500 focus:outline-none bg-white text-sm"
                                placeholder="Enter test name"
                            />
                        </div>
                    </div>
                </div>

                {/* Pricing Information Section */}
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 space-y-3">
                    <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                        <FaRupeeSign className="mr-2 text-yellow-600" /> Pricing Information
                    </h4>
                    
                    {/* Price Input */}
                    <div className="relative">
                        <label htmlFor="price" className="block text-sm font-medium text-gray-600 mb-1">
                            Price
                        </label>
                        <div className="relative">
                            <FaRupeeSign className="absolute top-2.5 left-3 text-gray-400" />
                            <input
                                id="price"
                                type="text"
                                inputMode="decimal"
                                name="price"
                                value={formData.price ?? ''}
                                onChange={handleInputChange}
                                onKeyDown={(e) => {
                                    if (!/[0-9.]|\b/.test(e.key)) {
                                        e.preventDefault();
                                    }
                                    // Prevent multiple dots
                                    if (e.key === '.' && e.currentTarget.value.includes('.')) {
                                        e.preventDefault();
                                    }
                                }}
                                onBlur={(e) => {
                                    const val = e.target.value;
                                    if (val && !/^\d+(\.\d{1,2})?$/.test(val)) {
                                        e.target.value = '';
                                        setFormData((prev) => ({ ...prev, price: undefined }));
                                    }
                                }}
                                pattern="^\d+(\.\d{0,2})?$"
                                className="border border-yellow-300 rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-yellow-500 focus:outline-none bg-white text-sm"
                                placeholder="Enter price"
                            />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-4">
                        <Loader />
                    </div>
                ) : (
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 flex items-center gap-2"
                        >
                            <FaTimes className="h-4 w-4" />
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                            style={{
                                background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
                            }}
                        >
                            <Plus className="h-4 w-4" />
                            Update Test
                        </button>
                    </div>
                )}
            </form>
        </div>
    )
}

export default TestEditComponent;