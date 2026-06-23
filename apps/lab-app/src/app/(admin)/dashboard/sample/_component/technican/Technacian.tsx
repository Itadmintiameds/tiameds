"use client";

import React, { useState } from 'react';
import { Search, Package, ChevronDown, Plus } from "lucide-react";
import KPISection from '../KPISection';
import NewCommonTable from '../../../newcommoncomponent/NewCommonTable';



type Patient = {
  id: string;
  date: string;
  name: string;
  age: string;
  gender: string;
  status: string;
  testPackage: string;
};

const Technacian = () => {
  const stats = [
    {
      title: "Samples Pending",
      value: "6531",
      valueColor: "text-black",
    },
    {
      title: "Samples Collected",
      value: "6531",
      valueColor: "text-blue-500",
    },
    {
      title: "Partially Completed Test Results",
      value: "6531",
      valueColor: "text-amber-500",
    },
    {
      title: "Completed Test",
      value: "6531",
      valueColor: "text-green-600",
    },
  ];

  const patients: Patient[] = [
    {
      id: "PAT-00507",
      date: "3/6/2026",
      name: "Mrs. JYOTHI",
      age: "41 Yrs",
      gender: "Male",
      status: "Pending",
      testPackage: "COMPLETE BLOOD COUNT (CBC)",
    },
    {
      id: "PAT-00508",
      date: "3/6/2026",
      name: "Mr. Rajesh Kumar",
      age: "41 Yrs",
      gender: "Male",
      status: "Pending",
      testPackage: "COMPLETE BLOOD COUNT (CBC)",
    },
    {
      id: "PAT-00509",
      date: "2/6/2026",
      name: "Ms. Priya Sharma",
      age: "41 Yrs",
      gender: "Male",
      status: "Pending",
      testPackage: "Diabetic test package",
    },
    {
      id: "PAT-00510",
      date: "2/6/2026",
      name: "Mr. Amit Patel",
      age: "41 Yrs",
      gender: "Male",
      status: "Pending",
      testPackage: "COMPLETE BLOOD COUNT (CBC)",
    },
    {
      id: "PAT-00511",
      date: "1/6/2026",
      name: "Mrs. Lakshmi Iyer",
      age: "41 Yrs",
      gender: "Male",
      status: "Pending",
      testPackage: "COMPLETE BLOOD COUNT (CBC)",
    },
    {
      id: "PAT-00512",
      date: "1/6/2026",
      name: "Mr. Suresh Reddy",
      age: "41 Yrs",
      gender: "Male",
      status: "Pending",
      testPackage: "Diabetic test package",
    },
    {
      id: "PAT-00513",
      date: "31/5/2026",
      name: "Ms. Ananya Das",
      age: "41 Yrs",
      gender: "Male",
      status: "Pending",
      testPackage: "COMPLETE BLOOD COUNT (CBC)",
    },
    {
      id: "PAT-00514",
      date: "31/5/2026",
      name: "Mr. Vikram Singh",
      age: "41 Yrs",
      gender: "Male",
      status: "Pending",
      testPackage: "COMPLETE BLOOD COUNT (CBC)",
    },
    {
      id: "PAT-00515",
      date: "30/5/2026",
      name: "Mr. Ravi Kumar",
      age: "41 Yrs",
      gender: "Male",
      status: "Pending",
      testPackage: "COMPLETE BLOOD COUNT (CBC)",
    },
    {
      id: "PAT-00516",
      date: "30/5/2026",
      name: "Mr. Arun Sharma",
      age: "41 Yrs",
      gender: "Male",
      status: "Pending",
      testPackage: "COMPLETE BLOOD COUNT (CBC)",
    },
    {
      id: "PAT-00517",
      date: "29/5/2026",
      name: "Mr. Kiran Rao",
      age: "41 Yrs",
      gender: "Male",
      status: "Pending",
      testPackage: "COMPLETE BLOOD COUNT (CBC)",
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const filteredPatients = patients.filter((patient) =>
  patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
  patient.name.toLowerCase().includes(searchTerm.toLowerCase())
);

  const columns = [
    {
      header: "Patient ID",
      accessor: "id",
      render: (row: Patient) => (
        <div>
          <p className="font-semibold text-p3 text-pneutral-900">
            {row.id}
          </p>

          <p className="text-[12px] leading-[16px] font-normal text-pneutral-500">
            {row.date}
          </p>
        </div>
      ),
    },

    {
      header: "Patient Details",
      accessor: "name",
      render: (row: Patient) => (
        <div>
          <p className="font-semibold text-p3 text-pneutral-900">
            {row.name}
          </p>

          <p className="text-p2 leading-[16px] font-normal text-pneutral-500">
            {row.age} | {row.gender}
          </p>
        </div>
      ),
    },

    {
      header: "Report Status",
      accessor: "status",
      render: (row: Patient) => (
        <span className="inline-flex rounded-full bg-danger-100 px-5 py-1 text-p2 font-medium text-warning-800">
          {row.status}
        </span>
      ),
    },

    {
      header: "Tests/Package",
      accessor: "testPackage",
      render: (row: Patient) =>
        row.testPackage === "Diabetic test package" ? (
          <button className="flex min-w-[220px] items-center font-semibold justify-between text-label-l4 rounded-xl border border-secondary-200 bg-secondary-50 px-2 py-2">
            <div className="flex items-center gap-2">
              <Package size={20} />

              <span className="font-semibold">
                {row.testPackage}
              </span>
            </div>

            <ChevronDown size={20} />
          </button>
        ) : (
          <span className="rounded-full bg-secondary-50 px-3 py-1 text-xs font-medium text-secondary-700">
            {row.testPackage}
          </span>
        ),
    },

    {
      header: "Actions",
      accessor: "actions",
      render: () => (
        <button className="flex items-center gap-1 rounded-lg border border-success-900 px-4 py-1 text-label-l2 font-medium text-success-900">
  <Plus size={12} strokeWidth={4}/>
  <span>Add Sample</span>
</button>
      ),
    },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-pneutral-900">
          Samples Status
        </h1>

        <p className="mt-1 text-sm text-pneutral-500">
          Manage and track pending patient Samples
        </p>
      </div>

      {/* KPI Section */}
      {/* <KPISection data={stats} /> */}
       <KPISection
  data={stats}
  onCardChange={(index) =>
    console.log("Selected Card:", index)
  }
/>

      {/* Filters */}
      <div className="mt-5 rounded-xl border border-pneutral-200 bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sneutral-700"
            />

            <input
  type="text"
  placeholder="Search by ID or Name"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="h-10 w-full rounded-lg border border-pneutral-200 pl-10 pr-4 text-sm outline-none"
/>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Date Range:
              </span>

              <select className="h-10 rounded-md border border-gray-200 px-3 text-sm">
                <option>This Year</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Sort by:
              </span>

              <select className="h-10 rounded-md border border-gray-200 px-3 text-sm">
                <option>This Year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5">
        <NewCommonTable
          columns={columns}
          data={filteredPatients}
          pageSize={10}
        />
      </div>
    </div>
  );
};

export default Technacian;











// "use client";

// import { Search, Package, ChevronDown } from "lucide-react";
// import KPISection from "../KPISection";
// import NewCommonTable from "../../../newcommoncomponent/NewCommonTable";



// type Patient = {
//   id: string;
//   date: string;
//   name: string;
//   age: string;
//   gender: string;
//   status: string;
//   testPackage: string;
// };

// const Technacian = () => {
//   const stats = [
//     {
//       title: "Samples Pending",
//       value: "6531",
//       valueColor: "text-black",
//     },
//     {
//       title: "Samples Collected",
//       value: "6531",
//       valueColor: "text-blue-500",
//     },
//     {
//       title: "Partially Completed Test Results",
//       value: "6531",
//       valueColor: "text-amber-500",
//     },
//     {
//       title: "Completed Test",
//       value: "6531",
//       valueColor: "text-green-600",
//     },
//   ];

//   const patients: Patient[] = [
//     {
//       id: "PAT-00507",
//       date: "3/6/2026",
//       name: "Mrs. JYOTHI",
//       age: "41 Yrs",
//       gender: "Male",
//       status: "Pending",
//       testPackage: "COMPLETE BLOOD COUNT (CBC)",
//     },
//     {
//       id: "PAT-00508",
//       date: "3/6/2026",
//       name: "Mr. Rajesh Kumar",
//       age: "41 Yrs",
//       gender: "Male",
//       status: "Pending",
//       testPackage: "COMPLETE BLOOD COUNT (CBC)",
//     },
//     {
//       id: "PAT-00509",
//       date: "2/6/2026",
//       name: "Ms. Priya Sharma",
//       age: "41 Yrs",
//       gender: "Male",
//       status: "Pending",
//       testPackage: "Diabetic test package",
//     },
//     {
//       id: "PAT-00510",
//       date: "2/6/2026",
//       name: "Mr. Amit Patel",
//       age: "41 Yrs",
//       gender: "Male",
//       status: "Pending",
//       testPackage: "COMPLETE BLOOD COUNT (CBC)",
//     },
//     {
//       id: "PAT-00511",
//       date: "1/6/2026",
//       name: "Mrs. Lakshmi Iyer",
//       age: "41 Yrs",
//       gender: "Male",
//       status: "Pending",
//       testPackage: "COMPLETE BLOOD COUNT (CBC)",
//     },
//     {
//       id: "PAT-00512",
//       date: "1/6/2026",
//       name: "Mr. Suresh Reddy",
//       age: "41 Yrs",
//       gender: "Male",
//       status: "Pending",
//       testPackage: "Diabetic test package",
//     },
//     {
//       id: "PAT-00513",
//       date: "31/5/2026",
//       name: "Ms. Ananya Das",
//       age: "41 Yrs",
//       gender: "Male",
//       status: "Pending",
//       testPackage: "COMPLETE BLOOD COUNT (CBC)",
//     },
//     {
//       id: "PAT-00514",
//       date: "31/5/2026",
//       name: "Mr. Vikram Singh",
//       age: "41 Yrs",
//       gender: "Male",
//       status: "Pending",
//       testPackage: "COMPLETE BLOOD COUNT (CBC)",
//     },
//     {
//       id: "PAT-00515",
//       date: "30/5/2026",
//       name: "Mr. Ravi Kumar",
//       age: "41 Yrs",
//       gender: "Male",
//       status: "Pending",
//       testPackage: "COMPLETE BLOOD COUNT (CBC)",
//     },
//     {
//       id: "PAT-00516",
//       date: "30/5/2026",
//       name: "Mr. Arun Sharma",
//       age: "41 Yrs",
//       gender: "Male",
//       status: "Pending",
//       testPackage: "COMPLETE BLOOD COUNT (CBC)",
//     },
//     {
//       id: "PAT-00517",
//       date: "29/5/2026",
//       name: "Mr. Kiran Rao",
//       age: "41 Yrs",
//       gender: "Male",
//       status: "Pending",
//       testPackage: "COMPLETE BLOOD COUNT (CBC)",
//     },
//   ];

//   const columns = [
//     {
//       header: "Patient ID",
//       accessor: "id",
//       render: (row: Patient) => (
//         <div>
//           <p className="font-semibold text-gray-900">
//             {row.id}
//           </p>

//           <p className="text-sm text-gray-500">
//             {row.date}
//           </p>
//         </div>
//       ),
//     },

//     {
//       header: "Patient Details",
//       accessor: "name",
//       render: (row: Patient) => (
//         <div>
//           <p className="font-semibold text-gray-900">
//             {row.name}
//           </p>

//           <p className="text-sm text-gray-500">
//             {row.age} | {row.gender}
//           </p>
//         </div>
//       ),
//     },

//     {
//       header: "Report Status",
//       accessor: "status",
//       render: (row: Patient) => (
//         <span className="inline-flex rounded-full bg-[#F8E3A1] px-5 py-1 text-xs font-medium text-[#7A5400]">
//           {row.status}
//         </span>
//       ),
//     },

//     {
//       header: "Tests/Package",
//       accessor: "testPackage",
//       render: (row: Patient) =>
//         row.testPackage === "Diabetic test package" ? (
//           <button className="flex min-w-[220px] items-center justify-between rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
//             <div className="flex items-center gap-2">
//               <Package size={16} />

//               <span className="font-medium">
//                 {row.testPackage}
//               </span>
//             </div>

//             <ChevronDown size={16} />
//           </button>
//         ) : (
//           <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-600">
//             {row.testPackage}
//           </span>
//         ),
//     },

//     {
//       header: "Actions",
//       accessor: "actions",
//       render: () => (
//         <button className="rounded-lg border border-green-500 px-4 py-2 text-sm font-medium text-green-600 transition hover:bg-green-50">
//           + Add Sample
//         </button>
//       ),
//     },
//   ];

//   return (
//     <div className="w-full">
//       {/* Header */}
//       <div className="mb-5">
//         <h1 className="text-2xl font-semibold text-gray-900">
//           Samples Status
//         </h1>

//         <p className="mt-1 text-sm text-gray-500">
//           Manage and track pending patient Samples
//         </p>
//       </div>

//       {/* KPI Section */}
//       <KPISection data={stats} />

//       {/* Filters */}
//       <div className="mt-5 rounded-xl border bg-white border-gray-200 p-4">
//         <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//           <div className="relative w-full max-w-md">
//             <Search
//               size={18}
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//             />

//             <input
//               type="text"
//               placeholder="Search by name, ID, or phone..."
//               className="h-10 w-full rounded-lg border border-gray-200 pl-10 pr-4 text-sm outline-none focus:border-violet-400"
//             />
//           </div>

//           <div className="flex flex-wrap items-center gap-4">
//             <div className="flex items-center gap-2">
//               <span className="text-sm text-gray-500">
//                 Date Range:
//               </span>

//               <select className="h-10 rounded-md border border-gray-200 px-3 text-sm">
//                 <option>This Year</option>
//               </select>
//             </div>

//             <div className="flex items-center gap-2">
//               <span className="text-sm text-gray-500">
//                 Sort by:
//               </span>

//               <select className="h-10 rounded-md border border-gray-200 px-3 text-sm">
//                 <option>This Year</option>
//               </select>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="mt-5">
//         <NewCommonTable
//           columns={columns}
//           data={patients}
//           pageSize={10}
//         />
//       </div>
//     </div>
//   );
// };

// export default Technacian;

















// code by abhishek........................

// 'use client';
// import { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { ClipboardList, CheckCircle, HandCoins } from 'lucide-react';
// import PendingTable from '../PendingTable';
// import CollectionTable from '../CollectionTable';
// import CompletedTable from '../CompletedTable';

// const tabs = [
//   { 
//     id: 'Pending',
//     label: 'Pending', 
//     icon: <ClipboardList className="text-lg" />,
//     activeColor: 'text-blue-600',
//     borderColor: 'bg-blue-600',
//     bgColor: 'bg-blue-100'
//   },
//   { 
//     id: 'Collected', 
//     label: 'Collected', 
//     icon: <CheckCircle className="text-lg" />,
//     activeColor: 'text-green-600',
//     borderColor: 'bg-green-600',
//     bgColor: 'bg-green-100'
//   },
//   { 
//     id: 'Received', 
//     label: 'Received', 
//     icon: <HandCoins className="text-lg" />,
//     activeColor: 'text-purple-600',
//     borderColor: 'bg-purple-600',
//     bgColor: 'bg-purple-100'
//   },
// ];

// const TabButton = ({ tab, isActive, onClick }: { tab: typeof tabs[0], isActive: boolean, onClick: () => void }) => (
//   <button
//     onClick={onClick}
//     className={`relative px-4 py-3 flex items-center space-x-2 transition-all duration-300 ${
//       isActive ? tab.activeColor : 'text-gray-500 hover:text-gray-700'
//     }`}
//   >
//     <span className={`p-1.5 rounded-md ${isActive ? `${tab.bgColor} ${tab.activeColor}` : 'bg-gray-100 text-gray-500'} transition-colors`}>
//       {tab.icon}
//     </span>
//     <span className="font-medium">{tab.label}</span>
//     {isActive && (
//       <motion.div 
//         layoutId="activeTab"
//         className={`absolute bottom-0 left-0 right-0 h-1 ${tab.borderColor} rounded-t-full`}
//         transition={{ type: 'spring', stiffness: 300, damping: 25 }}
//       />
//     )}
//   </button>
// );

// const Technacian = () => {
//   const [selectedTab, setSelectedTab] = useState<string>('Pending');
  
//   return (
//     <div className="p-4">
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//         {/* Enhanced Tab Bar */}
//         <div className="flex border-b border-gray-200 px-4">
//           {tabs.map((tab) => (
//             <TabButton
//               key={tab.id}
//               tab={tab}
//               isActive={selectedTab === tab.id}
//               onClick={() => setSelectedTab(tab.id)}
//             />
//           ))}
//         </div>
        
//         {/* Tab Content with Smooth Transition */}
//         <div className="px-2 py-4">
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={selectedTab}
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -10 }}
//               transition={{ duration: 0.25 }}
//             >
//               {selectedTab === 'Pending' && <PendingTable />}
//               {selectedTab === 'Collected' && <CollectionTable />}
//               {selectedTab === 'Received' && <CompletedTable />}
//             </motion.div>
//           </AnimatePresence>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Technacian;