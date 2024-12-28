// import React, { useState, useEffect } from 'react';
// import { getInsurance, createInsurance, updateInsurance, deleteInsurance } from '@/../services/insuranceService';
// import { Insurance } from '@/types/insurance/insurance';
// import Loader from '@/app/(admin)/_component/common/Loader';
// import { useLabs } from '@/context/LabContext';
// import Button from '../common/Button';
// import { IoMdEye, IoMdCreate, IoMdTrash } from 'react-icons/io';
// import Table from '../common/TableComponent';
// import Model from '@/app/(admin)/_component/common/Model';

// import AddInsurance from './AddInsurance';
// import EditInsurance from './UpdateInsurance';
// import ViewInsurance from './ViewInsurance';

// import { toast } from 'react-toastify';

// const InsuranceList = () => {
//   const [insurance, setInsurance] = useState<Insurance[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [showAddInsurance, setShowAddInsurance] = useState<boolean>(false);
//   const [showEditInsurance, setShowEditInsurance] = useState<boolean>(false);
//   const [showViewInsurance, setShowViewInsurance] = useState<boolean>(false);
//   const [selectedInsurance, setSelectedInsurance] = useState<Insurance | null>(null);

//   const { currentLab } = useLabs();

//   useEffect(() => {
//     const labId = currentLab?.id;
//     if (labId) {
//       setLoading(true);
//       const fetchInsurance = async () => {
//         try {
//           const response = await getInsurance(labId);
//           setInsurance(response.data);
//         } catch (error) {
//           console.error('Error fetching insurance: ', error);
//         } finally {
//           setLoading(false);
//         }
//       };
//       fetchInsurance();
//     }
//   }, [currentLab]);

//   const handleViewInsurance = (insurance: Insurance) => {
//     setSelectedInsurance(insurance);
//     setShowViewInsurance(true);
//   };

//   const handleAddInsurance = (newInsurance: Insurance) => {
//     const LabId = currentLab?.id;
//     if (LabId) {
//       createInsurance(LabId, newInsurance)
//         .then((response) => {
//           setInsurance([...insurance, response.data]);
//           setShowAddInsurance(false);
//           toast.success('Insurance added successfully', { autoClose: 2000 });
//         })
//         .catch((error) => {
//           console.error('Error adding insurance: ', error);
//           toast.error('Error adding insurance', { autoClose: 2000 });
//         });
//     } else {
//       toast.error('Error adding insurance');
//     }
//   };

//   const handleUpdateInsurance = (updatedInsurance: Insurance) => {
//     console.log('Updated insurance: ', updatedInsurance);
//     const LabId = currentLab?.id;
//     if (LabId && updatedInsurance && updatedInsurance.id !== undefined) {
//       updateInsurance(LabId, updatedInsurance.id, updatedInsurance)
//         .then((response) => {
//           // Update the insurance list with the updated insurance
//           setInsurance(insurance.map((ins) => (ins.id === updatedInsurance.id ? response.data : ins)));
//           setShowEditInsurance(false);
//           toast.success('Insurance updated successfully', { autoClose: 2000 });
//         })
//         .catch((error) => {
//           console.error('Error updating insurance: ', error);
//           toast.error('Error updating insurance', { autoClose: 2000 });
//         });
//     } else {
//       toast.error('Error updating insurance');
//     }
//   };

//   const handleDeleteInsurance = (insuranceId: string) => {
//     const LabId = currentLab?.id;
//     if (LabId) {
//       deleteInsurance(LabId, Number(insuranceId))
//         .then(() => {
//           // Remove the deleted insurance from the list
//           setInsurance(insurance.filter((ins) => ins.id !== Number(insuranceId)));
//           toast.success('Insurance deleted successfully', { autoClose: 2000 });
//         })
//         .catch((error) => {
//           console.error('Error deleting insurance: ', error);
//           toast.error('Error deleting insurance', { autoClose: 2000 });
//         });
//     } else {
//       toast.error('Error deleting insurance');
//     }

//   };

//   const columns = [
//     { header: 'Name', accessor: (item: Insurance) => item.name },
//     { header: 'Description', accessor: (item: Insurance) => item.description.substring(0, 20) },
//     { header: 'Price', accessor: (item: Insurance) => item.price },
//     { header: 'Duration', accessor: (item: Insurance) => item.duration },
//     { header: 'Coverage Limit', accessor: (item: Insurance) => item.coverageLimit },
//     { header: 'Coverage Type', accessor: (item: Insurance) => item.coverageType },
//     { header: 'Status', accessor: (item: Insurance) => item.status },
//     { header: 'Provider', accessor: (item: Insurance) => item.provider },
//   ];

