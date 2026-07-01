/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import KPISection from '../KPISection';
import { useLabs } from '@/context/LabContext';
import { getVisitsByDate } from '@/../services/patientServices';
import { getCollectedCompleted } from '@/../services/sampleServices';
import { getHealthPackageById } from '@/../services/packageServices';
import { formatDateForAPI, getDateRange, DateFilterOption } from '@/utils/dateUtils';
import PendingTable from '../PendingTable';
import CompletedTable from '../CompletedTable';
import CollectionTable from '../CollectionTable';
import CollectedSample from '../CollectedSample';

type ViewType = 'pending' | 'collected' | 'partial' | 'completed';

// interface KPIState {
//   pending: number;
//   collected: number;
//   partial: number;
//   completed: number;
// }

// Shared date filter state interface
export interface DateFilterState {
  dateFilter: DateFilterOption;
  customStartDate: Date | null;
  customEndDate: Date | null;
}

// Separate state for visit counts (for pending and collected)
interface VisitCounts {
  pending: number;
  collected: number;
}

// Separate state for test counts (for partial and completed)
interface TestCounts {
  partial: number;
  completed: number;
}

const Technician = () => {
  const { currentLab } = useLabs();
  const [currentView, setCurrentView] = useState<ViewType>('pending');
  const [hideKPI, setHideKPI] = useState(false);
  
  // Separate states for different types of counts
  const [visitCounts, setVisitCounts] = useState<VisitCounts>({
    pending: 0,
    collected: 0
  });
  
  const [testCounts, setTestCounts] = useState<TestCounts>({
    partial: 0,
    completed: 0
  });
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoadingKPI, setIsLoadingKPI] = useState(false);
  
  // Date filter state for KPI - default to today
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('today');
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  
  // Track if we're using custom date for KPI
  const [isUsingCustomDate, setIsUsingCustomDate] = useState(false);
  
  // Ref to track if we should fetch KPI on mount
  const isMounted = useRef(false);
  
  // Ref to prevent multiple concurrent fetches
  const isFetchingRef = useRef(false);

  // Function to fetch health packages and get test counts
  const fetchHealthPackages = async (packageIds: number[]) => {
    if (!currentLab?.id || packageIds.length === 0) return {};
    
    const packageMap: Record<number, any> = {};
    const uniquePackageIds = Array.from(new Set(packageIds));
    
    await Promise.all(
      uniquePackageIds.map(async (packageId) => {
        try {
          const response = await getHealthPackageById(currentLab.id, packageId);
          if (response?.data) {
            packageMap[packageId] = response.data;
          }
        } catch (error) {
          console.error(`Failed to fetch package ${packageId}:`, error);
        }
      })
    );
    
    return packageMap;
  };

  // Function to fetch all KPI counts based on date range
  const fetchAllKPICounts = useCallback(async (dateFilterParam?: DateFilterOption, startDateParam?: Date | null, endDateParam?: Date | null) => {
    // Prevent multiple concurrent fetches
    if (isFetchingRef.current) return;
    
    if (!currentLab?.id) {
      return;
    }

    // Use provided params or current state
    const filter = dateFilterParam || dateFilter;
    const start = startDateParam !== undefined ? startDateParam : customStartDate;
    const end = endDateParam !== undefined ? endDateParam : customEndDate;

    isFetchingRef.current = true;
    setIsLoadingKPI(true);
    
    try {
      const { startDate, endDate } = getDateRange(filter, start, end);

      if (!startDate || !endDate) {
        isFetchingRef.current = false;
        return;
      }

      const formattedStartDate = formatDateForAPI(startDate);
      const formattedEndDate = formatDateForAPI(endDate);

      // 1. Fetch pending samples count (number of visits with Pending status)
      const visitsResponse = await getVisitsByDate(
        currentLab.id,
        formattedStartDate,
        formattedEndDate
      );
      const allVisits = visitsResponse?.data || [];
      const pendingCount = allVisits.filter(
        (visit: any) => visit.visitDetailDto?.visitStatus === 'Pending'
      ).length;

      // 2. Fetch collected and completed samples
      const collectedResponse = await getCollectedCompleted(
        currentLab.id,
        formattedStartDate,
        formattedEndDate
      );

      // Collect all package IDs from all visits to fetch once
      const allPackageIds: number[] = [];
      collectedResponse.forEach((visit: any) => {
        if (visit.packageIds && visit.packageIds.length > 0) {
          allPackageIds.push(...visit.packageIds);
        }
      });

      // Fetch all health packages
      const packageMap = await fetchHealthPackages(allPackageIds);

      // Calculate counts
      let collectedCount = 0;
      let partialCount = 0; // Number of tests pending (not completed)
      let completedCount = 0; // Number of tests completed

      collectedResponse.forEach((visit: any) => {
        const testResults = visit.testResult || [];
        
        // Get all tests for this visit (including package tests)
        const allTestIds = new Set<number>();
        
        // Add individual tests
        if (visit.tests) {
          visit.tests.forEach((test: any) => allTestIds.add(test.id));
        }
        
        // Add package tests
        if (visit.packageIds) {
          visit.packageIds.forEach((packageId: number) => {
            const pkg = packageMap[packageId];
            if (pkg && pkg.tests) {
              pkg.tests.forEach((test: any) => allTestIds.add(test.id));
            }
          });
        }

        const totalTests = allTestIds.size;
        
        if (totalTests === 0) {
          // No tests found - consider as collected (1 visit = 1 collected)
          collectedCount++;
          return;
        }

        // Count completed tests
        const completedTestIds = new Set<number>();
        testResults.forEach((tr: any) => {
          if (tr.reportStatus === 'Completed') {
            completedTestIds.add(tr.testId);
          }
        });

        const completedTests = completedTestIds.size;
        const pendingTests = totalTests - completedTests;

        if (completedTests === totalTests && totalTests > 0) {
          // All tests completed
          completedCount += completedTests;
        } else if (completedTests > 0 && completedTests < totalTests) {
          // Partial - some completed, some pending
          completedCount += completedTests;
          partialCount += pendingTests;
        } else {
          // No tests completed - all pending
          partialCount += totalTests;
        }
      });

      // Update states separately
      setVisitCounts({
        pending: pendingCount,
        collected: collectedCount
      });
      
      setTestCounts({
        partial: partialCount,
        completed: completedCount
      });

    } catch (error) {
      console.error('Error fetching KPI counts:', error);
    } finally {
      setIsLoadingKPI(false);
      isFetchingRef.current = false;
    }
  }, [currentLab, dateFilter, customStartDate, customEndDate]);

  // Combined KPI data for display
  const getKPIData = useCallback(() => {
    return {
      pending: visitCounts.pending,
      collected: visitCounts.collected,
      partial: testCounts.partial,
      completed: testCounts.completed
    };
  }, [visitCounts, testCounts]);

  // Fetch KPI counts on mount with today's date
  useEffect(() => {
    if (currentLab?.id && !isMounted.current) {
      isMounted.current = true;
      // Reset to today's date on mount
      setDateFilter('today');
      setCustomStartDate(null);
      setCustomEndDate(null);
      setIsUsingCustomDate(false);
      fetchAllKPICounts('today', null, null);
    }
  }, [currentLab, fetchAllKPICounts]);

  // Set up auto-refresh interval (every 60 seconds)
  useEffect(() => {
    if (!currentLab?.id) return;
    
    const intervalId = setInterval(() => {
      // Only refresh if not on custom date
      if (!isUsingCustomDate) {
        fetchAllKPICounts();
      }
    }, 60000); // 60 seconds

    return () => clearInterval(intervalId);
  }, [currentLab, fetchAllKPICounts, isUsingCustomDate]);

  // Handle date filter changes from child components
  const handleDateFilterChange = useCallback((filter: DateFilterOption, startDate?: Date | null, endDate?: Date | null) => {
    setDateFilter(filter);
    
    if (filter === 'custom') {
      setCustomStartDate(startDate || null);
      setCustomEndDate(endDate || null);
      setIsUsingCustomDate(true);
      // Small delay to let state update
      setTimeout(() => {
        fetchAllKPICounts(filter, startDate || null, endDate || null);
      }, 50);
    } else {
      setCustomStartDate(null);
      setCustomEndDate(null);
      setIsUsingCustomDate(false);
      // Small delay to let state update
      setTimeout(() => {
        fetchAllKPICounts(filter, null, null);
      }, 50);
    }
  }, [fetchAllKPICounts]);

  // Reset to today's date when switching tabs
  const handleViewChange = useCallback((view: ViewType) => {
    setCurrentView(view);
    setHideKPI(false);
    
    // Reset to today's date when switching tabs
    // Only if we're not currently using a custom date
    if (!isUsingCustomDate) {
      setDateFilter('today');
      setCustomStartDate(null);
      setCustomEndDate(null);
      // Small delay to let state update
      setTimeout(() => {
        fetchAllKPICounts('today', null, null);
      }, 50);
    }
  }, [fetchAllKPICounts, isUsingCustomDate]);

  // Handle KPI card click
  const handleCardChange = (index: number) => {
    const views: ViewType[] = ['pending', 'collected', 'partial', 'completed'];
    const newView = views[index];
    
    // Reset to today's date when clicking on a different tab
    // Only if we're not currently using a custom date
    if (!isUsingCustomDate) {
      setDateFilter('today');
      setCustomStartDate(null);
      setCustomEndDate(null);
      // Fetch with today's date
      setTimeout(() => {
        fetchAllKPICounts('today', null, null);
      }, 50);
    }
    
    handleViewChange(newView);
  };

  // Stats for KPISection
  const kpiData = getKPIData();
  const stats = [
    {
      title: "Samples Pending",
      value: kpiData.pending.toString(),
      count: kpiData.pending
    },
    {
      title: "Samples Collected",
      value: kpiData.collected.toString(),
      count: kpiData.collected
    },
    {
      title: "Pending Test Results",
      value: kpiData.partial.toString(),
      count: kpiData.partial
    },
    {
      title: "Completed Test",
      value: kpiData.completed.toString(),
      count: kpiData.completed
    },
  ];

  // Handle data update from child components
  const handleChildDataUpdate = useCallback((type: ViewType, count: number) => {
    // For partial and completed, we do NOT update KPI from child
    // because child counts visits, but we want test counts
    if (type === 'partial' || type === 'completed') {
      // Just refresh KPI from API to ensure correct test counts
      if (!isFetchingRef.current) {
        fetchAllKPICounts();
      }
      return;
    }
    
    // For pending and collected, update visit counts
    if (type === 'pending') {
      setVisitCounts(prev => ({ ...prev, pending: count }));
    } else if (type === 'collected') {
      setVisitCounts(prev => ({ ...prev, collected: count }));
    }
  }, [fetchAllKPICounts]);

  // Render the appropriate component based on current view
  const renderContent = () => {
    switch (currentView) {
      case 'pending':
        return (
          <PendingTable 
            onDataUpdate={(count) => handleChildDataUpdate('pending', count)}
            onDateFilterChange={handleDateFilterChange}
          />
        );
      case 'collected':
        return (
          <CollectedSample 
            onDataUpdate={(count) => handleChildDataUpdate('collected', count)}
            onDateFilterChange={handleDateFilterChange}
          />
        );
      case 'partial':
        return (
          <CollectionTable 
            onDataUpdate={() => {
              // Just refresh KPI, don't use the count from child
              if (!isFetchingRef.current) {
                fetchAllKPICounts();
              }
            }}
            onHideKPI={() => setHideKPI(true)}
            onShowKPI={() => setHideKPI(false)}
            onDateFilterChange={handleDateFilterChange}
          />
        );
      case 'completed':
        return (
          <CompletedTable 
            onDataUpdate={() => {
              // Just refresh KPI, don't use the count from child
              if (!isFetchingRef.current) {
                fetchAllKPICounts();
              }
            }}
            onDateFilterChange={handleDateFilterChange}
          />
        );
      default:
        return <PendingTable onDataUpdate={(count) => handleChildDataUpdate('pending', count)} />;
    }
  };

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

      {/* KPI Section - Hide when on result entry screen */}
      {!hideKPI && (
        <KPISection
          data={stats}
          onCardChange={handleCardChange}
          selectedIndex={['pending', 'collected', 'partial', 'completed'].indexOf(currentView)}
        />
      )}

      {/* Dynamic Content */}
      <div className={`mt-5 ${hideKPI ? 'mt-0' : ''}`}>
        {renderContent()}
      </div>
    </div>
  );
};

