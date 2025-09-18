import { updateTest } from '@/../../services/testService';
import { useLabs } from '@/context/LabContext';
import { TestList } from '@/types/test/testlist';
import { Plus } from 'lucide-react';
import React from 'react';
import { FaClipboardList, FaRegEdit, FaRupeeSign, FaTag } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Button from '../common/Button';
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
        price: test?.price || undefined, // Changed from 0 to undefined
    });
    const { currentLab } = useLabs();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        if (name === 'price') {
            // Only allow numbers with max 2 digits after decimal
            if (value === '' || /^\d+(\.\d{1,2})?$/.test(value)) {
                setFormData((prev) => ({
                    ...prev,
                    [name]: value === '' ? undefined : Number(value)
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
        if (formData.price === undefined || formData.price < 0) {
            toast.error('Price must be a valid positive number');
            return;
        }
        
        if (currentLab) {
            setIsLoading(true);
            const updatedData = {
                ...formData,
                category: cleanedCategory,
                name: cleanedName,
                price: formData.price || 0 // Ensure price is 0 if undefined when submitting
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
        <div className="flex justify-center items-center">
            <div className="rounded-lg p-2 w-full max-w-lg">
                <h1 className="text-2xl font-semibold text-textzinc flex items-center mb-6">
                    <FaRegEdit className="mr-3 text-primary" /> Edit Test
                </h1>
                <form onSubmit={handleSubmit} className="space-y-5">
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
                                className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
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
                                className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                                placeholder="Enter test name"
                            />
                        </div>
                    </div>

                    {/* Price Input */}
                    <div className="relative">
                        <label htmlFor="price" className="block text-sm font-medium text-gray-600 mb-1">
                            Price
                        </label>
                        <div className="relative">
                            <FaRupeeSign className="absolute top-2.5 left-3 text-gray-400" />
                            <input
                                id="price"
                                type="number"
                                name="price"
                                value={formData.price || ''}
                                onChange={handleInputChange}
                                className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="Enter price"
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center">
                            <Loader />
                        </div>
                    ) : (
                        <Button
                            text="Update Test"
                            onClick={() => { }}
                            type='submit'
                            className="flex items-center justify-center px-4 py-1 w-full text-xs bg-primary text-textzinc rounded-md hover:bg-primarylight focus:outline-none"
                        >
                            <Plus className="h-4" />
                        </Button>
                    )}
                </form>
            </div>
        </div>
    )
}

export default TestEditComponent;