//   const actions = (item: Insurance) => (
//     <>
//       <button
//         onClick={() => handleViewInsurance(item)}
//         className="text-blue-500 hover:text-blue-700"
//       >
//         <IoMdEye size={20} />
//       </button>
//       <button
//         onClick={() => {
//           setSelectedInsurance(item);  // Ensure the selected insurance is set before opening the modal
//           setShowEditInsurance(true); // Open the edit modal
//         }}
//         className="text-green-500 hover:text-green-700"
//       >
//         <IoMdCreate size={20} />
//       </button>
//       <button onClick={() => handleDeleteInsurance(`${item.id}`)} className="text-red-500 hover:text-red-700">
//         <IoMdTrash size={20} />
//       </button>
//     </>
//   );

//   return (
//     <div>
//       {loading ? (
//         <Loader />
//       ) : (
//         <div>
//           <div className="flex justify-between items-center mb-4">
//             <input
//               placeholder="Search Insurance"
//               className="border border-gray-300 px-4 py-1 w-3/4 rounded-md focus:outline-none"
//             />
//             <Button
//               text="Add Insurance"
//               onClick={() => setShowAddInsurance(true)}
//               className="px-4 py-1 text-xs bg-button-tertiary text-white rounded-md hover:bg-button-tertiary focus:outline-none"
//             />
//           </div>
//           <Table
//             data={insurance}
//             columns={columns}
//             actions={actions}
//             noDataMessage="No insurance data available"
//           />
//         </div>
//       )}

//       {showAddInsurance && (
//         <Model
//           title="Add Insurance"
//           isOpen={showAddInsurance}
//           onClose={() => setShowAddInsurance(false)}
//           modalClassName="max-w-xl bg-gradient-to-r from-white via-gray-100 to-gray-200"
//         >
//           <AddInsurance handleAddInsurance={handleAddInsurance} />
//         </Model>
//       )}

//       {showEditInsurance && (
//         <Model
//           title="Update Insurance"
//           isOpen={showEditInsurance}
//           onClose={() => setShowEditInsurance(false)}
//           modalClassName="max-w-xl bg-gradient-to-r from-white via-gray-100 to-gray-200"
//         >
//           {selectedInsurance && (
//             <EditInsurance
//               handleUpdateInsurance={handleUpdateInsurance}
//               insurance={selectedInsurance}
//             />
//           )}
//         </Model>
//       )}

//       {showViewInsurance && (
//         <Model
//           title="Insurance Details"
//           isOpen={showViewInsurance}
//           onClose={() => setShowViewInsurance(false)}
//           modalClassName="max-w-xl"
//         >
//           {selectedInsurance && <ViewInsurance insurance={selectedInsurance} />}
//         </Model>
//       )}
//     </div>
//   );
// };

// export default InsuranceList;


















