import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Layers
} from 'lucide-react';
import { useTransactionStore } from '../store/useTransactionStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useSettingsStore } from '../store/useSettingsStore';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

export const Reports: React.FC = () => {
  const { transactions } = useTransactionStore();
  const { categories } = useCategoryStore();
  const { settings } = useSettingsStore();

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // all, 1-12

  // Generate Year Options based on transactions
  const yearOptions = useMemo(() => {
    const years = new Set<number>([currentYear]);
    transactions.forEach((tx) => {
      const year = new Date(tx.transaction_date).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions, currentYear]);

  // Compute 12-month data for Bar Chart (Income vs Expense) & Line Chart (Net Savings)
  const monthlyData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthName = new Date(selectedYear, i, 1).toLocaleString('th-TH', { month: 'short' });

      const txs = transactions.filter((t) => {
        const d = new Date(t.transaction_date);
        return d.getFullYear() === selectedYear && d.getMonth() === i;
      });

      const income = txs
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = txs
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const net = income - expense;

      return {
        name: monthName,
        รายรับ: income,
        รายจ่าย: expense,
        สะสม: net,
      };
    });
  }, [transactions, selectedYear]);

  // Total summary in selected period
  const totals = useMemo(() => {
    const filtered = transactions.filter((tx) => {
      const txDate = new Date(tx.transaction_date);
      const yearMatch = txDate.getFullYear() === selectedYear;
      const monthMatch = selectedMonth === 'all' || txDate.getMonth() + 1 === Number(selectedMonth);
      return yearMatch && monthMatch;
    });

    const income = filtered
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = filtered
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expense,
      savings: income - expense,
    };
  }, [transactions, selectedYear, selectedMonth]);

  // Category Expense Breakdown Data
  const pieData = useMemo(() => {
    const categoryMap: { [id: string]: { name: string; value: number; color: string } } = {};

    transactions.forEach((tx) => {
      const txDate = new Date(tx.transaction_date);
      if (txDate.getFullYear() !== selectedYear) return;
      if (selectedMonth !== 'all' && txDate.getMonth() + 1 !== Number(selectedMonth)) return;
      if (tx.type !== 'expense') return;

      const cat = categories.find((c) => c.id === tx.category_id);
      if (!cat) return;

      const parentCat = cat.parent_id ? categories.find((c) => c.id === cat.parent_id) : cat;
      if (!parentCat) return;

      if (categoryMap[parentCat.id]) {
        categoryMap[parentCat.id].value += tx.amount;
      } else {
        categoryMap[parentCat.id] = {
          name: parentCat.name,
          value: tx.amount,
          color: parentCat.color,
        };
      }
    });

    return Object.values(categoryMap).sort((a, b) => b.value - a.value);
  }, [transactions, categories, selectedYear, selectedMonth]);

  const totalExpenseBreakdown = useMemo(() => {
    return pieData.reduce((sum, item) => sum + item.value, 0);
  }, [pieData]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A3', '#19FFD8', '#BFFF19'];

  const monthNames = [
    { value: 'all', label: 'ทั้งปี (All Months)' },
    { value: '1', label: 'มกราคม' },
    { value: '2', label: 'กุมภาพันธ์' },
    { value: '3', label: 'มีนาคม' },
    { value: '4', label: 'เมษายน' },
    { value: '5', label: 'พฤษภาคม' },
    { value: '6', label: 'มิถุนายน' },
    { value: '7', label: 'กรกฎาคม' },
    { value: '8', label: 'สิงหาคม' },
    { value: '9', label: 'กันยายน' },
    { value: '10', label: 'ตุลาคม' },
    { value: '11', label: 'พฤศจิกายน' },
    { value: '12', label: 'ธันวาคม' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Filters Toolbar */}
      <div className="premium-card p-5 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-white dark:to-indigo-200">
            วิเคราะห์การใช้จ่ายเชิงลึก
          </h2>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">วิเคราะห์สถิติรายรับ รายจ่าย และกระแสเงินสดของคุณ</p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          {/* Year select */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="flex-1 sm:flex-initial text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-all"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                ปี ค.ศ. {y}
              </option>
            ))}
          </select>

          {/* Month select */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="flex-1 sm:flex-initial text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-all"
          >
            {monthNames.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Totals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6 relative overflow-hidden">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">รายรับรวมช่วงเวลานี้</p>
          <p className="text-3xl font-extrabold mt-3 text-emerald-600 dark:text-emerald-400 tracking-tight">
            +{totals.income.toLocaleString()} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">{settings.currency}</span>
          </p>
        </div>

        <div className="premium-card p-6 relative overflow-hidden">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">รายจ่ายรวมช่วงเวลานี้</p>
          <p className="text-3xl font-extrabold mt-3 text-rose-600 dark:text-rose-400 tracking-tight">
            -{totals.expense.toLocaleString()} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">{settings.currency}</span>
          </p>
        </div>

        <div className="premium-card p-6 relative overflow-hidden">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">เงินคงเหลือสุทธิ</p>
          <p className={`text-3xl font-extrabold mt-3 tracking-tight ${
            totals.savings >= 0 ? 'text-blue-650 dark:text-blue-400' : 'text-rose-650 dark:text-rose-450'
          }`}>
            {totals.savings.toLocaleString()} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">{settings.currency}</span>
          </p>
        </div>
      </div>

      {/* Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Income vs Expenses Bar Chart */}
        <div className="premium-card p-6">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            เปรียบเทียบรายรับ - รายจ่าย รายเดือน
          </h3>
          <div className="h-76 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={16}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.04)', radius: 4 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="รายรับ" fill="#10B981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="รายจ่าย" fill="#EF4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Net Savings Cash Flow Line Chart */}
        <div className="premium-card p-6">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            แนวโน้มกระแสเงินสดสะสมสุทธิรายเดือน
          </h3>
          <div className="h-76 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Line type="monotone" dataKey="สะสม" stroke="#3B82F6" strokeWidth={3} activeDot={{ r: 6 }} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Expense Breakdown */}
        <div className="lg:col-span-2 premium-card p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-purple-500" />
              สัดส่วนโครงสร้างค่าใช้จ่ายตามหมวดหมู่
            </h3>
            
            {pieData.length === 0 ? (
              <div className="h-72 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                <Layers className="w-10 h-10 mb-2 opacity-35" />
                <p className="text-sm font-semibold">ไม่มีสัดส่วนรายจ่ายในรอบเวลาที่เลือก</p>
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={105}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${Number(value).toLocaleString()} ${settings.currency}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Details Table */}
          <div className="flex flex-col justify-center">
            {pieData.length > 0 && (
              <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ตารางสัดส่วนเปรียบเทียบ</p>
                {pieData.map((item, index) => {
                  const percent = totalExpenseBreakdown > 0 ? (item.value / totalExpenseBreakdown) * 100 : 0;
                  return (
                    <div key={item.name} className="flex justify-between items-center text-xs pb-2 border-b border-slate-50 dark:border-slate-850 last:border-b-0">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }} />
                        <span className="font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-slate-900 dark:text-white">{item.value.toLocaleString()} {settings.currency}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{percent.toFixed(1)}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
