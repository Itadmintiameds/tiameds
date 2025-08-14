import { getLabList } from '@/../services/labServices';
import { useLabs } from '@/context/LabContext';
import { LabResponse } from '@/types/Lab';
import { useEffect, useState } from 'react';
import Loader from '../common/Loader';
import TableComponent from '../common/TableComponent';
// import { toast } from 'react-toastify';
import { FaEye, FaRegEdit } from "react-icons/fa";
import Modal from '../common/Model';
import BeataComponent from '../common/BeataComponent';

const LabList = () => {
  const { labs, setLabs } = useLabs();
  const [loading, setLoading] = useState<boolean>(false);
  const { currentLab } = useLabs();
  const [editPopup, setEditPopup] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_updateTest, setUpdateTest] = useState<LabResponse>();
  const [viewLabPopup, setViewLabPopup] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_viewLabDetails, setViewLabDetails] = useState<LabResponse>();

  useEffect(() => {
    setLoading(true);
    getLabList()
      .then((labs: LabResponse[]) => {
        setLabs(labs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentLab, setLabs]);
  

  

  const columns = [
    { header: 'ID', accessor: (item: LabResponse) => item.id },
    { header: 'Name', accessor: (item: LabResponse) => item.name },
    { header: 'Address', accessor: (item: LabResponse) => item.address },
    { header: 'City', accessor: (item: LabResponse) => item.city },
    { header: 'State', accessor: (item: LabResponse) => item.state },
    { header: 'Created By', accessor: (item: LabResponse) => item.createdByName },
    {
      header: 'Active',
      accessor: (item: LabResponse) => (
        <span className={`px-2 py-1 rounded ${item.isActive ? 'bg-green-500 text-white text-xs' : 'bg-red-500 text-white text-xs'}`}>
          {item.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Action',
      accessor: (item: LabResponse) => (
        <div className='flex items-center space-x-2'>
          <FaRegEdit
            onClick={() => {
              setEditPopup(true);
              setUpdateTest(item);
            }}
            className="cursor-pointer text-primary"
          />
          <FaEye
            onClick={() => {
              setViewLabPopup(true);
              setViewLabDetails(item);
            }}
            className="cursor-pointer text-primary"
          />
        </div>
      )
    }
  ];

  return (
    <div>
      <Modal
        isOpen={editPopup}
        onClose={() => setEditPopup(false)}
        title="Edit Lab"
        modalClassName='max-w-2xl'
      >
       <BeataComponent />
      </Modal>

      <Modal
        isOpen={viewLabPopup}
        onClose={() => setViewLabPopup(false)}
        title="View Lab"
        modalClassName='max-w-2xl'
      >
         <BeataComponent />
      </Modal>

      {loading ? (
        <Loader />
      ) : (
        <TableComponent
          data={labs}
          columns={columns}
          noDataMessage="No labs available." />
      )}
    </div>
  );
};

export default LabList;