export default Technician;












// working code dated 01.07.2026.............

// "use client";

// import React, { useState } from 'react';
// import KPISection from '../KPISection';

// // import { useLabs } from '@/context/LabContext';
// import PendingTable from '../PendingTable';
// import CompletedTable from '../CompletedTable';
// import CollectionTable from '../CollectionTable';
// import CollectedSample from '../CollectedSample';

// type ViewType = 'pending' | 'collected' | 'partial' | 'completed';

// const Technician = () => {
//   // const { currentLab } = useLabs();
//   const [currentView, setCurrentView] = useState<ViewType>('pending');
//   const [hideKPI, setHideKPI] = useState(false); // Add this state
  
//   // State to hold KPI data from child components
//   const [kpiData, setKpiData] = useState({
//     pending: 0,
//     collected: 0,
//     partial: 0,
//     completed: 0
//   });

//   // Handler to update KPI data from child components
//   const updateKPIData = (type: ViewType, count: number) => {
//     setKpiData(prev => ({
//       ...prev,
//       [type]: count
//     }));
//   };

//   // Stats for KPISection
//   const stats = [
//     {
//       title: "Samples Pending",
//       value: kpiData.pending.toString(),
//       count: kpiData.pending
//     },
//     {
//       title: "Samples Collected",
//       value: kpiData.collected.toString(),
//       count: kpiData.collected
//     },
//     {
//       title: "Partially Completed Test Results",
//       value: kpiData.partial.toString(),
//       count: kpiData.partial
//     },
//     {
//       title: "Completed Test",
//       value: kpiData.completed.toString(),
//       count: kpiData.completed
//     },
//   ];

