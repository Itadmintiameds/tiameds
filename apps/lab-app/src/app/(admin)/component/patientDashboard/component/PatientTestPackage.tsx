// import { TestList } from '@/types/test/testlist';
// import { useState } from 'react';
// import { FaBoxOpen, FaEye, FaEyeSlash, FaFlask, FaSearch, FaTimes, FaTrashAlt, FaListUl } from 'react-icons/fa';
// import Modal from '../../common/Model';

// interface Package {
//   id: number;
//   packageName: string;
//   price: number;
//   discount?: number;
//   tests?: TestList[];
// }

// interface PatientTestPackageProps {
//   categories: string[];
//   tests: TestList[];
//   packages: Package[];
//   selectedTests: TestList[];
//   selectedPackages: Package[];
//   setSelectedTests: React.Dispatch<React.SetStateAction<TestList[]>>;
//   setSelectedPackages: React.Dispatch<React.SetStateAction<Package[]>>;
//   selectedCategory: string;
//   handleCategoryChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
//   searchTestTerm: string;
//   handleTestSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
//   filteredTests: TestList[];
//   handleTestSelection: (test: TestList) => void;
//   handlePackageSelection: (pkg: Package) => void;
//   removeTest: (testId: string) => void;
//   removePackage: (packageId: string) => void;
//   handleTestDiscountChange: (testId: number, field: 'percent' | 'amount', value: number) => void;
// }

// const PatientTestPackage: React.FC<PatientTestPackageProps> = ({
//   categories,
//   packages,
//   selectedTests,
//   selectedPackages,
//   setSelectedTests,
//   setSelectedPackages,
//   selectedCategory,
//   handleCategoryChange,
//   searchTestTerm,
//   handleTestSearch,
//   filteredTests,
//   handleTestSelection,
//   handlePackageSelection,
//   removeTest,
//   removePackage,
// }) => {
//   const [showTestList, setShowTestList] = useState(false);
//   const [showPackageList, setShowPackageList] = useState(false);
//   const [searchPackageTerm, setSearchPackageTerm] = useState('');
//   const [showPackageTestList, setShowPackageTestList] = useState(false);
//   const [selectedPackageDetails, setSelectedPackageDetails] = useState<Package | null>(null);

//   const handleRemoveTest = (testId: string) => {
//     setSelectedTests(selectedTests.filter((test) => test.id !== Number(testId)));
//   };

//   const handleRemovePackage = (packageId: string) => {
//     setSelectedPackages(selectedPackages.filter((pkg) => pkg.id !== Number(packageId)));
//   };

//   const handlePackageSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchPackageTerm(event.target.value);
//   };

//   const handleTestDiscountChange = (testId: number, field: 'percent' | 'amount', value: number) => {
//     setSelectedTests(prevTests =>
//       prevTests.map(test => {
//         if (test.id === testId) {
//           let discountAmount = test.discountAmount || 0;
//           let discountPercent = test.discountPercent || 0;
//           const price = test.price;

//           if (field === 'percent') {
//             discountPercent = Math.min(100, Math.max(0, value)); // Clamp between 0-100
//             discountAmount = (price * discountPercent) / 100;
//           } else {
//             discountAmount = Math.min(price, Math.max(0, value)); // Clamp between 0-price
//             discountPercent = (discountAmount / price) * 100;
//           }

//           return {
//             ...test,
//             discountAmount,
//             discountPercent,
//             discountedPrice: price - discountAmount
//           };
//         }
//         return test;
//       })
//     );
//   };

//   const handleViewTestInPackage = (pkg: Package) => {
//     console.log('Package:', pkg);
//     setSelectedPackageDetails(pkg);
//     setShowPackageTestList(true);
//   };

//   const filteredPackages = searchPackageTerm
//     ? packages.filter(pkg =>
//       pkg.packageName.toLowerCase().includes(searchPackageTerm.toLowerCase()))
//     : packages;

//   return (
//     <>
//       <div className="space-y-4 p-3 bg-white rounded-lg border border-gray-200 shadow-xs my-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {/* Available Tests */}
//           <div className="space-y-2">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <h3 className="text-xs font-medium text-gray-700 flex items-center">
//                   <FaFlask className="mr-1.5 text-blue-500" />
//                   Available Tests
//                 </h3>
//                 <button
//                   onClick={() => setShowTestList(!showTestList)}
//                   className="ml-2 text-xs text-blue-500 flex items-center"
//                 >
//                   {showTestList ? <FaEyeSlash className="mr-1" /> : <FaEye className="mr-1" />}
//                   {showTestList ? 'Hide List' : 'Show List'}
//                 </button>
//               </div>
//               <div className="flex gap-2">
//                 <select
//                   className="border border-gray-300 p-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 w-28"
//                   value={selectedCategory}
//                   onChange={handleCategoryChange}
//                 >
//                   <option value="">All</option>
//                   {categories.map((category) => (
//                     <option key={category} value={category}>
//                       {category}
//                     </option>
//                   ))}
//                 </select>

