import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  FolderPlus,
  Briefcase,
  Store,
  TrendingUp,
  PlusCircle,
  Utensils,
  Car,
  Home,
  Zap,
  ShoppingBag,
  Film,
  Heart,
  BookOpen,
  HelpCircle,
  X,
  AlertTriangle
} from 'lucide-react';
import { useCategoryStore } from '../store/useCategoryStore';
import { useTransactionStore } from '../store/useTransactionStore';
import type { Category } from '../types';

export const Categories: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategoryStore();
  const { transactions } = useTransactionStore();

  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [parentId, setParentId] = useState<string>('');
  const [color, setColor] = useState('#EF4444');
  const [icon, setIcon] = useState('HelpCircle');

  const [error, setError] = useState('');

  const openAddModal = (presetParentId?: string) => {
    setEditingCategory(undefined);
    setName('');
    setType(activeTab);
    setParentId(presetParentId || '');
    setColor(activeTab === 'expense' ? '#EF4444' : '#10B981');
    setIcon(activeTab === 'expense' ? 'HelpCircle' : 'PlusCircle');
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setParentId(cat.parent_id || '');
    setColor(cat.color);
    setIcon(cat.icon);
    setError('');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('กรุณากรอกชื่อหมวดหมู่');
      return;
    }

    const data = {
      name: name.trim(),
      type,
      parent_id: parentId || undefined,
      icon,
      color,
    };

    if (editingCategory) {
      updateCategory(editingCategory.id, data);
    } else {
      addCategory(data);
    }

    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    // Check if there are transactions linked
    const linkedCount = transactions.filter((t) => t.category_id === id).length;
    if (linkedCount > 0) {
      if (
        !window.confirm(
          `หมวดหมู่นี้ถูกใช้งานในธุรกรรมจำนวน ${linkedCount} รายการ การลบหมวดหมู่นี้จะทำให้รายการธุรกรรมที่ผูกไว้กลายเป็นหมวดหมู่ "อื่นๆ"\n\nคุณยังต้องการลบหมวดหมู่นี้หรือไม่?`
        )
      ) {
        return;
      }
    } else {
      if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่นี้?')) {
        return;
      }
    }

    deleteCategory(id);
  };

  const mainCategories = categories.filter((c) => c.type === activeTab && !c.parent_id);

  // Icon mapping
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Briefcase':
        return <Briefcase className="w-5 h-5" />;
      case 'Store':
        return <Store className="w-5 h-5" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5" />;
      case 'PlusCircle':
        return <PlusCircle className="w-5 h-5" />;
      case 'Utensils':
        return <Utensils className="w-5 h-5" />;
      case 'Car':
        return <Car className="w-5 h-5" />;
      case 'Home':
        return <Home className="w-5 h-5" />;
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5" />;
      case 'Film':
        return <Film className="w-5 h-5" />;
      case 'Heart':
        return <Heart className="w-5 h-5" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5" />;
      default:
        return <HelpCircle className="w-5 h-5" />;
    }
  };

  const colors = [
    '#EF4444', // Red
    '#F59E0B', // Yellow
    '#10B981', // Green
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#6366F1', // Indigo
    '#6B7280', // Gray
    '#14B8A6', // Teal
    '#F97316', // Orange
  ];

  const iconsList =
    activeTab === 'expense'
      ? [
          { name: 'อาหาร', value: 'Utensils' },
          { name: 'เดินทาง', value: 'Car' },
          { name: 'ที่พัก', value: 'Home' },
          { name: 'สาธารณูปโภค', value: 'Zap' },
          { name: 'ช้อปปิ้ง', value: 'ShoppingBag' },
          { name: 'บันเทิง', value: 'Film' },
          { name: 'สุขภาพ', value: 'Heart' },
          { name: 'การศึกษา', value: 'BookOpen' },
          { name: 'อื่นๆ', value: 'HelpCircle' },
        ]
      : [
          { name: 'เงินเดือน', value: 'Briefcase' },
          { name: 'ธุรกิจ', value: 'Store' },
          { name: 'การลงทุน', value: 'TrendingUp' },
          { name: 'อื่นๆ', value: 'PlusCircle' },
        ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-white dark:to-indigo-200">
            ตั้งค่าหมวดหมู่ธุรกรรม
          </h2>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            ปรับแต่งหมวดหมู่หลักและหมวดหมู่ย่อย เพื่อจัดระเบียบรายงานรายรับ-รายจ่ายของคุณ
          </p>
        </div>
        <button
          onClick={() => openAddModal()}
          className="btn-primary font-bold px-6 py-3 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          เพิ่มหมวดหมู่หลัก
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveTab('expense')}
          className={`flex-1 py-3 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'expense'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          หมวดหมู่รายจ่าย (Expenses)
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`flex-1 py-3 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'income'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          หมวดหมู่รายรับ (Income)
        </button>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mainCategories.map((mainCat) => {
          const subCats = categories.filter((c) => c.parent_id === mainCat.id);

          return (
            <div
              key={mainCat.id}
              className="premium-card p-6 flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Card Body */}
              <div className="space-y-5">
                {/* Main Category Row */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-11 h-11 rounded-2xl text-white shadow-sm flex items-center justify-center shrink-0 font-extrabold"
                      style={{ backgroundColor: mainCat.color }}
                    >
                      {getIconComponent(mainCat.icon)}
                    </div>
                    <span className="font-extrabold text-base text-slate-800 dark:text-white leading-tight">
                      {mainCat.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openAddModal(mainCat.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                      title="เพิ่มหมวดหมู่ย่อย"
                    >
                      <FolderPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(mainCat)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                      title="แก้ไข"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(mainCat.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                      title="ลบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subcategories tags list */}
                <div className="space-y-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">หมวดหมู่ย่อย (Subcategories)</p>
                  
                  {subCats.length === 0 ? (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic py-1 font-medium">ยังไม่มีหมวดหมู่ย่อย</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {subCats.map((sub) => (
                        <div
                          key={sub.id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-700 transition-colors"
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sub.color }} />
                          <span>{sub.name}</span>
                          <div className="flex items-center gap-1 ml-1.5 border-l border-slate-200 dark:border-slate-850 pl-2">
                            <button
                              onClick={() => openEditModal(sub)}
                              className="text-slate-400 hover:text-blue-500 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(sub.id)}
                              className="text-slate-400 hover:text-rose-500 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />

          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800/80 flex justify-between items-center bg-slate-50 dark:bg-slate-850/50">
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">
                {editingCategory ? 'แก้ไขข้อมูลหมวดหมู่' : parentId ? 'เพิ่มหมวดหมู่ย่อย' : 'เพิ่มหมวดหมู่หลัก'}
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
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2 font-bold animate-pulse">
                  <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  ชื่อหมวดหมู่
                </label>
                <input
                  type="text"
                  placeholder="เช่น มื้อเที่ยง, ค่าน้ำมัน, ชาบู"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                  required
                />
              </div>

              {!parentId && !editingCategory?.parent_id && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    ประเภทธุรกรรมหลัก
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'income' | 'expense')}
                    className="w-full text-sm bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-all"
                  >
                    <option value="expense">รายจ่าย (Expense)</option>
                    <option value="income">รายรับ (Income)</option>
                  </select>
                </div>
              )}

              {/* Icon Selector (Only for main category or if customized) */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  เลือกไอคอนประจำหมวดหมู่
                </label>
                <div className="grid grid-cols-5 gap-2 mt-1">
                  {iconsList.map((ic) => (
                    <button
                      key={ic.value}
                      type="button"
                      onClick={() => setIcon(ic.value)}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        icon === ic.value
                          ? 'border-blue-500 bg-blue-500/10 text-blue-600'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                      title={ic.name}
                    >
                      {getIconComponent(ic.value)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  สีประจำหมวดหมู่
                </label>
                <div className="flex gap-2.5 flex-wrap mt-1">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-all relative ${
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
