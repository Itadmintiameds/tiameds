// 'use client';
// import Button from "@/app/(admin)/component/common/Button";
// import Loader from "@/app/(admin)/component/common/Loader";
// import Modal from "@/app/(admin)/component/common/Model";
// import Pagination from "@/app/(admin)/component/common/Pagination";
// import TableComponent from "@/app/(admin)/component/common/TableComponent";
// import { SampleList } from "@/types/sample/sample";
// import { PlusIcon } from "lucide-react";
// import { useEffect, useState } from "react";
// import { IoMdCreate, IoMdTrash } from "react-icons/io";
// import { RxUpdate } from "react-icons/rx";
// import { toast } from "react-toastify";
// import { createSample, deleteSample, getSamples, updateSample } from "../../../../../../services/sampleServices";

// import { MdOutlineCancel } from "react-icons/md";

// const Page = () => {
//   const [samples, setSamples] = useState<SampleList[]>([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 5;

//   // Modal state
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedSample, setSelectedSample] = useState<SampleList | null>(null);
//   const [formData, setFormData] = useState<Partial<SampleList>>({ name: "" });

//   // Fetch samples
//   useEffect(() => {
//     loadSamples();
//   }, []);

//   const loadSamples = async () => {
//     try {
//       const data = await getSamples();
//       setSamples(data);
//     } catch (error) {
//       // Handle samples load error
//     }
//   };

//   // Open modal for create/update
//   const handleOpenModal = (sample?: SampleList) => {
//     if (sample) {
//       setSelectedSample(sample);
//       setFormData({ name: sample.name }); // Populate form data for update
//     } else {
//       setSelectedSample(null);
//       setFormData({ name: "" }); // Reset form for new entry
//     }
//     setIsModalOpen(true);
//   };

//   // Close modal
//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setFormData({ name: "" });
//     setSelectedSample(null);
//   };

//   // Handle form input
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // Handle create or update submission
//   const handleSubmit = async () => {
//     try {
//       if (selectedSample) {
//         // Update Sample
//         await updateSample(selectedSample.id, formData);
//         toast.success("Sample updated successfully");
//       } else {
//         // Create Sample
//         await createSample(formData);
//         toast.success("Sample created successfully");
//       }
//       loadSamples(); // Refresh data
//       handleCloseModal();
//     } catch (error: unknown) {
//       if (error instanceof Error) {
//         toast.error(error.message); // Show error message in toast
//       } else {
//         toast.error("An error occurred while processing the request.");
//       }
//     }
//   };


//   // Handle delete
//   const handleDelete = async (id: number) => {
//     if (confirm("Are you sure you want to delete this sample?")) {
//       try {
//         await deleteSample(id);
//         toast.success("Sample deleted successfully");
//         loadSamples(); // Refresh list
//       } catch (error) {
//         // Handle sample delete error
//       }
//     }
//   };

//   // Corrected time formatter
//   const formatDate = (dateString: string) => {
//     if (!dateString) return "N/A";
//     const date = new Date(dateString);
//     return date.toLocaleString(); // Formats in local date-time format
//   };

//   if (!samples.length) return <Loader />;

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
//     <div>
//       {/* Header */}
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-lg font-bold">Sample List</h1>
//         <Button
//           text="Sample"
//           className="bg-primary hover:bg-primarylight text-textzinc text-xs px-4 py-2 rounded"
//           onClick={() => handleOpenModal()}
//         >
//           <PlusIcon size={20} />
//         </Button>
//       </div>

//       {/* Table */}
//       <TableComponent
//         data={paginatedData}
//         columns={columns}
//         actions={(item) => (
//           <div className="flex gap-2">
//             <Button
//               text=""
//               onClick={() => handleOpenModal(item)}
//               className="text-edit  border border-edit hover:bg-edit hover:text-white"
//             >
//               <IoMdCreate size={20} />
//             </Button>
//             <Button
//               text=""
//               onClick={() => handleDelete(item.id)}
//               className="text-deletebutton hover:text-red-700 border border-red-500 hover:bg-deletehover hover:text-white"
//             >
//               <IoMdTrash size={20} />
//             </Button>
//           </div>
//         )}
//       />

