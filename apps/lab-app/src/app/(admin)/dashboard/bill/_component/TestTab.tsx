// 'use client';

// import React, { useState } from 'react';
// import { CheckSquare, Package } from 'lucide-react'; // Importing icons from Lucide
// import PackageOrder from './PackageOrder';
// import TestOrders from './TestOrders';

// const TestTab = () => {
//   // State to keep track of the active tab
//   const [activeTab, setActiveTab] = useState('testOrders');

//   // Function to render the content based on the active tab
//   const renderContent = () => {
//     switch (activeTab) {
//       case 'testOrders':
//         return <TestOrders />;
//       case 'packageOrder':
//         return <PackageOrder />;
//       default:
//         return <TestOrders />;
//     }
//   };

//   return (
//     <div className=" rounded-lg  mt-4">
//       {/* Tab Navigation */}
//       <div className="flex border-b border-gray-200">
//         <button
//           className={`flex items-center flex-1 py-3 text-center transition duration-300 ease-in-out ${activeTab === 'testOrders'
//               ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
//               : 'text-gray-600 hover:text-blue-600'
//             }`}
//           onClick={() => setActiveTab('testOrders')}
//         >
//           <CheckSquare className="h-5 w-5 mr-2" /> {/* Icon for Test Orders */}
//           Test Orders
//         </button>
//         <button
//           className={`flex items-center flex-1 py-3 text-center transition duration-300 ease-in-out ${activeTab === 'packageOrder'
//               ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
//               : 'text-gray-600 hover:text-blue-600'
//             }`}
//           onClick={() => setActiveTab('packageOrder')}
//         >
//           <Package className="h-5 w-5 mr-2" /> {/* Icon for Package Order */}
//           Package Order
//         </button>
//       </div>

//       {/* Render the active tab's content */}
//       <div className="p-4">
//         {renderContent()}
//       </div>
//     </div>
//   );
// };

// export default TestTab;


'use client';

import React, { useState } from 'react';
import { CheckSquare, Package } from 'lucide-react'; // Importing icons from Lucide
import PackageOrder from './PackageOrder';
import TestOrders from './TestOrders';

const TestTab = () => {
  // State to keep track of the active tab
  const [activeTab, setActiveTab] = useState('testOrders');

  // Function to render the content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'testOrders':
        return <TestOrders />;
      case 'packageOrder':
        return <PackageOrder />;
      default:
        return <TestOrders />;
    }
  };

  return (
    <div className="rounded-lg mt-4">
      {/* Tab Navigation */}
      <div className="flex border-b border-purple-200 text-sm">
        <button
          className={`flex items-center flex-1 py-3 text-center transition duration-300 ease-in-out ${
            activeTab === 'testOrders'
              ? 'border-b-2 border-purple-600 text-purple-600 font-semibold'
              : 'text-zinc-900 hover:text-purple-600'
          }`}
          onClick={() => setActiveTab('testOrders')}
        >
          <CheckSquare className="h-5 w-5 mr-2" /> {/* Icon for Test Orders */}
          Test Orders
        </button>
        <button
          className={`flex items-center flex-1 py-3 text-center transition duration-300 ease-in-out ${
            activeTab === 'packageOrder'
              ? 'border-b-2 border-purple-600 text-purple-600 font-semibold'
              : 'text-zinc-900  hover:text-purple-600'
          }`}
          onClick={() => setActiveTab('packageOrder')}
        >
          <Package className="h-5 w-5 mr-2" /> {/* Icon for Package Order */}
          Package Order
        </button>
      </div>

      {/* Render the active tab's content */}
      <div className="p-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default TestTab;
