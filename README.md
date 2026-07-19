# 🚀 SmartFinance - ระบบบริหารจัดการการเงินส่วนบุคคลระดับพรีเมียม

**SmartFinance** เป็นเว็บแอปพลิเคชันระบบบริหารจัดการการเงินส่วนบุคคลระดับ SaaS ที่ได้รับการออกแบบอินเตอร์เฟสแบบพรีเมียม (Premium Glassmorphism Design) พร้อมด้วยการจัดการฐานข้อมูลด้วย **PostgreSQL** และทำข้อมูลสถิติรายงานเชิงลึกครบครัน

## ✨ คุณเด่นและฟังก์ชันการใช้งาน (Key Features)

### 1. 📊 แดชบอร์ดภาพรวมการเงิน (Dashboard Overview)
* แสดงยอดเงินคงเหลือจากทุกบัญชีรวมกัน, รายรับรวม และรายจ่ายรวมรายเดือน
* กราฟสรุปกระแสเงินสดเชิงเปรียบเทียบและอัตราสัดส่วนการเงิน
* ระบบแจ้งเตือนอัจฉริยะกรณีมีงบประมาณเกิน (Over budget) หรือแจ้งรายการทำธุรกรรมอัตโนมัติ

### 2. 💼 ระบบจัดการบัญชีธนาคารและกระเป๋าเงิน (Account Management)
* เพิ่มและตั้งค่าบัญชีเงินสด, บัญชีธนาคาร, บัตรเครดิต, หรือ E-wallet
* ตรวจสอบประวัติการเงินเฉพาะบัญชี และสถานะการบันทึกเอกสารยอดเงินในแต่ละบัญชี

### 3. 💸 บันทึกธุรกรรมรวดเร็ว & รองรับไฟล์ใบเสร็จ (Smart Transactions & Attachments)
* บันทึกรายรับ รายจ่าย หรือการโอนเงินระหว่างบัญชี (Transfer)
* หน้าฟอร์มแบบพรีเมียม เลือกบัญชีและหมวดหมู่ย่อยได้สะดวกรวดเร็ว
* รองรับการแนบภาพถ่ายใบเสร็จ (Receipt Upload) บันทึกแบบ Base64 ถ่ายโอนข้อมูลได้รวดเร็ว
* **การตั้งค่าธุรกรรมเกิดซ้ำ (Recurring Transactions):** กำหนดรอบทำซ้ำแบบรายวัน, รายสัปดาห์, รายเดือน หรือรายปีล่วงหน้าได้

### 4. 📈 การวิเคราะห์เชิงลึกและรายงาน (Reports & Analytics)
* แผนภูมิแสดงโครงสร้างค่าใช้จ่ายตามหมวดหมู่ (Expense Breakdown Donut Chart)
* กราฟแท่งเปรียบเทียบรายรับ-รายจ่ายรายเดือน (Income vs Expense Bar Chart)
* กราฟเส้นแสดงแนวโน้มยอดเงินคงเหลือสะสมสุทธิรายปี (Net Cash Flow Trend Line Chart)
* รายงานสรุปตารางการเปรียบเทียบสัดส่วนเปอร์เซ็นต์หมวดหมู่

### 5. 🎯 การบริหารจัดการงบประมาณ (Budgets Control)
* ตั้งค่าเป้าหมายงบประมาณรายเดือนแยกตามหมวดหมู่หลัก
* แถบความคืบหน้า (Progress Bar) แจ้งเตือนสี่เหลี่ยมสีสวยงามตามระดับการใช้จ่าย (ปกติ / เตือนเกิน 80% / เกินงบประมาณ 100%)

