import React, { useState } from 'react';
import { Insurance } from '@/types/insurance/insurance';
import { FaRegFileAlt, FaDollarSign, FaCalendarAlt, FaShieldAlt, FaUser } from 'react-icons/fa';

interface ViewInsuranceProps {
  insurance: Insurance;
}

const ViewInsurance = ({ insurance }: ViewInsuranceProps) => {
  const [insuranceData, setInsuranceData] = useState<Insurance | null>(null);

  if (insuranceData !== insurance) {
    setInsuranceData(insurance);
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2 text-sm">
          <FaRegFileAlt className="text-blue-500 text-lg" />
          <label className="font-semibold">Name</label>
        </div>
        <p className="text-sm">{insuranceData?.name}</p>

        <div className="flex items-center space-x-2 text-sm">
          <FaRegFileAlt className="text-blue-500 text-lg" />
          <label className="font-semibold">Description</label>
        </div>
        <p className="text-sm">{insuranceData?.description}</p>

        <div className="flex items-center space-x-2 text-sm">
          <FaDollarSign className="text-blue-500 text-lg" />
          <label className="font-semibold">Price</label>
        </div>
        <p className="text-sm">{insuranceData?.price}</p>

        <div className="flex items-center space-x-2 text-sm">
          <FaCalendarAlt className="text-blue-500 text-lg" />
          <label className="font-semibold">Duration</label>
        </div>
        <p className="text-sm">{insuranceData?.duration}</p>

        <div className="flex items-center space-x-2 text-sm">
          <FaShieldAlt className="text-blue-500 text-lg" />
          <label className="font-semibold">Coverage Limit</label>
        </div>
        <p className="text-sm">{insuranceData?.coverageLimit}</p>

        <div className="flex items-center space-x-2 text-sm">
          <FaShieldAlt className="text-blue-500 text-lg" />
          <label className="font-semibold">Coverage Type</label>
        </div>
        <p className="text-sm">{insuranceData?.coverageType}</p>

        <div className="flex items-center space-x-2 text-sm">
          <FaRegFileAlt className="text-blue-500 text-lg" />
          <label className="font-semibold">Status</label>
        </div>
        <p className="text-sm">{insuranceData?.status}</p>

        <div className="flex items-center space-x-2 text-sm">
          <FaUser className="text-blue-500 text-lg" />
          <label className="font-semibold">Provider</label>
        </div>
        <p className="text-sm">{insuranceData?.provider}</p>
      </div>
    </div>
  );
};

export default ViewInsurance;