//                 <div className="relative">
//                   <input
//                     type="text"
//                     className="border border-gray-300 p-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 pl-7 w-32"
//                     placeholder="Search"
//                     value={searchTestTerm}
//                     onChange={handleTestSearch}
//                   />
//                   <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
//                 </div>
//               </div>
//             </div>

//             <div className="border rounded-lg overflow-hidden bg-white">
//               {filteredTests.length > 0 || searchTestTerm ? (
//                 <div className="overflow-y-auto max-h-40 space-y-1 p-1">
//                   {(showTestList || searchTestTerm) ? filteredTests.map((test) => (
//                     <div
//                       key={test.id}
//                       className={`flex items-center justify-between p-1.5 rounded text-xs ${selectedTests.some((t) => t.id === test.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
//                     >
//                       <div className="flex items-center">
//                         <input
//                           type="checkbox"
//                           className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
//                           checked={selectedTests.some((t) => t.id === test.id)}
//                           onChange={() => handleTestSelection(test)}
//                         />
//                         <div>
//                           <p className="font-medium">{test.name}</p>
//                           <p className="text-gray-500 text-[0.65rem]">{test.category}</p>
//                         </div>
//                       </div>
//                       <p className="font-medium">₹{test.price}</p>
//                     </div>
//                   )) : (
//                     <div className="p-4 text-center text-gray-500 text-xs">
//                       <p>Test list is hidden. Search for tests or click "Show List"</p>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="p-4 text-center text-gray-500 text-xs flex flex-col items-center">
//                   <FaFlask className="text-gray-300 text-lg mb-1" />
//                   {searchTestTerm ? (
//                     <>
//                       <p>No tests found for "{searchTestTerm}"</p>
//                       <button
//                         onClick={() => handleTestSearch({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)}
//                         className="text-blue-500 text-[0.65rem] mt-1 flex items-center"
//                       >
//                         <FaTimes className="mr-1" /> Clear search
//                       </button>
//                     </>
//                   ) : (
//                     <p>No tests available</p>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Available Packages */}
//           <div className="space-y-2">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <h3 className="text-xs font-medium text-gray-700 flex items-center">
//                   <FaBoxOpen className="mr-1.5 text-blue-500" />
//                   Available Packages
//                 </h3>
//                 <button
//                   onClick={() => setShowPackageList(!showPackageList)}
//                   className="ml-2 text-xs text-blue-500 flex items-center"
//                 >
//                   {showPackageList ? <FaEyeSlash className="mr-1" /> : <FaEye className="mr-1" />}
//                   {showPackageList ? 'Hide List' : 'Show List'}
//                 </button>
//               </div>
//               <div className="relative">
//                 <input
//                   type="text"
//                   className="border border-gray-300 p-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 pl-7 w-32"
//                   placeholder="Search"
//                   value={searchPackageTerm}
//                   onChange={handlePackageSearch}
//                 />
//                 <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
//               </div>
//             </div>

