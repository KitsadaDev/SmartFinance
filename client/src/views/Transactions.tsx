import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Eye,
  X,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { useTransactionStore } from '../store/useTransactionStore';
import { useAccountStore } from '../store/useAccountStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { TransactionModal } from '../components/TransactionModal';
import type { Transaction } from '../types';

export const Transactions: React.FC = () => {
  const { transactions, deleteTransaction, deleteMultipleTransactions } = useTransactionStore();
  const { accounts } = useAccountStore();
  const { categories } = useCategoryStore();
  const { settings } = useSettingsStore();

  // Dialog States
  const [modalOpen, setModalOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | undefined>(undefined);
  const [lightboxUrl, setLightboxUrl] = useState<string | undefined>(undefined);

  // Pagination & Lists limit
  const [displayCount, setDisplayCount] = useState(15);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all'); // all, this-month, last-month, this-year

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Reset display count on filter change
  const handleFilterChange = () => {
    setDisplayCount(15);
    setSelectedIds([]);
  };

  // Filter computation
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Search term (matches note, amount or category name)
      const matchSearch =
        searchTerm === '' ||
        tx.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.amount.toString().includes(searchTerm);

      // 2. Type filter
      const matchType = filterType === 'all' || tx.type === filterType;

      // 3. Account filter
      const matchAccount =
        filterAccount === 'all' ||
        tx.account_id === filterAccount ||
        tx.to_account_id === filterAccount;

      // 4. Category filter
      const matchCategory =
        filterCategory === 'all' ||
        tx.category_id === filterCategory;

      // 5. Date filter
      let matchDate = true;
      if (filterDateRange !== 'all') {
        const txDate = new Date(tx.transaction_date);
        const today = new Date();
        if (filterDateRange === 'this-month') {
          matchDate =
            txDate.getMonth() === today.getMonth() &&
            txDate.getFullYear() === today.getFullYear();
        } else if (filterDateRange === 'last-month') {
          const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          matchDate =
            txDate.getMonth() === lastMonthDate.getMonth() &&
            txDate.getFullYear() === lastMonthDate.getFullYear();
        } else if (filterDateRange === 'this-year') {
          matchDate = txDate.getFullYear() === today.getFullYear();
        }
      }

      return matchSearch && matchType && matchAccount && matchCategory && matchDate;
    });
  }, [transactions, searchTerm, filterType, filterAccount, filterCategory, filterDateRange]);

  const displayedTransactions = useMemo(() => {
    return filteredTransactions.slice(0, displayCount);
  }, [filteredTransactions, displayCount]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(displayedTransactions.map((tx) => tx.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะลบรายการธุรกรรมที่เลือกจำนวน ${selectedIds.length} รายการ?`)) {
      deleteMultipleTransactions(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleEdit = (tx: Transaction) => {
    setEditTx(tx);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบรายการธุรกรรมนี้?')) {
      deleteTransaction(id);
    }
  };

  // Helpers
  const getAccountName = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    return acc ? acc.name : 'บัญชีถูกลบ';
  };

  const getCategoryDetails = (catId?: string) => {
    if (!catId) return { name: 'โอนเงิน', color: '#3B82F6' };
    const cat = categories.find((c) => c.id === catId);
    return cat ? { name: cat.name, color: cat.color } : { name: 'อื่นๆ', color: '#6B7280' };
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-white dark:to-indigo-200">
            ประวัติธุรกรรม
          </h2>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">ค้นหา กรอง และจัดการประวัติรายการรายรับ-รายจ่ายของคุณ</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 py-3 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              ลบที่เลือก ({selectedIds.length})
            </button>
          )}
          <button
            onClick={() => {
              setEditTx(undefined);
              setModalOpen(true);
            }}
            className="btn-primary font-bold px-6 py-3 cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            เพิ่มธุรกรรม
          </button>
        </div>
      </div>

      {/* Filter Card */}
      <div className="premium-card p-6 space-y-5">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <Filter className="w-4.5 h-4.5 text-blue-500" />
          <span>เครื่องมือกองข้อมูล (Filters)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              ค้นหาบันทึก / จำนวนเงิน
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="พิมพ์เพื่อค้นหา..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleFilterChange();
                }}
                className="w-full text-xs bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              ประเภท
            </label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                handleFilterChange();
              }}
              className="w-full text-xs bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-all"
            >
              <option value="all">ทั้งหมด (All Types)</option>
              <option value="income">รายรับ (Income)</option>
              <option value="expense">รายจ่าย (Expense)</option>
              <option value="transfer">โอนเงิน (Transfer)</option>
            </select>
          </div>

          {/* Account Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              บัญชี / กระเป๋าเงิน
            </label>
            <select
              value={filterAccount}
              onChange={(e) => {
                setFilterAccount(e.target.value);
                handleFilterChange();
              }}
              className="w-full text-xs bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-all"
            >
              <option value="all">ทุกบัญชี</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} {acc.is_archived && '(Archive)'}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              หมวดหมู่
            </label>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                handleFilterChange();
              }}
              className="w-full text-xs bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-all"
            >
              <option value="all">ทุกหมวดหมู่</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  [{cat.type === 'expense' ? 'จ่าย' : 'รับ'}] {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              ระยะเวลา
            </label>
            <select
              value={filterDateRange}
              onChange={(e) => {
                setFilterDateRange(e.target.value);
                handleFilterChange();
              }}
              className="w-full text-xs bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-all"
            >
              <option value="all">ทั้งหมด (All Time)</option>
              <option value="this-month">เดือนนี้ (This Month)</option>
              <option value="last-month">เดือนที่แล้ว (Last Month)</option>
              <option value="this-year">ปีนี้ (This Year)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-850/30 border-b border-slate-200/60 dark:border-slate-800/80 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-4.5 px-5 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      displayedTransactions.length > 0 &&
                      displayedTransactions.every((tx) => selectedIds.includes(tx.id))
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-slate-50 border-slate-350 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-4.5 px-4">วันที่ทำรายการ</th>
                <th className="py-4.5 px-4">บัญชี / กระเป๋า</th>
                <th className="py-4.5 px-4">ประเภท/หมวดหมู่</th>
                <th className="py-4.5 px-4">บันทึกช่วยจำ</th>
                <th className="py-4.5 px-4 w-16 text-center">รูปแนบ</th>
                <th className="py-4.5 px-4 text-right">จำนวนเงิน</th>
                <th className="py-4.5 px-5 w-28 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
              {displayedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 dark:text-slate-500">
                    <FolderOpen className="w-12 h-12 mx-auto opacity-30 mb-3" />
                    <p className="text-sm font-semibold">ไม่พบข้อมูลธุรกรรมตรงตามตัวกรองที่กำหนด</p>
                  </td>
                </tr>
              ) : (
                displayedTransactions.map((tx) => {
                  const catDetails = getCategoryDetails(tx.category_id);
                  const isExpense = tx.type === 'expense';
                  const isTransfer = tx.type === 'transfer';
                  const isSelected = selectedIds.includes(tx.id);

                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-all duration-150 ${
                        isSelected ? 'bg-blue-50/30 dark:bg-blue-950/15' : ''
                      }`}
                    >
                      <td className="py-4 px-5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(tx.id, e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-slate-50 border-slate-350 rounded focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-4 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        {new Date(tx.transaction_date).toLocaleDateString('th-TH', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {getAccountName(tx.account_id)}
                      </td>
                      <td className="py-4 px-4">
                        {isTransfer ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                            โอน → {getAccountName(tx.to_account_id!)}
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-sm"
                            style={{ backgroundColor: catDetails.color }}
                          >
                            {catDetails.name}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-400 max-w-[200px] truncate font-medium">
                        {tx.note || '-'}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {tx.receipt_url ? (
                          <button
                            onClick={() => setLightboxUrl(tx.receipt_url)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-blue-100 hover:text-blue-600 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-400 dark:text-slate-500 transition-all cursor-pointer shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                            title="ดูใบเสร็จ"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-700 text-xs font-bold">-</span>
                        )}
                      </td>
                      <td className={`py-4 px-4 font-black text-right whitespace-nowrap ${
                        isExpense
                          ? 'text-rose-600 dark:text-rose-400'
                          : isTransfer
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {isExpense ? '-' : isTransfer ? '' : '+'}
                        {tx.amount.toLocaleString()} {settings.currency}
                      </td>
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEdit(tx)}
                            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                            title="แก้ไข"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                            title="ลบ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Load More Button */}
        {filteredTransactions.length > displayCount && (
          <div className="py-4.5 border-t border-slate-100 dark:border-slate-800/80 flex justify-center bg-slate-50/50 dark:bg-slate-850/10">
            <button
              onClick={() => setDisplayCount(displayCount + 15)}
              className="btn-secondary py-2 text-xs flex items-center gap-1.5 cursor-pointer shadow-sm border border-slate-200/50 dark:border-slate-700/50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              โหลดข้อมูลเพิ่มเติม ({filteredTransactions.length - displayCount} รายการที่เหลือ)
            </button>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTx(undefined);
        }}
        transactionToEdit={editTx}
      />

      {/* Image Lightbox Modal */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <button
            onClick={() => setLightboxUrl(undefined)}
            className="absolute top-4 right-4 p-2 text-white bg-slate-900/60 hover:bg-slate-900 rounded-full border border-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl border border-white/5 bg-slate-900">
            <img
              src={lightboxUrl}
              alt="Receipt Attachment View"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