//       {/* Pagination */}
//       <Pagination
//         currentPage={currentPage}
//         totalPages={Math.ceil(samples.length / itemsPerPage)}
//         onPageChange={setCurrentPage}
//       />

//       {/* Modal for Create/Update */}
//       <Modal
//         modalClassName="max-w-sm"

//         isOpen={isModalOpen} onClose={handleCloseModal} title={selectedSample ? "Edit Sample" : "Add Sample"}>
//         <div>
//           <label className="block mb-2 text-sm font-medium">Sample Name</label>
//           <input
//             type="text"
//             name="name"
//             value={formData.name || ""}
//             onChange={handleChange}
//             className="w-full p-2 border rounded"
//           />
//         </div>
//         <div className="mt-4 flex justify-end gap-2">
//           <Button
//             text="Cancel" className="bg-deletebutton hover:bg-red-600 text-white px-4 py-2 rounded text-xs"
//             onClick={handleCloseModal} >
//             <MdOutlineCancel size={12} />
//           </Button>
//           <Button
//             text={selectedSample ? "Update" : "Create"}
//             className="bg-primary hover:bg-primarylight text-white px-4 py-2 rounded text-xs"
//             onClick={handleSubmit}
//           >
//             {selectedSample ? <RxUpdate size={12} /> : <PlusIcon size={12} />}
//           </Button>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default Page;