//             <div className="border rounded-lg overflow-hidden bg-white">
//               {filteredPackages.length > 0 || searchPackageTerm ? (
//                 <div className="overflow-y-auto max-h-40 space-y-1 p-1">
//                   {(showPackageList || searchPackageTerm) ? filteredPackages.map((pkg) => (
//                     <div
//                       key={pkg.id}
//                       className={`flex items-center justify-between p-1.5 rounded text-xs ${selectedPackages.some((p) => p.id === pkg.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
//                     >
//                       <div className="flex items-center">
//                         <input
//                           type="checkbox"
//                           className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
//                           checked={selectedPackages.some((p) => p.id === pkg.id)}
//                           onChange={() => handlePackageSelection(pkg)}
//                         />
//                         <p className="font-medium">{pkg.packageName}</p>
//                       </div>
//                       <p className="font-medium">₹{pkg.price}</p>
//                       <p className='' >{pkg.discount}% Off </p> 
//                       <FaListUl
//                         onClick={() => handleViewTestInPackage(pkg)}
//                       />
//                     </div>
//                   )) : (
//                     <div className="p-4 text-center text-gray-500 text-xs">
//                       <p>Package list is hidden. Search for packages or click "Show List"</p>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="p-4 text-center text-gray-500 text-xs flex flex-col items-center">
//                   <FaBoxOpen className="text-gray-300 text-lg mb-1" />
//                   {searchPackageTerm ? (
//                     <>
//                       <p>No packages found for "{searchPackageTerm}"</p>
//                       <button
//                         onClick={() => setSearchPackageTerm('')}
//                         className="text-blue-500 text-[0.65rem] mt-1 flex items-center"
//                       >
//                         <FaTimes className="mr-1" /> Clear search
//                       </button>
//                     </>
//                   ) : (
//                     <p>No packages available</p>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Selected Tests */}
//           {selectedTests.length > 0 && (
//             <div className="space-y-2">
//               <h3 className="text-xs font-medium text-gray-700">Selected Tests ({selectedTests.length})</h3>
//               <div className="border rounded-lg overflow-hidden bg-white">
//                 <div className="overflow-y-auto max-h-40 space-y-1 p-1">
//                   {selectedTests.map((test) => (
//                     <div key={test.id} className="p-1.5 rounded text-xs hover:bg-gray-50">
//                       <div className="flex justify-between items-center gap-2">
//                         {/* Test Info */}
//                         <div className="flex-1 min-w-0">
//                           <p className="font-medium truncate">{test.name}</p>
//                           <p className="text-gray-500 text-[0.65rem] truncate">{test.category}</p>
//                         </div>

//                         {/* Price Display */}
//                         <div className="flex flex-col items-end w-20">
//                           {test.discountAmount ? (
//                             <>
//                               <p className="line-through text-gray-400 text-[0.65rem]">₹{test.price}</p>
//                               <p className="font-medium">₹{test.discountedPrice}</p>
//                             </>
//                           ) : (
//                             <p className="font-medium">₹{test.price}</p>
//                           )}
//                         </div>

//                         {/* Discount Controls */}
//                         <div className="flex items-center space-x-1 w-40">
//                           <div className="flex items-center">
//                             <span className="text-[1rem] mr-1">%:</span>
//                             <input
//                               type="number"
//                               min="0"
//                               max="100"
//                               className="w-12 border border-gray-300 rounded px-1 text-xs"
//                               value={test.discountPercent || 0}
//                               onChange={(e) =>
//                                 handleTestDiscountChange(test.id, 'percent', parseFloat(e.target.value) || 0)
//                               }
//                             />
//                           </div>
//                           <div className="flex items-center">
//                             <span className="text-[1rem] text-zinc-900 mr-1">₹:</span>
//                             <input
//                               type="number"
//                               min="0"
//                               max={test.price}
//                               className="w-16 border border-gray-300 rounded px-1  text-xs"
//                               value={test.discountAmount || 0}
//                               onChange={(e) =>
//                                 handleTestDiscountChange(test.id, 'amount', parseFloat(e.target.value) || 0)
//                               }
//                             />
//                           </div>
//                         </div>

//                         {/* Delete Button */}
//                         <button
//                           onClick={() => removeTest(test.id.toString())}
//                           className="text-red-500 hover:text-red-700 p-1"
//                         >
//                           <FaTrashAlt className="text-xs" />
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Selected Packages */}
//           {selectedPackages.length > 0 && (
//             <div className="space-y-2">
//               <h3 className="text-xs font-medium text-gray-700">Selected Packages ({selectedPackages.length})</h3>
//               <div className="border rounded-lg overflow-hidden bg-white">
//                 <div className="overflow-y-auto max-h-40 space-y-1 p-1">
//                   {selectedPackages.map((pkg) => (
//                     <div key={pkg.id} className="flex items-center justify-between p-1.5 rounded text-xs hover:bg-gray-50">
//                       <p className="font-medium">{pkg.packageName}</p>
//                       <div className="flex items-center">
//                         <p className="font-medium mr-2">₹{pkg.price}</p>
//                         <button
//                           onClick={() => removePackage(pkg.id.toString())}
//                           className="text-red-500 hover:text-red-700 p-1"
//                         >
//                           <FaTrashAlt className="text-xs" />
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//         {
//           showPackageTestList && (
//             <Modal
//               isOpen={showPackageTestList}
//               onClose={() => {
//                 setShowPackageTestList(false);
//                 setSelectedPackageDetails(null);
//               }}
//               title=""
//               modalClassName='max-w-lg'
//             >
//               <h2 className="text-lg font-semibold text-blue-600 mb-2">{selectedPackageDetails?.packageName} </h2>
//               <div className="overflow-y-auto max-h-40 space-y-1 p-1">
//                 {selectedPackageDetails?.tests?.map((test) => (
//                   <div key={test.id} className="p-0.5 rounded bg-white shadow-md hover:shadow-lg">
                    
