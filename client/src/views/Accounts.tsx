import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Archive,
  ArchiveRestore,
  Trash2,
  AlertTriangle,
  X,
  CreditCard,
  Landmark,
  Coins,
  Wallet as WalletIcon
} from 'lucide-react';
import { useAccountStore } from '../store/useAccountStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { useSettingsStore } from '../store/useSettingsStore';
import type { Account, AccountType } from '../types';

export const Accounts: React.FC = () => {
  const { accounts, addAccount, updateAccount, deleteAccount, archiveAccount } = useAccountStore();
  const { transactions } = useTransactionStore();
  const { settings } = useSettingsStore();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>(undefined);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [balance, setBalance] = useState<number | ''>('');
  const [currency, setCurrency] = useState('THB');
  const [color, setColor] = useState('#3B82F6');
  const [icon, setIcon] = useState('Landmark');

  const [error, setError] = useState('');

  const openAddModal = () => {
    setEditingAccount(undefined);
    setName('');
    setType('bank');
    setBalance('');
    setCurrency(settings.currency);
    setColor('#3B82F6');
    setIcon('Landmark');
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (acc: Account) => {
    setEditingAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setBalance(acc.balance);
    setCurrency(acc.currency);
    setColor(acc.color);
    setIcon(acc.icon);
    setError('');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('กรุณากรอกชื่อบัญชี');
      return;
    }

    if (balance === '') {
      setError('กรุณากรอกยอดเงินตั้งต้น');
      return;
    }

    const data = {
      name: name.trim(),
      type,
      balance: Number(balance),
      currency,
      icon,
      color,
    };

    if (editingAccount) {
      updateAccount(editingAccount.id, data);
    } else {
      addAccount(data);
    }

    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    // Check if there are transactions associated with this account
    const associatedCount = transactions.filter(
      (t) => t.account_id === id || t.to_account_id === id
    ).length;

    if (associatedCount > 0) {
      if (
        window.confirm(
          `บัญชีนี้มีรายการธุรกรรมบันทึกไว้จำนวน ${associatedCount} รายการ การลบบัญชีนี้จะเป็นการลบประวัติธุรกรรมทั้งหมดด้วย แนะนำให้ใช้การ "ย้ายเข้าคลังประวัติ (Archive)" แทน เพื่อเก็บประวัติไว้\n\nคุณยังต้องการลบถาวรอยู่หรือไม่?`
        )
      ) {
        deleteAccount(id);
      }
    } else {
      if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบบัญชีนี้?')) {
        deleteAccount(id);
      }
    }
  };

  const activeAccounts = accounts.filter((a) => !a.is_archived);
  const archivedAccounts = accounts.filter((a) => a.is_archived);

  // Icon Mapper
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'CreditCard':
        return <CreditCard className="w-5 h-5" />;
      case 'Coins':
        return <Coins className="w-5 h-5" />;
      case 'Wallet':
        return <WalletIcon className="w-5 h-5" />;
      case 'Landmark':
      default:
        return <Landmark className="w-5 h-5" />;
    }
  };

  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#6366F1', // Indigo
    '#6B7280', // Gray
  ];

  const iconsList = [
    { name: 'ธนาคาร (Bank)', value: 'Landmark' },
    { name: 'บัตรเครดิต (Credit)', value: 'CreditCard' },
    { name: 'เงินสด (Cash)', value: 'Coins' },
    { name: 'E-Wallet', value: 'Wallet' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-white dark:to-indigo-200">
            จัดการบัญชีและกระเป๋าเงิน
          </h2>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            เพิ่ม แก้ไข และย้ายคลังบัญชีธนาคาร เงินสด หรือบัตรเครดิตต่างๆ ของคุณ
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary font-bold px-6 py-3 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          เพิ่มบัญชีใหม่
        </button>
      </div>

      {/* Active Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeAccounts.length === 0 ? (
          <div className="col-span-full premium-card p-12 text-center text-slate-400 dark:text-slate-500">
            <WalletIcon className="w-14 h-14 mx-auto opacity-30 mb-3" />
            <p className="text-sm font-medium">คุณยังไม่มีบัญชีที่กำลังใช้งานอยู่ คลิกปุ่ม "เพิ่มบัญชีใหม่" ด้านบนเพื่อเริ่มต้น</p>
          </div>
        ) : (
          activeAccounts.map((acc) => (
            <div
              key={acc.id}
              className="premium-card p-6 flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Top Accent Strip */}
              <div className="absolute top-0 left-0 right-0 h-1.5 transition-all group-hover:h-2" style={{ backgroundColor: acc.color }} />

              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: acc.color }}
                  >
                    {getIconComponent(acc.icon)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-800 dark:text-white leading-tight">{acc.name}</h3>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mt-1.5 inline-block">
                      {acc.type === 'bank'
                        ? 'บัญชีธนาคาร'
                        : acc.type === 'credit'
                        ? 'บัตรเครดิต'
                        : acc.type === 'cash'
                        ? 'เงินสด'
                        : 'E-Wallet'}
                    </span>
                  </div>
                </div>

                {/* Actions overlay */}
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(acc)}
                    className="p-2 rounded-xl text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                    title="แก้ไข"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => archiveAccount(acc.id, true)}
                    className="p-2 rounded-xl text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                    title="ย้ายเข้า Archive"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(acc.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                    title="ลบ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-8 flex justify-between items-end relative z-10">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">ยอดคงเหลือปัจจุบัน</p>
                  <p className="text-2xl font-extrabold mt-1 text-slate-900 dark:text-white tracking-tight">
                    {acc.balance.toLocaleString()} <span className="text-sm font-normal text-slate-400">{acc.currency}</span>
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Archived Accounts Section */}
      {archivedAccounts.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-800/80 pt-8 mt-8">
          <h3 className="font-extrabold text-lg text-slate-600 dark:text-slate-400 mb-6 flex items-center gap-2">
            <Archive className="w-5 h-5 text-amber-500" />
            <span>บัญชีในคลังเก็บประวัติ (Archived Accounts)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {archivedAccounts.map((acc) => (
              <div
                key={acc.id}
                className="premium-card p-5 opacity-65 hover:opacity-90 flex items-center justify-between transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
                    {getIconComponent(acc.icon)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 leading-tight">{acc.name}</h4>
                    <p className="text-xs font-semibold text-slate-400 mt-1">
                      {acc.balance.toLocaleString()} {acc.currency}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => archiveAccount(acc.id, false)}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-150 dark:border-slate-750 shadow-sm transition-all cursor-pointer"
                    title="กู้คืนบัญชี"
                  >
                    <ArchiveRestore className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(acc.id)}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-150 dark:border-slate-750 shadow-sm transition-all cursor-pointer"
                    title="ลบถาวร"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Account Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />

          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800/80 flex justify-between items-center bg-slate-50 dark:bg-slate-850/50">
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">
                {editingAccount ? 'แก้ไขรายละเอียดบัญชี' : 'เพิ่มบัญชีใหม่'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {error && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  ชื่อบัญชี / กระเป๋าเงิน
                </label>
                <input
                  type="text"
                  placeholder="เช่น เงินสดส่วนตัว, บัญชีออมทรัพย์ KBank"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    ประเภทบัญชี
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AccountType)}
                    className="w-full text-sm bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-all"
                  >
                    <option value="bank">ธนาคาร (Bank)</option>
                    <option value="credit">บัตรเครดิต (Credit)</option>
                    <option value="cash">เงินสด (Cash)</option>
                    <option value="e-wallet">E-Wallet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    สกุลเงินหลักบัญชี
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full text-sm bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-all"
                  >
                    <option value="THB">THB (฿)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  ยอดเงินเริ่มต้น
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-sm bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  เลือกไอคอนบัญชี
                </label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {iconsList.map((ic) => (
                    <button
                      key={ic.value}
                      type="button"
                      onClick={() => setIcon(ic.value)}
                      className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all ${
                        icon === ic.value
                          ? 'border-blue-500 bg-blue-500/10 text-blue-600'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      {getIconComponent(ic.value)}
                      <span className="text-[10px] font-semibold leading-none">{ic.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  เลือกสีธีมของบัญชี
                </label>
                <div className="flex gap-2.5 flex-wrap mt-1">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-9 h-9 rounded-full border-2 transition-all relative ${
                        color === c ? 'border-slate-900 dark:border-white scale-110 shadow-md' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
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
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
