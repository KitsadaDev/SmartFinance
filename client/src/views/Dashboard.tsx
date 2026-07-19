import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  AlertTriangle,
  FileText,
  Calendar,
  Layers
} from 'lucide-react';
import { useAccountStore } from '../store/useAccountStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { useBudgetStore } from '../store/useBudgetStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { MetricCard } from '../components/MetricCard';
import { TransactionModal } from '../components/TransactionModal';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export const Dashboard: React.FC = () => {
  const { accounts } = useAccountStore();
  const { transactions } = useTransactionStore();
  const { budgets } = useBudgetStore();
  const { categories } = useCategoryStore();
  const { settings } = useSettingsStore();

  const [modalOpen, setModalOpen] = useState(false);

  // Date filters
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // Net Worth (active accounts only)
  const totalBalance = accounts
    .filter((a) => !a.is_archived)
    .reduce((sum, a) => sum + a.balance, 0);

  // Filter transactions for this month
  const monthlyTransactions = transactions.filter((tx) => {
    const d = new Date(tx.transaction_date);
    return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
  });

  // Calculate this month's income and expense totals
  const monthlyIncome = monthlyTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const monthlyExpense = monthlyTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Recent transactions (limit 5)
  const recentTransactions = transactions.slice(0, 5);

  // Get active budgets for the current month
  const currentBudgets = budgets.filter((b) => b.month === currentMonth && b.year === currentYear);

  // Prepare data for the Bar Chart
  const chartData = [
    {
      name: 'เปรียบเทียบรายเดือน',
      รายรับ: monthlyIncome,
      รายจ่าย: monthlyExpense,
    },
  ];

  // Helper to get category properties
  const getCategoryDetails = (catId?: string) => {
    if (!catId) return { name: 'โอนเงิน', icon: 'ArrowLeftRight', color: '#3B82F6' };
    const cat = categories.find((c) => c.id === catId);
    return cat ? { name: cat.name, icon: cat.icon, color: cat.color } : { name: 'อื่นๆ', icon: 'HelpCircle', color: '#6B7280' };
  };

  // Helper to get account properties
  const getAccountName = (accId: string) => {
    const acc = accounts.find((a) => a.id === accId);
    return acc ? acc.name : 'บัญชีถูกลบ';
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 dark:from-white dark:via-slate-100 dark:to-indigo-200">
            สรุปภาพรวมทางการเงิน
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ประจำเดือน {today.toLocaleString('th-TH', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary font-bold px-6 py-3 cursor-pointer select-none"
        >
          <Plus className="w-4.5 h-4.5" />
          บันทึกธุรกรรมใหม่
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="สินทรัพย์ทั้งหมด"
          value={`${totalBalance.toLocaleString()} ${settings.currency}`}
          icon={Wallet}
          colorClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          subtext="จากบัญชีที่เปิดใช้งานอยู่ทั้งหมด"
        />
        <MetricCard
          title="รายรับเดือนนี้"
          value={`${monthlyIncome.toLocaleString()} ${settings.currency}`}
          icon={TrendingUp}
          colorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          subtext="ยอดเงินเข้าทั้งหมดในเดือนนี้"
        />
        <MetricCard
          title="รายจ่ายเดือนนี้"
          value={`${monthlyExpense.toLocaleString()} ${settings.currency}`}
          icon={TrendingDown}
          colorClass="bg-rose-500/10 text-rose-600 dark:text-rose-400"
          subtext="ยอดเงินออกทั้งหมดในเดือนนี้"
        />
      </div>

      {/* Main Grid: Left (Recent + Chart), Right (Budgets) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Chart & Recent Transactions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Chart Panel */}
          <div className="premium-card p-6">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6">เปรียบเทียบรายรับ - รายจ่าย</h3>
            <div className="h-68 w-full">
              {monthlyIncome === 0 && monthlyExpense === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                  <Calendar className="w-10 h-10 mb-2.5 opacity-40 text-slate-400" />
                  <p className="text-sm font-medium">ไม่มีข้อมูลสรุปรายเดือนในขณะนี้</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} barSize={50}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.04)', radius: 8 }} />
                    <Bar dataKey="รายรับ" fill="#10B981" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="รายจ่าย" fill="#EF4444" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Recent Transactions List */}
          <div className="premium-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">ธุรกรรมล่าสุด</h3>
              <Link
                to="/transactions"
                className="text-xs text-blue-600 dark:text-blue-400 font-extrabold flex items-center gap-1 hover:underline"
              >
                ดูทั้งหมด
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                <FileText className="w-12 h-12 mx-auto opacity-30 mb-3" />
                <p className="text-sm font-medium">ยังไม่มีประวัติธุรกรรมบันทึกไว้ในระบบ</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {recentTransactions.map((tx) => {
                  const catDetails = getCategoryDetails(tx.category_id);
                  const isExpense = tx.type === 'expense';
                  const isTransfer = tx.type === 'transfer';

                  return (
                    <div key={tx.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 px-2 rounded-xl transition-all">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-white font-extrabold shadow-sm shadow-black/5"
                          style={{ backgroundColor: isTransfer ? '#3B82F6' : catDetails.color }}
                        >
                          {isTransfer ? 'โอน' : catDetails.name.slice(0, 1)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate text-slate-800 dark:text-slate-200">
                            {isTransfer ? `โอนไปยัง ${getAccountName(tx.to_account_id!)}` : catDetails.name}
                          </p>
                          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 truncate mt-1">
                            {getAccountName(tx.account_id)} • {new Date(tx.transaction_date).toLocaleDateString('th-TH')}
                            {tx.note && ` • ${tx.note}`}
                          </p>
                        </div>
                      </div>

                      <div className={`text-base font-extrabold shrink-0 ${
                        isExpense
                          ? 'text-rose-600 dark:text-rose-400'
                          : isTransfer
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {isExpense ? '-' : isTransfer ? '' : '+'}
                        {tx.amount.toLocaleString()} {settings.currency}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Monthly Budgets & Goals */}
        <div className="space-y-8">
          <div className="premium-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">งบประมาณเดือนนี้</h3>
              <Link to="/budgets" className="text-xs text-blue-600 dark:text-blue-400 font-extrabold hover:underline">
                จัดการงบ
              </Link>
            </div>

            {currentBudgets.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                <Layers className="w-12 h-12 mx-auto opacity-30 mb-3" />
                <p className="text-sm font-medium mb-4">ยังไม่ได้ตั้งค่าเป้าหมายงบประมาณรายเดือน</p>
                <Link
                  to="/budgets"
                  className="btn-secondary py-2 text-xs"
                >
                  ไปตั้งงบประมาณ
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {currentBudgets.map((budget) => {
                  const category = categories.find((c) => c.id === budget.category_id);
                  if (!category) return null;

                  // Sum expenses for this category and subcategories
                  const relatedIds = [category.id, ...categories.filter(c => c.parent_id === category.id).map(c => c.id)];

                  const spent = monthlyTransactions
                    .filter((tx) => tx.type === 'expense' && tx.category_id && relatedIds.includes(tx.category_id))
                    .reduce((sum, tx) => sum + tx.amount, 0);

                  const progress = Math.min((spent / budget.amount) * 100, 100);
                  const isOver = spent >= budget.amount;
                  const isWarning = !isOver && progress >= 80;

                  return (
                    <div key={budget.id} className="space-y-2.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700 dark:text-slate-300">{category.name}</span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {spent.toLocaleString()} / {budget.amount.toLocaleString()} {settings.currency}
                        </span>
                      </div>
                      
                      {/* Progress bar container */}
                      <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      {/* Over budget indicator */}
                      {(isOver || isWarning) && (
                        <div className={`flex items-center gap-1.5 text-[11px] font-bold ${
                          isOver ? 'text-rose-500' : 'text-amber-500'
                        }`}>
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>{isOver ? 'ใช้จ่ายเกินงบประมาณที่กำหนดแล้ว!' : 'ใช้จ่ายไปแล้วมากกว่า 80% ของงบ'}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Transaction Modal */}
      <TransactionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
