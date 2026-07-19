# Software Requirements Specification

## ระบบติดตามรายรับ-รายจ่าย (Personal Finance Tracker)

**เวอร์ชัน:** 1.0
**วันที่:** 2026-07-12
**ประเภท:** Web Application (SPA)

---

## 1. ภาพรวมระบบ

เว็บแอปพลิเคชันสำหรับบันทึกและติดตามรายรับ-รายจ่ายส่วนบุคคล รองรับหลายบัญชี/กระเป๋าเงิน จัดหมวดหมู่ธุรกรรม ตั้งงบประมาณ และแสดงรายงานเชิงวิเคราะห์

---

## 2. ขอบเขตระบบ (Scope)

### 2.1 In Scope

- บันทึกธุรกรรมรายรับ/รายจ่าย/โอนเงินระหว่างบัญชี
- จัดการหมวดหมู่ (Category) แบบ custom + default
- จัดการบัญชี/กระเป๋าเงินหลายบัญชี (เงินสด, ธนาคาร, บัตรเครดิต, e-wallet)
- ตั้งงบประมาณรายเดือนต่อหมวดหมู่ พร้อมแจ้งเตือนเมื่อใกล้/เกินงบ
- ธุรกรรมที่เกิดซ้ำ (Recurring transactions)
- รายงาน: สรุปรายเดือน, แนวโน้มรายหมวด, กระแสเงินสด, เปรียบเทียบเดือนต่อเดือน
- Export ข้อมูลเป็น CSV/PDF
- Import ธุรกรรมจากไฟล์ CSV
- Multi-currency (พื้นฐาน — 1 currency หลักต่อบัญชี)
- Local Data Persistence (ข้อมูลอยู่แต่ในเครื่องผู้ใช้ ไม่ต้องต่อ Server)
- Responsive design (Desktop + Mobile browser)

### 2.2 Out of Scope (ไม่ทำ)

- ระบบ Backend / Database / Authentication (ทำแค่ Frontend)
- แอปมือถือ native (iOS/Android)
- เชื่อมต่อ Open Banking API / ดึงธุรกรรมอัตโนมัติจากธนาคาร
- ระบบแชร์บัญชีร่วมกันแบบ multi-user
- การลงทุน/พอร์ตหุ้น/สินทรัพย์ดิจิทัล
- Native push notification (ใช้ in-app แทน)

---

## 3. Tech Stack

| Layer            | Technology                                |
| ---------------- | ----------------------------------------- |
| Frontend         | React 18+ (Vite), TypeScript, TailwindCSS |
| State Management | Zustand / TanStack Query                  |
| Routing          | React Router v6                           |
| Charts           | Recharts                                  |
| Form             | React Hook Form + Zod                     |
| Data Storage     | LocalStorage / IndexedDB                  |
| File export      | papaparse, jspdf (Client-side)            |
| Deployment       | Vercel / Netlify / GitHub Pages           |

---

## 4. User Roles

| Role             | สิทธิ์                                        |
| ---------------- | --------------------------------------------- |
| Local User       | จัดการธุรกรรม/บัญชี/หมวดหมู่/งบประมาณภายในเครื่องตนเอง |

---

## 5. Functional Requirements

### FR-1 User Profile (Local)

- FR-1.1 ตั้งค่าโปรไฟล์เบื้องต้น (ชื่อ, currency หลัก, timezone)
- FR-1.2 ข้อมูลถูกเก็บไว้ในเครื่องของผู้ใช้ (Local) ไม่ต้องมีระบบ Login

### FR-2 Account/Wallet Management

- FR-2.1 CRUD บัญชี (ชื่อ, ประเภท, ยอดเงินตั้งต้น, สกุลเงิน, ไอคอน/สี)
- FR-2.2 แสดงยอดคงเหลือปัจจุบันต่อบัญชี
- FR-2.3 Archive บัญชีที่ไม่ใช้แล้ว (ไม่ลบ ป้องกันข้อมูลประวัติหาย)

### FR-3 Transaction Management

- FR-3.1 CRUD ธุรกรรม: จำนวนเงิน, วันที่, บัญชี, หมวดหมู่, บันทึกช่วยจำ, แนบรูป (ใบเสร็จ)
- FR-3.2 ประเภทธุรกรรม: Income / Expense / Transfer
- FR-3.3 Filter/Search ตามวันที่, บัญชี, หมวดหมู่, ช่วงจำนวนเงิน, คำค้น
- FR-3.4 Pagination/Infinite scroll สำหรับรายการธุรกรรม
- FR-3.5 Bulk delete/edit

### FR-4 Category Management

- FR-4.1 Default categories (อาหาร, เดินทาง, ที่พัก, เงินเดือน ฯลฯ)
- FR-4.2 CRUD custom category พร้อม subcategory (1 ระดับ)
- FR-4.3 กำหนดไอคอน/สีต่อหมวดหมู่

### FR-5 Budget Management

