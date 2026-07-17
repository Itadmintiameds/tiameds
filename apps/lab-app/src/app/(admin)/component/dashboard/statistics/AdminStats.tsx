import { FaTools } from 'react-icons/fa';
import StatisticsMain from './StatisticsMain';

const AdminStats = () => {
    return (
        <div>
            <div className="mx-4 md:mx-6 mt-4 flex items-start gap-3 rounded-xl border border-warning-500 bg-warning-50 px-4 py-3">
                <FaTools className="mt-0.5 shrink-0 text-[#2a78d6] w-4 h-4" />
                <p className="text-sm text-warning-600">
                    <span className="font-semibold ">A redesigned analytics experience for admins is in progress.</span>{' '}
                    You&apos;re viewing the current dashboard in the meantime.
                </p>
            </div>
            <StatisticsMain />
        </div>
    );
};

export default AdminStats;
