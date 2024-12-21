import React, { useState, useEffect } from 'react';
import { Insurance } from '@/types/insurance/insurance';
import { FaRegMoneyBillAlt, FaUser, FaRegFileAlt, FaShieldAlt, FaCalendarAlt } from 'react-icons/fa';
import Button from '@/app/(admin)/_component/common/Button';
import { Plus } from 'lucide-react';

interface UpdateInsuranceProps {
  insurance: Insurance;
  handleUpdateInsurance: (insurance: Insurance) => void;
}

const UpdateInsurance = ({ insurance, handleUpdateInsurance }: UpdateInsuranceProps) => {
  const [formData, setFormData] = useState<Insurance>(insurance);

  useEffect(() => {
    setFormData(insurance);
  }, [insurance]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUpdateInsurance(formData); // Pass the updated insurance data
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gradient-to-r from-white via-gray-100 to-gray-200 p-8 rounded-lg max-w-4xl mx-auto">
      {/* <h1 className="text-2xl font-semibold text-gray-700">Update Insurance</h1> */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Name */}
        <div className="mb-2">
          <label htmlFor="name" className="text-xs font-medium text-gray-700 flex items-center">
            <FaUser className="mr-2" /> Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md"
          />
        </div>

        {/* Description */}
        <div className="mb-2">
          <label htmlFor="description" className="text-xs font-medium text-gray-700 flex items-center">
            <FaRegFileAlt className="mr-2" /> Description
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md"
          />
        </div>

        {/* Price */}
        <div className="mb-2">
          <label htmlFor="price" className="text-xs font-medium text-gray-700 flex items-center">
            <FaRegMoneyBillAlt className="mr-2" /> Price
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md"
          />
        </div>

        {/* Duration */}
        <div className="mb-2">
          <label htmlFor="duration" className="text-xs font-medium text-gray-700 flex items-center">
            <FaCalendarAlt className="mr-2" /> Duration (Months)
          </label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md"
          />
        </div>

        {/* Coverage Limit */}
        <div className="mb-2">
          <label htmlFor="coverageLimit" className="text-xs font-medium text-gray-700 flex items-center">
            <FaShieldAlt className="mr-2" /> Coverage Limit
          </label>
          <input
            type="number"
            id="coverageLimit"
            name="coverageLimit"
            value={formData.coverageLimit}
            onChange={handleChange}
            className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md"
          />
        </div>

        {/* Coverage Type */}
        <div className="mb-2">
          <label htmlFor="coverageType" className="text-xs font-medium text-gray-700 flex items-center">
            <FaShieldAlt className="mr-2" /> Coverage Type
          </label>
          <input
            type="text"
            id="coverageType"
            name="coverageType"
            value={formData.coverageType}
            onChange={handleChange}
            className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md"
          />
        </div>

        {/* Status */}
        <div className="mb-2">
          <label htmlFor="status" className="text-xs font-medium text-gray-700 flex items-center">
            <FaUser className="mr-2" /> Status
          </label>
          <input
            type="text"
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md"
          />
        </div>

        {/* Provider */}
        <div className="mb-2">
          <label htmlFor="provider" className="text-xs font-medium text-gray-700 flex items-center">
            <FaUser className="mr-2" /> Provider
          </label>
          <input
            type="text"
            id="provider"
            name="provider"
            value={formData.provider}
            onChange={handleChange}
            className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <Button
        text="Update Insurance"
        onClick={() => handleUpdateInsurance(formData)}
        className="w-full px-4 py-2 mt-4 text-xs bg-button-tertiary text-white rounded-md hover:bg-button-tertiary focus:outline-none flex items-center justify-center space-x-2"
      >
        <Plus size={20} />
      </Button>
    </form>
  );
};

export default UpdateInsurance;
