import { updateTest } from '@/../../services/testService';
import { useLabs } from '@/context/LabContext';
import { TestList } from '@/types/test/testlist';
import { Plus } from 'lucide-react';
import React from 'react';
import { FaClipboardList, FaRegEdit, FaRupeeSign, FaTag } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Button from '../common/Button';


interface TestEditComponentProps {
    updateList: boolean;
    setUpdateList: (value: boolean) => void;
    closeModal: () => void;
    test: TestList | undefined;
}

const TestEditComponent = ({ updateList, setUpdateList, closeModal, test }: TestEditComponentProps) => {
    const [formData, setFormData] = React.useState({
        id: test?.id || 0,
        category: test?.category || '',
        name: test?.name || '',
        price: test?.price || 0,
        createdAt: test?.createdAt || new Date().toISOString(),
        updatedAt: test?.updatedAt || new Date().toISOString(),
    });
    const { currentLab } = useLabs();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (currentLab) {
            updateTest(currentLab.id.toString(), test?.id.toString() || '', formData)
                .then(() => {
                    toast.success("Test updated successfully");
                    setUpdateList(!updateList);
                    closeModal();
                })
                .catch(console.error);
        }
    }
    return (
        <div className="flex justify-center items-center  ">
            <div className=" rounded-lg p-2 w-full max-w-lg">
                <h1 className="text-2xl font-semibold text-textzinc flex items-center mb-6">
                    <FaRegEdit className="text-textzinc mr-2" /> Edit Test
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
                                value={formData.price}
                                onChange={handleInputChange}
                                className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                                placeholder="Enter price"
                            />
                        </div>
                    </div>
                    <Button
                        text="Add Test"
                        onClick={() => { }}
                        type='submit'
                        className="flex items-center justify-center px-4 py-1 w-full text-xs bg-primary text-white rounded-md hover:bg-secondary focus:outline-none"
                    >
                        <Plus className="h-4" />
                    </Button>
                </form>
            </div>
        </div>
    )
}
export default TestEditComponent