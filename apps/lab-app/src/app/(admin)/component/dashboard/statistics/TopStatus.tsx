import { getAllVisits } from '../../../../../../services/patientServices';
import { useEffect, useState } from 'react';
import { useLabs } from '@/context/LabContext';
import Loader from '../../common/Loader';
import { Patient } from '@/types/patient/patient';
import {
  FaUserInjured,
  FaClipboardList,
  FaFlask,
  FaClock,
  FaMoneyBillWave,
  FaBox,
  FaWallet,
} from 'react-icons/fa';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);



export default function TopStats() {
  const [loading, setLoading] = useState(false);
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [stats, setStats] = useState<{ name: string; value: number | string; icon: JSX.Element }[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('today');
  const [customRange, setCustomRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: null,
    endDate: null,
  });
  const { currentLab } = useLabs();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (currentLab?.id !== undefined) {
          const res = await getAllVisits(currentLab.id);
          setPatientList(res.data);
        }
      } catch (error) {
        console.error('❌ Error fetching visits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentLab]);

  useEffect(() => {
    calculateStats();
  }, [patientList, selectedFilter, customRange]);

  const calculateStats = () => {
    const now = dayjs();
    let filteredVisits = patientList;

    if (selectedFilter !== 'custom') {
      filteredVisits = patientList.filter((patient) => {
        const visitDate = dayjs(patient.visit.visitDate);
        switch (selectedFilter) {
          case 'today':
            return visitDate.isSame(now, 'day');
          case 'last7Days':
            return visitDate.isSameOrAfter(now.subtract(7, 'day'), 'day');
          case 'thisMonth':
            return visitDate.isSame(now, 'month');
          case 'thisYear':
            return visitDate.isSame(now, 'year');
          default:
            return true;
        }
      });
    } else if (customRange.startDate && customRange.endDate) {
      filteredVisits = patientList.filter((patient) => {
        const visitDate = dayjs(patient.visit.visitDate);
        return (
          visitDate.isSameOrAfter(dayjs(customRange.startDate), 'day') &&
          visitDate.isSameOrBefore(dayjs(customRange.endDate), 'day')
        );
      });
    }

    const uniquePatients = new Set(filteredVisits.map((p) => p.id)).size;
    const totalVisits = filteredVisits.length;
    const collectedSamples = filteredVisits.filter((p) => p.visit.visitStatus === 'Collected').length;
    const pendingSamples = filteredVisits.filter((p) => p.visit.visitStatus !== 'Pending').length;
    const totalSales = filteredVisits.reduce((acc, p) => acc + (p.visit.billing?.totalAmount || 0), 0);
    const totalRevenue = filteredVisits.reduce((acc, p) => acc + (p.visit.billing?.netAmount || 0), 0);
    const productsSold = filteredVisits.reduce((acc, p) => acc + (p.visit.testIds?.length || 0), 0);
    const avgOrderValue = totalVisits > 0 ? Math.round(totalRevenue / totalVisits) : 0;
    // const paidVisits = filteredVisits.filter((p) => p.visit.billing?.paymentStatus === PaymentStatus.PAID).length;  // New line
    const paidVisits = filteredVisits.filter((p) => p.visit.billing?.paymentStatus?.toLowerCase() === 'paid').length;

    

    setStats([
      { name: 'Number of Patients', value: uniquePatients, icon: <FaUserInjured size={28} className="text-primary" /> },
      { name: 'Number of Visits', value: totalVisits, icon: <FaClipboardList size={28} className="text-secondary" /> },
      { name: 'Collected Samples', value: collectedSamples, icon: <FaFlask size={28} className="text-tertiary" /> },
      { name: 'Pending Samples', value: pendingSamples, icon: <FaClock size={28} className="text-deletebutton" /> },
      {name : 'Paid Visits', value: paidVisits, icon: <FaMoneyBillWave size={28} className="text-savebutton" />},  // New line  
      { name: 'Total Sales', value: `₹${totalSales.toLocaleString()}`, icon: <FaMoneyBillWave size={28} className="text-savebutton" /> },
      // { name: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: <FaChartLine size={28} className="text-updatebutton" /> },
      { name: 'Products Sold', value: productsSold, icon: <FaBox size={28} className="text-primarylight" /> },
      { name: 'Average Order Value', value: `₹${avgOrderValue}`, icon: <FaWallet size={28} className="text-orange-400" /> },
    ]);
  };

  console.log('📊 Stats:', stats);

  console.log('patientList:', patientList);

  return (
    <div id="top-stats">
      {loading ? (
        <Loader />
      ) : (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-semibold text-textdark">Top Statistics</h2>
            <div className="flex items-center gap-4">
              <select
                className="rounded-lg border-gray-300 bg-cardbackground p-2 shadow-sm focus:border-primary focus:ring-primary"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="last7Days">Last 7 Days</option>
                <option value="thisMonth">This Month</option>
                <option value="thisYear">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
              {selectedFilter === 'custom' && (
                <div className="flex gap-2 items-center">
                  <DatePicker
                    selected={customRange.startDate}
                    onChange={(date) => setCustomRange((prev) => ({ ...prev, startDate: date }))}
                    selectsStart
                    startDate={customRange.startDate}
                    endDate={customRange.endDate}
                    placeholderText="Start Date"
                    className="p-2 rounded-lg border border-gray-300"
                  />
                  <DatePicker
                    selected={customRange.endDate}
                    onChange={(date) => setCustomRange((prev) => ({ ...prev, endDate: date }))}
                    selectsEnd
                    startDate={customRange.startDate}
                    endDate={customRange.endDate}
                    minDate={customRange.startDate || undefined}
                    placeholderText="End Date"
                    className="p-2 rounded-lg border border-gray-300"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
        </div>
      )}
    </div>
  );
}









