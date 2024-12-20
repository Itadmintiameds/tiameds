import React, { useState, useEffect } from 'react';
import { getInsurance , deleteInsurance , updateInsurance, createInsurance, getInsuranceById} from '@/../services/insuranceService';
import { Insurance } from '@/types/insurance/insurance';
import Loader from '@/app/(admin)/_component/Loader';
import { useLabs } from '@/context/LabContext';
import Button from '../Button';
import { IoMdEye, IoMdCreate, IoMdTrash } from 'react-icons/io';
import Model from '@/app/(admin)/_component/Model';

import AddInsurance from './AddInsurance';
import EditInsurance from './UpdateInsurance';
import ViewInsurance from './ViewInsurance';



interface InsuranceApiResponse {
  status: string;
  message: string;
  data: Insurance[];
}

const InsuranceList = () => {
  const [insurance, setInsurance] = useState<Insurance[]>([]); // Corrected type for the state
  const [loading, setLoading] = useState<boolean>(false); // Specify the type for loading

  const { currentLab } = useLabs();

  useEffect(() => {
    const labId = currentLab?.id;
    if (labId !== undefined && labId !== null) {
      setLoading(true);
      const fetchInsurance = async () => {
        try {
          const response: InsuranceApiResponse = await getInsurance(labId); // Get the full response object
          setInsurance(response.data); // Extract the 'data' field, which contains the array
        } catch (error) {
          console.error('Error fetching insurance: ', error);
        } finally {
          setLoading(false);
        }
      };

      fetchInsurance();
    }
  }, [currentLab]);

  

  return (
    <div>
      {loading ? (
        <Loader />
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <input placeholder="Search Insurance" className="border border-gray-300 px-4 py-1 w-3/4 rounded-md focus:outline-none" />

            <Button
              text='Add Insurance'
              onClick={() => { }}
              className="px-4 py-1 text-xs bg-button-tertiary text-white rounded-md hover:bg-button-tertiary focus:outline-none rounded"
            />

          </div>
          <div className="overflow-x-auto shadow-md rounded-lg bg-white">
            <table className="table-auto w-full text-sm text-gray-700">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-3 py-1 font-medium text-gray-600">Name</th>
                  <th className="px-3 py-1 font-medium text-gray-600">Description</th>
                  <th className="px-3 py-1 font-medium text-gray-600">Price</th>
                  <th className="px-3 py-1 font-medium text-gray-600">Duration</th>
                  <th className="px-3 py-1 font-medium text-gray-600">Coverage Limit</th>
                  <th className="px-3 py-1 font-medium text-gray-600">Coverage Type</th>
                  <th className="px-3 py-1 font-medium text-gray-600">Status</th>
                  <th className="px-3 py-1 font-medium text-gray-600">Provider</th>
                  <th className="px-3 py-1 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {insurance.length > 0 ? (
                  insurance.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-50 transition duration-300"
                    >
                      <td className="px-3 py-1">{item.name}</td>
                      <td className="px-3 py-1">{item.description.substring(0, 20)}</td>
                      <td className="px-3 py-1">{item.price}</td>
                      <td className="px-3 py-1">{item.duration}</td>
                      <td className="px-3 py-1">{item.coverageLimit}</td>
                      <td className="px-3 py-1">{item.coverageType}</td>
                      <td className="px-3 py-1">{item.status}</td>
                      <td className="px-3 py-1">{item.provider}</td>
                      <td className="px-3 py-1 text-center space-x-3 flex justify-center">
                        <button
                          // onClick={() => handleView(doctor)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <IoMdEye size={20} />
                        </button>
                        <button
                          // onClick={() => handleEdit(doctor)}
                          className="text-green-500 hover:text-green-700"
                        >
                          <IoMdCreate size={20} />
                        </button>
                        <button
                          // onClick={() => doctor.id && handleDelete(doctor.id.toString())}
                          className="text-red-500 hover:text-red-700"
                        >
                          <IoMdTrash size={20} />
                        </button>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-1 text-gray-500">No insurance data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
};

export default InsuranceList;