//                     <div className="flex justify-between items-center">
//                       {/* Test Info */}
//                       <div className="flex-1 min-w-0">
//                         <p className="font-semibold text-xs truncate">{test.name}</p>
//                         <p className="text-blue-500 text-xs truncate">{test.category}</p>
//                       </div>

//                       {/* Price Display */}
//                       <div className="flex flex-col items-end">
//                         {test.discountAmount ? (
//                           <>
//                             <p className="text-blue-500 text-xs ">₹{test.price}</p>
//                             <p className="font-medium text-blue-500 text-xs ">₹{test.discountedPrice}</p>
//                           </>
//                         ) : (
//                           <p className="font-semibold text-xs">₹{test.price}</p>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </Modal>
//           )
//         }
//       </div>


//     </>
//   );
// };

// export default PatientTestPackage;









import { TestList } from '@/types/test/testlist';
import { useState } from 'react';
import { FaBoxOpen, FaEye, FaEyeSlash, FaFlask, FaSearch, FaTimes, FaTrashAlt, FaListUl } from 'react-icons/fa';

interface Package {
  id: number;
  packageName: string;
  price: number;
  discount?: number;
  tests?: TestList[];
}

interface PatientTestPackageProps {
  categories: string[];
  tests: TestList[];
  packages: Package[];
  selectedTests: TestList[];
  selectedPackages: Package[];
  setSelectedTests: React.Dispatch<React.SetStateAction<TestList[]>>;
  setSelectedPackages: React.Dispatch<React.SetStateAction<Package[]>>;
  selectedCategory: string;
  handleCategoryChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  searchTestTerm: string;
  handleTestSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  filteredTests: TestList[];
  handleTestSelection: (test: TestList) => void;
  handlePackageSelection: (pkg: Package) => void;
  removeTest: (testId: string) => void;
  removePackage: (packageId: string) => void;
  handleTestDiscountChange: (testId: number, field: 'percent' | 'amount', value: number) => void;
}

