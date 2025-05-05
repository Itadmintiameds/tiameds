import React from "react";
import Loader from "../../common/Loader";
import "react-datepicker/dist/react-datepicker.css";

interface StatItem {
  name: string;
  value: number | string;
  icon: JSX.Element;
}

interface TopStatsProps {
  loading: boolean;
  stats: StatItem[];
  selectedFilter: string;
  setSelectedFilter: (value: string) => void;
  customRange: { startDate: Date | null; endDate: Date | null };
  setCustomRange: (value: { startDate: Date | null; endDate: Date | null }) => void;
}

const TopStats: React.FC<TopStatsProps> = ({
  loading,
  stats,
}) => {
  return (
    <div id="top-stats">
      {loading ? (
        <Loader />
      ) : (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-1">
          {/* If stats are empty */}
          {stats.length === 0 ? (
            <p className="text-center text-gray-500">No data available</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
              {stats.map((stat) => (
                <div
                  key={stat.name}
                  className="group relative overflow-hidden rounded-2xl bg-cardbackground p-6 shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:bg-cardhover hover:shadow-2xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-3">{stat.icon}</div>
                    <p className="text-sm font-medium text-textlight">{stat.name}</p>
                  </div>
                  <p className="mt-6 flex items-baseline gap-x-2">
                    <span className="text-3xl font-bold tracking-tight text-textdark group-hover:text-primary transition-all">
                      {stat.value}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TopStats;