//   // Handle KPI card click
//   const handleCardChange = (index: number) => {
//     const views: ViewType[] = ['pending', 'collected', 'partial', 'completed'];
//     setCurrentView(views[index]);
//     setHideKPI(false); // Show KPI when changing views
//   };

//   // Render the appropriate component based on current view
//   const renderContent = () => {
//     switch (currentView) {
//       case 'pending':
//         return <PendingTable onDataUpdate={(count) => updateKPIData('pending', count)} />;
//       case 'collected':
//         return <CollectedSample onDataUpdate={(count) => updateKPIData('collected', count)} />;
//       case 'partial':
//         return (
//           <CollectionTable 
//             onDataUpdate={(count) => updateKPIData('partial', count)}
//             onHideKPI={() => setHideKPI(true)} // Pass callback to hide KPI
//             onShowKPI={() => setHideKPI(false)}  // Pass callback to show KPI
//           />
//         );
//       case 'completed':
//         return <CompletedTable onDataUpdate={(count) => updateKPIData('completed', count)} />;
//       default:
//         return <PendingTable onDataUpdate={(count) => updateKPIData('pending', count)} />;
//     }
//   };

//   return (
//     <div className="w-full">
//       {/* Header */}
//       <div className="mb-5">
//         <h1 className="text-2xl font-semibold text-pneutral-900">
//           Samples Status
//         </h1>
//         <p className="mt-1 text-sm text-pneutral-500">
//           Manage and track pending patient Samples
//         </p>
//       </div>

//       {/* KPI Section - Hide when on result entry screen */}
//       {!hideKPI && (
//         <KPISection
//           data={stats}
//           onCardChange={handleCardChange}
//           selectedIndex={['pending', 'collected', 'partial', 'completed'].indexOf(currentView)}
//         />
//       )}

//       {/* Dynamic Content */}
//       <div className={`mt-5 ${hideKPI ? 'mt-0' : ''}`}>
//         {renderContent()}
//       </div>
//     </div>
//   );
// };

// export default Technician;
























// code by abhishek........................do not chnage......................

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