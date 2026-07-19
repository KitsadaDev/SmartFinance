import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Tag,
  PiggyBank,
  BarChart3,
  Settings as SettingsIcon,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  AlertTriangle
} from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAccountStore } from '../store/useAccountStore';
import { useBudgetStore } from '../store/useBudgetStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useRecurringStore } from '../store/useRecurringStore';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { settings, fetchSettings, updateSettings } = useSettingsStore();
  const { accounts, fetchAccounts } = useAccountStore();
  const { budgets, fetchBudgets } = useBudgetStore();
  const { transactions, fetchTransactions } = useTransactionStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { processRules, fetchRules } = useRecurringStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [bootstrapped, setBootstrapped] = useState(false);

  // Bootstrap: fetch all data from API on mount
  useEffect(() => {
    const bootstrap = async () => {
      await fetchSettings();
      await Promise.all([
        fetchAccounts(),
        fetchCategories(),
        fetchTransactions(),
        fetchBudgets(),
        fetchRules(),
      ]);
      setBootstrapped(true);
    };
    bootstrap();
  }, []);

  // Check if onboarding is needed (wait until settings loaded)
  useEffect(() => {
    if (!bootstrapped) return;
    if (!settings.name && location.pathname !== '/onboarding') {
      navigate('/onboarding');
    } else if (settings.name && location.pathname === '/onboarding') {
      navigate('/dashboard');
    }
  }, [settings.name, location.pathname, navigate, bootstrapped]);

  // Run recurring rules engine after bootstrap
  useEffect(() => {
    if (bootstrapped && settings.name) {
      processRules();
    }
  }, [bootstrapped, settings.name]);

  // Apply dark mode theme
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [settings.theme]);

  // Budget alert calculations
  useEffect(() => {
    if (!settings.name) return;

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const monthlyTransactions = transactions.filter((tx) => {
      const txDate = new Date(tx.transaction_date);
      return (
        tx.type === 'expense' &&
        txDate.getMonth() + 1 === currentMonth &&
        txDate.getFullYear() === currentYear
      );
    });

    const activeBudgets = budgets.filter((b) => b.month === currentMonth && b.year === currentYear);
    const newAlerts: string[] = [];

    activeBudgets.forEach((budget) => {
      const category = categories.find((c) => c.id === budget.category_id);
      if (!category) return;

      // Expense sum for this category (including subcategories)
      const relatedCategoryIds = [category.id, ...categories.filter(c => c.parent_id === category.id).map(c => c.id)];

      const spent = monthlyTransactions
        .filter((tx) => tx.category_id && relatedCategoryIds.includes(tx.category_id))
        .reduce((sum, tx) => sum + tx.amount, 0);

      const percent = (spent / budget.amount) * 100;
      if (percent >= 100) {
        newAlerts.push(`คุณใช้จ่ายในหมวดหมู่ "${category.name}" เกินงบประมาณแล้ว (${spent.toLocaleString()} / ${budget.amount.toLocaleString()})`);
      } else if (percent >= 80) {
        newAlerts.push(`คุณใช้จ่ายในหมวดหมู่ "${category.name}" ไปแล้วกว่า 80% ของงบประมาณ (${spent.toLocaleString()} / ${budget.amount.toLocaleString()})`);
      }
    });

    setAlerts(newAlerts);
  }, [transactions, budgets, categories, settings.name]);

  // Total balance computation
  const totalBalance = accounts
    .filter((acc) => !acc.is_archived)
    .reduce((sum, acc) => sum + acc.balance, 0);

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' });
  };

  const navItems = [
    { name: 'ภาพรวม (Dashboard)', path: '/dashboard', icon: LayoutDashboard },
    { name: 'ธุรกรรม (Transactions)', path: '/transactions', icon: ArrowLeftRight },
    { name: 'บัญชี/กระเป๋าเงิน (Accounts)', path: '/accounts', icon: Wallet },
    { name: 'หมวดหมู่ (Categories)', path: '/categories', icon: Tag },
    { name: 'งบประมาณ (Budgets)', path: '/budgets', icon: PiggyBank },
    { name: 'รายงานวิเคราะห์ (Reports)', path: '/reports', icon: BarChart3 },
    { name: 'ตั้งค่า (Settings)', path: '/settings', icon: SettingsIcon },
  ];

  if (!settings.name && location.pathname === '/onboarding') {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">{children}</div>;
  }

  const getPageTitle = () => {
    const item = navItems.find((nav) => nav.path === location.pathname);
    return item ? item.name : 'Personal Finance Tracker';
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
            F
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white leading-tight">SmartFinance</h1>
            <span className="text-xs text-slate-500 dark:text-slate-400">Personal Tracker</span>
          </div>
        </div>

        {/* Total Net Worth Card */}
        <div className="p-4 mx-4 mt-6 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/10">
          <p className="text-xs text-blue-100 uppercase tracking-wider font-medium">สินทรัพย์รวมสุทธิ</p>
          <p className="text-2xl font-bold mt-1">
            {totalBalance.toLocaleString()} <span className="text-sm font-normal">{settings.currency}</span>
          </p>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 mt-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info / Theme Toggle */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 shrink-0">
              {settings.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{settings.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Local Account</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={settings.theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {settings.theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Top Navbar - Mobile */}
      <header className="md:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-20 sticky top-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
            F
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-base">SmartFinance</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 relative"
            >
              <Bell className="w-5 h-5" />
              {alerts.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
              )}
            </button>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {settings.theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Slide-out Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex flex-col w-4/5 max-w-sm bg-white dark:bg-slate-900 h-full p-6 shadow-2xl">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 mb-6 mt-2">
              <div className="w-9 h-9 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
                F
              </div>
              <div>
                <h2 className="font-bold text-lg text-slate-900 dark:text-white leading-none">SmartFinance</h2>
                <span className="text-xs text-slate-500">Personal Finance Tracker</span>
              </div>
            </div>

            <div className="py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 mb-6">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">สินทรัพย์รวมสุทธิ</p>
              <p className="text-xl font-bold mt-0.5 text-slate-900 dark:text-white">
                {totalBalance.toLocaleString()} <span className="text-sm font-normal text-slate-500">{settings.currency}</span>
              </p>
            </div>

            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                {settings.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="truncate flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{settings.name}</p>
                <p className="text-xs text-slate-500">Local Account</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Desktop Header */}
        <header className="hidden md:flex h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="font-bold text-xl text-slate-800 dark:text-white">{getPageTitle()}</h2>
          
          <div className="flex items-center gap-4">
            
            {/* Budget Alert Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {alerts.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border border-white dark:border-slate-900 rounded-full animate-pulse" />
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 lg:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 p-4 max-h-96 overflow-y-auto">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="font-bold text-sm">การแจ้งเตือนงบประมาณ</span>
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                        {alerts.length} รายการ
                      </span>
                    </div>
                    {alerts.length === 0 ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">ไม่พบการแจ้งเตือน ทุกอย่างอยู่ในงบประมาณ</p>
                    ) : (
                      <div className="space-y-3">
                        {alerts.map((alert, idx) => (
                          <div key={idx} className="flex gap-2.5 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-300">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <p className="text-xs leading-relaxed font-medium">{alert}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">ยินดีต้อนรับ,</span>
              <span className="text-sm font-semibold">{settings.name}</span>
            </div>
          </div>
        </header>

        {/* Global Banner for Mobile Budget Alerts */}
        {alerts.length > 0 && (
          <div className="md:hidden px-4 pt-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl flex items-start gap-2 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold">ตรวจพบการใช้งบประมาณเกินเกณฑ์!</p>
                <button
                  onClick={() => setNotificationsOpen(true)}
                  className="text-xs font-bold underline mt-1 block"
                >
                  ดูการแจ้งเตือนทั้งหมด ({alerts.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto relative z-10 animate-fade-in-up">
          {children}
        </div>

        {/* Backdrop Glow Spots */}
        <div className="glow-spot w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 top-[-100px] left-1/4" />
        <div className="glow-spot w-[600px] h-[600px] bg-purple-500/5 dark:bg-purple-500/10 bottom-[-100px] right-1/4" />
      </main>
    </div>
  );
};
