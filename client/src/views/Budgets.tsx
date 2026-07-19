import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
  Layers
} from 'lucide-react';
import { useBudgetStore } from '../store/useBudgetStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { useSettingsStore } from '../store/useSettingsStore';

export const Budgets: React.FC = () => {
  const { budgets, setBudget, copyBudgets } = useBudgetStore();
  const { categories } = useCategoryStore();
  const { transactions } = useTransactionStore();
  const { settings } = useSettingsStore();

  // Selected date state
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [targetCategoryId, setTargetCategoryId] = useState('');
  const [budgetAmount, setBudgetAmount] = useState<number | ''>('');
  const [error, setError] = useState('');

  const currentMonth = selectedDate.getMonth() + 1;
  const currentYear = selectedDate.getFullYear();

  // Go to previous month
  const handlePrevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  // Go to next month
  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  // Open modal to set budget
  const openSetModal = (catId: string, currentAmount?: number) => {
    setTargetCategoryId(catId);
    setBudgetAmount(currentAmount !== undefined ? currentAmount : '');
    setError('');
    setModalOpen(true);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (budgetAmount === '' || budgetAmount < 0) {
      setError('กรุณากรอกจำนวนเงินให้ถูกต้อง');
      return;
    }

    setBudget(targetCategoryId, Number(budgetAmount), currentMonth, currentYear);
    setModalOpen(false);
  };

  // Copy budgets from previous month
  const handleCopyBudgets = () => {
    const prevDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
    const prevMonth = prevDate.getMonth() + 1;
    const prevYear = prevDate.getFullYear();

    const previousBudgetsCount = budgets.filter((b) => b.month === prevMonth && b.year === prevYear).length;

    if (previousBudgetsCount === 0) {
      alert('ไม่พบงบประมาณในเดือนก่อนหน้าให้คัดลอก');
      return;
    }

    if (
      window.confirm(
        `ต้องการคัดลอกงบประมาณจำนวน ${previousBudgetsCount} รายการจากเดือน ${prevDate.toLocaleString(
          'th-TH',
          { month: 'long', year: 'numeric' }
        )} มายังเดือนปัจจุบันใช่หรือไม่? (การดำเนินการนี้จะเขียนทับงบประมาณที่มีอยู่สำหรับหมวดหมู่ซ้ำ)`
      )
    ) {
      copyBudgets(prevMonth, prevYear, currentMonth, currentYear);
    }
  };

  // Calculate monthly transactions (expenses only)
  const monthlyExpenses = transactions.filter((tx) => {
    const txDate = new Date(tx.transaction_date);
    return (
      tx.type === 'expense' &&
      txDate.getMonth() + 1 === currentMonth &&
      txDate.getFullYear() === currentYear
    );
  });

  // Load parent categories for expense
  const expenseCategories = categories.filter((c) => c.type === 'expense' && !c.parent_id);

  // Month formatting
  const monthLabel = selectedDate.toLocaleString('th-TH', { month: 'long', year: 'numeric' });

  // Get budgets set for the active month
  const activeMonthBudgets = budgets.filter((b) => b.month === currentMonth && b.year === currentYear);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-white dark:to-indigo-200">
            ตั้งงบประมาณรายเดือน
          </h2>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            วางแผนและกำหนดวงเงินใช้จ่ายรายเดือนแยกตามหมวดหมู่เพื่อควบคุมวินัยการเงิน
          </p>
        </div>
      </div>

      {/* Month Picker & Utility Controls */}
      <div className="premium-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-450 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-base min-w-[130px] text-center text-slate-855 dark:text-slate-155">
            {monthLabel}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-450 transition-all cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={handleCopyBudgets}
          className="btn-secondary py-2.5 text-xs font-bold shadow-sm border border-slate-200/50 dark:border-slate-700/50 cursor-pointer"
        >
          <Copy className="w-4 h-4" />
          คัดลอกงบจากเดือนก่อนหน้า
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {expenseCategories.map((category) => {
          // Find matching budget if any
          const budget = activeMonthBudgets.find((b) => b.category_id === category.id);
          
          // Find subcategories IDs for inclusion
          const subCategoryIds = categories
            .filter((c) => c.parent_id === category.id)
            .map((c) => c.id);
          const inclusiveCategoryIds = [category.id, ...subCategoryIds];

          // Calculate spent amount under this category + subcategories in this month
          const spent = monthlyExpenses
            .filter((tx) => tx.category_id && inclusiveCategoryIds.includes(tx.category_id))
            .reduce((sum, tx) => sum + tx.amount, 0);

          const budgetAmountVal = budget ? budget.amount : 0;
          const progress = budgetAmountVal > 0 ? Math.min((spent / budgetAmountVal) * 100, 100) : 0;
          const remaining = budgetAmountVal - spent;
          
          const isOver = spent >= budgetAmountVal && budgetAmountVal > 0;
          const isWarning = !isOver && progress >= 80 && budgetAmountVal > 0;

          return (
            <div
              key={category.id}
              className="premium-card p-6 flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Category color strip */}
              <div className="absolute top-0 left-0 right-0 h-1.5 transition-all group-hover:h-2" style={{ backgroundColor: category.color }} />

              <div className="space-y-5">
                {/* Header */}
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full shadow-inner" style={{ backgroundColor: category.color }} />
                    <h3 className="font-extrabold text-base text-slate-800 dark:text-white leading-tight">{category.name}</h3>
                  </div>

                  {budget ? (
                    <div className="flex items-center gap-1 opacity-85 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openSetModal(category.id, budget.amount)}
                        className="p-2 text-slate-400 hover:text-blue-500 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                        title="แก้ไขวงเงิน"
                      >
                        <Edit2 className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => setBudget(category.id, 0, currentMonth, currentYear)}
                        className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                        title="ลบงบประมาณ"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => openSetModal(category.id)}
                      className="flex items-center gap-1 py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-700 transition-all cursor-pointer shadow-sm"
                    >
                      <Plus className="w-4 h-4 text-blue-500" />
                      ตั้งงบ
                    </button>
                  )}
                </div>

                {/* Progress calculation & bar */}
                {budget ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">ใช้จ่ายไปแล้ว</p>
                        <p className="text-lg font-black mt-1 text-slate-900 dark:text-white tracking-tight">
                          {spent.toLocaleString()} / {budget.amount.toLocaleString()} <span className="text-xs font-normal text-slate-500">{settings.currency}</span>
                        </p>
                      </div>
                      <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                        isOver ? 'bg-red-500/10 text-red-500' : isWarning ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {progress.toFixed(0)}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Meta info & Warning Banner */}
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                      <span>เหลืองบประมาณ</span>
                      <span className={`font-extrabold ${remaining < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {remaining.toLocaleString()} {settings.currency}
                      </span>
                    </div>

                    {isOver && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 text-rose-600 dark:text-rose-450 rounded-2xl text-[11px] font-bold flex items-center gap-1.5 animate-pulse">
                        <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                        <span>ใช้จ่ายเกินงบประมาณที่กำหนด!</span>
                      </div>
                    )}
                    {isWarning && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-450 rounded-2xl text-[11px] font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                        <span>ใช้เกิน 80% ระวังในการใช้จ่าย!</span>
                      </div>
                    )}
                    {!isOver && !isWarning && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-450 rounded-2xl text-[11px] font-bold flex items-center gap-1.5">
                        <CheckCircle className="w-4.5 h-4.5 shrink-0" />
                        <span>ยอดใช้จ่ายอยู่ในเกณฑ์ควบคุม</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center justify-center text-slate-450 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-dashed border-slate-200/80 dark:border-slate-800">
                    <Layers className="w-8 h-8 mb-2 opacity-30 text-slate-400" />
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">ไม่ได้กำหนดงบประมาณไว้</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Set Budget Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />

          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800/80 flex justify-between items-center bg-slate-50 dark:bg-slate-850/50">
              <h3 className="font-extrabold text-base text-slate-850 dark:text-white">
                ตั้งวงเงินงบประมาณ
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-rose-600 dark:text-rose-400 rounded-2xl text-xs flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  หมวดหมู่ใช้จ่าย
                </label>
                <div className="py-3 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold">
                  {categories.find((c) => c.id === targetCategoryId)?.name}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  วงเงินงบประมาณรายเดือน
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-lg font-black bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-500 dark:text-slate-400">
                    {settings.currency}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary py-2 text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 text-xs"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
