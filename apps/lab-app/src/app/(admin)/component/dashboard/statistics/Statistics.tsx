import AdminStats from './AdminStats';
import SuperAdminStats from './SuperAdminStats';
import { useAuth } from '@/hooks/useAuth';

const Statistics = () => {
    const { isSuperAdmin } = useAuth();

    return isSuperAdmin ? <SuperAdminStats /> : <AdminStats />;
};

export default Statistics;




// code written by abhishek .............do not delete this ................

// import { IoIosStats } from "react-icons/io";
// import { FaChartBar } from "react-icons/fa";
// import React, { useCallback, useState } from 'react';
// import Loader from '../../common/Loader';
// import SubTabComponent from '../../common/SubTabComponent';
// import AdminStats from './AdminStats';
// import SuperAdminStats from './SuperAdminStats';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/hooks/useAuth';

// // Component for Detailed Analytics tab that redirects to detailed reports
// const DetailedAnalytics = () => {
//     const router = useRouter();
    
//     // Redirect to detailed reports page
//     React.useEffect(() => {
//         router.push('/dashboard/detailreports');
//     }, [router]);
    
//     return (
//         <div className="flex items-center justify-center h-64">
//             <div className="text-center">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
//                 <p className="text-gray-600">Redirecting to Detailed Analytics...</p>
//             </div>
//         </div>
//     );
// };

// const Statistics = () => {
//     const [activeTab, setActiveTab] = useState<string>('Status'); // Default tab set directly
//     const { isSuperAdmin } = useAuth();

//     const handleTabChange = useCallback((tabId: string) => {
//         setActiveTab(tabId);
//     }, []);

//     // Super admins get a single real-time statistics screen, no sub-tabs.
//     if (isSuperAdmin) {
//         return <SuperAdminStats />;
//     }

//     const tabs = [
//         { id: 'Status', icon: <IoIosStats size={16} />, label: 'Stats', content: <AdminStats /> },
//         { id: 'DetailedAnalytics', icon: <FaChartBar size={16} />, label: 'Detailed Analytics', content: <DetailedAnalytics /> },
//     ];

//     if (!activeTab) {
//         return <Loader />;
//     }

//     const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

//     return (
//         <SubTabComponent tabs={tabs} selectedTab={activeTab} onTabChange={handleTabChange}>
//             {activeTabContent || <div>No content available</div>}
//         </SubTabComponent>
//     );
// };

// export default Statistics;
