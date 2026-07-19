import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2, AlertCircle } from 'lucide-react';
import { useAccountStore } from '../store/useAccountStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { useRecurringStore } from '../store/useRecurringStore';
import { useSettingsStore } from '../store/useSettingsStore';
import type { Transaction, TransactionType, RecurringFrequency } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: Transaction;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transactionToEdit,
}) => {
  const { accounts } = useAccountStore();
  const { categories } = useCategoryStore();
  const { addTransaction, updateTransaction } = useTransactionStore();
  const { addRule } = useRecurringStore();
  const { settings } = useSettingsStore();

  const [type, setType] = useState<TransactionType>('expense');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);
  
  // Recurring states
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  // Error messaging
  const [error, setError] = useState('');

  // Populate data when editing
  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setAccountId(transactionToEdit.account_id);
      setToAccountId(transactionToEdit.to_account_id || '');
      setCategoryId(transactionToEdit.category_id || '');
      setAmount(transactionToEdit.amount);
      setNote(transactionToEdit.note);
      setDate(transactionToEdit.transaction_date);
      setReceiptUrl(transactionToEdit.receipt_url);
      setIsRecurring(false); // Do not support making an existing tx recurring directly
    } else {
      // Set defaults for new transaction
      const activeAccounts = accounts.filter((a) => !a.is_archived);
      if (activeAccounts.length > 0) {
        setAccountId(activeAccounts[0].id);
        const secondAcc = activeAccounts.find((a) => a.id !== activeAccounts[0].id);
        if (secondAcc) setToAccountId(secondAcc.id);
      }
      
      const defaultCat = categories.find((c) => c.type === 'expense');
      if (defaultCat) setCategoryId(defaultCat.id);

      setType('expense');
      setAmount('');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
      setReceiptUrl(undefined);
      setIsRecurring(false);
    }
    setError('');
  }, [transactionToEdit, isOpen, accounts, categories]);

  // When type changes, adjust category options
  useEffect(() => {
    if (!transactionToEdit) {
      const matchType = type === 'expense' ? 'expense' : 'income';
      const firstCat = categories.find((c) => c.type === matchType);
      if (firstCat) setCategoryId(firstCat.id);
    }
  }, [type, categories, transactionToEdit]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (limit base64 size to 1.5MB to save localStorage space)
      if (file.size > 1.5 * 1024 * 1024) {
        setError('ขนาดไฟล์รูปภาพห้ามเกิน 1.5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptUrl(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptUrl(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!amount || amount <= 0) {
      setError('กรุณากรอกจำนวนเงินให้ถูกต้อง');
      return;
    }

    if (!accountId) {
      setError('กรุณาเลือกบัญชีต้นทาง');
      return;
    }

    if (type === 'transfer' && !toAccountId) {
      setError('กรุณาเลือกบัญชีปลายทาง');
      return;
    }

    if (type === 'transfer' && accountId === toAccountId) {
      setError('บัญชีต้นทางและปลายทางต้องไม่ซ้ำกัน');
      return;
    }

    if (type !== 'transfer' && !categoryId) {
      setError('กรุณาเลือกหมวดหมู่');
      return;
    }

    const txData = {
      account_id: accountId,
      category_id: type !== 'transfer' ? categoryId : undefined,
      to_account_id: type === 'transfer' ? toAccountId : undefined,
      type,
      amount: Number(amount),
      note,
      receipt_url: receiptUrl,
      transaction_date: date,
    };

    if (transactionToEdit) {
      updateTransaction(transactionToEdit.id, txData);
    } else {
      // Add the normal transaction
      addTransaction(txData);

      // If set to recurring, add the recurring rule
      if (isRecurring) {
        addRule({
          template_transaction: txData,
          frequency,
          start_date: startDate,
          end_date: endDate || undefined,
        });
      }
    }

    onClose();
  };

  const activeAccounts = accounts.filter((a) => !a.is_archived || a.id === accountId || a.id === toAccountId);
  const filteredCategories = categories.filter((c) => {
    const targetType = type === 'expense' ? 'expense' : 'income';
    return c.type === targetType;
  });

  // Separate parent and subcategories
  const parentCategories = filteredCategories.filter((c) => !c.parent_id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-fade-in-up">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800/80 flex justify-between items-center bg-slate-50 dark:bg-slate-850/50">
          <h3 className="font-extrabold text-lg text-slate-850 dark:text-white">
            {transactionToEdit ? 'แก้ไขธุรกรรม' : 'บันทึกธุรกรรมใหม่'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-650 dark:text-red-400 text-xs flex items-center gap-2 font-bold animate-pulse">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Selector (Income, Expense, Transfer) */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-950 rounded-2xl">
            {(['expense', 'income', 'transfer'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  type === t
                    ? t === 'expense'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10'
                      : t === 'income'
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10'
                      : 'bg-blue-500 text-white shadow-md shadow-blue-500/10'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t === 'expense' ? 'รายจ่าย' : t === 'income' ? 'รายรับ' : 'โอนเงิน'}
              </button>
            ))}
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              จำนวนเงิน
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full text-2xl font-black bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-500 dark:text-slate-400">
                {settings.currency}
              </span>
            </div>
          </div>

          {/* Accounts & Target Accounts (conditional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                {type === 'transfer' ? 'บัญชีต้นทาง' : 'บัญชี / กระเป๋าเงิน'}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-all"
                required
              >
                <option value="" disabled>เลือกบัญชี</option>
                {activeAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.balance.toLocaleString()} {acc.currency})
                  </option>
                ))}
              </select>
            </div>

            {type === 'transfer' ? (
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  บัญชีปลายทาง
                </label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-all"
                  required
                >
                  <option value="" disabled>เลือกบัญชี</option>
                  {activeAccounts
                    .filter((acc) => acc.id !== accountId)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.balance.toLocaleString()} {acc.currency})
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  หมวดหมู่
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-all"
                  required
                >
                  <option value="" disabled>เลือกหมวดหมู่</option>
                  {parentCategories.map((parent) => {
                    const subs = filteredCategories.filter((c) => c.parent_id === parent.id);
                    return (
                      <optgroup key={parent.id} label={parent.name}>
                        <option value={parent.id}>{parent.name} (หลัก)</option>
                        {subs.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            └ {sub.name}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>
            )}
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              วันที่ทำธุรกรรม
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all cursor-pointer"
              required
            />
          </div>

          {/* Notes input */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              บันทึกช่วยจำ
            </label>
            <textarea
              placeholder="รายละเอียดเพิ่มเติม..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all min-h-[70px]"
            />
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              แนบรูปใบเสร็จ (ไม่เกิน 1.5MB)
            </label>
            {receiptUrl ? (
              <div className="relative border border-slate-200 dark:border-slate-800 rounded-2xl p-3 bg-slate-50 dark:bg-slate-950/30 flex items-center justify-between gap-4">
                <img
                  src={receiptUrl}
                  alt="Receipt Preview"
                  className="w-16 h-16 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                />
                <span className="text-xs text-slate-550 dark:text-slate-400 truncate flex-1 font-bold">รูปภาพใบเสร็จแนบแล้ว</span>
                <button
                  type="button"
                  onClick={handleRemoveReceipt}
                  className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl shrink-0 transition-all cursor-pointer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 dark:border-slate-850 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/5 dark:hover:bg-blue-950/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all">
                <Upload className="w-5 h-5 text-slate-400" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">คลิกเพื่ออัปโหลดใบเสร็จ</span>
                <span className="text-[10px] text-slate-400 font-semibold">PNG, JPG, JPEG</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Recurring Transaction Setup (Only for new transactions) */}
          {!transactionToEdit && (
            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-5">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4.5 h-4.5 text-blue-600 bg-slate-50 border-slate-350 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  สร้างเป็นธุรกรรมเกิดซ้ำ (Recurring)
                </span>
              </label>

              {isRecurring && (
                <div className="mt-4 p-4.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        ความถี่
                      </label>
                      <select
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                        className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                      >
                        <option value="daily">ทุกวัน (Daily)</option>
                        <option value="weekly">ทุกสัปดาห์ (Weekly)</option>
                        <option value="monthly">ทุกเดือน (Monthly)</option>
                        <option value="yearly">ทุกปี (Yearly)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        วันเริ่มดำเนินการรอบซ้ำ
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      สิ้นสุดเมื่อ (ปล่อยว่างหากเกิดซ้ำไม่มีที่สิ้นสุด)
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4.5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-850/50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary py-2.5 text-xs"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary py-2.5 text-xs"
          >
            {transactionToEdit ? 'บันทึกการแก้ไข' : 'บันทึกธุรกรรม'}
          </button>
        </div>
      </div>
    </div>
  );
};