const PatientTestPackage: React.FC<PatientTestPackageProps> = ({
  categories,
  packages,
  selectedTests,
  selectedPackages,
  setSelectedTests,
  // setSelectedPackages,
  selectedCategory,
  handleCategoryChange,
  searchTestTerm,
  handleTestSearch,
  filteredTests,
  handleTestSelection,
  handlePackageSelection,
  removeTest,
  removePackage,
}) => {
  const [showTestList, setShowTestList] = useState(false);
  const [showPackageList, setShowPackageList] = useState(false);
  const [searchPackageTerm, setSearchPackageTerm] = useState('');
  const [hoveredPackage, setHoveredPackage] = useState<Package | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  // const handleRemoveTest = (testId: string) => {
  //   setSelectedTests(selectedTests.filter((test) => test.id !== Number(testId)));
  // };

  // const handleRemovePackage = (packageId: string) => {
  //   setSelectedPackages(selectedPackages.filter((pkg) => pkg.id !== Number(packageId)));
  // };

  const handlePackageSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchPackageTerm(event.target.value);
  };

  const handleTestDiscountChange = (testId: number, field: 'percent' | 'amount', value: number) => {
    setSelectedTests(prevTests =>
      prevTests.map(test => {
        if (test.id === testId) {
          let discountAmount = test.discountAmount || 0;
          let discountPercent = test.discountPercent || 0;
          const price = test.price;

          if (field === 'percent') {
            discountPercent = Math.min(100, Math.max(0, value)); // Clamp between 0-100
            discountAmount = (price * discountPercent) / 100;
          } else {
            discountAmount = Math.min(price, Math.max(0, value)); // Clamp between 0-price
            discountPercent = (discountAmount / price) * 100;
          }

          return {
            ...test,
            discountAmount,
            discountPercent,
            discountedPrice: price - discountAmount
          };
        }
        return test;
      })
    );
  };

  const handlePackageHover = (pkg: Package) => {
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    
    // Set a new timeout to show the tooltip after a short delay
    const timeout = setTimeout(() => {
      setHoveredPackage(pkg);
    }, 300);
    
    setHoverTimeout(timeout);
  };

  const handlePackageLeave = () => {
    // Clear the timeout if it exists
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    setHoveredPackage(null);
  };

  const filteredPackages = searchPackageTerm
    ? packages.filter(pkg =>
      pkg.packageName.toLowerCase().includes(searchPackageTerm.toLowerCase()))
    : packages;

  return (
    <div className="space-y-4 p-3 bg-white rounded-lg border border-gray-200 shadow-xs my-4 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Available Tests */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h3 className="text-xs font-medium text-gray-700 flex items-center">
                <FaFlask className="mr-1.5 text-purple-500" />
                Available Tests
              </h3>
              <button
                onClick={() => setShowTestList(!showTestList)}
                className="ml-2 text-xs text-purple-500 flex items-center"
              >
                {showTestList ? <FaEyeSlash className="mr-1" /> : <FaEye className="mr-1" />}
                {showTestList ? 'Hide List' : 'Show List'}
              </button>
            </div>
            <div className="flex gap-2">
              <select
                className="border border-gray-300 p-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 w-28"
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <option value="">All</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <div className="relative">
                <input
                  type="text"
                  className="border border-gray-300 p-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 pl-7 w-32"
                  placeholder="Search"
                  value={searchTestTerm}
                  onChange={handleTestSearch}
                />
                <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-purple-500 text-xs" />
              </div>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden bg-white">
            {filteredTests.length > 0 || searchTestTerm ? (
              <div className="overflow-y-auto max-h-40 space-y-1 p-1">
                {(showTestList || searchTestTerm) ? filteredTests.map((test) => (
                  <div
                    key={test.id}
                    className={`flex items-center justify-between p-1.5 rounded text-xs ${selectedTests.some((t) => t.id === test.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                        checked={selectedTests.some((t) => t.id === test.id)}
                        onChange={() => handleTestSelection(test)}
                      />
                      <div>
                        <p className="font-medium">{test.name}</p>
                        <p className="text-gray-500 text-[0.65rem]">{test.category}</p>
                      </div>
                    </div>
                    <p className="font-medium">₹{test.price}</p>
                  </div>
                )) : (
                  <div className="p-4 text-center text-gray-500 text-xs">
                    <p>Test list is hidden. Search for tests or click &quot;Show List&quot;</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 text-xs flex flex-col items-center">
                <FaFlask className="text-purple-500 text-lg mb-1" />
                {searchTestTerm ? (
                  <>
                    <p>No tests found for &quot;{searchTestTerm}&quot;</p>
                    <button
                      onClick={() => handleTestSearch({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)}
                      className="text-blue-500 text-[0.65rem] mt-1 flex items-center"
                    >
                      <FaTimes className="mr-1" /> Clear search
                    </button>
                  </>
                ) : (
                  <p>No tests available</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Available Packages */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h3 className="text-xs font-medium text-gray-700 flex items-center">
                <FaBoxOpen className="mr-1.5 text-purple-500" />
                Available Packages
              </h3>
              <button
                onClick={() => setShowPackageList(!showPackageList)}
                className="ml-2 text-xs text-purple-500 flex items-center"
              >
                {showPackageList ? <FaEyeSlash className="mr-1 text-purple-500" /> : <FaEye className="mr-1 text-purple-500" />}
                {showPackageList ? 'Hide List' : 'Show List'}
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                className="border border-gray-300  p-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 pl-7 w-32"
                placeholder="Search"
                value={searchPackageTerm}
                onChange={handlePackageSearch}
              />
              <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-purple-500 text-xs" />
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden bg-white">
            {filteredPackages.length > 0 || searchPackageTerm ? (
              <div className="overflow-y-auto max-h-40 space-y-1 p-1">
                {(showPackageList || searchPackageTerm) ? filteredPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`flex items-center justify-between p-1.5 rounded text-xs ${selectedPackages.some((p) => p.id === pkg.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    onMouseEnter={() => handlePackageHover(pkg)}
                    onMouseLeave={handlePackageLeave}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                        checked={selectedPackages.some((p) => p.id === pkg.id)}
                        onChange={() => handlePackageSelection(pkg)}
                      />
                      <p className="font-medium">{pkg.packageName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">₹{pkg.price}</p>
                      {pkg.discount && <p className="text-green-600 text-xs">{pkg.discount}% Off</p>}
                      <FaListUl className="text-gray-500 hover:text-blue-500 cursor-pointer" />
                    </div>
                  </div>
                )) : (
                  <div className="p-4 text-center text-gray-500 text-xs">
                    <p>Package list is hidden. Search for packages or click &quot;Show List&quot;</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 text-xs flex flex-col items-center">
                <FaBoxOpen className="text-gray-300 text-lg mb-1" />
                {searchPackageTerm ? (
                  <>
                    <p>No packages found for &quot;{searchPackageTerm}&quot;</p>
                    <button
                      onClick={() => setSearchPackageTerm('')}
                      className="text-blue-500 text-[0.65rem] mt-1 flex items-center"
                    >
                      <FaTimes className="mr-1" /> Clear search
                    </button>
                  </>
                ) : (
                  <p>No packages available</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selected Tests */}
        {selectedTests.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-gray-700">Selected Tests ({selectedTests.length})</h3>
            <div className="border rounded-lg overflow-hidden bg-white">
              <div className="overflow-y-auto max-h-40 space-y-1 p-1">
                {selectedTests.map((test) => (
                  <div key={test.id} className="p-1.5 rounded text-xs hover:bg-gray-50">
                    <div className="flex justify-between items-center gap-2">
                      {/* Test Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{test.name}</p>
                        <p className="text-gray-500 text-[0.65rem] truncate">{test.category}</p>
                      </div>

                      {/* Price Display */}
                      <div className="flex flex-col items-end w-20">
                        {test.discountAmount ? (
                          <>
                            <p className="line-through text-gray-400 text-[0.65rem]">₹{test.price}</p>
                            <p className="font-medium">₹{test.discountedPrice}</p>
                          </>
                        ) : (
                          <p className="font-medium">₹{test.price}</p>
                        )}
                      </div>

                      {/* Discount Controls */}
                      <div className="flex items-center space-x-1 w-40">
                        <div className="flex items-center">
                          <span className="text-[1rem] mr-1">%:</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="w-12 border border-gray-300 rounded px-1 text-xs"
                            value={test.discountPercent || 0}
                            onChange={(e) =>
                              handleTestDiscountChange(test.id, 'percent', parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                        <div className="flex items-center">
                          <span className="text-[1rem] text-zinc-900 mr-1">₹:</span>
                          <input
                            type="number"
                            min="0"
                            max={test.price}
                            className="w-16 border border-gray-300 rounded px-1  text-xs"
                            value={test.discountAmount || 0}
                            onChange={(e) =>
                              handleTestDiscountChange(test.id, 'amount', parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => removeTest(test.id.toString())}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <FaTrashAlt className="text-xs" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Selected Packages */}
        {selectedPackages.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-gray-700">Selected Packages ({selectedPackages.length})</h3>
            <div className="border rounded-lg overflow-hidden bg-white">
              <div className="overflow-y-auto max-h-40 space-y-1 p-1">
                {selectedPackages.map((pkg) => (
                  <div 
                    key={pkg.id} 
                    className="flex items-center justify-between p-1.5 rounded text-xs hover:bg-gray-50"
                    onMouseEnter={() => handlePackageHover(pkg)}
                    onMouseLeave={handlePackageLeave}
                  >
                    <p className="font-medium">{pkg.packageName}</p>
                    <div className="flex items-center">
                      <p className="font-medium mr-2">₹{pkg.price}</p>
                      <button
                        onClick={() => removePackage(pkg.id.toString())}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <FaTrashAlt className="text-xs" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Package Test List Tooltip */}
      {hoveredPackage && (
        <div 
          className="absolute z-10 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 "
          style={{
            // top: `${(hoveredPackage.id % 10) * 30 + 100}px`,
            top: '-40%',
            left: '70%'
          }}
          onMouseEnter={() => setHoveredPackage(hoveredPackage)}
          onMouseLeave={handlePackageLeave}
        >
          <h3 className="text-sm font-semibold text-blue-600 mb-2">{hoveredPackage.packageName}</h3>
          <div className="max-h-60 overflow-y-auto">
            {hoveredPackage.tests?.map((test) => (
              <div key={test.id} className="mb-2 last:mb-0">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <p className="font-medium">{test.name}</p>
                    <p className="text-gray-500">{test.category}</p>
                  </div>
                  <p className="font-semibold">₹{test.price}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
            <span className="text-xs font-medium">Total:</span>
            <span className="text-sm font-bold">₹{hoveredPackage.price}</span>
          </div>
          {hoveredPackage.discount && (
            <div className="text-green-600 text-xs mt-1">
              {hoveredPackage.discount}% discount applied
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientTestPackage;