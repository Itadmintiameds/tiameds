'use client';

import React, { useState, useEffect, useMemo } from 'react';
import './ReportsGraphView.css';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getDatewiseTransactionDetails } from '@/../services/patientServices';
import { useLabs } from '@/context/LabContext';
import { FaMoneyBillWave, FaFileInvoice, FaCalendarDay, FaReceipt, FaChartLine, FaRupeeSign, FaFileAlt, FaUsers, FaUndo, FaArrowUp } from 'react-icons/fa';
import Loader from './Loader';


interface ReportsGraphViewProps {
  startDate?: string;
  endDate?: string;
}

interface TransactionData {
  id: number;
  firstName: string;
  visit: {
    visitId: number;
    visitDate: string;
    visitType: string;
    billing: {
      billingId: number;
      totalAmount: number;
      discount: number;
      netAmount: number;
      received_amount: number;
      due_amount: number;
      billingDate: string;
      paymentMethod: string;
      transactions: Array<{
        id: number;
        payment_method: string;
        received_amount: number;
        refund_amount: number;
        due_amount: number;
        cash_amount: number;
        card_amount: number;
        upi_amount: number;
        payment_date: string;
        created_at: string;
      }>;
    };
    testResult: Array<{
      testName: string;
      category: string;
    }>;
    listofeachtestdiscount: Array<{
      testName: string;
      finalPrice: number;
      category: string;
    }>;
    doctorName?: string;
  };
}

const COLORS = {
  purple: ['#8B5CF6', '#7C3AED', '#E1C4F8', '#d1a8f5'],
  yellow: ['#FCD34D', '#FBBF24', '#FEF3C7', '#FDE68A'],
  green: ['#10B981', '#059669', '#D1FAE5', '#A7F3D0'],
  blue: ['#3B82F6', '#2563EB', '#DBEAFE', '#BFDBFE'],
  orange: ['#F59E0B', '#D97706', '#FED7AA', '#FCD34D'],
  red: ['#EF4444', '#DC2626', '#FEE2E2', '#FECACA'],
};

const ReportsGraphView: React.FC<ReportsGraphViewProps> = ({ startDate, endDate }) => {
  const { currentLab } = useLabs();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TransactionData[]>([]);

  // Format date range for display
  const formatDateRange = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const startFormatted = start.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const endFormatted = end.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      return `${startFormatted} - ${endFormatted}`;
    }
    if (startDate) {
      const start = new Date(startDate);
      return `From ${start.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })}`;
    }
    if (endDate) {
      const end = new Date(endDate);
      return `Until ${end.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })}`;
    }
    return null;
  };

  const headerDateRange = formatDateRange();

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!currentLab?.id) {
        setData([]);
        return;
      }

      // If dates are not provided, use today's date as default
      let start = startDate;
      let end = endDate;

      // Handle undefined, null, or empty string dates
      if (!start || !end || start === 'undefined' || end === 'undefined' || start === 'null' || end === 'null') {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        start = todayStr;
        end = todayStr;
      }

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(start) || !dateRegex.test(end)) {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        start = todayStr;
        end = todayStr;
      }

      try {
        setLoading(true);
        const response = await getDatewiseTransactionDetails(
          currentLab.id,
          start,
          end
        );
        const apiData = Array.isArray(response) ? response : response?.data || [];
        setData(apiData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setData([]);
        // Error is handled by empty state check below
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentLab?.id, startDate, endDate]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount === 0 ? '0' : amount.toFixed(2);
  };

  // ========== AMOUNT RECEIVED DATA ==========
  const amountReceivedData = useMemo(() => {
    const dailyData = new Map<string, { date: string; received: number; due: number; netReceived: number }>();
    
    data.forEach((patient) => {
      const transactions = patient.visit.billing.transactions || [];
      transactions.forEach((transaction) => {
        const date = transaction.payment_date || patient.visit.billing.billingDate;
        const existing = dailyData.get(date) || { date, received: 0, due: 0, netReceived: 0 };
        existing.received += transaction.received_amount || 0;
        existing.due += transaction.due_amount || 0;
        existing.netReceived += (transaction.received_amount || 0) - (transaction.refund_amount || 0);
        dailyData.set(date, existing);
      });
    });

    return Array.from(dailyData.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  const paymentMethodsData = useMemo(() => {
    let cash = 0, card = 0, upi = 0;
    
    data.forEach((patient) => {
      patient.visit.billing.transactions?.forEach((transaction) => {
        const method = transaction.payment_method?.toLowerCase() || '';
        if (method.includes('cash')) cash += transaction.received_amount || 0;
        else if (method.includes('card')) card += transaction.received_amount || 0;
        else if (method.includes('upi') || method.includes('imps')) upi += transaction.received_amount || 0;
      });
    });

    return [
      { name: 'Cash', value: cash, color: COLORS.blue[0] },
      { name: 'Card', value: card, color: COLORS.purple[0] },
      { name: 'UPI', value: upi, color: COLORS.orange[0] },
    ].filter(item => item.value > 0);
  }, [data]);

  // ========== BILL REPORT DATA ==========
  const billReportData = useMemo(() => {
    const categoryMap = new Map<string, { amount: number; count: number }>();
    const doctorMap = new Map<string, { amount: number; count: number }>();
    let total = 0, discount = 0, netAmount = 0;

    const processedVisits = new Set<number>();
    
    data.forEach((patient) => {
      const visitId = patient.visit.visitId;
      if (processedVisits.has(visitId)) return;
      processedVisits.add(visitId);

      const billing = patient.visit.billing;
      total += billing.totalAmount || 0;
      discount += billing.discount || 0;
      netAmount += billing.netAmount || 0;

      // Lab tests by category
      patient.visit.listofeachtestdiscount?.forEach((test) => {
        const category = test.category || 'OTHER';
        const existing = categoryMap.get(category) || { amount: 0, count: 0 };
        existing.amount += test.finalPrice || 0;
        existing.count += 1;
        categoryMap.set(category, existing);
      });

      // Doctors
      const doctorName = patient.visit.doctorName || 'No Doctor';
      const existing = doctorMap.get(doctorName) || { amount: 0, count: 0 };
      existing.amount += patient.visit.listofeachtestdiscount?.reduce((sum, t) => sum + (t.finalPrice || 0), 0) || 0;
      existing.count += patient.visit.testResult?.length || 0;
      doctorMap.set(doctorName, existing);
    });

    return {
      summary: [
        { name: 'Total', value: total, color: COLORS.purple[0] },
        { name: 'Discount', value: discount, color: COLORS.yellow[0] },
        { name: 'Net Amount', value: netAmount, color: COLORS.green[0] },
      ],
      categories: Array.from(categoryMap.entries()).map(([name, data]) => ({
        name,
        amount: data.amount,
        count: data.count,
      })).sort((a, b) => b.amount - a.amount).slice(0, 10),
      doctors: Array.from(doctorMap.entries()).map(([name, data]) => ({
        name,
        amount: data.amount,
        count: data.count,
      })).sort((a, b) => b.amount - a.amount).slice(0, 10),
    };
  }, [data]);

  // ========== DAY CLOSING SUMMARY DATA ==========
  const dayClosingData = useMemo(() => {
    const dailyMap = new Map<string, {
      date: string;
      bills: number;
      sales: number;
      receipts: number;
      payments: number;
    }>();

    data.forEach((patient) => {
      const date = patient.visit.billing.billingDate || patient.visit.visitDate;
      const existing = dailyMap.get(date) || { date, bills: 0, sales: 0, receipts: 0, payments: 0 };
      
      existing.bills += 1;
      existing.sales += patient.visit.billing.totalAmount || 0;
      
      patient.visit.billing.transactions?.forEach((transaction) => {
        existing.receipts += transaction.received_amount || 0;
        existing.payments += transaction.refund_amount || 0;
      });
      
      dailyMap.set(date, existing);
    });

    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  const billCountData = useMemo(() => {
    const uniqueVisits = new Set<number>();
    let cashBills = 0;

    data.forEach((patient) => {
      const visitId = patient.visit.visitId;
      if (uniqueVisits.has(visitId)) return;
      uniqueVisits.add(visitId);

      if ((patient.visit.billing.received_amount || 0) > 0) {
        cashBills += 1;
      }
    });

    return [
      { name: 'Total Bills', value: uniqueVisits.size, color: COLORS.blue[0] },
      { name: 'Cash Bills', value: cashBills, color: COLORS.green[0] },
      { name: 'Credit Bills', value: uniqueVisits.size - cashBills, color: COLORS.purple[0] },
    ];
  }, [data]);

  // ========== RECEIPTS SUMMARY DATA ==========
  const receiptsData = useMemo(() => {
    const modeMap = {
      current: { cash: 0, card: 0, upi: 0 },
      past: { cash: 0, card: 0, upi: 0 },
    };

    const selectedDate = startDate || new Date().toISOString().split('T')[0];

    data.forEach((patient) => {
      const billingDate = patient.visit.billing.billingDate;
      const isCurrent = billingDate === selectedDate;
      const target = isCurrent ? modeMap.current : modeMap.past;

      patient.visit.billing.transactions?.forEach((transaction) => {
        if (transaction.received_amount > 0) {
          const method = transaction.payment_method?.toLowerCase() || '';
          if (method.includes('cash')) target.cash += transaction.received_amount;
          else if (method.includes('card')) target.card += transaction.received_amount;
          else if (method.includes('upi') || method.includes('imps')) target.upi += transaction.received_amount;
        }
      });
    });

    return {
      current: [
        { name: 'Cash', value: modeMap.current.cash, color: COLORS.blue[0] },
        { name: 'Card', value: modeMap.current.card, color: COLORS.purple[0] },
        { name: 'UPI', value: modeMap.current.upi, color: COLORS.orange[0] },
      ].filter(item => item.value > 0),
      past: [
        { name: 'Cash', value: modeMap.past.cash, color: COLORS.blue[0] },
        { name: 'Card', value: modeMap.past.card, color: COLORS.purple[0] },
        { name: 'UPI', value: modeMap.past.upi, color: COLORS.orange[0] },
      ].filter(item => item.value > 0),
    };
  }, [data, startDate]);

  // ========== SUMMARY KPIs ==========
  const summaryKPIs = useMemo(() => {
    const processedVisits = new Set<number>();
    let totalRevenue = 0;
    let totalBills = 0;
    let totalReceipts = 0;
    let totalRefunds = 0;
    let totalDiscount = 0;
    let totalTests = 0;

    data.forEach((patient) => {
      const visitId = patient.visit.visitId;
      if (!processedVisits.has(visitId)) {
        processedVisits.add(visitId);
        totalBills += 1;
        totalRevenue += patient.visit.billing.totalAmount || 0;
        totalDiscount += patient.visit.billing.discount || 0;
        totalTests += patient.visit.testResult?.length || 0;
      }

      patient.visit.billing.transactions?.forEach((transaction) => {
        totalReceipts += transaction.received_amount || 0;
        totalRefunds += transaction.refund_amount || 0;
      });
    });

    const netReceipts = totalReceipts - totalRefunds;
    const averageTransaction = totalBills > 0 ? totalReceipts / totalBills : 0;

    return {
      totalRevenue,
      totalBills,
      totalReceipts,
      netReceipts,
      totalRefunds,
      totalDiscount,
      totalTests,
      averageTransaction,
    };
  }, [data]);

  // ========== REFUND ANALYSIS DATA ==========
  const refundData = useMemo(() => {
    const dailyRefunds = new Map<string, { date: string; refund: number }>();
    const refundByMethod = { cash: 0, card: 0, upi: 0 };

    data.forEach((patient) => {
      patient.visit.billing.transactions?.forEach((transaction) => {
        if (transaction.refund_amount > 0) {
          const date = transaction.payment_date || patient.visit.billing.billingDate;
          const existing = dailyRefunds.get(date) || { date, refund: 0 };
          existing.refund += transaction.refund_amount || 0;
          dailyRefunds.set(date, existing);

          const method = transaction.payment_method?.toLowerCase() || '';
          if (method.includes('cash')) refundByMethod.cash += transaction.refund_amount;
          else if (method.includes('card')) refundByMethod.card += transaction.refund_amount;
          else if (method.includes('upi') || method.includes('imps')) refundByMethod.upi += transaction.refund_amount;
        }
      });
    });

    return {
      daily: Array.from(dailyRefunds.values()).sort((a, b) => a.date.localeCompare(b.date)),
      byMethod: [
        { name: 'Cash', value: refundByMethod.cash, color: COLORS.blue[0] },
        { name: 'Card', value: refundByMethod.card, color: COLORS.purple[0] },
        { name: 'UPI', value: refundByMethod.upi, color: COLORS.orange[0] },
      ].filter(item => item.value > 0),
    };
  }, [data]);

  // ========== VISIT TYPE BREAKDOWN ==========
  const visitTypeData = useMemo(() => {
    const typeMap = new Map<string, { count: number; revenue: number }>();

    const processedVisits = new Set<number>();
    data.forEach((patient) => {
      const visitId = patient.visit.visitId;
      if (processedVisits.has(visitId)) return;
      processedVisits.add(visitId);

      const visitType = patient.visit.visitType || 'Unknown';
      const existing = typeMap.get(visitType) || { count: 0, revenue: 0 };
      existing.count += 1;
      existing.revenue += patient.visit.billing.totalAmount || 0;
      typeMap.set(visitType, existing);
    });

    return Array.from(typeMap.entries()).map(([name, data]) => ({
      name: name === 'Out-Patient' ? 'OP' : name === 'In-Patient' ? 'IP' : name,
      count: data.count,
      revenue: data.revenue,
    }));
  }, [data]);

  // ========== DISCOUNT TRENDS ==========
  const discountTrendData = useMemo(() => {
    const dailyDiscounts = new Map<string, { date: string; discount: number; totalAmount: number }>();

    const processedVisits = new Set<number>();
    data.forEach((patient) => {
      const visitId = patient.visit.visitId;
      if (processedVisits.has(visitId)) return;
      processedVisits.add(visitId);

      const date = patient.visit.billing.billingDate || patient.visit.visitDate;
      const existing = dailyDiscounts.get(date) || { date, discount: 0, totalAmount: 0 };
      existing.discount += patient.visit.billing.discount || 0;
      existing.totalAmount += patient.visit.billing.totalAmount || 0;
      dailyDiscounts.set(date, existing);
    });

    return Array.from(dailyDiscounts.values())
      .map(item => ({
        ...item,
        discountPercent: item.totalAmount > 0 ? (item.discount / item.totalAmount) * 100 : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  // ========== TEST COUNT DATA ==========
  const testCountData = useMemo(() => {
    const dailyTests = new Map<string, { date: string; count: number }>();
    const categoryTestCount = new Map<string, number>();

    const processedVisits = new Set<number>();
    data.forEach((patient) => {
      const visitId = patient.visit.visitId;
      if (processedVisits.has(visitId)) return;
      processedVisits.add(visitId);

      const date = patient.visit.billing.billingDate || patient.visit.visitDate;
      const existing = dailyTests.get(date) || { date, count: 0 };
      existing.count += patient.visit.testResult?.length || 0;
      dailyTests.set(date, existing);

      patient.visit.testResult?.forEach((test) => {
        const category = test.category || 'OTHER';
        categoryTestCount.set(category, (categoryTestCount.get(category) || 0) + 1);
      });
    });

    return {
      daily: Array.from(dailyTests.values()).sort((a, b) => a.date.localeCompare(b.date)),
      byCategory: Array.from(categoryTestCount.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    };
  }, [data]);

  // ========== NET RECEIPTS DATA ==========
  const netReceiptsData = useMemo(() => {
    const dailyNet = new Map<string, { date: string; receipts: number; refunds: number; net: number }>();

    data.forEach((patient) => {
      const date = patient.visit.billing.billingDate || patient.visit.visitDate;
      const existing = dailyNet.get(date) || { date, receipts: 0, refunds: 0, net: 0 };

      patient.visit.billing.transactions?.forEach((transaction) => {
        existing.receipts += transaction.received_amount || 0;
        existing.refunds += transaction.refund_amount || 0;
        existing.net = existing.receipts - existing.refunds;
      });

      dailyNet.set(date, existing);
    });

    return Array.from(dailyNet.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader type="progress" fullScreen={false} text="Loading graphical reports..." />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <FaChartLine className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-semibold">No data available</p>
          <p className="text-sm">Please select a date range to view graphical reports</p>
          {currentLab?.id && (
            <p className="text-xs text-gray-400 mt-2">
              Date Range: {headerDateRange || 'Not specified'}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Calculate additional metrics for engagement
  const avgBillValue = summaryKPIs.totalBills > 0 ? summaryKPIs.totalRevenue / summaryKPIs.totalBills : 0;
  const refundRate = summaryKPIs.totalReceipts > 0 ? (summaryKPIs.totalRefunds / summaryKPIs.totalReceipts) * 100 : 0;
  const discountRate = summaryKPIs.totalRevenue > 0 ? (summaryKPIs.totalDiscount / summaryKPIs.totalRevenue) * 100 : 0;

  return (
    <div className="space-y-4" style={{ animation: 'fadeIn 0.6s ease-out' }}>
      {/* SUMMARY KPI CARDS - Enhanced with animations */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FaRupeeSign className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
              <FaArrowUp className="w-3 h-3 text-green-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-purple-700 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-purple-900 mb-1">₹{formatCurrency(summaryKPIs.totalRevenue)}</p>
          <p className="text-[10px] text-purple-600">Avg: ₹{formatCurrency(avgBillValue)}/bill</p>
        </div>

        <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FaFileAlt className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-full">
              <FaFileInvoice className="w-3 h-3 text-blue-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-blue-700 mb-1">Total Bills</p>
          <p className="text-2xl font-bold text-blue-900 mb-1">{summaryKPIs.totalBills}</p>
          <p className="text-[10px] text-blue-600">Bills processed</p>
        </div>

        <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FaMoneyBillWave className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
              <FaArrowUp className="w-3 h-3 text-green-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-green-700 mb-1">Net Receipts</p>
          <p className="text-2xl font-bold text-green-700 mb-1">₹{formatCurrency(summaryKPIs.netReceipts)}</p>
          <p className="text-[10px] text-green-600">
            {refundRate > 0 ? `Refund: ${refundRate.toFixed(1)}%` : 'No refunds'}
          </p>
        </div>

        <div className="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 p-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FaUsers className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-full">
              <FaArrowUp className="w-3 h-3 text-orange-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-orange-700 mb-1">Total Tests</p>
          <p className="text-2xl font-bold text-orange-900 mb-1">{summaryKPIs.totalTests}</p>
          <p className="text-[10px] text-orange-600">
            {summaryKPIs.totalBills > 0 ? `Avg: ${(summaryKPIs.totalTests / summaryKPIs.totalBills).toFixed(1)}/bill` : 'No tests'}
          </p>
        </div>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-yellow-700 font-medium mb-1">Total Discount</p>
              <p className="text-lg font-bold text-yellow-900">₹{formatCurrency(summaryKPIs.totalDiscount)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-yellow-600">{discountRate.toFixed(1)}%</p>
              <p className="text-[10px] text-yellow-500">of revenue</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200 p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-700 font-medium mb-1">Total Refunds</p>
              <p className="text-lg font-bold text-red-900">₹{formatCurrency(summaryKPIs.totalRefunds)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-red-600">{refundRate.toFixed(1)}%</p>
              <p className="text-[10px] text-red-500">refund rate</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200 p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-indigo-700 font-medium mb-1">Avg Transaction</p>
              <p className="text-lg font-bold text-indigo-900">₹{formatCurrency(summaryKPIs.averageTransaction)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-indigo-600">Per bill</p>
              <p className="text-[10px] text-indigo-500">average</p>
            </div>
          </div>
        </div>
      </div>

      {/* 1. AMOUNT RECEIVED SECTION - Merged Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
        <div 
          className="px-4 py-3 border-b border-gray-200 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, #E1C4F8 0%, #d1a8f5 100%)` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" style={{ animation: 'shimmer 3s infinite' }}></div>
          <div className="flex items-center gap-2 relative z-10">
            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-all duration-200">
              <FaChartLine className="w-3.5 h-3.5 text-white animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white drop-shadow-sm">Graphical Reports Dashboard</h3>
                {headerDateRange && (
                  <>
                    <span className="text-xs text-white/70">•</span>
                    <p className="text-[11px] font-medium text-white/90 bg-white/20 px-2 py-0.5 rounded-full">
                      {headerDateRange}
                    </p>
                  </>
                )}
              </div>
              <p className="text-xs text-white/90 mt-0.5 font-medium">Comprehensive visual analytics for all reports</p>
            </div>
            <div className="p-1 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-all duration-200 hover:scale-110">
              <FaMoneyBillWave className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
        <div className="p-3 space-y-3">
          {/* Daily Trend */}
          <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-6 bg-gradient-to-b from-green-400 to-green-600 rounded-full"></div>
              <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Daily Received Trend</h5>
            </div>
            {amountReceivedData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={amountReceivedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: '#6B7280' }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                    }}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#6B7280' }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`₹${formatCurrency(value)}`, '']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '8px',
                      fontSize: '11px',
                      padding: '8px'
                    }}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area 
                    type="monotone" 
                    dataKey="received" 
                    stackId="1" 
                    stroke={COLORS.green[0]} 
                    fill={COLORS.green[2]} 
                    name="Received"
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="netReceived" 
                    stackId="2" 
                    stroke={COLORS.blue[0]} 
                    fill={COLORS.blue[2]} 
                    name="Net Received"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500 text-xs">No trend data available</div>
            )}
          </div>

          {/* Net Receipts Trend */}
          <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
              <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Net Receipts Trend</h5>
            </div>
            {netReceiptsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={netReceiptsData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: '#6B7280' }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                    }}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#6B7280' }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => `₹${formatCurrency(value)}`}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '8px',
                      fontSize: '11px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area 
                    type="monotone" 
                    dataKey="receipts" 
                    stackId="1" 
                    stroke={COLORS.green[0]} 
                    fill={COLORS.green[2]} 
                    name="Receipts"
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="refunds" 
                    stackId="2" 
                    stroke={COLORS.red[0]} 
                    fill={COLORS.red[2]} 
                    name="Refunds"
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="net" 
                    stroke={COLORS.blue[0]} 
                    fill="transparent" 
                    name="Net Receipts"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500 text-xs">No net receipts data</div>
            )}
          </div>

          {/* Payment Methods & Comparison - Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Payment Methods */}
            <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full"></div>
                <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Payment Methods Distribution</h5>
              </div>
              {paymentMethodsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={paymentMethodsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={65}
                      innerRadius={25}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentMethodsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `₹${formatCurrency(value)}`}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '8px',
                        fontSize: '11px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-500 text-xs">No payment data</div>
              )}
            </div>

            {/* Received vs Due */}
            <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-6 bg-gradient-to-b from-red-400 to-red-600 rounded-full"></div>
                <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Received vs Due Amount</h5>
              </div>
              {amountReceivedData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={amountReceivedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 9, fill: '#6B7280' }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                      }}
                    />
                    <YAxis 
                      tick={{ fontSize: 9, fill: '#6B7280' }}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(value: number) => `₹${formatCurrency(value)}`}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '8px',
                        fontSize: '11px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="received" fill={COLORS.green[0]} name="Received" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="due" fill={COLORS.red[0]} name="Due" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-500 text-xs">No comparison data</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* REFUND ANALYSIS SECTION */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
        <div 
          className="px-4 py-3 border-b border-gray-200 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, #E1C4F8 0%, #d1a8f5 100%)` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" style={{ animation: 'shimmer 3s infinite' }}></div>
          <div className="flex items-center gap-2 relative z-10">
            <div className="p-1 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-all duration-200 hover:scale-110">
              <FaUndo className="w-3 h-3 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white drop-shadow-sm">Refund Analysis</h4>
              <p className="text-[11px] text-white/90 font-medium">Refund trends and payment method breakdown</p>
            </div>
          </div>
        </div>
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Refund Trends */}
            <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-6 bg-gradient-to-b from-red-400 to-red-600 rounded-full"></div>
                <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Refund Trends</h5>
              </div>
              {refundData.daily.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={refundData.daily} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10, fill: '#6B7280' }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                      }}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: '#6B7280' }}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(value: number) => `₹${formatCurrency(value)}`}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '8px',
                        fontSize: '11px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="refund" 
                      stroke={COLORS.red[0]} 
                      strokeWidth={2} 
                      name="Refunds"
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-500 text-xs">No refund data</div>
              )}
            </div>

            {/* Refund by Payment Method */}
            <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-6 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full"></div>
                <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Refunds by Payment Method</h5>
              </div>
              {refundData.byMethod.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={refundData.byMethod}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={70}
                      innerRadius={30}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {refundData.byMethod.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `₹${formatCurrency(value)}`}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '8px',
                        fontSize: '11px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-500 text-xs">No refund data</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. BILL REPORT SECTION - Green (Tests) & Purple (Doctors) */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
        <div 
          className="px-4 py-3 border-b border-gray-200 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, #E1C4F8 0%, #d1a8f5 100%)` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" style={{ animation: 'shimmer 3s infinite' }}></div>
          <div className="flex items-center gap-2 relative z-10">
            <div className="p-1 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-all duration-200 hover:scale-110">
              <FaFileInvoice className="w-3 h-3 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white drop-shadow-sm">Bill Report Analysis</h4>
              <p className="text-[11px] text-white/90 font-medium">Billing breakdown and test category analysis</p>
            </div>
          </div>
        </div>
        <div className="p-3 space-y-3">
          {/* Financial Summary */}
          <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full"></div>
              <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Financial Summary</h5>
            </div>
            {billReportData.summary.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={billReportData.summary} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#6B7280' }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => `₹${formatCurrency(value)}`}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '8px',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {billReportData.summary.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500 text-xs">No summary data</div>
            )}
          </div>

          {/* Discount Trends */}
          <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full"></div>
              <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Discount Trends</h5>
            </div>
            {discountTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={discountTrendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: '#6B7280' }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                    }}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#6B7280' }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'discountPercent') {
                        return [`${value.toFixed(1)}%`, 'Discount %'];
                      }
                      return [`₹${formatCurrency(value)}`, name === 'discount' ? 'Discount' : 'Total Amount'];
                    }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '8px',
                      fontSize: '11px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="discount" fill={COLORS.yellow[0]} name="Discount Amount" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500 text-xs">No discount data</div>
            )}
          </div>

          {/* Lab Tests & Doctors - Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Lab Tests by Category */}
            <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-6 bg-gradient-to-b from-green-400 to-green-600 rounded-full"></div>
                <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Top Lab Test Categories</h5>
              </div>
              {billReportData.categories.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={billReportData.categories.slice(0, 8)} layout="vertical" margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      type="number" 
                      tick={{ fontSize: 9, fill: '#6B7280' }}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tick={{ fontSize: 9, fill: '#6B7280' }} 
                      width={90}
                    />
                    <Tooltip 
                      formatter={(value: number) => `₹${formatCurrency(value)}`}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '8px',
                        fontSize: '11px'
                      }}
                    />
                    <Bar dataKey="amount" fill={COLORS.green[0]} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-500 text-xs">No category data</div>
              )}
            </div>

            {/* Top Doctors */}
            <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full"></div>
                <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Top Doctors by Revenue</h5>
              </div>
              {billReportData.doctors.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={billReportData.doctors.slice(0, 8)} margin={{ top: 5, right: 5, left: 5, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 9, fill: '#6B7280' }} 
                      angle={-45} 
                      textAnchor="end" 
                      height={70}
                    />
                    <YAxis 
                      tick={{ fontSize: 9, fill: '#6B7280' }}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(value: number) => `₹${formatCurrency(value)}`}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '8px',
                        fontSize: '11px'
                      }}
                    />
                    <Bar dataKey="amount" fill={COLORS.purple[0]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-500 text-xs">No doctor data</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* VISIT TYPE & TEST COUNT SECTION */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
        <div 
          className="px-4 py-3 border-b border-gray-200 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, #E1C4F8 0%, #d1a8f5 100%)` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" style={{ animation: 'shimmer 3s infinite' }}></div>
          <div className="flex items-center gap-2 relative z-10">
            <div className="p-1 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-all duration-200 hover:scale-110">
              <FaUsers className="w-3 h-3 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white drop-shadow-sm">Visit Type & Test Analysis</h4>
              <p className="text-[11px] text-white/90 font-medium">Patient visit breakdown and test count trends</p>
            </div>
          </div>
        </div>
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Visit Type Breakdown */}
            <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
                <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Visit Type Distribution</h5>
              </div>
              {visitTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={visitTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={70}
                      innerRadius={30}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {visitTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? COLORS.blue[0] : COLORS.purple[0]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `${value} visits`}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '8px',
                        fontSize: '11px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-500 text-xs">No visit type data</div>
              )}
            </div>

            {/* Test Count Trends */}
            <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-6 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full"></div>
                <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Daily Test Count</h5>
              </div>
              {testCountData.daily.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={testCountData.daily} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10, fill: '#6B7280' }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                      }}
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '8px',
                        fontSize: '11px'
                      }}
                    />
                    <Bar dataKey="count" fill={COLORS.green[0]} name="Tests" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-500 text-xs">No test count data</div>
              )}
            </div>
          </div>

          {/* Tests by Category Count */}
          {testCountData.byCategory.length > 0 && (
            <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-6 bg-gradient-to-b from-green-400 to-green-600 rounded-full"></div>
                <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Test Count by Category</h5>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={testCountData.byCategory} layout="vertical" margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" tick={{ fontSize: 9, fill: '#6B7280' }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 9, fill: '#6B7280' }} 
                    width={90}
                  />
                  <Tooltip 
                    formatter={(value: number) => `${value} tests`}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '8px',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="count" fill={COLORS.orange[0]} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* 3. DAY CLOSING SUMMARY SECTION - Yellow (Billing) */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
        <div 
          className="px-4 py-3 border-b border-gray-200 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, #E1C4F8 0%, #d1a8f5 100%)` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" style={{ animation: 'shimmer 3s infinite' }}></div>
          <div className="flex items-center gap-2 relative z-10">
            <div className="p-1 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-all duration-200 hover:scale-110">
              <FaCalendarDay className="w-3 h-3 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white drop-shadow-sm">Day Closing Summary</h4>
              <p className="text-[11px] text-white/90 font-medium">Daily financial analysis and transaction overview</p>
            </div>
          </div>
        </div>
        <div className="p-3 space-y-3">
          {/* Bill Count */}
          <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
              <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Bill Count Breakdown</h5>
            </div>
            {billCountData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={billCountData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '8px',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {billCountData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500 text-xs">No bill count data</div>
            )}
          </div>

          {/* Daily Sales & Receipts Trend */}
          <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full"></div>
              <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Daily Sales & Receipts Trend</h5>
            </div>
            {dayClosingData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={dayClosingData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: '#6B7280' }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                    }}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#6B7280' }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => `₹${formatCurrency(value)}`}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '8px',
                      fontSize: '11px'
                    }}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke={COLORS.purple[0]} 
                    strokeWidth={2} 
                    name="Sales"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="receipts" 
                    stroke={COLORS.green[0]} 
                    strokeWidth={2} 
                    name="Receipts"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="payments" 
                    stroke={COLORS.red[0]} 
                    strokeWidth={2} 
                    name="Payments"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500 text-xs">No trend data available</div>
            )}
          </div>
        </div>
      </div>

      {/* 4. RECEIPTS SUMMARY SECTION - Yellow (Billing) */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
        <div 
          className="px-4 py-3 border-b border-gray-200 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, #E1C4F8 0%, #d1a8f5 100%)` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" style={{ animation: 'shimmer 3s infinite' }}></div>
          <div className="flex items-center gap-2 relative z-10">
            <div className="p-1 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-all duration-200 hover:scale-110">
              <FaReceipt className="w-3 h-3 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white drop-shadow-sm">Receipts Summary</h4>
              <p className="text-[11px] text-white/90 font-medium">Payment methods analysis for current and past bills</p>
            </div>
          </div>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Current Bills Payment Methods */}
            <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-6 bg-gradient-to-b from-green-400 to-green-600 rounded-full"></div>
                <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Current Bills - Payment Methods</h5>
              </div>
              {receiptsData.current.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={receiptsData.current}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={65}
                      innerRadius={25}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {receiptsData.current.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `₹${formatCurrency(value)}`}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '8px',
                        fontSize: '11px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-500 text-xs">No current bill data</div>
              )}
            </div>

            {/* Past Bills Payment Methods */}
            <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
                <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Past Bills - Payment Methods</h5>
              </div>
              {receiptsData.past.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={receiptsData.past}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={65}
                      innerRadius={25}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {receiptsData.past.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `₹${formatCurrency(value)}`}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '8px',
                        fontSize: '11px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-500 text-xs">No past bill data</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsGraphView;