- FR-5.1 ตั้งงบประมาณรายเดือนต่อหมวดหมู่
- FR-5.2 แสดง progress bar (ใช้ไปเท่าไหร่ / เหลือเท่าไหร่)
- FR-5.3 แจ้งเตือน in-app เมื่อใช้เกิน 80% / 100% ของงบ
- FR-5.4 คัดลอกงบประมาณจากเดือนก่อนหน้า

### FR-6 Recurring Transactions

- FR-6.1 ตั้งธุรกรรมซ้ำ (รายวัน/สัปดาห์/เดือน/ปี)
- FR-6.2 ระบบสร้างธุรกรรมอัตโนมัติตามรอบ (cron job / scheduled task)
- FR-6.3 แก้ไข/ยกเลิกรายการที่ตั้งซ้ำ

### FR-7 Reports & Analytics

- FR-7.1 สรุปรายรับ-รายจ่ายรายเดือน (กราฟแท่ง)
- FR-7.2 สัดส่วนรายจ่ายตามหมวดหมู่ (Pie/Donut chart)
- FR-7.3 แนวโน้มกระแสเงินสดรายเดือน (Line chart, 6-12 เดือนย้อนหลัง)
- FR-7.4 เปรียบเทียบเดือนต่อเดือน / ปีต่อปี
- FR-7.5 Dashboard สรุปภาพรวม (ยอดรวมทุกบัญชี, รายจ่ายเดือนนี้, งบที่เหลือ)

### FR-8 Import/Export

- FR-8.1 Export ธุรกรรมเป็น CSV
- FR-8.2 Export รายงานเป็น PDF
- FR-8.3 Import ธุรกรรมจาก CSV พร้อม mapping column และตรวจสอบ duplicate

---

## 6. Non-Functional Requirements

| หมวด           | รายละเอียด                                                                              |
| -------------- | --------------------------------------------------------------------------------------- |
| Performance    | หน้า Dashboard โหลด < 2s สำหรับข้อมูล 1 ปี (~1,000 ธุรกรรม)                             |
| Security       | ข้อมูลทั้งหมดเก็บใน Local Storage/IndexedDB ไม่มีการส่งออกไปภายนอก                      |
| Usability      | Responsive ≥ 375px, Dark mode support                                                   |
| Data Integrity | Transaction ต้องผูกกับบัญชีที่มีอยู่จริง, ป้องกันยอดติดลบเกิน limit (configurable)      |
| Backup         | มีระบบ Export ข้อมูลเป็นไฟล์ (JSON/CSV) เพื่อให้ผู้ใช้ทำ Backup ด้วยตนเอง                |
| Accessibility  | WCAG 2.1 AA เบื้องต้น (contrast, keyboard nav)                                          |

---

## 7. State Model (Local Storage / IndexedDB)

```
Settings (name, currency, timezone, theme)
Account (id, name, type, balance, currency, icon, is_archived)
Category (id, name, type[income/expense], parent_id, icon, color)
Transaction (id, account_id, category_id, type, amount, note,
             receipt_url, transaction_date, created_at)
Transfer (id, from_account_id, to_account_id, amount, transaction_date)
Budget (id, category_id, amount, month, year)
RecurringRule (id, template_transaction_id, frequency,
               start_date, end_date, next_run_date)
```

**ความสัมพันธ์หลัก:**

- Account 1—N Transaction
- Category 1—N Transaction, Budget
- Category 1—N Category (subcategory, self-referencing)

---

## 8. Local State Actions (Zustand / IndexedDB)

- **Settings Store**: `updateSettings(data)`
- **Account Store**: `addAccount`, `updateAccount`, `deleteAccount`, `getAccounts`
- **Category Store**: `addCategory`, `updateCategory`, `deleteCategory`, `getCategories`
- **Transaction Store**: `addTransaction`, `updateTransaction`, `deleteTransaction`, `getTransactions`
- **Budget Store**: `setBudget`, `getBudgets`
- **Data Manager**: `exportAllData()`, `importData(file)`

---

## 9. UI Screens (Frontend Routes)

```
/onboarding             → ตั้งค่าเริ่มต้น (ชื่อ, สกุลเงิน)
/dashboard              → ภาพรวม + กราฟสรุป
/transactions           → รายการ + filter + add/edit modal
/accounts               → จัดการบัญชี
/categories              → จัดการหมวดหมู่
/budgets                → ตั้ง/ดูงบประมาณรายเดือน
/reports                → กราฟวิเคราะห์เชิงลึก
/settings                → โปรไฟล์, currency, export/import
```

---

## 10. Milestone แนะนำ

| Phase | Feature                                      |
| ----- | -------------------------------------------- |
| M1    | Local Setup, Account CRUD, Transaction CRUD  |
| M2    | Category, Dashboard, Reports (chart พื้นฐาน) |
| M3    | Budget + แจ้งเตือน, Recurring transactions   |
| M4    | Import/Export (JSON/CSV), Polish UI          |
