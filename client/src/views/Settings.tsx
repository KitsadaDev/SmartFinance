import React, { useState } from 'react';
import {
  User,
  Download,
  Upload,
  RefreshCcw,
  FileText,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAccountStore } from '../store/useAccountStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { useBudgetStore } from '../store/useBudgetStore';
import { useRecurringStore } from '../store/useRecurringStore';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { api } from '../lib/api';

export const Settings: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const { accounts } = useAccountStore();
  const { categories } = useCategoryStore();
  const { transactions, addTransaction } = useTransactionStore();
  const { budgets } = useBudgetStore();
  const { rules } = useRecurringStore();

  // Settings State
  const [profileName, setProfileName] = useState(settings.name);
  const [profileCurrency, setProfileCurrency] = useState(settings.currency);
  
  // Messaging Statuses
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // CSV Import mapping states
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<any[]>([]);
  const [mapping, setMapping] = useState({
    amount: '',
    date: '',
    type: '',
    account: '',
    category: '',
    note: ''
  });
  const [showMapping, setShowMapping] = useState(false);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setSuccessMsg('');
    setTimeout(() => setErrorMsg(''), 4000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      showError('กรุณากรอกชื่อผู้ใช้');
      return;
    }
    updateSettings({
      name: profileName.trim(),
      currency: profileCurrency,
    });
    showSuccess('บันทึกการตั้งค่าโปรไฟล์เรียบร้อยแล้ว');
  };

  // 1. JSON Export (Full Backup)
  const handleExportJSON = () => {
    const backupData = {
      settings,
      accounts,
      categories,
      transactions,
      budgets,
      rules
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `smartfinance_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showSuccess('ส่งออกข้อมูลสำรอง JSON สำเร็จ');
  };

  // 2. JSON Import (Restore Backup)
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.settings && parsed.accounts && parsed.categories && parsed.transactions) {
          // Restore all states
          useSettingsStore.setState({ settings: parsed.settings });
          useAccountStore.setState({ accounts: parsed.accounts });
          useCategoryStore.setState({ categories: parsed.categories });
          useTransactionStore.setState({ transactions: parsed.transactions });
          if (parsed.budgets) useBudgetStore.setState({ budgets: parsed.budgets });
          if (parsed.rules) useRecurringStore.setState({ rules: parsed.rules });

          // Reset UI
          setProfileName(parsed.settings.name);
          setProfileCurrency(parsed.settings.currency);

          showSuccess('กู้คืนข้อมูลสำรองจากไฟล์ JSON เรียบร้อยแล้ว');
        } else {
          showError('รูปแบบไฟล์สำรอง JSON ไม่ถูกต้อง');
        }
      } catch {
        showError('ไม่สามารถอ่านไฟล์ JSON ได้ หรือไฟล์มีความเสียหาย');
      }
    };
    reader.readAsText(file);
  };

  // 3. Export Transactions to CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      showError('ไม่มีรายการธุรกรรมใดๆ สำหรับการส่งออก');
      return;
    }

    const data = transactions.map((t) => {
      const acc = accounts.find((a) => a.id === t.account_id);
      const cat = categories.find((c) => c.id === t.category_id);
      return {
        'วันที่ (Date)': t.transaction_date,
        'จำนวนเงิน (Amount)': t.amount,
        'ประเภท (Type)': t.type === 'expense' ? 'รายจ่าย' : t.type === 'income' ? 'รายรับ' : 'โอนเงิน',
        'บัญชี (Account)': acc ? acc.name : 'N/A',
        'หมวดหมู่ (Category)': cat ? cat.name : t.type === 'transfer' ? 'โอนเงิน' : 'อื่นๆ',
        'บันทึก (Note)': t.note,
      };
    });

    const csv = Papa.unparse(data);
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' }); // Add UTF-8 BOM
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showSuccess('ส่งออกประวัติธุรกรรม CSV สำเร็จ');
  };

  // 4. CSV Import file loader
  const handleCSVLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.meta.fields && results.meta.fields.length > 0) {
          setCsvHeaders(results.meta.fields);
          setCsvRows(results.data);
          
          // Pre-populate mapping guess
          const guess: typeof mapping = { amount: '', date: '', type: '', account: '', category: '', note: '' };
          
          results.meta.fields.forEach((h) => {
            const lh = h.toLowerCase();
            if (lh.includes('amount') || lh.includes('เงิน') || lh.includes('จำนวน')) guess.amount = h;
            if (lh.includes('date') || lh.includes('วัน')) guess.date = h;
            if (lh.includes('type') || lh.includes('ประเภท')) guess.type = h;
            if (lh.includes('account') || lh.includes('บัญชี')) guess.account = h;
            if (lh.includes('category') || lh.includes('หมวด')) guess.category = h;
            if (lh.includes('note') || lh.includes('บันทึก') || lh.includes('ช่วยจำ')) guess.note = h;
          });

          setMapping(guess);
          setShowMapping(true);
        } else {
          showError('ไม่สามารถดึงข้อมูลหัวตารางคอลัมน์จาก CSV ได้');
        }
      },
      error: () => {
        showError('ไม่สามารถประมวลผลไฟล์ CSV นี้ได้');
      }
    });
  };

  // 5. CSV Mapping executor with Duplicate checking
  const handleImportCSVExecute = () => {
    if (!mapping.amount || !mapping.date || !mapping.type) {
      alert('กรุณาจับคู่คอลัมน์ วันที่, จำนวนเงิน และ ประเภท เป็นอย่างน้อย');
      return;
    }

    let importCount = 0;
    let skipCount = 0;

    const defaultAccount = accounts.find((a) => !a.is_archived) || accounts[0];
    if (!defaultAccount) {
      alert('กรุณาสร้างบัญชีการเงินในระบบก่อนทำการนำเข้าธุรกรรม');
      return;
    }

    csvRows.forEach((row) => {
      const amountVal = Number(row[mapping.amount]?.replace(/[^0-9.-]+/g, ''));
      const dateVal = row[mapping.date];
      
      // Parse type
      let typeVal: 'income' | 'expense' | 'transfer' = 'expense';
      const rawType = row[mapping.type]?.toString().toLowerCase() || '';
      if (rawType.includes('รับ') || rawType.includes('inc') || rawType.includes('in')) {
        typeVal = 'income';
      } else if (rawType.includes('โอน') || rawType.includes('trans')) {
        typeVal = 'transfer';
      }

      const noteVal = row[mapping.note] || '';

      // Account resolve
      let accId = defaultAccount.id;
      if (mapping.account && row[mapping.account]) {
        const matchedAcc = accounts.find(
          (a) => a.name.toLowerCase() === row[mapping.account].toString().toLowerCase()
        );
        if (matchedAcc) accId = matchedAcc.id;
      }

      // Category resolve
      let catId = '';
      if (typeVal !== 'transfer') {
        const matchType = typeVal === 'expense' ? 'expense' : 'income';
        const defaultCat = categories.find((c) => c.type === matchType) || categories[0];
        catId = defaultCat.id;

        if (mapping.category && row[mapping.category]) {
          const matchedCat = categories.find(
            (c) =>
              c.name.toLowerCase() === row[mapping.category].toString().toLowerCase() &&
              c.type === matchType
          );
          if (matchedCat) catId = matchedCat.id;
        }
      }

      // Validations
      if (!amountVal || isNaN(amountVal) || !dateVal) {
        skipCount++;
        return;
      }

      // Format Date to YYYY-MM-DD
      let formattedDate = dateVal;
      try {
        const parsedDate = new Date(dateVal);
        if (!isNaN(parsedDate.getTime())) {
          formattedDate = parsedDate.toISOString().split('T')[0];
        }
      } catch {}

      // Duplicate detection
      const isDuplicate = transactions.some(
        (t) =>
          t.transaction_date === formattedDate &&
          t.amount === amountVal &&
          t.type === typeVal &&
          t.account_id === accId &&
          t.note === noteVal
      );

      if (isDuplicate) {
        skipCount++;
        return;
      }

      // Insert transaction!
      addTransaction({
        account_id: accId,
        category_id: typeVal !== 'transfer' ? catId : undefined,
        to_account_id: typeVal === 'transfer' ? defaultAccount.id : undefined, // fallback target for transfers
        type: typeVal,
        amount: amountVal,
        note: noteVal,
        transaction_date: formattedDate,
      });

      importCount++;
    });

    showSuccess(`นำเข้าธุรกรรมเสร็จสิ้น: นำเข้าสำเร็จ ${importCount} รายการ, ข้าม ${skipCount} รายการ (เนื่องจากข้อมูลซ้ำหรือผิดพลาด)`);
    setShowMapping(false);
    setCsvHeaders([]);
    setCsvRows([]);
  };

  // 6. Generate PDF Report (Full details A4)
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const todayStr = new Date().toLocaleDateString('th-TH');
    
    // Header title block
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('SmartFinance Report', 15, 22);
    doc.setFontSize(10);
    doc.text(`Generated At: ${todayStr} | For: ${settings.name}`, 15, 28);

    // Section: Portfolio Balance Summary
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.text('Summary of Accounts', 15, 50);

    const accountsData = accounts.map((a) => [
      a.name,
      a.type.toUpperCase(),
      `${a.balance.toLocaleString()} ${a.currency}`,
      a.is_archived ? 'Archived' : 'Active'
    ]);

    autoTable(doc, {
      startY: 55,
      head: [['Account Name', 'Type', 'Current Balance', 'Status']],
      body: accountsData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] } // Blue-500
    });

    // Section: Recent Transactions List
    const currentY = (doc as any).lastAutoTable.finalY + 15;
    doc.text('Transactions Log', 15, currentY);

    const txData = transactions.slice(0, 30).map((t) => {
      const acc = accounts.find((a) => a.id === t.account_id);
      const cat = categories.find((c) => c.id === t.category_id);
      return [
        t.transaction_date,
        acc ? acc.name : 'Deleted Account',
        t.type === 'transfer' ? `Transfer -> ${accounts.find(a => a.id === t.to_account_id)?.name || ''}` : (cat ? cat.name : 'Other'),
        t.note || '-',
        t.type === 'expense' ? `-${t.amount}` : `+${t.amount}`
      ];
    });

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Date', 'Wallet', 'Category / Details', 'Memo', 'Amount']],
      body: txData,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] } // Slate-800
    });

    doc.save(`smartfinance_report_${new Date().toISOString().split('T')[0]}.pdf`);
    showSuccess('ดาวน์โหลดไฟล์รายงาน PDF สำเร็จ');
  };

  // 7. Hard Reset App back to factory state
  const handleResetApp = async () => {
    if (
      window.confirm(
        'คำเตือน! การดำเนินการนี้จะลบข้อมูลทั้งหมดที่บันทึกไว้ในเครื่องของคุณ (บัญชี, ธุรกรรม, หมวดหมู่, งบประมาณ) และไม่สามารถย้อนกลับได้\n\nคุณแน่ใจหรือไม่ที่จะทำการล้างข้อมูลทั้งหมด?'
      )
    ) {
      try {
        await api.post('/reset', {});
        window.location.reload();
      } catch (e: any) {
        showError('ไม่สามารถรีเซ็ตข้อมูลได้: ' + e.message);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Top Banner Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-bold animate-pulse">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-450 text-xs flex items-center gap-2 font-bold animate-pulse">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: General Profile Setting */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Profile card */}
          <div className="premium-card p-6">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <User className="w-5 h-5 text-blue-500" />
              การตั้งค่าโปรไฟล์และสกุลเงินหลัก
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  ชื่อผู้ใช้งาน
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full text-sm bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  สกุลเงินสากลหลัก
                </label>
                <select
                  value={profileCurrency}
                  onChange={(e) => setProfileCurrency(e.target.value)}
                  className="w-full text-sm bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-all"
                >
                  <option value="THB">THB (฿) - บาทไทย</option>
                  <option value="USD">USD ($) - ดอลลาร์สหรัฐ</option>
                  <option value="EUR">EUR (€) - ยูโร</option>
                  <option value="JPY">JPY (¥) - เยนญี่ปุ่น</option>
                  <option value="GBP">GBP (£) - ปอนด์อังกฤษ</option>
                </select>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="btn-primary font-bold px-6 py-3 cursor-pointer"
                >
                  บันทึกการตั้งค่า
                </button>
              </div>
            </form>
          </div>

          {/* CSV Import/Mapping Card */}
          <div className="premium-card p-6">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
              นำเข้าธุรกรรมจากไฟล์ CSV (Import CSV)
            </h3>

            {!showMapping ? (
              <div className="space-y-5">
                <p className="text-xs text-slate-500 leading-relaxed font-bold">
                  คุณสามารถนำเข้าไฟล์ธุรกรรมที่เป็นรูปแบบ CSV ได้ โดยระบบจะคัดกรองรายการที่มีข้อมูลวันเวลา จำนวนเงิน ประเภท และบัญชีตรงกันเพื่อป้องกันข้อมูลซ้ำโดยอัตโนมัติ
                </p>
                <label className="border-2 border-dashed border-slate-200 dark:border-slate-850 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-blue-50/5 dark:hover:bg-blue-950/5 transition-all text-center">
                  <Upload className="w-6 h-6 text-slate-450 dark:text-slate-500" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">คลิกเพื่อเลือกไฟล์ CSV นำเข้า</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVLoad}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-xs font-bold text-blue-600 dark:text-blue-400">
                  ตรวจพบไฟล์ CSV มีจำนวนคอลัมน์ {csvHeaders.length} ช่องและ {csvRows.length} รายการแถว กรุณาจับคู่ชื่อคอลัมน์ของ CSV เข้ากับระบบ
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(['date', 'amount', 'type', 'account', 'category', 'note'] as const).map((field) => (
                    <div key={field}>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        {field === 'date' ? 'วันที่ (Date)*' : field === 'amount' ? 'จำนวนเงิน (Amount)*' : field === 'type' ? 'ประเภทธุรกรรม (Type)*' : field === 'account' ? 'บัญชี (Account)' : field === 'category' ? 'หมวดหมู่ (Category)' : 'บันทึกช่วยจำ (Notes)'}
                      </label>
                      <select
                        value={mapping[field]}
                        onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
                        className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                      >
                        <option value="">-- ไม่ระบุ / ปล่อยข้าม --</option>
                        {csvHeaders.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => setShowMapping(false)}
                    className="btn-secondary py-2 text-xs"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleImportCSVExecute}
                    className="btn-primary py-2 text-xs"
                  >
                    ดำเนินการนำเข้าธุรกรรม
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Backups, Export, Danger Zones */}
        <div className="space-y-8">
          
          {/* Backup restore panel */}
          <div className="premium-card p-6 space-y-4">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <Download className="w-5 h-5 text-blue-500" />
              การจัดการและสำรองข้อมูล
            </h3>

            {/* Export JSON */}
            <button
              onClick={handleExportJSON}
              className="w-full flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800/80 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all text-left cursor-pointer group"
            >
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-blue-550 transition-colors">ดาวน์โหลดไฟล์สำรองข้อมูล (JSON)</p>
                <p className="text-[10px] text-slate-450 mt-1 font-bold">รวมประวัติและตั้งค่าทุกอย่างในระบบ</p>
              </div>
              <Download className="w-4.5 h-4.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </button>

            {/* Import JSON */}
            <label className="w-full flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800/80 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer group">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-blue-550 transition-colors">นำเข้าข้อมูลกู้คืนบราวเซอร์ (JSON)</p>
                <p className="text-[10px] text-slate-450 mt-1 font-bold">เขียนข้อมูลทับด้วยข้อมูลสำรองเดิม</p>
              </div>
              <Upload className="w-4.5 h-4.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="w-full flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800/80 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all text-left cursor-pointer group"
            >
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-emerald-550 transition-colors">ส่งออกธุรกรรมเป็นไฟล์ CSV</p>
                <p className="text-[10px] text-slate-450 mt-1 font-bold">เปิดดูใน Excel / Google Sheets</p>
              </div>
              <FileSpreadsheet className="w-4.5 h-4.5 text-slate-400 group-hover:text-emerald-550 transition-colors" />
            </button>

            {/* Download PDF report */}
            <button
              onClick={handleExportPDF}
              className="w-full flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800/80 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all text-left cursor-pointer group"
            >
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-blue-550 transition-colors">ดาวน์โหลดเอกสาร PDF สรุปบัญชี</p>
                <p className="text-[10px] text-slate-450 mt-1 font-bold">รายงานสถิติประกอบภาพรวมบัญชี</p>
              </div>
              <FileText className="w-4.5 h-4.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </button>
          </div>

          {/* Danger Zone */}
          <div className="premium-card p-6 space-y-5">
            <h3 className="font-extrabold text-lg text-rose-500 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <RefreshCcw className="w-5 h-5" />
              เขตอันตราย (Danger Zone)
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed font-bold">
              ลบข้อมูลการติดตามทั้งหมดที่บันทึกไว้ในเครื่องของคุณ เพื่อเริ่มต้นใหม่ทั้งหมด (รวมถึงยอดเงินบัญชี ประวัติ งบประมาณ ทั้งหมด)
            </p>

            <button
              onClick={handleResetApp}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all cursor-pointer"
            >
              <RefreshCcw className="w-4 h-4" />
              ลบข้อมูลทั้งหมดและตั้งค่าใหม่
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
