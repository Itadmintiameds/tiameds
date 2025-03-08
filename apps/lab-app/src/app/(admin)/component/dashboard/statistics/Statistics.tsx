import { IoIosStats } from "react-icons/io";
import { useCallback, useState } from 'react';
import Loader from '../../common/Loader';
import SubTabComponent from '../../common/SubTabComponent';
import StatisticsMain from './StatisticsMain';

const tabs = [
    { id: 'Status', icon: <IoIosStats size={16} />, label: 'Stats', content: <StatisticsMain /> },
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
