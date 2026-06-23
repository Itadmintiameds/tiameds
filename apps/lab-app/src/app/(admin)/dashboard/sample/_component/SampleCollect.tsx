"use client";

import Loader from "@/app/(admin)/component/common/Loader";
import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { getSamples } from "../../../../../../services/sampleServices";
import { useLabs } from "@/context/LabContext";
import { HiBeaker, HiOutlineBeaker, HiPlus, HiChevronDown } from "react-icons/hi2";
import { Listbox } from "@headlessui/react";

interface Sample {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface SampleCollectProps {
  visitId: number;
  samples: string[];
  setSamples: (value: string[]) => void;
  handleVititSample: () => void;
  loading: boolean;
  setShowModal?: (value: boolean) => void;
  onClose?: () => void;
}

const SampleCollect: React.FC<SampleCollectProps> = ({
  samples,
  setSamples,
  handleVititSample,
  loading,
  onClose,
}) => {
  const { currentLab } = useLabs();

  const [allSamples, setAllSamples] = useState<Sample[]>([]);
  const [selectedSample, setSelectedSample] = useState<string>("");

  useEffect(() => {
    const fetchSamples = async () => {
      if (!currentLab?.id) {
        setAllSamples([]);
        return;
      }

      try {
        const data = await getSamples(currentLab.id);

        const normalized: Sample[] = data.map((sample) => ({
          ...sample,
          id: sample.id.toString(),
        }));

        setAllSamples(normalized);
      } catch (error) {
        setAllSamples([]);
      }
    };

    fetchSamples();
  }, [currentLab?.id]);

  const handleAddSample = () => {
    if (selectedSample && !samples.includes(selectedSample)) {
      setSamples([...samples, selectedSample]);
      setSelectedSample("");
    }
  };

  const handleDeleteSample = (index: number) => {
    setSamples(samples.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    setSamples([]);
    setSelectedSample("");

    if (onClose) {
      onClose();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader
          type="progress"
          fullScreen={false}
          text="Loading sample types..."
        />
        <p className="mt-4 text-sm text-gray-500">
          Fetching available samples...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Sample Section */}
      <div className="bg-info-50 rounded-xl p-4">
        <h4 className="flex items-center gap-2 text-label-l3 font-medium text-pneutral-900 mb-3">
          <HiOutlineBeaker size={18} />
          Add Sample
        </h4>

        <div className="flex items-center gap-3">
            <div className="relative flex-1">
  <Listbox value={selectedSample} onChange={setSelectedSample}>
    <div className="relative">
      
      {/* Button */}
      <Listbox.Button className="
        w-full
        h-11
        rounded-full
        border
        border-pneutral-300
        bg-white
        pl-4
        pr-10
        text-left
        text-p2
        text-pneutral-900
        focus:outline-none
      ">
        {selectedSample || "Select Sample Type"}
      </Listbox.Button>

      {/* Icon */}
      <HiChevronDown
        size={20}
        className="
          absolute
          right-4
          top-1/2
          -translate-y-1/2
          text-pneutral-900
          pointer-events-none
        "
      />

      {/* Options */}
      <Listbox.Options className="
        absolute
        z-50
        max-h-60
        w-full
        overflow-auto
        rounded-xl
        bg-white
        border
        border-pneutral-200
        shadow-lg
      ">
        {allSamples.map((sample) => (
          <Listbox.Option
            key={sample.id}
            value={sample.name}
            className={({ active }) => `
              cursor-pointer
              px-4
              py-2
              text-sm
              ${active ? "bg-info-100" : ""}
            `}
          >
            {sample.name}
          </Listbox.Option>
        ))}
      </Listbox.Options>

    </div>
  </Listbox>
</div>
          

          <button
            onClick={handleAddSample}
            disabled={!selectedSample}
            className="
              h-11
              px-7
              rounded-full
              text-pneutral-50
              text-label-l3 
              font-medium
              flex
              items-center
              gap-2
              transition-all
              disabled:cursor-not-allowed
              bg-secondary-700
            "
          >
            <HiPlus size={16} strokeWidth={3} />
            Add
          </button>
        </div>
      </div>

      {/* Collected Samples */}
      <div className="bg-info-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="flex items-center gap-2 text-label-l3 font-medium text-pneutral-900">
            <HiBeaker size={20} />
            Collected Samples
          </h4>

          <span
            className="
              px-3
              py-1
              rounded-full
              text-label-l3
              font-medium
              bg-success-50
              text-success-800
              border
              border-success-600
            "
          >
            {samples.length} collected
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 min-h-[80px]">
          {samples.length === 0 ? (
            <p className="text-sm text-gray-500">
              No samples added yet. Select a sample type and click
              &nbsp;&quot;Add&quot;&nbsp;to get started.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {samples.map((sample, index) => (
                <div
                  key={index}
                  className="
                    flex
                    items-center
                    gap-2
                    px-3
                    py-1.5
                    rounded-full
                    bg-danger-100
                    text-pneutral-900
                    text-p2
                    font-medium
                  "
                >
                  <span>{sample}</span>

                  <button
                    onClick={() => handleDeleteSample(index)}
                    className="
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <IoClose size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Buttons */}
      {samples.length > 0 && (
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={handleCancel}
            className="
              min-w-[110px]
              h-11
              rounded-full
              border-[1.5px]
              border-pneutral-900
              bg-white
              text-pneutral-900
              text-label-l3
              font-medium
            "
          >
            Cancel
          </button>

          <button
            onClick={handleVititSample}
            className="
              min-w-[110px]
              h-11
              rounded-full
              bg-pneutral-900
              text-pneutral-50
              text-label-l3
              font-medium
            "
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default SampleCollect;








// code is working but without dropdown bug...................
// "use client";

// import Loader from "@/app/(admin)/component/common/Loader";
// import React, { useEffect, useState } from "react";
// import { IoClose } from "react-icons/io5";
// import { getSamples } from "../../../../../../services/sampleServices";
// import { useLabs } from "@/context/LabContext";
// import { HiBeaker, HiOutlineBeaker, HiPlus, HiChevronDown } from "react-icons/hi2";
// import { Listbox } from "@headlessui/react";

// interface Sample {
//   id: string;
//   name: string;
//   createdAt: string;
//   updatedAt: string;
// }

// interface SampleCollectProps {
//   visitId: number;
//   samples: string[];
//   setSamples: (value: string[]) => void;
//   handleVititSample: () => void;
//   loading: boolean;
//   setShowModal?: (value: boolean) => void;
//   onClose?: () => void;
// }

// const SampleCollect: React.FC<SampleCollectProps> = ({
//   samples,
//   setSamples,
//   handleVititSample,
//   loading,
//   onClose,
// }) => {
//   const { currentLab } = useLabs();

//   const [allSamples, setAllSamples] = useState<Sample[]>([]);
//   const [selectedSample, setSelectedSample] = useState<string>("");

//   useEffect(() => {
//     const fetchSamples = async () => {
//       if (!currentLab?.id) {
//         setAllSamples([]);
//         return;
//       }

//       try {
//         const data = await getSamples(currentLab.id);

//         const normalized: Sample[] = data.map((sample) => ({
//           ...sample,
//           id: sample.id.toString(),
//         }));

//         setAllSamples(normalized);
//       } catch (error) {
//         setAllSamples([]);
//       }
//     };

//     fetchSamples();
//   }, [currentLab?.id]);

//   const handleAddSample = () => {
//     if (selectedSample && !samples.includes(selectedSample)) {
//       setSamples([...samples, selectedSample]);
//       setSelectedSample("");
//     }
//   };

//   const handleDeleteSample = (index: number) => {
//     setSamples(samples.filter((_, i) => i !== index));
//   };

//   const handleCancel = () => {
//     setSamples([]);
//     setSelectedSample("");

//     if (onClose) {
//       onClose();
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center py-8">
//         <Loader
//           type="progress"
//           fullScreen={false}
//           text="Loading sample types..."
//         />
//         <p className="mt-4 text-sm text-gray-500">
//           Fetching available samples...
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {/* Add Sample Section */}
//       <div className="bg-info-50 rounded-xl p-4">
//         <h4 className="flex items-center gap-2 text-label-l3 font-medium text-pneutral-900 mb-3">
//           <HiOutlineBeaker size={18} />
//           Add Sample
//         </h4>

//         <div className="flex items-center gap-3">
//             <div className="relative flex-1">
// <select
//             value={selectedSample}
//             onChange={(e) => setSelectedSample(e.target.value)}
//             className="
//               w-full
//               h-11
//               rounded-full
//               border
//               border-pneutral-300
//               bg-white
//               appearance-none
//               pl-4
//               pr-10
//               text-p2
//               text-pneutral-900
//               focus:outline-none
//             "
//           >
//             <option value="">Select Sample Type</option>

//             {allSamples.map((sample) => (
//               <option key={sample.id} value={sample.name}>
//                 {sample.name}
//               </option>
//             ))}
//           </select>
//           <HiChevronDown
//     size={20}
//     className="
//       absolute
//       right-4
//       top-1/2
//       -translate-y-1/2
//       text-pneutral-900
//       pointer-events-none
//     "
//   />
//             </div>
          

//           <button
//             onClick={handleAddSample}
//             disabled={!selectedSample}
//             className="
//               h-11
//               px-7
//               rounded-full
//               text-pneutral-50
//               text-label-l3 
//               font-medium
//               flex
//               items-center
//               gap-2
//               transition-all
//               disabled:cursor-not-allowed
//               bg-secondary-700
//             "
//           >
//             <HiPlus size={16} strokeWidth={3} />
//             Add
//           </button>
//         </div>
//       </div>

//       {/* Collected Samples */}
//       <div className="bg-info-50 rounded-xl p-4">
//         <div className="flex items-center justify-between mb-4">
//           <h4 className="flex items-center gap-2 text-label-l3 font-medium text-pneutral-900">
//             <HiBeaker size={20} />
//             Collected Samples
//           </h4>

//           <span
//             className="
//               px-3
//               py-1
//               rounded-full
//               text-label-l3
//               font-medium
//               bg-success-50
//               text-success-800
//               border
//               border-success-600
//             "
//           >
//             {samples.length} collected
//           </span>
//         </div>

//         <div className="bg-white rounded-xl p-4 min-h-[80px]">
//           {samples.length === 0 ? (
//             <p className="text-sm text-gray-500">
//               No samples added yet. Select a sample type and click
//               &nbsp;&quot;Add&quot;&nbsp;to get started.
//             </p>
//           ) : (
//             <div className="flex flex-wrap gap-2">
//               {samples.map((sample, index) => (
//                 <div
//                   key={index}
//                   className="
//                     flex
//                     items-center
//                     gap-2
//                     px-3
//                     py-1.5
//                     rounded-full
//                     bg-danger-100
//                     text-pneutral-900
//                     text-p2
//                     font-medium
//                   "
//                 >
//                   <span>{sample}</span>

//                   <button
//                     onClick={() => handleDeleteSample(index)}
//                     className="
//                       flex
//                       items-center
//                       justify-center
//                     "
//                   >
//                     <IoClose size={20} />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Footer Buttons */}
//       {samples.length > 0 && (
//         <div className="flex justify-end gap-3 pt-2">
//           <button
//             onClick={handleCancel}
//             className="
//               min-w-[110px]
//               h-11
//               rounded-full
//               border
//               border-gray-400
//               bg-white
//               text-gray-700
//               text-sm
//               font-medium
//               hover:bg-gray-50
//             "
//           >
//             Cancel
//           </button>

//           <button
//             onClick={handleVititSample}
//             className="
//               min-w-[110px]
//               h-11
//               rounded-full
//               bg-black
//               text-white
//               text-sm
//               font-medium
//               hover:opacity-90
//             "
//           >
//             Submit
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SampleCollect;














































// code done by abhishek.......................(do not change)...............

// import Loader from "@/app/(admin)/component/common/Loader";
// import React, { useEffect, useState } from "react";
// import { FaPlusCircle, FaTrashAlt} from "react-icons/fa";
// import { TbTestPipe2Filled } from "react-icons/tb";
// import { getSamples } from "../../../../../../services/sampleServices";
// import { useLabs } from "@/context/LabContext";

// interface Sample {
//     id: string;
//     name: string;
//     createdAt: string;
//     updatedAt: string;
// }

// interface SampleCollectProps {
//     visitId: number;
//     samples: string[];
//     setSamples: (value: string[]) => void;
//     handleVititSample: () => void;
//     loading: boolean;
//     setShowModal?: (value: boolean) => void;
//     onClose?: () => void;
// }

// const SampleCollect: React.FC<SampleCollectProps> = ({
//     samples,
//     setSamples,
//     handleVititSample,
//     loading,
//     onClose,
// }) => {
//     const { currentLab } = useLabs();
//     const handleCancel = () => {
//         // Clear any selected samples when canceling
//         setSamples([]);
//         setSelectedSample("");
//         // Call the onClose function if provided
//         if (onClose) {
//             onClose();
//         }
//     };
//     const [allSamples, setAllSamples] = useState<Sample[]>([]);
//     const [selectedSample, setSelectedSample] = useState<string>("");

//     useEffect(() => {
//         const fetchSamples = async () => {
//             if (!currentLab?.id) {
//                 setAllSamples([]);
//                 return;
//             }
//             try {
//                 const data = await getSamples(currentLab.id);
//                 const normalized: Sample[] = data.map(sample => ({
//                     ...sample,
//                     id: sample.id.toString(),
//                 }));
//                 setAllSamples(normalized);
//             } catch (error) {
//                 setAllSamples([]);
//             }
//         };

//         fetchSamples();
//     }, [currentLab?.id]);

//     const handleAddSample = () => {
//         if (selectedSample && !samples.includes(selectedSample)) {
//             setSamples([...samples, selectedSample]);
//             setSelectedSample("");
//         }
//     };

//     const handleDeleteSample = (index: number) => {
//         setSamples(samples.filter((_, i) => i !== index));
//     };

//     const handleClearAll = () => {
//         setSamples([]);
//     };

//     if (loading) {
//         return (
//             <div className="flex flex-col items-center justify-center p-6">
//                 <Loader type="progress" fullScreen={false} text="Loading sample types..." />
//                 <p className="mt-4 text-sm text-gray-600">Fetching available samples...</p>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-4 text-sm">
//             {/* Add Sample Section */}
//             <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
//                 <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
//                     <TbTestPipe2Filled className="mr-2 text-blue-500" size={16} />
//                     Add Sample
//                 </h4>
//                 <div className="flex items-center gap-2">
//                     <select
//                         value={selectedSample}
//                         onChange={(e) => setSelectedSample(e.target.value)}
//                         className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
//                     >
//                         <option value="">Select sample type</option>
//                         {allSamples.map((sample) => (
//                             <option key={sample.id} value={sample.name}>
//                                 {sample.name}
//                             </option>
//                         ))}
//                     </select>
//                     <button
//                         onClick={handleAddSample}
//                         disabled={!selectedSample}
//                         className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
//                         style={{
//                             background: !selectedSample 
//                                 ? '#9CA3AF' 
//                                 : `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
//                         }}
//                     >
//                         <FaPlusCircle className="w-4 h-4 mr-2" />
//                         Add
//                     </button>
//                 </div>
//             </div>

//             {/* Collected Samples List */}
//             <div className="bg-green-50 p-3 rounded-lg border border-green-100">
//                 <div className="flex justify-between items-center mb-2">
//                     <h4 className="font-semibold text-green-800 flex items-center">
//                         <TbTestPipe2Filled className="mr-2 text-green-500" size={16} />
//                         Collected Samples
//                     </h4>
//                     <span className="text-xs font-medium text-green-600 bg-white px-2 py-1 rounded-full border border-green-200">
//                         {samples.length} collected
//                     </span>
//                 </div>
//                 {samples.length === 0 ? (
//                     <div className="text-center py-4 text-gray-600 bg-white rounded-lg border border-gray-200">
//                         <p className="text-xs">No samples added yet. Select a sample type and click &ldquo;Add&rdquo; to get started.</p>
//                     </div>
//                 ) : (
//                     <div className="space-y-1 max-h-48 overflow-y-auto">
//                         {samples.map((sample, index) => (
//                             <div key={index} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
//                                 <div className="flex items-center flex-1 min-w-0">
//                                     <TbTestPipe2Filled className="text-green-500 mr-2 text-sm flex-shrink-0" />
//                                     <span className="text-xs font-medium text-gray-900 truncate">{sample}</span>
//                                 </div>
//                                 <button
//                                     onClick={() => handleDeleteSample(index)}
//                                     className="text-red-600 hover:text-red-800 p-1 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0 ml-2"
//                                     title="Delete sample"
//                                 >
//                                     <FaTrashAlt className="w-4 h-4" />
//                                 </button>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>

//             {/* Action Buttons */}
//             <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
//                 {samples.length > 0 && (
//                     <button
//                         onClick={handleClearAll}
//                         className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 border border-gray-200"
//                     >
//                         Clear All
//                     </button>
//                 )}
//                 <button
//                     onClick={handleCancel}
//                     className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
//                 >
//                     Cancel
//                 </button>
//                 <button
//                     onClick={handleVititSample}
//                     disabled={samples.length === 0}
//                     className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
//                     style={{
//                         background: samples.length === 0 
//                             ? '#9CA3AF' 
//                             : `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
//                     }}
//                 >
//                     Submit Samples
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default SampleCollect;