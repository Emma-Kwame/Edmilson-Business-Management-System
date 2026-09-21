import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, Lock, Mail, User, Briefcase, ClipboardList, Users, Package, BarChart3, KeyRound } from 'lucide-react';
import { useData } from '../store';
import { supabase } from '../lib/supabase';
import type { Role } from '../data/mock';
import logo from '../assets/Logo-removebg-preview.png';
import printerArt from '../assets/PRINTER.png';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'owner', label: 'Owner' },
  { value: 'manager', label: 'Manager' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'staff', label: 'Staff' },
];

const FEATURES = [
  { icon: ClipboardList, title: 'Project Management', desc: 'Keep your projects on track' },
  { icon: Users, title: 'Team & Attendance', desc: 'Monitor staff and productivity' },
  { icon: Package, title: 'Inventory Control', desc: 'Never run out of essentials' },
  { icon: BarChart3, title: 'Financial Reports', desc: 'Make better decisions' },
];

export default function Login() {
  const { signIn, signUp, authLoading, authError } = useData();
  const [screen, setScreen] = useState<'login'|'signup'|'signup-sent'|'forgot'|'sent'>('login');

  // Sign in
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);

  // Sign up
  const [suName, setSuName] = useState('');
  const [suUsername, setSuUsername] = useState('');
  const [suRole, setSuRole] = useState<Role>('staff');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suConfirm, setSuConfirm] = useState('');
  const [suCode, setSuCode] = useState('');
  const [suError, setSuError] = useState('');

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetError, setResetError] = useState('');

  const handleLogin = () => {
    if (!username || !password) return;
    signIn(username, password);
  };

  const handleSignUp = async () => {
    setSuError('');
    if (!suName.trim()) { setSuError('Please enter your name.'); return; }
    if (!/^[a-z0-9_]{3,20}$/i.test(suUsername.trim())) {
      setSuError('Username must be 3–20 characters: letters, numbers, or underscores only.');
      return;
    }
    if (!suEmail.trim()) { setSuError('Please enter a recovery email address.'); return; }
    if (suPassword.length < 6) { setSuError('Password must be at least 6 characters.'); return; }
    if (suPassword !== suConfirm) { setSuError('Passwords do not match.'); return; }
    if (!suCode.trim()) { setSuError('Please enter your company\'s sign-up code.'); return; }
    const result = await signUp(suName.trim(), suUsername.trim(), suEmail.trim(), suPassword, suRole, suCode.trim());
    if (!result.ok) return;
    if (result.needsConfirmation) { setScreen('signup-sent'); return; }
    // Otherwise the store's session listener picks up the new session automatically.
  };

  const sendResetLink = async () => {
    setResetError('');
    if (!forgotEmail) { setResetError('Please enter your email address.'); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail);
    if (error) { setResetError(error.message); return; }
    setScreen('sent');
  };

  if (screen === 'forgot') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
          <button onClick={() => setScreen('login')} className="text-xs text-indigo-600 font-semibold mb-6 flex items-center gap-1 hover:underline">
            ← Back to Login
          </button>
          <h2 className="text-2xl font-semibold text-slate-900 font-display mb-1">Forgot password?</h2>
          <p className="text-sm text-slate-500 mb-6">Enter your email and we'll send a reset link.</p>
          {resetError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700 mb-4">
              <AlertCircle size={14} />{resetError}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
            <input value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
              placeholder="you@yourbusiness.com" className="input-base" />
          </div>
          <button onClick={sendResetLink}
            className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm">
            Send Reset Link
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'sent') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📧</span>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 font-display mb-1">Check your email</h2>
          <p className="text-sm text-slate-500 mb-6">
            We sent a password reset link to {forgotEmail || 'your email'}. Follow it to set a new password.
          </p>
          <button onClick={() => setScreen('login')}
            className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm mb-3">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'signup-sent') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📧</span>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 font-display mb-1">Confirm your email</h2>
          <p className="text-sm text-slate-500 mb-6">
            We sent a confirmation link to {suEmail}. Click it, then come back here and sign in.
          </p>
          <button onClick={() => setScreen('login')}
            className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm mb-3">
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden flex flex-col">
      <div className="relative z-10 flex-1 w-full flex items-center justify-center px-6 sm:px-12 lg:px-16 xl:px-20 py-12">
      <div className="relative w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[55%_45%] items-center gap-12">
        <img src={printerArt} alt="" aria-hidden="true"
          className="pointer-events-none select-none absolute right-0 top-1/2 -translate-y-1/2 z-0
            w-[34rem] opacity-10 blur-[2px]" />

        {/* Left brand panel */}
        <div className="hidden lg:flex flex-col justify-center text-white max-w-2xl relative z-10">
          <div className="flex items-center gap-3 mb-9">
            <div className="w-14 h-14 rounded-full overflow-hidden shadow-[0_0_18px_4px_rgba(240,160,92,0.5)] flex-shrink-0">
              <img src={logo} alt="Edmilson Graphics & Photography"
                className="w-full h-full object-cover scale-[1.22]" />
            </div>
            <div>
              <p className="font-semibold text-xl font-display leading-tight">Edmilson Graphics &amp; Photography</p>
              <p className="text-indigo-300 text-sm">Management Portal</p>
            </div>
          </div>
          <h1 className="text-5xl xl:text-6xl font-semibold font-display leading-[1.12] mb-6">
            Your Vision.<br />Our Expertise.<br />Better Managed.
          </h1>
          <p className="text-indigo-200 text-base leading-relaxed max-w-lg mb-11">
            Track projects, manage your team, monitor inventory, handle finances and grow your business — all in one place.
          </p>

          <div className="space-y-5">
            {FEATURES.map(f => (
              <div key={f.title} className="flex items-start gap-3">
                <span className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                  <f.icon size={18} className="text-white" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs text-indigo-300">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auth Card */}
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-auto lg:mx-0 lg:ml-auto">
          <div className="p-10 sm:p-14 pb-0 text-center">
            <div className="w-16 h-16 rounded-full overflow-hidden shadow-[0_0_24px_5px_rgba(240,160,92,0.5)] mx-auto mb-6">
              <img src={logo} alt="Edmilson Graphics & Photography"
                className="w-full h-full object-cover scale-[1.22]" />
            </div>
            {screen === 'login' ? (
              <>
                <h2 className="text-3xl font-semibold text-slate-900 font-display mb-1.5">Welcome back</h2>
                <p className="text-sm text-slate-500">Sign in to continue to your workspace.</p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-semibold text-slate-900 font-display mb-1.5">Create your account</h2>
                <p className="text-sm text-slate-500">Tell us your role and we'll take you to the right portal.</p>
              </>
            )}
          </div>

          {screen === 'login' ? (
            <div className="p-10 sm:p-14 pt-8 space-y-5">
              {authError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                  <AlertCircle size={14} />{authError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Username</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="yourusername"
                    className="input-base pl-9" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={password} onChange={e => setPassword(e.target.value)}
                    type={showPass ? 'text' : 'password'} placeholder="Enter your password"
                    className="input-base pl-9 pr-10" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
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

              <button onClick={handleLogin} disabled={authLoading}
                className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700
                  transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-70">
                {authLoading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                ) : 'Sign In'}
              </button>

              <p className="text-center text-sm text-slate-500">
                Don't have an account?{' '}
                <button onClick={() => setScreen('signup')} className="text-indigo-600 font-semibold hover:underline">Sign up</button>
              </p>

              <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400 pt-1">
                <Lock size={11} /> Your account is protected with secure authentication.
              </p>
            </div>
          ) : (
            <div className="p-10 sm:p-14 pt-8 space-y-5">
              {(suError || authError) && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                  <AlertCircle size={14} />{suError || authError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Company sign-up code</label>
                <div className="relative">
                  <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={suCode} onChange={e => setSuCode(e.target.value)}
                    placeholder="Ask your Owner or Manager" className="input-base pl-9" />
                </div>
                <p className="text-xs text-slate-400 mt-1">Keeps sign-up limited to your company — find it in Settings → Company (Owner/Manager).</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={suName} onChange={e => setSuName(e.target.value)}
                    placeholder="e.g. Kwame Asante" className="input-base pl-9" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Username</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={suUsername} onChange={e => setSuUsername(e.target.value.replace(/\s/g, ''))}
                    placeholder="yourusername" className="input-base pl-9" />
                </div>
                <p className="text-xs text-slate-400 mt-1">This is what you'll use to sign in.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Your role</label>
                <div className="relative">
                  <Briefcase size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select value={suRole} onChange={e => setSuRole(e.target.value as Role)}
                    className="input-base pl-9">
                    {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Recovery email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={suEmail} onChange={e => setSuEmail(e.target.value)}
                    type="email" placeholder="you@yourbusiness.com" className="input-base pl-9" />
                </div>
                <p className="text-xs text-slate-400 mt-1">Only used if you ever need to reset your password — never for signing in.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={suPassword} onChange={e => setSuPassword(e.target.value)}
                    type={showPass ? 'text' : 'password'} placeholder="At least 6 characters"
                    className="input-base pl-9 pr-10" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={suConfirm} onChange={e => setSuConfirm(e.target.value)}
                    type={showPass ? 'text' : 'password'} placeholder="Re-enter your password"
                    className="input-base pl-9" onKeyDown={e => e.key === 'Enter' && handleSignUp()} />
                </div>
              </div>

              <button onClick={handleSignUp} disabled={authLoading}
                className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700
                  transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-70">
                {authLoading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
                ) : 'Create Account'}
              </button>

              <p className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <button onClick={() => setScreen('login')} className="text-indigo-600 font-semibold hover:underline">Sign in</button>
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
