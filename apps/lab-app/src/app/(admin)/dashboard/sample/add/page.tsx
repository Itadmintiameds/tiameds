'use client';
import Button from "@/app/(admin)/component/common/Button";
import Loader from "@/app/(admin)/component/common/Loader";
import Modal from "@/app/(admin)/component/common/Model";
import Pagination from "@/app/(admin)/component/common/Pagination";
import TableComponent from "@/app/(admin)/component/common/TableComponent";
import { SampleList } from "@/types/sample/sample";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { IoMdCreate, IoMdTrash } from "react-icons/io";
import { RxUpdate } from "react-icons/rx";
import { toast } from "react-toastify";
import { createSample, deleteSample, getSamples, updateSample } from "../../../../../../services/sampleServices";

import { MdOutlineCancel } from "react-icons/md";

const Page = () => {
  const [samples, setSamples] = useState<SampleList[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState<SampleList | null>(null);
  const [formData, setFormData] = useState<Partial<SampleList>>({ name: "" });

  // Fetch samples
  useEffect(() => {
    loadSamples();
  }, []);

  const loadSamples = async () => {
    try {
      const data = await getSamples();
      setSamples(data);
    } catch (error) {
      console.error("Error loading samples:", error);
    }
  };

  // Open modal for create/update
  const handleOpenModal = (sample?: SampleList) => {
    if (sample) {
      setSelectedSample(sample);
      setFormData({ name: sample.name }); // Populate form data for update
    } else {
      setSelectedSample(null);
      setFormData({ name: "" }); // Reset form for new entry
    }
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "" });
    setSelectedSample(null);
  };

  // Handle form input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle create or update submission
  const handleSubmit = async () => {
    try {
      if (selectedSample) {
        // Update Sample
        await updateSample(selectedSample.id, formData);
        toast.success("Sample updated successfully");
      } else {
        // Create Sample
        await createSample(formData);
        toast.success("Sample created successfully");
      }
      loadSamples(); // Refresh data
      handleCloseModal();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message); // Show error message in toast
      } else {
        toast.error("An error occurred while processing the request.");
      }
    }
  };


  // Handle delete
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this sample?")) {
      try {
        await deleteSample(id);
        toast.success("Sample deleted successfully");
        loadSamples(); // Refresh list
      } catch (error) {
        console.error("Error deleting sample:", error);
      }
    }
  };

  // Corrected time formatter
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString(); // Formats in local date-time format
  };

  if (!samples.length) return <Loader />;

  const columns = [
    { header: "ID", accessor: "id" as keyof SampleList },
    { header: "Name", accessor: "name" as keyof SampleList },
    {
      header: "Created At",
      accessor: "createdAt" as keyof SampleList,
      Cell: ({ value }: { value: string }) => formatDate(value),
    },
    {
      header: "Updated At",
      accessor: "updatedAt" as keyof SampleList,
      Cell: ({ value }: { value: string }) => formatDate(value),
    },
  ];

  const paginatedData = samples.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">Sample List</h1>
        <Button
          text="Sample"
          className="bg-primary hover:bg-primarylight text-white text-xs px-4 py-2 rounded"
          onClick={() => handleOpenModal()}
        >
          <PlusIcon size={20} />
        </Button>
      </div>

      {/* Table */}
      <TableComponent
        data={paginatedData}
        columns={columns}
        actions={(item) => (
          <div className="flex gap-2">
            <Button
              text=""
              onClick={() => handleOpenModal(item)}
              className="text-green-500 hover:text-green-700 border border-green-500 hover:bg-green-500 hover:text-white"
            >
              <IoMdCreate size={20} />
            </Button>
            <Button
              text=""
              onClick={() => handleDelete(item.id)}
              className="text-red-500 hover:text-red-700 border border-red-500 hover:bg-red-500 hover:text-white"
            >
              <IoMdTrash size={20} />
            </Button>
          </div>
        )}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(samples.length / itemsPerPage)}
        onPageChange={setCurrentPage}
      />

      {/* Modal for Create/Update */}
      <Modal
        modalClassName="max-w-sm"

        isOpen={isModalOpen} onClose={handleCloseModal} title={selectedSample ? "Edit Sample" : "Add Sample"}>
        <div>
          <label className="block mb-2 text-sm font-medium">Sample Name</label>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            text="Cancel" className="bg-deletebutton hover:bg-red-600 text-white px-4 py-2 rounded text-xs"
            onClick={handleCloseModal} >
            <MdOutlineCancel size={12} />
          </Button>
          <Button
            text={selectedSample ? "Update" : "Create"}
            className="bg-primary hover:bg-primarylight text-white px-4 py-2 rounded text-xs"
            onClick={handleSubmit}
          >
            {selectedSample ? <RxUpdate size={12} /> : <PlusIcon size={12} />}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Page;