### 6. ⚙️ การตั้งค่าขั้นสูง การส่งออกเอกสาร และความปลอดภัย (Settings & Backups)
* **ดาวน์โหลดรายงาน PDF:** สร้างไฟล์รายงาน PDF สรุปภาพรวมทางการเงินและรายการเดินบัญชีขนาด A4 สวยงามเป็นระเบียบ
* **สำรองข้อมูลและนำเข้า (JSON):** ส่งออกและนำเข้าข้อมูลประวัติทางการเงินทั้งหมดของระบบผ่านไฟล์ JSON
* **นำเข้าผ่าน CSV (CSV Import & Mapping):** รองรับการอัปโหลดไฟล์ตาราง `.csv` พร้อมฟังก์ชันจับคู่คอลัมน์และป้องกันการนำเข้าข้อมูลซ้ำซ้อนโดยอัตโนมัติ
* **Danger Zone Reset:** ระบบรีเซ็ตล้างข้อมูลทั้งหมดเพื่อเริ่มต้นใหม่ได้อย่างปลอดภัยผ่านฐานข้อมูล PostgreSQL

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

### Frontend (Client)
* **Core:** React 19, TypeScript, Vite
* **Styling:** TailwindCSS v4, Vanilla CSS (Glassmorphism design tokens)
* **State Management:** Zustand
* **Libraries:** Recharts (แผนภูมิข้อมูล), jsPDF & jsPDF-Autotable (ระบบสร้าง PDF), PapaParse (ระบบแกะไฟล์ CSV), Lucide React (ไอคอนพรีเมียม)

### Backend (Server)
* **Core:** Node.js, Express (REST API)
* **ORM:** Prisma Client
* **Database:** PostgreSQL (ฐานข้อมูลหลักประสิทธิภาพสูง)

---

## 📥 ขั้นตอนการติดตั้งและเริ่มใช้งาน (Installation & Setup)

### 1. โคลนคลังข้อมูลโปรเจกต์
```bash
git clone https://github.com/KitsadaDev/SmartFinance.git
cd SmartFinance
```

### 2. ตั้งค่าและรันฝั่ง Backend (Server)
1. ไปยังโฟลเดอร์ `server` และติดตั้ง Packages:
   ```bash
   cd server
   npm install
   ```
2. สร้างไฟล์ `.env` สำหรับเชื่อมโยงกับฐานข้อมูล PostgreSQL:
   ```env
   DATABASE_URL="postgresql://<username>:<password>@localhost:5432/money?schema=public"
   PORT=3001
   ```
3. สั่งรัน Migration เพื่อสร้างโครงสร้างตารางข้อมูลในฐานข้อมูล:
   ```bash
   npx prisma migrate dev --name init
   ```
4. รันระบบข้อมูลตั้งต้น (Seeding - สกุลเงิน/หมวดหมู่หลัก):
   ```bash
   npx prisma db seed
   ```
5. เริ่มการรัน Server พัฒนา:
   ```bash
   npm run dev
   ```

### 3. ตั้งค่าและรันฝั่ง Frontend (Client)
1. ไปยังโฟลเดอร์ `client` และติดตั้ง Packages:
   ```bash
   cd ../client
   npm install
   ```
2. เริ่มต้นรันระบบหน้าเว็บพัฒนา:
   ```bash
   npm run dev
   ```
3. เปิดเว็บบราวเซอร์ไปยัง: [http://localhost:5173](http://localhost:5173)

---

## 📂 โครงสร้างโฟลเดอร์หลัก (Folder Directory Structure)

```text
SmartFinance/
├── client/                 # React & Vite Frontend Application
│   ├── src/
│   │   ├── components/     # UI Layout & Transaction Modal
│   │   ├── store/          # Zustand State Stores
│   │   ├── views/          # หน้าต่างเมนูต่างๆ (Dashboard, Transactions, Settings, ฯลฯ)
│   │   └── types/          # Type Definitions (TypeScript)
│   ├── package.json
│   └── vite.config.ts
│
├── server/                 # Express & Node.js Backend API
│   ├── prisma/             # Schema & Database Migration
│   ├── src/
│   │   ├── routes/         # API Endpoint Routers
│   │   └── index.js        # Backend Entrypoint
│   └── package.json
│
└── README.md
```

---
*จัดทำขึ้นและดูแลระบบโดย KitsadaDev*
