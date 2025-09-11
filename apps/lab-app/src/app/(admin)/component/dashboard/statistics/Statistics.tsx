import { IoIosStats } from "react-icons/io";
import { FaChartBar } from "react-icons/fa";
import React, { useCallback, useState } from 'react';
import Loader from '../../common/Loader';
import SubTabComponent from '../../common/SubTabComponent';
import StatisticsMain from './StatisticsMain';
import { useRouter } from 'next/navigation';

// Component for Detailed Analytics tab that redirects to detailed reports
const DetailedAnalytics = () => {
    const router = useRouter();
    
    // Redirect to detailed reports page
    React.useEffect(() => {
        router.push('/dashboard/detailreports');
    }, [router]);
    
    return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Redirecting to Detailed Analytics...</p>
            </div>
        </div>
    );
};

const tabs = [
    { id: 'Status', icon: <IoIosStats size={16} />, label: 'Stats', content: <StatisticsMain /> },
    { id: 'DetailedAnalytics', icon: <FaChartBar size={16} />, label: 'Detailed Analytics', content: <DetailedAnalytics /> },
];
const Statistics = () => {
    const [activeTab, setActiveTab] = useState<string>('Status'); // Default tab set directly

    const handleTabChange = useCallback((tabId: string) => {
        setActiveTab(tabId);
    }, []);

    if (!activeTab) {
        return <Loader />;
    }

    const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

    return (
        <SubTabComponent tabs={tabs} selectedTab={activeTab} onTabChange={handleTabChange}>
            {activeTabContent || <div>No content available</div>}
        </SubTabComponent>
    );
};

export default Statistics;
