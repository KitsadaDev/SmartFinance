<h1 align="center">
  💰 SmartFinance
</h1>

<p align="center">
  <strong>ระบบบริหารจัดการการเงินส่วนบุคคลระดับพรีเมียม</strong><br/>
  Personal Finance Management System with Premium Glassmorphism Design
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Zustand-State_Mgmt-FF6154?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Vite-Build_Tool-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
</p>

---

## 📖 เกี่ยวกับโปรเจกต์ (About)

**SmartFinance** คือเว็บแอปพลิเคชันบริหารจัดการการเงินส่วนบุคคลแบบครบวงจร ออกแบบด้วยสไตล์ **Premium Glassmorphism** ที่ให้ความรู้สึกทันสมัยและใช้งานง่าย รองรับการติดตามรายรับ-รายจ่าย, การจัดการงบประมาณ, รายงานเชิงลึกพร้อมกราฟ, และการส่งออกรายงาน PDF — ทั้งหมดขับเคลื่อนด้วย **PostgreSQL** ผ่าน **Prisma ORM**

---

## ✨ ฟีเจอร์หลัก (Key Features)

### 📊 แดชบอร์ดภาพรวมการเงิน
- แสดงยอดเงินคงเหลือรวมทุกบัญชี, รายรับ และรายจ่ายรายเดือน
- กราฟเปรียบเทียบกระแสเงินสดและสัดส่วนทางการเงิน
- การแจ้งเตือนอัจฉริยะเมื่องบประมาณใกล้เต็มหรือเกิน

### 💼 ระบบจัดการบัญชี (Account Management)
- รองรับบัญชีเงินสด, ธนาคาร, บัตรเครดิต และ E-Wallet
- ติดตามประวัติและยอดเงินแยกแต่ละบัญชีได้อย่างละเอียด

### 💸 บันทึกธุรกรรมอัจฉริยะ (Smart Transactions)
- บันทึกรายรับ, รายจ่าย และการโอนเงินระหว่างบัญชี (Transfer)
- รองรับการแนบภาพถ่ายใบเสร็จ (Receipt Upload via Base64)
- **Recurring Transactions** — กำหนดธุรกรรมเกิดซ้ำ รายวัน / รายสัปดาห์ / รายเดือน / รายปี

### 📈 รายงานและการวิเคราะห์เชิงลึก (Reports & Analytics)
- **Donut Chart** — สัดส่วนค่าใช้จ่ายแยกตามหมวดหมู่
- **Bar Chart** — เปรียบเทียบรายรับ vs รายจ่ายรายเดือน
- **Line Chart** — แนวโน้มกระแสเงินสดสุทธิสะสมรายปี
- ตารางสรุปเปอร์เซ็นต์สัดส่วนหมวดหมู่

### 🎯 การจัดการงบประมาณ (Budget Control)
- ตั้งเป้าหมายงบประมาณรายเดือนแยกตามหมวดหมู่
- Progress Bar แสดงสถานะการใช้จ่าย (ปกติ / เตือน 80% / เกินงบ 100%)

### ⚙️ การตั้งค่าและนำเข้า/ส่งออกข้อมูล
- **ดาวน์โหลด PDF** — รายงานสรุปภาพรวมและเดินบัญชีแบบ A4
- **JSON Backup** — สำรองและกู้คืนข้อมูลทั้งหมด
- **CSV Import** — นำเข้าข้อมูลพร้อมจับคู่คอลัมน์และป้องกันข้อมูลซ้ำ
- **Danger Zone Reset** — รีเซ็ตข้อมูลทั้งหมดอย่างปลอดภัย

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, TailwindCSS v4 |
| **State** | Zustand |
| **Charts** | Recharts |
| **PDF** | jsPDF, jsPDF-Autotable |
| **CSV** | PapaParse |
| **Icons** | Lucide React |
| **Backend** | Node.js, Express.js (REST API) |
| **ORM** | Prisma Client |
| **Database** | PostgreSQL |

---

## 📥 การติดตั้ง (Installation & Setup)

### 1. Clone โปรเจกต์
```bash
git clone https://github.com/KitsadaDev/SmartFinance.git
cd SmartFinance
```

### 2. ตั้งค่า Backend (Server)
```bash
cd server
npm install
```

สร้างไฟล์ `.env`:
```env
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/smartfinance?schema=public"
PORT=3001
```

รัน Migration และ Seed:
```bash
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

### 3. ตั้งค่า Frontend (Client)
```bash
cd ../client
npm install
npm run dev
```

เปิดเบราว์เซอร์ที่ → [http://localhost:5173](http://localhost:5173)

---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

```
SmartFinance/
├── client/                    # React & Vite Frontend
│   └── src/
│       ├── components/        # UI Layout & Transaction Modal
│       ├── store/             # Zustand State Stores
│       ├── views/             # Pages (Dashboard, Transactions, Reports, ...)
│       └── types/             # TypeScript Type Definitions
│
├── server/                    # Node.js & Express Backend
│   ├── prisma/                # Schema & Migrations
│   └── src/
│       ├── routes/            # API Endpoint Routers
│       └── index.js           # Server Entry Point
│
└── README.md
```

---

<p align="center">
  จัดทำและดูแลโดย <strong><a href="https://github.com/KitsadaDev">KitsadaDev</a></strong>
</p>
