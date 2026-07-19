import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAccountStore } from '../store/useAccountStore';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

const CURRENCIES = [
  { value: 'THB', label: 'THB (฿) — บาทไทย', flag: '🇹🇭' },
  { value: 'USD', label: 'USD ($) — ดอลลาร์สหรัฐ', flag: '🇺🇸' },
  { value: 'EUR', label: 'EUR (€) — ยูโร', flag: '🇪🇺' },
  { value: 'JPY', label: 'JPY (¥) — เยนญี่ปุ่น', flag: '🇯🇵' },
  { value: 'GBP', label: 'GBP (£) — ปอนด์อังกฤษ', flag: '🇬🇧' },
];



export const Onboarding: React.FC = () => {
  const { updateSettings } = useSettingsStore();
  const { addAccount } = useAccountStore();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('THB');
  const [loading, setLoading] = useState(false);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || loading) return;
    setLoading(true);

    await updateSettings({ name: name.trim(), currency });

    await addAccount({
      name: 'เงินสด (Cash)',
      type: 'cash',
      balance: 0,
      currency,
      icon: 'Coins',
      color: '#F59E0B',
    });

    await addAccount({
      name: 'บัญชีธนาคารหลัก (Bank)',
      type: 'bank',
      balance: 0,
      currency,
      icon: 'Building2',
      color: '#3B82F6',
    });

    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f0c29 0%, #1a1040 30%, #0d1b4b 60%, #0a0f2e 100%)',
      }}
    >
      {/* Animated orbs */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-10%', left: '-10%',
          width: '600px', height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'pulse 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '-10%', right: '-10%',
          width: '500px', height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
          filter: 'blur(50px)',
          animation: 'pulse 10s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: '40%', left: '50%',
          width: '400px', height: '400px',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'pulse 6s ease-in-out infinite',
        }}
      />

      {/* Floating dots grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Main card */}
      <div
        className="relative z-10 w-full max-w-md"
        style={{ animation: 'fadeInUp 0.6s ease-out' }}
      >
        {/* Card */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '28px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
            padding: '40px 36px',
          }}
        >
          {/* Logo + Title */}
          <div className="flex flex-col items-center text-center mb-8">
            <div
              className="flex items-center justify-center mb-5"
              style={{
                width: '72px', height: '72px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 12px 32px rgba(99,102,241,0.45)',
              }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </div>

            <div
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
                border: '1px solid rgba(139,92,246,0.3)',
                borderRadius: '100px',
                padding: '4px 14px',
                marginBottom: '12px',
              }}
            >
              <span style={{ color: '#a78bfa', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Personal Finance
              </span>
            </div>

            <h1
              className="font-extrabold tracking-tight"
              style={{
                fontSize: '34px',
                background: 'linear-gradient(135deg, #fff 30%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.15,
              }}
            >
              SmartFinance
            </h1>
          </div>


          {/* Divider */}
          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)', marginBottom: '28px' }} />

          {/* Form */}
          <form onSubmit={handleStart} className="space-y-4">
            {/* Name input */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(167,139,250,0.9)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
                ชื่อผู้ใช้งาน
              </label>
              <input
                type="text"
                placeholder="กรอกชื่อผู้ใช้"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '14px',
                  padding: '14px 18px',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 500,
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid rgba(139,92,246,0.6)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)';
                  e.target.style.background = 'rgba(255,255,255,0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid rgba(255,255,255,0.12)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = 'rgba(255,255,255,0.06)';
                }}
              />
            </div>

            {/* Currency select */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(167,139,250,0.9)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
                สกุลเงินหลัก
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(30,20,60,0.9)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '14px',
                  padding: '14px 18px',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 500,
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value} style={{ background: '#1a1040' }}>
                    {c.flag} {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!name.trim() || loading}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '14px',
                border: 'none',
                background: !name.trim() || loading
                  ? 'rgba(99,102,241,0.3)'
                  : 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 700,
                cursor: !name.trim() || loading ? 'not-allowed' : 'pointer',
                boxShadow: !name.trim() || loading ? 'none' : '0 8px 24px rgba(99,102,241,0.45)',
                transition: 'all 0.25s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '8px',
              }}
              onMouseEnter={(e) => {
                if (!name.trim() || loading) return;
                (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                (e.target as HTMLButtonElement).style.boxShadow = '0 12px 32px rgba(99,102,241,0.55)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.target as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(99,102,241,0.45)';
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  กำลังตั้งค่า...
                </>
              ) : (
                <>
                  เริ่มต้นใช้งานระบบ
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-center gap-1.5 mt-5">
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#4ade80' }} />
            <p style={{ color: 'rgba(148,163,184,0.6)', fontSize: '11px' }}>
              ข้อมูลถูกเก็บใน PostgreSQL บนเครื่องของคุณ ปลอดภัย 100%
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input::placeholder { color: rgba(148,163,184,0.4); }
      `}</style>
    </div>
  );
};