'use client';
import Button from "@/app/(admin)/component/common/Button";
import Loader from "@/app/(admin)/component/common/Loader";
import Modal from "@/app/(admin)/component/common/Model";
import Pagination from "@/app/(admin)/component/common/Pagination";
import TableComponent from "@/app/(admin)/component/common/TableComponent";
import { SampleList } from "@/types/sample/sample";
import { PlusIcon, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { IoMdCreate, IoMdTrash } from "react-icons/io";
import { RxUpdate } from "react-icons/rx";
import { MdOutlineCancel } from "react-icons/md";
import { FaFlask, FaInbox } from "react-icons/fa";
import { toast } from "react-toastify";
import { createSample, deleteSample, getSamples, updateSample } from "../../../../../../services/sampleServices";
import { useLabs } from "@/context/LabContext";

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
  const [samples, setSamples] = useState<SampleList[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 5;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState<SampleList | null>(null);
  const [formData, setFormData] = useState<Partial<SampleList>>({ name: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch samples
  useEffect(() => {
    if (currentLab?.id) {
      loadSamples();
    }
  }, [currentLab?.id]);

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

  // Handle form input with suggestions
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    
    // Filter suggestions based on input
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
        // Update Sample
        await updateSample(currentLab.id, selectedSample.id, formData);
        toast.success("Sample updated successfully", { autoClose: 2000 });
      } else {
        // Create Sample
        await createSample(currentLab.id, formData);
        toast.success("Sample created successfully", { autoClose: 2000 });
      }
      loadSamples();
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

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!currentLab?.id) {
      toast.error("Please select a lab first", { autoClose: 3000 });
      return;
    }

    if (confirm("Are you sure you want to delete this sample?")) {
      try {
        await deleteSample(currentLab.id, id);
        toast.success("Sample deleted successfully", { autoClose: 2000 });
        loadSamples();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete sample';
        toast.error(errorMessage, { autoClose: 5000 });
      }
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Show loading state
  if (isLoading) {
    return <Loader />;
  }

  // Show message if no lab is selected
  if (!currentLab?.id) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Lab Selected</h2>
          <p className="text-gray-500">Please select a lab to manage samples.</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (samples.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Sample Management</h1>
            <p className="text-sm text-gray-600 mt-1">Manage samples for {currentLab.name}</p>
          </div>
          <Button
            text="Add Sample"
            className="bg-primary hover:bg-primarylight text-white text-sm px-5 py-2.5 rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2"
            onClick={() => handleOpenModal()}
          >
            <PlusIcon size={18} />
            <span>Add Sample</span>
          </Button>
        </div>

        {/* No Data State */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gray-200 rounded-full">
                <FaInbox className="text-4xl text-gray-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Data</h3>
            <p className="text-sm text-gray-500 mb-6">No samples have been added for this lab yet.</p>
            <Button
              text="Add Sample"
              className="bg-primary hover:bg-primarylight text-white text-sm px-6 py-2.5 rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2 mx-auto"
              onClick={() => handleOpenModal()}
            >
              <PlusIcon size={18} />
              <span>Add Sample</span>
            </Button>
          </div>
        </div>

        {/* Modal for Create/Update */}
        <Modal
          modalClassName="max-w-lg"
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={selectedSample ? "Edit Sample" : "Add New Sample"}
        >
          <div className="space-y-4">
            <div className="relative">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Sample Name <span className="text-red-500">*</span>
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              
              {/* Suggestions Dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                  <div className="p-2 text-xs text-gray-500 font-medium border-b border-gray-100">
                    Suggested Samples
                  </div>
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-2.5 hover:bg-primary hover:text-white transition-colors flex items-center gap-2"
                    >
                      <FaFlask size={14} className="text-gray-400" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Add Suggestions */}
            {!formData.name && !selectedSample && (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Quick Add
                </label>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_SAMPLES.slice(0, 8).map((sample, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(sample)}
                      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-primary hover:text-white rounded-md transition-colors border border-gray-200 hover:border-primary"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              text="Cancel"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm transition-all duration-200"
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              <MdOutlineCancel size={14} className="mr-1" />
              Cancel
            </Button>
            <Button
              text={selectedSample ? "Update" : "Create"}
              className="bg-primary hover:bg-primarylight text-white px-5 py-2.5 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {selectedSample ? <RxUpdate size={14} /> : <PlusIcon size={14} />}
              {selectedSample ? "Update" : "Create"}
            </Button>
          </div>
        </Modal>
      </div>
    );
  }

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
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sample Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage samples for {currentLab.name}</p>
        </div>
        <Button
          text="Add Sample"
          className="bg-primary hover:bg-primarylight text-white text-sm px-5 py-2.5 rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2"
          onClick={() => handleOpenModal()}
        >
          <PlusIcon size={18} />
          <span>Add Sample</span>
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-center gap-2">
          <FaFlask className="text-primary text-xl" />
          <span className="text-sm font-medium text-gray-700">
            Total Samples: <span className="text-primary font-bold">{samples.length}</span>
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <TableComponent
          data={paginatedData}
          columns={columns}
          actions={(item) => (
            <div className="flex gap-2">
              <Button
                text=""
                onClick={() => handleOpenModal(item)}
                className="text-edit border border-edit hover:bg-edit hover:text-white transition-all duration-200"
                title="Edit sample"
              >
                <IoMdCreate size={18} />
              </Button>
              <Button
                text=""
                onClick={() => handleDelete(item.id)}
                className="text-deletebutton hover:text-white border border-red-500 hover:bg-red-600 transition-all duration-200"
                title="Delete sample"
              >
                <IoMdTrash size={18} />
              </Button>
            </div>
          )}
        />
      </div>

      {/* Pagination */}
      {samples.length > itemsPerPage && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(samples.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Modal for Create/Update */}
      <Modal
        modalClassName="max-w-lg"
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedSample ? "Edit Sample" : "Add New Sample"}
      >
        <div className="space-y-4">
          <div className="relative">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Sample Name <span className="text-red-500">*</span>
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            {/* Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                <div className="p-2 text-xs text-gray-500 font-medium border-b border-gray-100">
                  Suggested Samples
                </div>
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-2.5 hover:bg-primary hover:text-white transition-colors flex items-center gap-2"
                  >
                    <FaFlask size={14} className="text-gray-400" />
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Add Suggestions */}
          {!formData.name && !selectedSample && (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Quick Add
              </label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_SAMPLES.slice(0, 8).map((sample, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(sample)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-primary hover:text-white rounded-md transition-colors border border-gray-200 hover:border-primary"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            text="Cancel"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm transition-all duration-200"
            onClick={handleCloseModal}
            disabled={isSubmitting}
          >
            <MdOutlineCancel size={14} className="mr-1" />
            Cancel
          </Button>
          <Button
            text={selectedSample ? "Update" : "Create"}
            className="bg-primary hover:bg-primarylight text-white px-5 py-2.5 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {selectedSample ? <RxUpdate size={14} /> : <PlusIcon size={14} />}
            {selectedSample ? "Update" : "Create"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Page;