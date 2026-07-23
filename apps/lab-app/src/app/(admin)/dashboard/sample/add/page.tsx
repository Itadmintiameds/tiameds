'use client';
import { deleteSample, getSamples, updateSample, createSample } from "../../../../../../services/sampleServices";
import { useLabs } from "@/context/LabContext";
import { SampleList } from "@/types/sample/sample";
import { Plus, Edit, Search } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { HiOutlineTrash } from 'react-icons/hi2';
import { FaFlask } from 'react-icons/fa';
import { toast } from "react-toastify";

// Components
import Loader from "@/app/(admin)/component/common/Loader";
import NewCommonTable from '@/app/(admin)/dashboard/newcommoncomponent/NewCommonTable';
import NewModal from '@/app/(admin)/dashboard/newcommoncomponent/NewModal';
import useAuthStore from '@/context/userStore';

// Common sample types for suggestions
const SUGGESTED_SAMPLES = [
  "Blood",
  "Urine",
  "Stool",
  "Sputum",
  "Saliva",
  "Swab",
  "Tissue",
  "Serum",
  "Plasma",
  "CSF (Cerebrospinal Fluid)",
  "Pus",
  "Semen",
  "Sputum Culture",
  "Throat Swab",
  "Nasal Swab",
  "Wound Swab",
  "Blood Culture",
  "Urine Culture",
  "Stool Culture",
  "Sputum Culture",
  "Body Fluid",
  "Bone Marrow",
  "Biopsy",
  "Aspirate",
  "Other"
];

