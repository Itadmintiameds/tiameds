
'use client';

import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaPlus } from 'react-icons/fa';
import { getTests } from '@/../services/testService';
import { useLabs } from '@/context/LabContext';
import { TestList } from '@/types/test/testlist';


interface updatePackage {
    id: number;
    packageName: string;
    discount: number;
    price: number;
    tests: TestList[];
}

interface UpdatePackageProps {
    packageData: updatePackage;
    onClose: () => void;
    handleUpdatePackage: (data: updatePackage) => void;
}

const UpdatePackage = ({ packageData, onClose, handleUpdatePackage }: UpdatePackageProps) => {
    const [updatedPackage, setUpdatedPackage] = useState<updatePackage>(packageData);
    const [tests, setTests] = useState<TestList[]>([]);
    const [filteredTests, setFilteredTests] = useState<TestList[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const { currentLab } = useLabs();
    const [categories, setCategories] = useState<string[]>([]);
    const [totalCost, setTotalCost] = useState<number>(0);

    useEffect(() => {
        setUpdatedPackage(packageData);
        setFilteredTests(packageData.tests || []);

        const fetchTests = async () => {
            setLoading(true);
            try {
                const fetchedTests = await getTests(currentLab?.id.toString() || '');
                setTests(fetchedTests);
                setFilteredTests(fetchedTests);

                // Extract unique categories
                const uniqueCategories = Array.from(
                    new Set(fetchedTests.map((test) => test.category))
                );
                setCategories(['All', ...uniqueCategories]);
            } catch (error) {
                console.error('Error fetching tests:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTests();
    }, [packageData, currentLab]);

    useEffect(() => {
        let filtered = tests;

        if (selectedCategory !== 'All') {
            filtered = filtered.filter((test) => test.category === selectedCategory);
        }

        if (searchQuery) {
            filtered = filtered.filter((test) =>
                test.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredTests(filtered);
    }, [selectedCategory, searchQuery, tests]);

    useEffect(() => {
        const calculateTotalCost = () => {
            const total = updatedPackage.tests.reduce(
                (sum, test: TestList) => sum + test.price,
                0
            );
            setTotalCost(total);

            // Update package price based on discount
            const discountedPrice = total - (total * updatedPackage.discount) / 100;
            setUpdatedPackage((prev) => ({
                ...prev,
                price: parseFloat(discountedPrice.toFixed(2)),
            }));
        };

        calculateTotalCost();
    }, [updatedPackage.tests, updatedPackage.discount]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setUpdatedPackage((prev) => ({
            ...prev,
            [name]: name === 'discount' ? parseFloat(value) : value,
        }));
    };

    const handleAddTest = (test: TestList) => {
        if (!updatedPackage.tests.find((t: TestList) => t.id === test.id)) {
            setUpdatedPackage((prev) => ({
                ...prev,
                tests: [...prev.tests, test],
            }));
        }
    };

    const handleRemoveTest = (testId: number) => {
        setUpdatedPackage((prev) => ({
            ...prev,
            tests: prev.tests.filter((test: TestList) => test.id !== testId),
        }));
    };

    const handleSave = () => {
        handleUpdatePackage(updatedPackage);
        onClose();
    };

    return (
        <div className="flex flex-col md:flex-row justify-around gap-4">
            {/* Package Details */}
            <div className="p-4 bg-slate-50 rounded-lg shadow-lg w-full md:w-1/2">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Package Name</label>
                        <input
                            type="text"
                            name="packageName"
                            value={updatedPackage.packageName}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Discount (%)</label>
                        <input
                            type="number"
                            name="discount"
                            value={updatedPackage.discount}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Selected Tests</h3>
                        <div className="overflow-y-auto max-h-40 border rounded-md p-2">
                            {updatedPackage.tests?.map((test: TestList) => (
                                <div
                                    key={test.id}
                                    className="flex justify-between items-center p-2 border-b rounded-md hover:bg-gray-50"
                                >
                                    <span className="text-sm text-gray-700">{test.name}</span>
                                    <button
                                        onClick={() => handleRemoveTest(test.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total Cost and Discounted Price */}
                    <div className="mt-4 space-y-2">
                        <div className="text-gray-700 text-sm">
                            <strong>Total Cost of Tests:</strong> ₹{totalCost.toFixed(2)}
                        </div>
                        <div className="text-gray-700 text-sm">
                            <strong>Discounted Price:</strong> ₹{updatedPackage.price.toFixed(2)}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-4">
                    <button
                        onClick={handleSave}
                        className="flex items-center space-x-2 px-4 py-2 bg-indigo-900 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
                    >
                        <FaSave />
                        <span>Save Changes</span>
                    </button>
                </div>
            </div>

            {/* Available Tests */}
            <div className="p-4 bg-slate-50 rounded-lg shadow-lg w-full md:w-1/2">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Available Tests</h2>
                <div className="flex items-center space-x-2 mb-4">
                    <input
                        type="text"
                        placeholder="Search tests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="overflow-y-auto max-h-80">
                    {loading ? (
                        <p>Loading tests...</p>
                    ) : (
                        filteredTests.map((test) => (
                            <div
                                key={test.id}
                                className="flex justify-between items-center p-3 border-b rounded-md hover:bg-gray-100"
                            >
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-700">{test.name}</span>
                                    <span className="text-xs text-gray-500">{test.category}</span>
                                </div>
                                <button
                                    onClick={() => handleAddTest(test)}
                                    className="text-green-500 hover:text-green-700"
                                >
                                    <FaPlus />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpdatePackage;



