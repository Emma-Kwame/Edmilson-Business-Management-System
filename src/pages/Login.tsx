import React, { useState } from 'react';
import { Printer, Eye, EyeOff, AlertCircle } from 'lucide-react';
import type { Role } from '../data/mock';

interface LoginProps {
  onLogin: (role: Role) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('kwame@printcraft.gh');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [screen, setScreen] = useState<'login'|'forgot'|'otp'>('login');
  const [otpValue, setOtpValue] = useState(['','','','','','']);
  const [forgotEmail, setForgotEmail] = useState('');

  const roleMap: Record<string, Role> = {
    'kwame@printcraft.gh': 'owner',
    'ama@printcraft.gh': 'manager',
    'kofi@printcraft.gh': 'accountant',
    'abena@printcraft.gh': 'staff',
  };

  const handleLogin = () => {
    if (!email) { setError('Please enter your email address.'); return; }
    if (!password && password.length === 0) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        const role = roleMap[email] || 'staff';
        onLogin(role);
      }, 900);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const role = roleMap[email] || 'staff';
      onLogin(role);
    }, 900);
  };

  const demoAccounts: { email: string; role: string; label: string }[] = [
    { email: 'kwame@printcraft.gh', role: 'Owner', label: 'KA' },
    { email: 'ama@printcraft.gh', role: 'Manager', label: 'AM' },
    { email: 'kofi@printcraft.gh', role: 'Accountant', label: 'KB' },
    { email: 'abena@printcraft.gh', role: 'Staff', label: 'AD' },
  ];

  if (screen === 'forgot') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
          <button onClick={() => setScreen('login')} className="text-xs text-indigo-600 font-semibold mb-6 flex items-center gap-1 hover:underline">
            ← Back to Login
          </button>
          <h2 className="text-xl font-bold text-slate-900 font-display mb-1">Forgot password?</h2>
          <p className="text-sm text-slate-500 mb-6">Enter your email and we'll send a reset link.</p>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
            <input value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
              placeholder="you@printcraft.gh" className="input-base" />
          </div>
          <button onClick={() => setScreen('otp')}
            className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm">
            Send Reset Link
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'otp') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📧</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display mb-1">Check your email</h2>
          <p className="text-sm text-slate-500 mb-6">Enter the 6-digit code sent to {forgotEmail || 'your email'}.</p>
          <div className="flex gap-2 justify-center mb-6">
            {otpValue.map((v, i) => (
              <input key={i} value={v} maxLength={1}
                onChange={e => { const n = [...otpValue]; n[i] = e.target.value; setOtpValue(n); }}
                className="w-11 h-12 text-center text-lg font-bold border-2 border-slate-200 rounded-lg
                  focus:border-indigo-500 focus:outline-none transition-colors" />
            ))}
          </div>
          <button onClick={() => setScreen('login')}
            className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm mb-3">
            Verify Code
          </button>
          <button onClick={() => setScreen('login')} className="text-xs text-slate-500 hover:text-indigo-600">
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-80 mr-8 text-white">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Printer size={20} color="white" />
            </div>
            <div>
              <p className="font-bold text-lg font-display">PrintCraft BMS</p>
              <p className="text-indigo-300 text-xs">Business Management System</p>
            </div>
          </div>
          <h1 className="text-3xl font-bold font-display leading-snug mb-4">
            Manage your print<br/>business smarter.
          </h1>
          <p className="text-indigo-200 text-sm leading-relaxed">
            Track projects, staff, inventory, and finances — all from one powerful dashboard designed for creative businesses.
          </p>
        </div>
        <div className="space-y-3">
          {['Real-time attendance tracking', 'Project & task management', 'Inventory & stock alerts', 'Financial reports & analytics'].map(f => (
            <div key={f} className="flex items-center gap-2 text-sm text-indigo-200">
              <span className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">✓</span>
              </span>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        {/* Header */}
        <div className="p-8 pb-0">
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Printer size={15} color="white" />
            </div>
            <div>
              <p className="font-bold text-sm font-display text-slate-900">PrintCraft BMS</p>
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display mb-1">Welcome back</h2>
          <p className="text-sm text-slate-500">Sign in to your account to continue.</p>
        </div>

        <div className="p-8 pt-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
              <AlertCircle size={14} />{error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
            <input value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
              type="email" placeholder="you@printcraft.gh"
              className="input-base" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
            <div className="relative">
              <input value={password} onChange={e => setPassword(e.target.value)}
                type={showPass ? 'text' : 'password'} placeholder="Enter your password"
                className="input-base pr-10" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">Leave blank for demo — any password works</p>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                className="rounded" />
              <span className="text-xs text-slate-600">Remember me</span>
            </label>
            <button onClick={() => setScreen('forgot')} className="text-xs text-indigo-600 font-semibold hover:underline">
              Forgot password?
            </button>
          </div>

          <button onClick={handleLogin} disabled={loading}
            className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700
              transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-70">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
            ) : 'Sign In'}
          </button>

          <div className="relative flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400">or demo as</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map(acc => (
              <button key={acc.email} onClick={() => { setEmail(acc.email); setError(''); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                  email === acc.email ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}>
                <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">
                  {acc.label.charAt(0)}
                </span>
                {acc.role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
