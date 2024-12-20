import React, { useState, useEffect } from 'react';
import { getInsurance } from '@/../services/insuranceService';
import { Insurance } from '@/types/insurance/insurance';
import Loader from '@/app/(admin)/_component/common/Loader';
import { useLabs } from '@/context/LabContext';
import Button from '../common/Button';
import { IoMdEye, IoMdCreate, IoMdTrash } from 'react-icons/io';
import Table from '../common/TableComponent';
import Model from '@/app/(admin)/_component/common/Model';

import AddInsurance from './AddInsurance';
import EditInsurance from './UpdateInsurance';
import ViewInsurance from './ViewInsurance';

const InsuranceList = () => {
  const [insurance, setInsurance] = useState<Insurance[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showAddInsurance, setShowAddInsurance] = useState<boolean>(false);
  const [showEditInsurance, setShowEditInsurance] = useState<boolean>(false);
  const [showViewInsurance, setShowViewInsurance] = useState<boolean>(false);
  const [selectedInsurance, setSelectedInsurance] = useState<Insurance | null>(null);

  const { currentLab } = useLabs();

  useEffect(() => {
    const labId = currentLab?.id;
    if (labId) {
      setLoading(true);
      const fetchInsurance = async () => {
        try {
          const response = await getInsurance(labId);
          setInsurance(response.data);
        } catch (error) {
          console.error('Error fetching insurance: ', error);
        } finally {
          setLoading(false);
        }
      };
      fetchInsurance();
    }
  }, [currentLab]);

  const handleViewInsurance = (insurance: Insurance) => {
    setSelectedInsurance(insurance);
    setShowViewInsurance(true);
  };

  const columns = [
    { header: 'Name', accessor: (item: Insurance) => item.name },
    { header: 'Description', accessor: (item: Insurance) => item.description.substring(0, 20) },
    { header: 'Price', accessor: (item: Insurance) => item.price },
    { header: 'Duration', accessor: (item: Insurance) => item.duration },
    { header: 'Coverage Limit', accessor: (item: Insurance) => item.coverageLimit },
    { header: 'Coverage Type', accessor: (item: Insurance) => item.coverageType },
    { header: 'Status', accessor: (item: Insurance) => item.status },
    { header: 'Provider', accessor: (item: Insurance) => item.provider },
  ];

  const actions = (item: Insurance) => (
    <>
      <button
        onClick={() => handleViewInsurance(item)}
        className="text-blue-500 hover:text-blue-700"
      >
        <IoMdEye size={20} />
      </button>
      <button
        onClick={() => setShowEditInsurance(true)}
        className="text-green-500 hover:text-green-700"
      >
        <IoMdCreate size={20} />
      </button>
      <button className="text-red-500 hover:text-red-700">
        <IoMdTrash size={20} />
      </button>
    </>
  );

  return (
    <div>
      {loading ? (
        <Loader />
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <input
              placeholder="Search Insurance"
              className="border border-gray-300 px-4 py-1 w-3/4 rounded-md focus:outline-none"
            />
            <Button
              text="Add Insurance"
              onClick={() => setShowAddInsurance(true)}
              className="px-4 py-1 text-xs bg-button-tertiary text-white rounded-md hover:bg-button-tertiary focus:outline-none"
            />
          </div>
          <Table
            data={insurance}
            columns={columns}
            actions={actions}
            noDataMessage="No insurance data available"
          />
        </div>
      )}

      {showAddInsurance && (
        <Model
          title="Add Insurance"
          isOpen={showAddInsurance}
          onClose={() => setShowAddInsurance(false)}
        >
          {selectedInsurance && <AddInsurance insurance={selectedInsurance} handleAddInsurance={() => {}} />}
        </Model>
      )}

      {showEditInsurance && (
        <Model
          title="Edit Insurance"
          isOpen={showEditInsurance}
          onClose={() => setShowEditInsurance(false)}
        >
          {selectedInsurance && <EditInsurance insurance={selectedInsurance} />}
        </Model>
      )}

      {showViewInsurance && (
        <Model
          title="View Insurance"
          isOpen={showViewInsurance}
          onClose={() => setShowViewInsurance(false)}
          modalClassName='w-96'
        >
          {selectedInsurance && <ViewInsurance insurance={selectedInsurance} />}
        </Model>
      )}
    </div>
  );
};

export default InsuranceList;
