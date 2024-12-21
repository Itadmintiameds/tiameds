import React, { useState } from 'react';
import { Insurance } from '@/types/insurance/insurance';
import { FaRegMoneyBillAlt, FaUser, FaRegFileAlt, FaShieldAlt, FaCalendarAlt } from 'react-icons/fa';
import Button from '@/app/(admin)/_component/common/Button';
import { insuranceSchema } from '@/schema/insuranceSchema';
import { Plus } from 'lucide-react';

interface AddInsuranceProps {
  handleAddInsurance: (insurance: Insurance) => void;
}

const AddInsurance = ({ handleAddInsurance }: AddInsuranceProps) => {
  const [insurance, setInsurance] = useState<Insurance>({
    name: '',
    description: '',
    price: 0,
    duration: 0,
    coverageLimit: 0,
    coverageType: '',
    status: '',
    provider: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const result = insuranceSchema.safeParse(insurance);
    if (result.success) {
      setErrors({});
      return true;
    } else {
      const errorMessages: { [key: string]: string } = {};
      result.error.errors.forEach((err) => {
        errorMessages[err.path[0]] = err.message;
      });
      setErrors(errorMessages);
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      handleAddInsurance(insurance);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gradient-to-r from-white via-gray-100 to-gray-200 p-8 rounded-lg  max-w-4xl mx-auto">
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
            value={insurance.name}
            onChange={(e) => setInsurance({ ...insurance, name: e.target.value })}
            className={`mt-1 block w-full p-2 text-xs border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
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
            value={insurance.description}
            onChange={(e) => setInsurance({ ...insurance, description: e.target.value })}
            className={`mt-1 block w-full p-2 text-xs border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
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
            value={insurance.price}
            onChange={(e) => setInsurance({ ...insurance, price: parseInt(e.target.value) })}
            className={`mt-1 block w-full p-2 text-xs border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          />
          {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
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
            value={insurance.duration}
            onChange={(e) => setInsurance({ ...insurance, duration: parseInt(e.target.value) })}
            className={`mt-1 block w-full p-2 text-xs border ${errors.duration ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          />
          {errors.duration && <p className="text-xs text-red-500 mt-1">{errors.duration}</p>}
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
            value={insurance.coverageLimit}
            onChange={(e) => setInsurance({ ...insurance, coverageLimit: parseInt(e.target.value) })}
            className={`mt-1 block w-full p-2 text-xs border ${errors.coverageLimit ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          />
          {errors.coverageLimit && <p className="text-xs text-red-500 mt-1">{errors.coverageLimit}</p>}
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
            value={insurance.coverageType}
            onChange={(e) => setInsurance({ ...insurance, coverageType: e.target.value })}
            className={`mt-1 block w-full p-2 text-xs border ${errors.coverageType ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          />
          {errors.coverageType && <p className="text-xs text-red-500 mt-1">{errors.coverageType}</p>}
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
            value={insurance.status}
            onChange={(e) => setInsurance({ ...insurance, status: e.target.value })}
            className={`mt-1 block w-full p-2 text-xs border ${errors.status ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          />
          {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status}</p>}
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
            value={insurance.provider}
            onChange={(e) => setInsurance({ ...insurance, provider: e.target.value })}
            className={`mt-1 block w-full p-2 text-xs border ${errors.provider ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          />
          {errors.provider && <p className="text-xs text-red-500 mt-1">{errors.provider}</p>}
        </div>
      </div>

      <Button
        text="Add Insurance"
        onClick={() => handleAddInsurance(insurance)}
        className="w-full px-4 py-2 mt-4 text-xs bg-button-tertiary text-white rounded-md hover:bg-button-tertiary focus:outline-none flex items-center justify-center space-x-2"
      >
        <Plus size={20} />
      </Button>
    </form>
  );
};

export default AddInsurance;
