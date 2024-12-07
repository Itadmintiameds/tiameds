import { addTest } from '@/../services/testService';
import { useLabs } from '@/context/LabContext';
import { testFormDataSchema } from '@/schema/testFormDataSchema';
import { TestForm } from '@/types/test/testlist';
import React, { useState } from 'react';
import { FaClipboardList, FaPlusCircle, FaRupeeSign, FaTag } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { z } from 'zod';

const AddTest = () => {
  const [formData, setFormData] = useState<TestForm>({
    category: '',
    name: '',
    price: 0,
  });
  const {  currentLab } = useLabs();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      testFormDataSchema.parse(formData);
      const testListData = {
        ...formData,
        id: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (currentLab) {
        await addTest(currentLab.id.toString(), testListData);
        toast.success('Test added successfully!', { autoClose: 2000 });
        setFormData({ category: '', name: '', price: 0 });
      } else {
        toast.error('Current lab is not selected.');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      } else {
        toast.error((err as Error).message);
      }
    }
  };

  return (
    <div className="flex justify-center items-center  ">
      <div className="bg-white shadow-2xl rounded-lg p-8 w-full max-w-lg">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center mb-6">
          <FaPlusCircle className="mr-3 text-indigo-800" /> Add New Test
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

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-indigo-800 text-white py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition text-sm font-medium"
          >
            Add Test
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTest;
