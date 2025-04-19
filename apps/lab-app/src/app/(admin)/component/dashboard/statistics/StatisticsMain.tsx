import { useLabs } from '@/context/LabContext';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
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
  FaWallet
} from 'react-icons/fa';
import { getLabStatsData } from '../../../../../../services/statusServices';
import Loader from '../../common/Loader';
import BarGraph from "./BarGraph";
import PieChartStatus from "./PieChartStatus";
import TopStats from "./TopStatus";

const StatisticsMain = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{ name: string; value: number | string; icon: JSX.Element }[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('today');
  const [customRange, setCustomRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: null,
    endDate: null,
  });
  const { currentLab } = useLabs();
  
  useEffect(() => {
    if (currentLab?.id) {
      fetchStats();
    }
  }, [currentLab, selectedFilter, customRange]);

  const fetchStats = async () => {
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
        setStats(
          [
            // { name: 'Number of Patients', value: data.numberOfPatients, icon: <FaUserInjured size={28} className="text-primary" /> },
            { name: 'Number of Patients', value: data.numberOfVisits, icon: <FaUserInjured size={28} className="text-primary" /> },
            // { name: 'Number of Visits', value: data.numberOfVisits, icon: <FaClipboardList size={28} className="text-secondary" /> },
            { name: 'Collected Samples', value: data.collectedSamples, icon: <FaFlask size={28} className="text-tertiary" /> },
            { name: 'Pending Samples', value: data.pendingSamples, icon: <FaClock size={28} className="text-deletebutton" /> },
            { name: 'Paid Visits', value: data.paidVisits, icon: <FaMoneyBillWave size={28} className="text-savebutton" /> },
            { name: 'Total Sales', value: `₹${data.totalSales.toLocaleString()}`, icon: <FaMoneyBillWave size={28} className="text-savebutton" /> },
            { name: 'Products Sold', value: data.productsSold, icon: <FaBox size={28} className="text-primarylight" /> },
            { name: 'Average Order Value', value: `₹${data.averageOrderValue}`, icon: <FaWallet size={28} className="text-orange-400" /> },
            { name: 'Total Tests', value: data.totalTests, icon: <FaVial size={28} className="text-blue-400" /> },
            { name: 'Total Health Packages', value: data.totalHealthPackages, icon: <FaBriefcaseMedical size={28} className="text-green-400" /> },
            { name: 'Total Doctors', value: data.totalDoctors, icon: <FaUserMd size={28} className="text-indigo-400" /> },
            { name: 'Total Discounts', value: `₹${data.totalDiscounts}`, icon: <FaPercentage size={28} className="text-red-400" /> },
            { name: 'Total Gross Sales', value: `₹${data.totalGrossSales.toLocaleString()}`, icon: <FaChartLine size={28} className="text-purple-400" /> },
          ]
        );
      }
    } catch (error) {
      console.error('❌ Error fetching lab stats:', error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) return <Loader />;
  return (
    <div className="p-6 grid gap-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold text-textdark">Top Statistics</h2>
        <div className="flex items-center gap-4">
          {selectedFilter === "custom" && (
            <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-300">
              <DatePicker
                selected={customRange.startDate}
                onChange={(date: Date | null) => setCustomRange({ ...customRange, startDate: date })}
                selectsStart
                startDate={customRange.startDate}
                endDate={customRange.endDate}
                placeholderText="Start Date"
                className="p-2 w-36 rounded-md border border-gray-400 focus:border-primary focus:ring-primary/50"
              />
              <DatePicker
                selected={customRange.endDate}
                onChange={(date: Date | null) => setCustomRange({ ...customRange, endDate: date })}
                selectsEnd
                startDate={customRange.startDate}
                endDate={customRange.endDate}
                minDate={customRange.startDate || undefined}
                placeholderText="End Date"
                className="p-2 w-36 rounded-md border border-gray-400 focus:border-primary focus:ring-primary/50"
              />
            </div>
          )}
          <select
            className="px-4 py-2 rounded-md border border-gray-300 bg-white shadow-sm focus:border-primary focus:ring-primary transition hover:border-primary cursor-pointer"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="last7Days">Last 7 Days</option>
            <option value="thisMonth">This Month</option>
            <option value="thisYear">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Top Stats */}
        <div className="flex-1 bg-white shadow-md p-6 rounded-lg">
          <TopStats
            loading={loading}
            stats={stats}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
            customRange={customRange}
            setCustomRange={setCustomRange}
          />
        </div>

        {/* Graphs Section */}
        <div className="flex-1 bg-white shadow-md p-6 rounded-lg flex flex-col gap-6">
          <PieChartStatus 
            loading={loading}
            stats={stats}
            selectedFilter={selectedFilter}
            customRange={customRange}
            setSelectedFilter={setSelectedFilter}
            setCustomRange={setCustomRange}
          />
          <BarGraph
            loading={loading}
            stats={stats}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
            customRange={customRange}
            setCustomRange={setCustomRange}
          />
        </div>
      </div>
    </div>

  );
};
export default StatisticsMain;
