// 'use client';

// import PatientList from '@/app/(admin)/component/dashboard/patient/PatientList';
// import { FaUserInjured } from 'react-icons/fa';
// import { MdOutlineHealthAndSafety } from 'react-icons/md';

// const Page = () => {
//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       {/* Page Header */}
//       <div className="mb-10">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
//           <div>
//             <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center gap-3">
//               <MdOutlineHealthAndSafety className="text-blue-600" />
//               Patient Management Portal
//             </h1>
//             <p className="text-lg text-gray-600 mt-3 max-w-3xl">
//               Comprehensive oversight of all patient records. Monitor health data, track appointments, and manage care plans with our intuitive interface.
//             </p>
//           </div>
          
//           <div className="flex flex-wrap gap-4 w-full md:w-auto">
//             {/* <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
//               <FaSearch size={14} />
//               Quick Search
//             </button>
//             <button className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
//               <FaFilter size={14} />
//               Advanced Filters
//             </button>
//             <button className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
//               <FaChartLine size={14} />
//               View Analytics
//             </button> */}
//           </div>
//         </div>
//       </div>

//       {/* Patient List Table */}
//       <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
//         <div className="p-6 border-b border-gray-200">
//           <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
//             <FaUserInjured className="text-blue-500" />
//             Patient Records
//           </h2>
//           <p className="text-sm text-gray-500 mt-1">
//             All registered patients with their complete medical profiles
//           </p>
//         </div>
//         <PatientList />
//       </div>
//     </div>
//   );
// };

// export default Page;









'use client';

import React from 'react';
import PatientList from '@/app/(admin)/component/dashboard/patient/PatientList';
import { FaUserInjured } from 'react-icons/fa';
import { MdOutlineHealthAndSafety } from 'react-icons/md';
// import { useLabs } from '@/context/LabContext';
import useAuthStore from '@/context/userStore';
import Unauthorised from '@/app/(admin)/component/Unauthorised';

const Page = () => {
  const { user: loginedUser } = useAuthStore();
  const roles = loginedUser?.roles || [];
  const isAdmin = ['ADMIN', 'DESKROLE','SUPERADMIN'].some(role => roles.includes(role));
   

  if (!isAdmin) {
    return (
      <Unauthorised
        username={loginedUser?.username || ''}
        currentRoles={roles}
        notallowedRoles={['TECHNICIAN', 'DESKROLE']}
        allowedRoles={['ADMIN']}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center gap-3">
              <MdOutlineHealthAndSafety className="text-blue-600" />
              Patient Management Portal
            </h1>
            <p className="text-lg text-gray-600 mt-3 max-w-3xl">
              Comprehensive oversight of all patient records. Monitor health data, track appointments, and manage care plans with our intuitive interface.
            </p>
          </div>
        </div>
      </div>

      {/* Patient List Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FaUserInjured className="text-blue-500" />
            Patient Records
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            All registered patients with their complete medical profiles
          </p>
        </div>
        <PatientList />
      </div>
    </div>
  );
};

export default Page;