import { createInsurance, deleteInsurance, getInsurance, updateInsurance } from '@/../services/insuranceService';
import Loader from '@/app/(admin)/_component/common/Loader';
import Model from '@/app/(admin)/_component/common/Model';
import Pagination from '@/app/(admin)/_component/common/Pagination';
import { useLabs } from '@/context/LabContext';
import { Insurance } from '@/types/insurance/insurance';
import React, { useEffect, useState } from 'react';
import { IoMdCreate, IoMdEye, IoMdTrash } from 'react-icons/io';
import { toast } from 'react-toastify';
import Button from '../common/Button';
import Table from '../common/TableComponent';
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
  const [searchTerm, setSearchTerm] = useState<string>(''); // Search term state
  const [currentPage, setCurrentPage] = useState<number>(1); // Current page for pagination
  const [totalPages, setTotalPages] = useState<number>(1); // Total pages for pagination
  const [filteredInsurance, setFilteredInsurance] = useState<Insurance[]>([]); // Filtered insurance list

  const { currentLab } = useLabs();

  useEffect(() => {
    const labId = currentLab?.id;
    if (labId) {
      setLoading(true);
      const fetchInsurance = async () => {
        try {
          const response = await getInsurance(labId);
          setInsurance(response.data);
          setTotalPages(Math.ceil(response.data.length / 10)); // Assuming 10 items per page
        } catch (error) {
          console.error('Error fetching insurance: ', error);
        } finally {
          setLoading(false);
        }
      };
      fetchInsurance();
    }
  }, [currentLab]);

  useEffect(() => {
    // Filter insurance based on the search term
    setFilteredInsurance(
      insurance.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, insurance]);

  const handleViewInsurance = (insurance: Insurance) => {
    setSelectedInsurance(insurance);
    setShowViewInsurance(true);
  };

  const handleAddInsurance = (newInsurance: Insurance) => {
    const LabId = currentLab?.id;
    if (LabId) {
      createInsurance(LabId, newInsurance)
        .then((response) => {
          setInsurance([...insurance, response.data]);
          setShowAddInsurance(false);
          toast.success('Insurance added successfully', { autoClose: 2000 });
        })
        .catch((error) => {
          console.error('Error adding insurance: ', error);
          toast.error('Error adding insurance', { autoClose: 2000 });
        });
    } else {
      toast.error('Error adding insurance');
    }
  };

  const handleUpdateInsurance = (updatedInsurance: Insurance) => {
    const LabId = currentLab?.id;
    if (LabId && updatedInsurance && updatedInsurance.id !== undefined) {
      updateInsurance(LabId, updatedInsurance.id, updatedInsurance)
        .then((response) => {
          setInsurance(insurance.map((ins) => (ins.id === updatedInsurance.id ? response.data : ins)));
          setShowEditInsurance(false);
          toast.success('Insurance updated successfully', { autoClose: 2000 });
        })
        .catch((error) => {
          console.error('Error updating insurance: ', error);
          toast.error('Error updating insurance', { autoClose: 2000 });
        });
    } else {
      toast.error('Error updating insurance');
    }
  };

  const handleDeleteInsurance = (insuranceId: string) => {
    const LabId = currentLab?.id;
    if (LabId) {
      deleteInsurance(LabId, Number(insuranceId))
        .then(() => {
          setInsurance(insurance.filter((ins) => ins.id !== Number(insuranceId)));
          toast.success('Insurance deleted successfully', { autoClose: 2000 });
        })
        .catch((error) => {
          console.error('Error deleting insurance: ', error);
          toast.error('Error deleting insurance', { autoClose: 2000 });
        });
    } else {
      toast.error('Error deleting insurance');
    }
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
      <button onClick={() => handleViewInsurance(item)} className="text-blue-500 hover:text-blue-700">
        <IoMdEye size={20} />
      </button>
      <button onClick={() => { setSelectedInsurance(item); setShowEditInsurance(true); }} className="text-green-500 hover:text-green-700">
        <IoMdCreate size={20} />
      </button>
      <button onClick={() => handleDeleteInsurance(`${item.id}`)} className="text-red-500 hover:text-red-700">
        <IoMdTrash size={20} />
      </button>
    </>
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search term changes
  };

  const paginatedInsurance = filteredInsurance.slice((currentPage - 1) * 10, currentPage * 10); // Paginate filtered data

  return (
    <div>
      {loading ? (
        <Loader />
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <input
              placeholder="Search Insurance"
              value={searchTerm}
              onChange={handleSearch}
              className="border border-gray-300 px-4 py-1 w-3/4 rounded-md focus:outline-none"
            />
            <Button
              text="Add Insurance"
              onClick={() => setShowAddInsurance(true)}
              className="px-4 py-1 text-xs bg-button-tertiary text-white rounded-md hover:bg-button-tertiary focus:outline-none"
            />
          </div>

          <Table data={paginatedInsurance} columns={columns} actions={actions} noDataMessage="No insurance data available" />

          {/* <div className="flex justify-center items-center mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 text-xs flex items-center gap-2"
            >
              <FaSortAmountDown className="text-gray-600" /> Previous
            </button>
            <span className="mx-4 text-xs">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 text-xs flex items-center gap-2"
            >
              Next <FaSortAmountUp className="text-gray-600" />
            </button>
          </div> */}
          <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
      )}

      {showAddInsurance && (
        <Model title="Add Insurance" isOpen={showAddInsurance} onClose={() => setShowAddInsurance(false)} modalClassName="max-w-xl bg-gradient-to-r from-white via-gray-100 to-gray-200">
          <AddInsurance handleAddInsurance={handleAddInsurance} />
        </Model>
      )}

      {showEditInsurance && (
        <Model title="Update Insurance" isOpen={showEditInsurance} onClose={() => setShowEditInsurance(false)} modalClassName="max-w-xl bg-gradient-to-r from-white via-gray-100 to-gray-200">
          {selectedInsurance && <EditInsurance handleUpdateInsurance={handleUpdateInsurance} insurance={selectedInsurance} />}
        </Model>
      )}

      {showViewInsurance && (
        <Model title="Insurance Details" isOpen={showViewInsurance} onClose={() => setShowViewInsurance(false)} modalClassName="max-w-xl">
          {selectedInsurance && <ViewInsurance insurance={selectedInsurance} />}
        </Model>
      )}
    </div>
  );
};

export default InsuranceList;

