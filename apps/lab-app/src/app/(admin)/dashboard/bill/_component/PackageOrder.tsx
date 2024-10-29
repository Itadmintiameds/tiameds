'use client';
import React, { useState } from 'react';
import Button from '@/app/(admin)/_component/Button';
import { Trash2Icon } from 'lucide-react';


// Define the TestOrder interface
interface TestOrder {
    name: string;
    qty: number;
    price: number;
    discountPercent: number;
    gstPercent: number;
}

// Define the Package interface
interface Package {
    name: string;
    tests: TestOrder[];
}

// Sample test data structured into packages
const packages: Package[] = [
    {
        name: "Health Package",
        tests: [
            { name: "Blood Test", qty: 1, price: 500, discountPercent: 10, gstPercent: 18 },
            { name: "Urine Test", qty: 2, price: 300, discountPercent: 5, gstPercent: 18 },
            { name: "Lipid Profile", qty: 3, price: 400, discountPercent: 8, gstPercent: 18 }
        ]
    },
    {
        name: "Diagnostic Package",
        tests: [
            { name: "X-Ray", qty: 1, price: 1200, discountPercent: 0, gstPercent: 18 },
            { name: "MRI Scan", qty: 1, price: 3000, discountPercent: 15, gstPercent: 18 },
            { name: "CT Scan", qty: 1, price: 2500, discountPercent: 12, gstPercent: 18 }
        ]
    },
    {
        name: "Comprehensive Package",
        tests: [
            { name: "Thyroid Test", qty: 2, price: 700, discountPercent: 5, gstPercent: 18 },
            { name: "HIV Test", qty: 1, price: 900, discountPercent: 0, gstPercent: 12 },
            { name: "Vitamin D Test", qty: 2, price: 600, discountPercent: 7, gstPercent: 12 }
        ]
    }
];

const PackageOrder = () => {
    const [selectedPackages, setSelectedPackages] = useState<number[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

    const handleCheckboxChange = (index: number) => {
        setSelectedPackages(prevSelectedPackages =>
            prevSelectedPackages.includes(index)
                ? prevSelectedPackages.filter(pkgIndex => pkgIndex !== index)
                : [...prevSelectedPackages, index]
        );
    };

    const handleClearSelection = () => {
        setSelectedPackages([]); // Clears all selected packages
    };

    return (
        <section className="container mx-auto py-1">
            <h1 className="text-sm font-semibold mb-2">Package Orders</h1>

            <div className="relative inline-block w-1/4">
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="form-select text-xs w-full bg-white border border-gray-300 px-4 py-2 rounded-md">
                    {selectedPackages.length === 0 ? 'Select Packages' : `${selectedPackages.length} Packages Selected`}
                </button>

                {dropdownOpen && (
                    <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                        <ul className="max-h-60 overflow-y-auto p-2">
                            {packages.map((pkg, index) => (
                                <li key={index} className="flex items-center mb-1">
                                    <input
                                        type="checkbox"
                                        id={`package-${index}`}
                                        className="mr-2"
                                        checked={selectedPackages.includes(index)}
                                        onChange={() => handleCheckboxChange(index)}
                                    />
                                    <label htmlFor={`package-${index}`} className="text-sm">
                                        {pkg.name}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {selectedPackages.length > 0 && (

                <>
                  <div className="flex justify-end -mt-4">
                        <Button onClick={handleClearSelection} className='bg-red-500 hover:bg-red-300 text-xs ' text='clear'>
                            <Trash2Icon size={15} />
                        </Button>
                    </div>
                    <table className="table-auto w-full mt-4 text-xs border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-purple-900 text-slate-100 text-left">
                                <th className="px-4 py-2 border border-gray-300">Package Name</th>
                                <th className="px-4 py-2 border border-gray-300">Test Name</th>
                                <th className="px-4 py-2 border border-gray-300">Quantity</th>
                                <th className="px-4 py-2 border border-gray-300">Price</th>
                                <th className="px-4 py-2 border border-gray-300">Discount (%)</th>
                                <th className="px-4 py-2 border border-gray-300">GST (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedPackages.map((pkgIndex) => {
                                const selectedPackage = packages[pkgIndex];
                                return selectedPackage.tests.map((test, testIndex) => (
                                    <tr key={`${pkgIndex}-${testIndex}`} className="hover:bg-gray-100">
                                        <td className="border px-4 py-2">{selectedPackage.name}</td>
                                        <td className="border px-4 py-2">{test.name}</td>
                                        <td className="border px-4 py-2">{test.qty}</td>
                                        <td className="border px-4 py-2">{test.price}</td>
                                        <td className="border px-4 py-2">{test.discountPercent}</td>
                                        <td className="border px-4 py-2">{test.gstPercent}</td>
                                    </tr>
                                ));
                            })}
                        </tbody>
                    </table>

                
                </>
            )}
        </section>
    );
};

export default PackageOrder;
