




import { useLabs } from '@/context/LabContext';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import {
  FaBox,
  FaBriefcaseMedical,
  FaChartLine,
  FaClock,
  FaFlask,
  FaMoneyBillWave,
  FaPercentage,
  FaUserInjured,
  FaUserMd,
  FaVial,
  FaWallet,

} from 'react-icons/fa';
import { getLabStatsData } from '../../../../../../services/statusServices';
import Loader from '../../common/Loader';
// import BarGraph from "./BarGraph";
import PieChartStatus from "./PieChartStatus";

const TopStats = ({ stats }: { stats: { name: string; value: number | string; icon: JSX.Element }[] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="flex items-center bg-gradient-to-br from-white to-gray-50 rounded-xl p-3 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-primary/20 min-h-[75px]"
        >
          <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-md mr-3 text-primary">
            {stat.icon}
          </div>
          <div className="flex flex-col justify-center min-w-0 flex-1">
            <span className="font-bold text-base text-gray-800 leading-tight mb-1">{stat.value}</span>
            <span className="text-xs text-gray-500 leading-tight">{stat.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const StatisticsMain = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{ name: string; value: number | string; icon: JSX.Element }[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('today');
  const [customRange, setCustomRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: null,
    endDate: null,
  });
  const { currentLab } = useLabs();

  
  
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const now = dayjs();
      let startDate = now.startOf('day').format('YYYY-MM-DD');
      let endDate = now.endOf('day').format('YYYY-MM-DD');
  
      if (selectedFilter === 'last7Days') {
        startDate = now.subtract(7, 'days').format('YYYY-MM-DD');
      } else if (selectedFilter === 'thisMonth') {
        startDate = now.startOf('month').format('YYYY-MM-DD');
      } else if (selectedFilter === 'thisYear') {
        startDate = now.startOf('year').format('YYYY-MM-DD');
      } else if (selectedFilter === 'custom' && customRange.startDate && customRange.endDate) {
        startDate = dayjs(customRange.startDate).format('YYYY-MM-DD');
        endDate = dayjs(customRange.endDate).format('YYYY-MM-DD');
      }
  
      let data;
      if (currentLab?.id) {
        data = await getLabStatsData(currentLab.id.toString(), startDate, endDate);
      }
  
      if (data) {
        setStats([
          { name: 'Patients', value: data.numberOfVisits, icon: <FaUserInjured className="text-purple-600 w-5 h-5" /> },
          { name: 'Collected Samples', value: data.collectedSamples, icon: <FaFlask className="text-blue-600 w-5 h-5" /> },
          { name: 'Pending Samples', value: data.pendingSamples, icon: <FaClock className="text-amber-500 w-5 h-5" /> },
          { name: 'Paid Visits', value: data.paidVisits, icon: <FaMoneyBillWave className="text-green-600 w-5 h-5" /> },
          { name: 'Total Sales', value: `₹${data.totalSales.toLocaleString()}`, icon: <FaMoneyBillWave className="text-emerald-600 w-5 h-5" /> },
          { name: 'Products Sold', value: data.productsSold, icon: <FaBox className="text-indigo-600 w-5 h-5" /> },
          { name: 'Avg Order Value', value: `₹${Number(data.averageOrderValue).toFixed(2)}`, icon: <FaWallet className="text-orange-500 w-5 h-5" /> },
          { name: 'Total Tests', value: data.totalTests, icon: <FaVial className="text-cyan-600 w-5 h-5" /> },
          { name: 'Health Packages', value: data.totalHealthPackages, icon: <FaBriefcaseMedical className="text-teal-600 w-5 h-5" /> },
          { name: 'Doctors', value: data.totalDoctors, icon: <FaUserMd className="text-violet-600 w-5 h-5" /> },
          { name: 'Total Discounts', value: `₹${Number(data.totalDiscounts).toFixed(2)}`, icon: <FaPercentage className="text-red-500 w-5 h-5" /> },
          { name: 'Gross Sales', value: `₹${data.totalGrossSales.toLocaleString()}`, icon: <FaChartLine className="text-purple-600 w-5 h-5" /> },
        ]);
      }
    } catch (error) {
      // Handle lab stats fetch error
    } finally {
      setLoading(false);
    }
  }, [selectedFilter, customRange, currentLab]);

  useEffect(() => {
    if (currentLab?.id) {
      fetchStats();
    }
  }, [currentLab, selectedFilter, customRange, fetchStats]);
  

  if (loading) return <Loader />;

  return (
    <div className="p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Lab Performance Dashboard</h2>
          <p className="hidden lg:block text-sm text-gray-600 mt-1">
            Comprehensive analytics and insights for {currentLab?.name || 'your lab'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-col w-40">
            <label className="text-xs font-semibold mb-1 text-gray-600">Date Range:</label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="border border-gray-300 px-3 py-1.5 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="today">Today</option>
              <option value="last7Days">Last 7 Days</option>
              <option value="thisMonth">This Month</option>
              <option value="thisYear">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {selectedFilter === "custom" && (
            <>
              <div className="flex flex-col w-40">
                <label className="text-xs font-semibold mb-1 text-gray-600">Start Date:</label>
                <input
                  type="date"
                  value={customRange.startDate ? customRange.startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setCustomRange({ ...customRange, startDate: e.target.value ? new Date(e.target.value) : null })}
                  className="border border-gray-300 px-3 py-1.5 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                />
              </div>

              <div className="flex flex-col w-40">
                <label className="text-xs font-semibold mb-1 text-gray-600">End Date:</label>
                <input
                  type="date"
                  value={customRange.endDate ? customRange.endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setCustomRange({ ...customRange, endDate: e.target.value ? new Date(e.target.value) : null })}
                  className="border border-gray-300 px-3 py-1.5 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Key Metrics</h3>
          <span className="text-xs text-gray-500">
            Last updated: {dayjs().format('DD MMM YYYY, hh:mm A')}
          </span>
        </div>
        <TopStats stats={stats} />
      </div>

      {/* Charts Section - Fixed layout */}
      <div className="space-y-full">
        <div className="lg:hidden text-sm text-gray-600 px-2">
          Swipe left/right to view different charts and insights for your lab.
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
          {/* Pie Chart Container */}
          <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 border border-gray-100 hover:shadow-md transition-shadow min-h-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sample Status Distribution</h3>
            <div className="h-auto w-full">
              <PieChartStatus
                loading={loading}
                stats={stats}
                selectedFilter={selectedFilter}
                customRange={customRange}
                setSelectedFilter={setSelectedFilter}
                setCustomRange={setCustomRange}
              />
            </div>
          </div>

          {/* Bar Chart Container */}
          {/* <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 border border-gray-100 hover:shadow-md transition-shadow min-h-[400px]">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales & Activity Trends</h3>
            <div className="h-[300px] w-full">
              <BarGraph
                loading={loading}
                stats={stats}
                selectedFilter={selectedFilter}
                customRange={customRange}
                setSelectedFilter={setSelectedFilter}
                setCustomRange={setCustomRange}
              />
            </div>
          </div> */}
        </div>
      </div>

      {/* Quick Insights */}
      {/* <div className="mt-8 bg-gradient-to-r from-primary/5 to-blue-50 rounded-2xl p-6 border border-primary/10">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Busiest Day</div>
            <div className="font-bold text-gray-800">Monday</div>
            <div className="text-xs text-gray-400 mt-1">30% more visits than average</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Top Service</div>
            <div className="font-bold text-gray-800">Complete Blood Count</div>
            <div className="text-xs text-gray-400 mt-1">25% of total tests</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Revenue Growth</div>
            <div className="font-bold text-green-600">+12.5%</div>
            <div className="text-xs text-gray-400 mt-1">vs previous period</div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default StatisticsMain;