const Page = () => {
  const { currentLab } = useLabs();
  const { user: loginedUser } = useAuthStore();
  const roles = loginedUser?.roles || [];
  const isSuperAdmin = roles.includes('SUPERADMIN');
  const isAdmin = roles.includes('ADMIN');

  const [samples, setSamples] = useState<SampleList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState<SampleList | null>(null);
  const [sampleToDelete, setSampleToDelete] = useState<SampleList | null>(null);
  const [formData, setFormData] = useState<Partial<SampleList>>({ name: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [updateList, setUpdateList] = useState(false);

  // Fetch samples
  useEffect(() => {
    if (currentLab?.id) {
      loadSamples();
    }
  }, [currentLab?.id, updateList]);

  const loadSamples = async () => {
    if (!currentLab?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await getSamples(currentLab.id);
      setSamples(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load samples';
      toast.error(errorMessage, { autoClose: 3000 });
      setSamples([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter samples based on search
  const filteredSamples = samples.filter(sample => 
    sample.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open modal for create/update
  const handleOpenModal = (sample?: SampleList) => {
    if (sample) {
      setSelectedSample(sample);
      setFormData({ name: sample.name });
      setShowSuggestions(false);
    } else {
      setSelectedSample(null);
      setFormData({ name: "" });
      setShowSuggestions(false);
    }
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "" });
    setSelectedSample(null);
    setShowSuggestions(false);
  };

  // Handle delete modal
  const handleDeleteClick = (sample: SampleList) => {
    setSampleToDelete(sample);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!sampleToDelete || !currentLab?.id) return;

    try {
      await deleteSample(currentLab.id, sampleToDelete.id);
      toast.success("Sample deleted successfully", { autoClose: 2000 });
      setUpdateList(!updateList);
      setIsDeleteModalOpen(false);
      setSampleToDelete(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete sample';
      toast.error(errorMessage, { autoClose: 5000 });
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setSampleToDelete(null);
  };

  // Handle form input with suggestions
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    
    if (value.trim()) {
      const filtered = SUGGESTED_SAMPLES.filter(sample =>
        sample.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setFormData({ ...formData, name: suggestion });
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle create or update submission
  const handleSubmit = async () => {
    if (!currentLab?.id) {
      toast.error("Please select a lab first", { autoClose: 3000 });
      return;
    }

    if (!formData.name || formData.name.trim() === "") {
      toast.error("Sample name is required", { autoClose: 3000 });
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedSample) {
        await updateSample(currentLab.id, selectedSample.id, formData);
        toast.success("Sample updated successfully", { autoClose: 2000 });
      } else {
        await createSample(currentLab.id, formData);
        toast.success("Sample created successfully", { autoClose: 2000 });
      }
      setUpdateList(!updateList);
      handleCloseModal();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message, { autoClose: 5000 });
      } else {
        toast.error("An error occurred while processing the request.", { autoClose: 5000 });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleString();
    } catch (error) {
      return "N/A";
    }
  };

  // Table Columns
  const columns = [
    {
      header: "Sample ID",
      accessor: "id",
      render: (row: SampleList) => (
        <div>
          <p className="font-semibold text-p3 text-pneutral-900">
            #{row.id}
          </p>
        </div>
      ),
    },
    {
      header: "Sample Name",
      accessor: "name",
      render: (row: SampleList) => (
        <div>
          <p className="font-semibold text-p3 text-pneutral-900">
            {row.name}
          </p>
        </div>
      ),
    },
    {
      header: "Created At",
      accessor: "createdAt",
      render: (row: SampleList) => (
        <p className="text-p3 text-pneutral-600">
          {formatDate(row.createdAt)}
        </p>
      ),
    },
    {
      header: "Updated At",
      accessor: "updatedAt",
      render: (row: SampleList) => (
        <p className="text-p3 text-pneutral-600">
          {formatDate(row.updatedAt)}
        </p>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row: SampleList) => {
        const canEdit = isSuperAdmin || isAdmin;
        const canDelete = isSuperAdmin || isAdmin;

        return (
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={() => handleOpenModal(row)}
                className="flex h-[28px] w-[28px] items-center border border-info-700 justify-center rounded-full text-info-700 hover:bg-info-50 transition-colors"
                title="Edit Sample"
              >
                <Edit size={12} />
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => handleDeleteClick(row)}
                className="flex h-[28px] w-[28px] items-center justify-center border border-warning-500 rounded-full text-warning-500 hover:bg-warning-50 transition-colors"
                title="Delete Sample"
              >
                <HiOutlineTrash size={12} />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader type="progress" fullScreen={false} text="Loading samples..." />
        <p className="mt-4 text-sm text-gray-500">Fetching the latest sample data...</p>
      </div>
    );
  }

  // Show message if no lab is selected
  if (!currentLab?.id) {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center justify-center rounded-xl border border-pneutral-200 bg-white py-16">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-pneutral-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-4 text-sm font-medium text-pneutral-500">
            No Lab Selected
          </p>
          <p className="mt-1 text-xs text-pneutral-400">
            Please select a lab to manage samples.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 bg-secondary-50">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-h3 font-semibold text-pneutral-900">
              Sample Management
            </h1>
            <p className="mt-1 text-p3 text-pneutral-500">
              Manage samples for {currentLab.name}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {(isSuperAdmin || isAdmin) && (
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 rounded-full bg-secondary-700 px-4 py-2 text-label-l3 font-medium text-pneutral-50"
              >
                <Plus className="h-4 w-4" />
                <span>Add Sample</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats and Search Section */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-info-50 p-4 rounded-lg border border-info-100 flex items-center gap-3">
            <FaFlask className="text-info-500 text-xl" />
            <div>
              <span className="text-p3 font-semibold text-info-800">
                Total Samples: <span className="text-info-900 font-bold">{samples.length}</span>
              </span>
            </div>
          </div>
          
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sneutral-700"
            />
            <input
              type="text"
              placeholder="Search by sample name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-14 w-full rounded-lg bg-white border border-pneutral-200 pl-10 pr-4 text-sm outline-none focus:border-pneutral-500"
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="relative">
        {filteredSamples.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-pneutral-200 bg-white py-16">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-pneutral-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mt-4 text-sm font-medium text-pneutral-500">
              {searchTerm ? `No results found for "${searchTerm}"` : "No samples available"}
            </p>
            {searchTerm && (
              <p className="mt-1 text-xs text-pneutral-400">
                Try adjusting your search criteria
              </p>
            )}
          </div>
        ) : (
          <NewCommonTable
            columns={columns}
            data={filteredSamples}
            pageSize={10}
            showPagination={true}
          />
        )}
      </div>

      {/* Add/Edit Sample Modal */}
      <NewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedSample ? "Edit Sample" : "Add New Sample"}
        modalClassName="max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-pneutral-700 mb-2">
              Sample Name <span className="text-danger-500">*</span>
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                onFocus={() => {
                  if (formData.name && !selectedSample) {
                    const filtered = SUGGESTED_SAMPLES.filter(sample =>
                      sample.toLowerCase().includes((formData.name || "").toLowerCase())
                    );
                    setFilteredSuggestions(filtered);
                    setShowSuggestions(filtered.length > 0);
                  }
                }}
                className="w-full rounded-lg border border-pneutral-200 px-3 py-2 text-sm outline-none focus:border-pneutral-500"
                placeholder="Enter or select sample name"
                disabled={isSubmitting}
                autoFocus
              />
              {formData.name && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, name: "" });
                    setShowSuggestions(false);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-pneutral-400 hover:text-pneutral-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-50 w-full mt-1 bg-white border border-pneutral-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                <div className="p-2 text-xs text-pneutral-600 font-semibold border-b border-pneutral-100 bg-pneutral-50">
                  Suggested Samples
                </div>
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-2.5 hover:bg-info-50 transition-colors flex items-center gap-2 text-xs text-pneutral-900"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-info-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Add Suggestions */}
          {!formData.name && !selectedSample && (
            <div className="bg-info-50 p-3 rounded-lg border border-info-100">
              <label className="block mb-2 text-sm font-medium text-info-700">
                Quick Add
              </label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_SAMPLES.slice(0, 8).map((sample, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(sample)}
                    className="px-3 py-1.5 text-xs bg-white hover:bg-info-100 text-pneutral-900 rounded-lg transition-colors border border-info-200 hover:border-info-300 font-medium"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-pneutral-200">
          <button
            type="button"
            onClick={handleCloseModal}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-pneutral-700 bg-pneutral-100 rounded-lg hover:bg-pneutral-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-pneutral-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center bg-secondary-700 hover:bg-secondary-800"
          >
            {selectedSample ? (
              <>
                <Edit size={14} className="mr-2" />
                Update
              </>
            ) : (
              <>
                <Plus size={14} className="mr-2" />
                Create
              </>
            )}
          </button>
        </div>
      </NewModal>

      {/* Delete Confirmation Modal */}
      <NewModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        title="Delete Sample"
        modalClassName="max-w-md"
      >
        <div className="text-center py-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <HiOutlineTrash className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-pneutral-900 mb-2">
            Are you sure you want to delete &quot;{sampleToDelete?.name}&quot;?
          </h3>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={handleCancelDelete}
              className="px-4 py-2 text-sm font-medium text-pneutral-700 bg-pneutral-100 rounded-lg hover:bg-pneutral-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <HiOutlineTrash size={16} />
              Delete
            </button>
          </div>
        </div>
      </NewModal>
    </div>
  );
};

export default Page;
















// code written by abhishek ............ do not delete this.....................


// 'use client';
// import Button from "@/app/(admin)/component/common/Button";
// import Loader from "@/app/(admin)/component/common/Loader";
// import Modal from "@/app/(admin)/component/common/Model";
// import Pagination from "@/app/(admin)/component/common/Pagination";
// import TableComponent from "@/app/(admin)/component/common/TableComponent";
// import { SampleList } from "@/types/sample/sample";
// import { PlusIcon, X } from "lucide-react";
// import { useEffect, useState, useRef } from "react";
// import { IoMdCreate, IoMdTrash } from "react-icons/io";
// import { RxUpdate } from "react-icons/rx";
// import { MdOutlineCancel } from "react-icons/md";
// import { FaFlask, FaInbox } from "react-icons/fa";
// import { toast } from "react-toastify";
// import { createSample, deleteSample, getSamples, updateSample } from "../../../../../../services/sampleServices";
// import { useLabs } from "@/context/LabContext";

// // Common sample types for suggestions
// const SUGGESTED_SAMPLES = [
//   "Blood",
//   "Urine",
//   "Stool",
//   "Sputum",
//   "Saliva",
//   "Swab",
//   "Tissue",
//   "Serum",
//   "Plasma",
//   "CSF (Cerebrospinal Fluid)",
//   "Pus",
//   "Semen",
//   "Sputum Culture",
//   "Throat Swab",
//   "Nasal Swab",
//   "Wound Swab",
//   "Blood Culture",
//   "Urine Culture",
//   "Stool Culture",
//   "Sputum Culture",
//   "Body Fluid",
//   "Bone Marrow",
//   "Biopsy",
//   "Aspirate",
//   "Other"
// ];

// const Page = () => {
//   const { currentLab } = useLabs();
//   const [samples, setSamples] = useState<SampleList[]>([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isLoading, setIsLoading] = useState(true);
//   const itemsPerPage = 5;

//   // Modal state
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedSample, setSelectedSample] = useState<SampleList | null>(null);
//   const [formData, setFormData] = useState<Partial<SampleList>>({ name: "" });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const suggestionsRef = useRef<HTMLDivElement>(null);

//   // Fetch samples
//   useEffect(() => {
//     if (currentLab?.id) {
//       loadSamples();
//     }
//   }, [currentLab?.id]);

//   const loadSamples = async () => {
//     if (!currentLab?.id) {
//       setIsLoading(false);
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const data = await getSamples(currentLab.id);
//       setSamples(data);
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : 'Failed to load samples';
//       toast.error(errorMessage, { autoClose: 3000 });
//       setSamples([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Open modal for create/update
//   const handleOpenModal = (sample?: SampleList) => {
//     if (sample) {
//       setSelectedSample(sample);
//       setFormData({ name: sample.name });
//       setShowSuggestions(false);
//     } else {
//       setSelectedSample(null);
//       setFormData({ name: "" });
//       setShowSuggestions(false);
//     }
//     setIsModalOpen(true);
//   };

//   // Close modal
//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setFormData({ name: "" });
//     setSelectedSample(null);
//     setShowSuggestions(false);
//   };

//   // Handle form input with suggestions
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setFormData({ ...formData, [e.target.name]: value });
    
//     // Filter suggestions based on input
//     if (value.trim()) {
//       const filtered = SUGGESTED_SAMPLES.filter(sample =>
//         sample.toLowerCase().includes(value.toLowerCase())
//       );
//       setFilteredSuggestions(filtered);
//       setShowSuggestions(filtered.length > 0);
//     } else {
//       setShowSuggestions(false);
//       setFilteredSuggestions([]);
//     }
//   };

//   // Handle suggestion selection
//   const handleSuggestionClick = (suggestion: string) => {
//     setFormData({ ...formData, name: suggestion });
//     setShowSuggestions(false);
//     inputRef.current?.focus();
//   };

//   // Close suggestions when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         suggestionsRef.current &&
//         !suggestionsRef.current.contains(event.target as Node) &&
//         inputRef.current &&
//         !inputRef.current.contains(event.target as Node)
//       ) {
//         setShowSuggestions(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   // Handle create or update submission
//   const handleSubmit = async () => {
//     if (!currentLab?.id) {
//       toast.error("Please select a lab first", { autoClose: 3000 });
//       return;
//     }

//     if (!formData.name || formData.name.trim() === "") {
//       toast.error("Sample name is required", { autoClose: 3000 });
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       if (selectedSample) {
//         // Update Sample
//         await updateSample(currentLab.id, selectedSample.id, formData);
//         toast.success("Sample updated successfully", { autoClose: 2000 });
//       } else {
//         // Create Sample
//         await createSample(currentLab.id, formData);
//         toast.success("Sample created successfully", { autoClose: 2000 });
//       }
//       loadSamples();
//       handleCloseModal();
//     } catch (error: unknown) {
//       if (error instanceof Error) {
//         toast.error(error.message, { autoClose: 5000 });
//       } else {
//         toast.error("An error occurred while processing the request.", { autoClose: 5000 });
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Handle delete
//   const handleDelete = async (id: number) => {
//     if (!currentLab?.id) {
//       toast.error("Please select a lab first", { autoClose: 3000 });
//       return;
//     }

//     if (confirm("Are you sure you want to delete this sample?")) {
//       try {
//         await deleteSample(currentLab.id, id);
//         toast.success("Sample deleted successfully", { autoClose: 2000 });
//         loadSamples();
//       } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : 'Failed to delete sample';
//         toast.error(errorMessage, { autoClose: 5000 });
//       }
//     }
//   };

//   // Format date
//   const formatDate = (dateString: string) => {
//     if (!dateString) return "N/A";
//     try {
//     const date = new Date(dateString);
//       if (isNaN(date.getTime())) return "N/A";
//     return date.toLocaleString();
//     } catch (error) {
//       return "N/A";
//     }
//   };

//   // Show loading state
//   if (isLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center p-6">
//         <Loader type="progress" fullScreen={false} text="Loading samples..." />
//         <p className="mt-4 text-sm text-gray-600">Please wait while we fetch the sample data...</p>
//       </div>
//     );
//   }

//   // Show message if no lab is selected
//   if (!currentLab?.id) {
//     return (
//       <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
//         <div className="text-center py-12">
//           <h2 className="text-xl font-semibold text-gray-900 mb-2">No Lab Selected</h2>
//           <p className="text-sm text-gray-600">Please select a lab to manage samples.</p>
//         </div>
//       </div>
//     );
//   }

//   // Show empty state
//   if (samples.length === 0) {
//     return (
//       <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">Sample Management</h1>
//             <p className="text-sm text-gray-600 mt-1">Manage samples for {currentLab.name}</p>
//           </div>
//           <button
//             onClick={() => handleOpenModal()}
//             className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 flex items-center gap-2"
//             style={{
//               background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
//             }}
//           >
//             <PlusIcon size={18} />
//             <span>Add Sample</span>
//           </button>
//         </div>

//         {/* No Data State */}
//         <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl py-16">
//           <div className="text-center">
//             <div className="flex justify-center mb-4">
//               <div className="p-4 bg-gray-200 rounded-full">
//                 <FaInbox className="text-4xl text-gray-400" />
//               </div>
//             </div>
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data</h3>
//             <p className="text-sm text-gray-600 mb-6">No samples have been added for this lab yet.</p>
//             <button
//               onClick={() => handleOpenModal()}
//               className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 flex items-center gap-2 mx-auto"
//               style={{
//                 background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
//               }}
//             >
//               <PlusIcon size={18} />
//               <span>Add Sample</span>
//             </button>
//           </div>
//         </div>

//         {/* Modal for Create/Update */}
//         <Modal
//           modalClassName="max-w-lg"
//           isOpen={isModalOpen}
//           onClose={handleCloseModal}
//           title={selectedSample ? "Edit Sample" : "Add New Sample"}
//         >
//           <div className="space-y-4 text-sm">
//             {/* Sample Name Input Section */}
//             <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
//               <label className="block mb-2 text-sm font-semibold text-blue-800">
//                 Sample Name <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   ref={inputRef}
//                   type="text"
//                   name="name"
//                   value={formData.name || ""}
//                   onChange={handleChange}
//                   onFocus={() => {
//                     if (formData.name && !selectedSample) {
//                       const filtered = SUGGESTED_SAMPLES.filter(sample =>
//                         sample.toLowerCase().includes((formData.name || "").toLowerCase())
//                       );
//                       setFilteredSuggestions(filtered);
//                       setShowSuggestions(filtered.length > 0);
//                     }
//                   }}
//                   className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white pr-10"
//                   placeholder="Enter or select sample name"
//                   disabled={isSubmitting}
//                   autoFocus
//                 />
//                 {formData.name && (
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setFormData({ ...formData, name: "" });
//                       setShowSuggestions(false);
//                       inputRef.current?.focus();
//                     }}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
//                   >
//                     <X size={18} />
//                   </button>
//                 )}
//               </div>
              
//               {/* Suggestions Dropdown */}
//               {showSuggestions && filteredSuggestions.length > 0 && (
//                 <div
//                   ref={suggestionsRef}
//                   className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
//                 >
//                   <div className="p-2 text-xs text-gray-600 font-semibold border-b border-gray-100 bg-gray-50">
//                     Suggested Samples
//                   </div>
//                   {filteredSuggestions.map((suggestion, index) => (
//                     <button
//                       key={index}
//                       type="button"
//                       onClick={() => handleSuggestionClick(suggestion)}
//                       className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors flex items-center gap-2 text-xs text-gray-900"
//                     >
//                       <FaFlask size={14} className="text-blue-500" />
//                       <span>{suggestion}</span>
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Quick Add Suggestions */}
//             {!formData.name && !selectedSample && (
//               <div className="bg-green-50 p-3 rounded-lg border border-green-100">
//                 <label className="block mb-2 text-sm font-semibold text-green-800">
//                   Quick Add
//                 </label>
//                 <div className="flex flex-wrap gap-2">
//                   {SUGGESTED_SAMPLES.slice(0, 8).map((sample, index) => (
//                     <button
//                       key={index}
//                       type="button"
//                       onClick={() => handleSuggestionClick(sample)}
//                       className="px-3 py-1.5 text-xs bg-white hover:bg-green-100 text-gray-900 rounded-lg transition-colors border border-green-200 hover:border-green-300 font-medium"
//                     >
//                       {sample}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-200">
//             <button
//               type="button"
//               onClick={handleCloseModal}
//               disabled={isSubmitting}
//               className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
//             >
//               <MdOutlineCancel size={14} className="mr-1 inline" />
//               Cancel
//             </button>
//             <button
//               type="button"
//               onClick={handleSubmit}
//               disabled={isSubmitting}
//               className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
//               style={{
//                 background: isSubmitting 
//                   ? '#9CA3AF' 
//                   : `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
//               }}
//             >
//               {selectedSample ? <RxUpdate size={14} className="mr-2" /> : <PlusIcon size={14} className="mr-2" />}
//               {selectedSample ? "Update" : "Create"}
//             </button>
//           </div>
//         </Modal>
//       </div>
//     );
//   }

//   const columns = [
//     { header: "ID", accessor: "id" as keyof SampleList },
//     { header: "Name", accessor: "name" as keyof SampleList },
//     {
//       header: "Created At",
//       accessor: "createdAt" as keyof SampleList,
//       Cell: ({ value }: { value: string }) => formatDate(value),
//     },
//     {
//       header: "Updated At",
//       accessor: "updatedAt" as keyof SampleList,
//       Cell: ({ value }: { value: string }) => formatDate(value),
//     },
//   ];

//   const paginatedData = samples.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   return (
//     <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Sample Management</h1>
//           <p className="text-sm text-gray-600 mt-1">Manage samples for {currentLab.name}</p>
//         </div>
//         <button
//           onClick={() => handleOpenModal()}
//           className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 flex items-center gap-2"
//           style={{
//             background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
//           }}
//         >
//           <PlusIcon size={18} />
//           <span>Add Sample</span>
//         </button>
//       </div>

//       {/* Stats Bar */}
//       <div className="mb-6 bg-blue-50 p-3 rounded-lg border border-blue-100">
//         <div className="flex items-center gap-2">
//           <FaFlask className="text-blue-500 text-xl" />
//           <span className="text-sm font-semibold text-blue-800">
//             Total Samples: <span className="text-blue-900 font-bold">{samples.length}</span>
//           </span>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="border border-gray-200 rounded-xl overflow-hidden">
//         <TableComponent
//           data={paginatedData}
//           columns={columns}
//           actions={(item) => (
//             <div className="flex gap-2">
//               <Button
//                 text=""
//                 onClick={() => handleOpenModal(item)}
//                 className="text-edit border border-edit hover:bg-edit hover:text-white transition-all duration-200"
//               >
//                 <span className="sr-only">Edit sample</span>
//                 <IoMdCreate size={18} />
//               </Button>
//               <Button
//                 text=""
//                 onClick={() => handleDelete(item.id)}
//                 className="text-deletebutton hover:text-white border border-red-500 hover:bg-red-600 transition-all duration-200"
//               >
//                 <span className="sr-only">Delete sample</span>
//                 <IoMdTrash size={18} />
//               </Button>
//             </div>
//           )}
//         />
//       </div>

//       {/* Pagination */}
//       {samples.length > itemsPerPage && (
//         <div className="mt-6 flex justify-center">
//           <Pagination
//             currentPage={currentPage}
//             totalPages={Math.ceil(samples.length / itemsPerPage)}
//             onPageChange={setCurrentPage}
//           />
//         </div>
//       )}

//       {/* Modal for Create/Update */}
//       <Modal
//         modalClassName="max-w-lg"
//         isOpen={isModalOpen}
//         onClose={handleCloseModal}
//         title={selectedSample ? "Edit Sample" : "Add New Sample"}
//       >
//         <div className="space-y-4 text-sm">
//           {/* Sample Name Input Section */}
//           <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
//             <label className="block mb-2 text-sm font-semibold text-blue-800">
//               Sample Name <span className="text-red-500">*</span>
//             </label>
//             <div className="relative">
//               <input
//                 ref={inputRef}
//                 type="text"
//                 name="name"
//                 value={formData.name || ""}
//                 onChange={handleChange}
//                 onFocus={() => {
//                   if (formData.name && !selectedSample) {
//                     const filtered = SUGGESTED_SAMPLES.filter(sample =>
//                       sample.toLowerCase().includes((formData.name || "").toLowerCase())
//                     );
//                     setFilteredSuggestions(filtered);
//                     setShowSuggestions(filtered.length > 0);
//                   }
//                 }}
//                 className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white pr-10"
//                 placeholder="Enter or select sample name"
//                 disabled={isSubmitting}
//                 autoFocus
//               />
//               {formData.name && (
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setFormData({ ...formData, name: "" });
//                     setShowSuggestions(false);
//                     inputRef.current?.focus();
//                   }}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
//                 >
//                   <X size={18} />
//                 </button>
//               )}
//             </div>
            
//             {/* Suggestions Dropdown */}
//             {showSuggestions && filteredSuggestions.length > 0 && (
//               <div
//                 ref={suggestionsRef}
//                 className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
//               >
//                 <div className="p-2 text-xs text-gray-600 font-semibold border-b border-gray-100 bg-gray-50">
//                   Suggested Samples
//                 </div>
//                 {filteredSuggestions.map((suggestion, index) => (
//                   <button
//                     key={index}
//                     type="button"
//                     onClick={() => handleSuggestionClick(suggestion)}
//                     className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors flex items-center gap-2 text-xs text-gray-900"
//                   >
//                     <FaFlask size={14} className="text-blue-500" />
//                     <span>{suggestion}</span>
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Quick Add Suggestions */}
//           {!formData.name && !selectedSample && (
//             <div className="bg-green-50 p-3 rounded-lg border border-green-100">
//               <label className="block mb-2 text-sm font-semibold text-green-800">
//                 Quick Add
//               </label>
//               <div className="flex flex-wrap gap-2">
//                 {SUGGESTED_SAMPLES.slice(0, 8).map((sample, index) => (
//                   <button
//                     key={index}
//                     type="button"
//                     onClick={() => handleSuggestionClick(sample)}
//                     className="px-3 py-1.5 text-xs bg-white hover:bg-green-100 text-gray-900 rounded-lg transition-colors border border-green-200 hover:border-green-300 font-medium"
//                   >
//                     {sample}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-200">
//           <button
//             type="button"
//             onClick={handleCloseModal}
//             disabled={isSubmitting}
//             className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
//           >
//             <MdOutlineCancel size={14} className="mr-1 inline" />
//             Cancel
//           </button>
//           <button
//             type="button"
//             onClick={handleSubmit}
//             disabled={isSubmitting}
//             className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
//             style={{
//               background: isSubmitting 
//                 ? '#9CA3AF' 
//                 : `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
//             }}
//           >
//             {selectedSample ? <RxUpdate size={14} className="mr-2" /> : <PlusIcon size={14} className="mr-2" />}
//             {selectedSample ? "Update" : "Create"}
//           </button>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default Page;