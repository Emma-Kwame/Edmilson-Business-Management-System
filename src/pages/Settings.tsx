import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../store';
import { Card, PageHeader, Btn, Input, Select, Textarea, Tabs, Alert, Avatar } from '../components/ui';
import { Lock, ShieldCheck, Copy } from 'lucide-react';

const NOTIF_PREFS: { key: 'tasks'|'projects'|'stock'|'payments'|'attendance'|'system'; label: string; desc: string }[] = [
  { key: 'tasks', label: 'Task Reminders', desc: 'Notify when tasks are due or overdue' },
  { key: 'projects', label: 'Project Updates', desc: 'Notify on project status changes' },
  { key: 'stock', label: 'Low Stock Alerts', desc: 'Notify when inventory falls below minimum' },
  { key: 'payments', label: 'Payment Received', desc: 'Notify when a payment is recorded' },
  { key: 'attendance', label: 'Staff Attendance', desc: 'Notify on late or absent staff' },
  { key: 'system', label: 'System Alerts', desc: 'System maintenance and updates' },
];

const BUSINESS_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const emptyCompanyDraft = {
  name: '', address: '', phone: '', email: '', currency: 'GHS', timezone: 'Africa/Accra',
  dateFormat: 'dmy', lateThresholdMinutes: '10', lowStockWarning: 'min', signupCode: '',
  businessHours: Object.fromEntries(BUSINESS_DAYS.map(d => [d, ['08:00', '17:00']])) as Record<string, [string, string]>,
};

export default function Settings() {
  const {
    profile, role, companySettings, updateCompanySettings, uploadLogo, uploadAvatar, updateStaff,
    changePassword, mfaFactors, mfaEnroll, mfaVerify, mfaUnenroll,
  } = useData();
  const canEditCompany = role === 'manager' || role === 'owner';
  const [tab, setTab] = useState('Company');
  const [toast, setToast] = useState<{ type: 'success'|'error'|'info'; msg: string } | null>(null);
  const showToast = (type: 'success'|'error'|'info', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Company ────────────────────────────────────────────────────────────
  const [companyDraft, setCompanyDraft] = useState(emptyCompanyDraft);
  const [savingCompany, setSavingCompany] = useState(false);
  useEffect(() => {
    if (!companySettings) return;
    setCompanyDraft({
      name: companySettings.name, address: companySettings.address, phone: companySettings.phone,
      email: companySettings.email, currency: companySettings.currency, timezone: companySettings.timezone,
      dateFormat: companySettings.dateFormat, lateThresholdMinutes: String(companySettings.lateThresholdMinutes),
      lowStockWarning: companySettings.lowStockWarning, signupCode: companySettings.signupCode,
      businessHours: Object.keys(companySettings.businessHours).length ? companySettings.businessHours : emptyCompanyDraft.businessHours,
    });
  }, [companySettings]);

  const saveCompany = async () => {
    setSavingCompany(true);
    await updateCompanySettings({
      name: companyDraft.name, address: companyDraft.address, phone: companyDraft.phone,
      email: companyDraft.email, currency: companyDraft.currency, timezone: companyDraft.timezone,
      businessHours: companyDraft.businessHours,
    });
    setSavingCompany(false);
    showToast('success', 'Company settings saved.');
  };

  const [savingCode, setSavingCode] = useState(false);
  const saveSignupCode = async () => {
    if (!companyDraft.signupCode.trim()) { showToast('error', 'Sign-up code cannot be empty.'); return; }
    setSavingCode(true);
    await updateCompanySettings({ signupCode: companyDraft.signupCode.trim() });
    setSavingCode(false);
    showToast('success', 'Sign-up code updated.');
  };

  const savePreferences = async () => {
    setSavingCompany(true);
    await updateCompanySettings({
      dateFormat: companyDraft.dateFormat,
      lateThresholdMinutes: Number(companyDraft.lateThresholdMinutes) || 10,
      lowStockWarning: companyDraft.lowStockWarning,
    });
    setSavingCompany(false);
    showToast('success', 'Preferences saved.');
  };

  const setHour = (day: string, idx: 0 | 1, value: string) => {
    setCompanyDraft(d => ({
      ...d,
      businessHours: { ...d.businessHours, [day]: idx === 0 ? [value, d.businessHours[day][1]] : [d.businessHours[day][0], value] },
    }));
  };

  // ─── Logo ───────────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const handleLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    await uploadLogo(file);
    setUploadingLogo(false);
    showToast('success', 'Logo updated.');
  };

  // ─── Profile ────────────────────────────────────────────────────────────
  const [profileDraft, setProfileDraft] = useState({ firstName: '', lastName: '', phone: '', position: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  useEffect(() => {
    if (!profile) return;
    const [firstName, ...rest] = profile.name.split(' ');
    setProfileDraft({ firstName, lastName: rest.join(' '), phone: profile.phone, position: profile.position });
  }, [profile]);

  const saveProfile = async () => {
    if (!profile) return;
    setSavingProfile(true);
    await updateStaff(profile.id, {
      name: `${profileDraft.firstName} ${profileDraft.lastName}`.trim(),
      phone: profileDraft.phone, position: profileDraft.position,
    });
    setSavingProfile(false);
    showToast('success', 'Profile updated.');
  };

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    await uploadAvatar(file);
    setUploadingAvatar(false);
    showToast('success', 'Profile picture updated.');
  };

  // ─── Security: password ─────────────────────────────────────────────────
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  const submitPasswordChange = async () => {
    setPwError('');
    if (!pwCurrent) { setPwError('Enter your current password.'); return; }
    if (pwNew.length < 6) { setPwError('New password must be at least 6 characters.'); return; }
    if (pwNew !== pwConfirm) { setPwError('New passwords do not match.'); return; }
    setPwSaving(true);
    const result = await changePassword(pwCurrent, pwNew);
    setPwSaving(false);
    if (!result.ok) { setPwError(result.error || 'Could not change password.'); return; }
    setPwCurrent(''); setPwNew(''); setPwConfirm('');
    showToast('success', 'Password changed.');
  };

  // ─── Security: 2FA ──────────────────────────────────────────────────────
  const activeFactor = mfaFactors.find(f => f.status === 'verified');
  const [mfaSetup, setMfaSetup] = useState<{ factorId: string; qrCode: string; secret: string } | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [mfaBusy, setMfaBusy] = useState(false);

  const startMfaEnroll = async () => {
    setMfaError('');
    setMfaBusy(true);
    const res = await mfaEnroll();
    setMfaBusy(false);
    if (res) setMfaSetup(res);
  };
  const confirmMfa = async () => {
    if (!mfaSetup) return;
    setMfaError('');
    setMfaBusy(true);
    const ok = await mfaVerify(mfaSetup.factorId, mfaCode);
    setMfaBusy(false);
    if (ok) {
      setMfaSetup(null); setMfaCode('');
      showToast('success', 'Two-factor authentication enabled.');
    } else {
      setMfaError('That code was rejected — check your authenticator app and try again.');
    }
  };
  const disableMfa = async () => {
    if (!activeFactor) return;
    setMfaBusy(true);
    await mfaUnenroll(activeFactor.id);
    setMfaBusy(false);
    showToast('info', 'Two-factor authentication disabled.');
  };

  // ─── Notifications (saved instantly per toggle) ─────────────────────────
  const toggleNotifPref = (key: typeof NOTIF_PREFS[number]['key']) => {
    if (!profile) return;
    updateStaff(profile.id, { notificationPrefs: { ...profile.notificationPrefs, [key]: !profile.notificationPrefs[key] } });
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" sub="Manage your business preferences and account" breadcrumb={['Home', 'Settings']} />

      {toast && (
        <Alert type={toast.type} message={toast.msg} onClose={() => setToast(null)} />
      )}

      <Tabs tabs={['Company', 'Profile', 'Security', 'Notifications', 'Preferences']} active={tab} onChange={setTab} />

      {tab === 'Company' && (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {!canEditCompany && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-500">
                <Lock size={12} className="flex-shrink-0" /> Only Managers and the Owner can edit company settings — you're viewing this read-only.
              </div>
            )}
            <Card className="p-6">
              <h3 className="font-bold text-slate-800 font-display mb-4">Company Information</h3>
              <div className="space-y-4">
                <Input label="Company Name" value={companyDraft.name} disabled={!canEditCompany}
                  onChange={v => setCompanyDraft(c => ({ ...c, name: v }))} />
                <Textarea label="Address" value={companyDraft.address} disabled={!canEditCompany}
                  onChange={v => setCompanyDraft(c => ({ ...c, address: v }))} rows={2} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Phone" value={companyDraft.phone} disabled={!canEditCompany}
                    onChange={v => setCompanyDraft(c => ({ ...c, phone: v }))} />
                  <Input label="Email" type="email" value={companyDraft.email} disabled={!canEditCompany}
                    onChange={v => setCompanyDraft(c => ({ ...c, email: v }))} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select label="Currency" value={companyDraft.currency} disabled={!canEditCompany}
                    onChange={v => setCompanyDraft(c => ({ ...c, currency: v }))} options={[
                      { label: 'GHS — Ghana Cedi (GH₵)', value: 'GHS' },
                      { label: 'USD — US Dollar ($)', value: 'USD' },
                      { label: 'EUR — Euro (€)', value: 'EUR' },
                    ]} />
                  <Select label="Time Zone" value={companyDraft.timezone} disabled={!canEditCompany}
                    onChange={v => setCompanyDraft(c => ({ ...c, timezone: v }))} options={[
                      { label: 'GMT+0 — Accra, Ghana', value: 'Africa/Accra' },
                      { label: 'GMT+1 — Lagos, Nigeria', value: 'Africa/Lagos' },
                    ]} />
                </div>
                {canEditCompany && (
                  <Btn variant="primary" size="sm" onClick={saveCompany} disabled={savingCompany}>
                    {savingCompany ? 'Saving...' : 'Save Company Info'}
                  </Btn>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-slate-800 font-display mb-4">Business Hours</h3>
              <div className="space-y-3">
                {BUSINESS_DAYS.map(day => (
                  <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <span className="text-sm text-slate-600 sm:w-24 flex-shrink-0">{day}</span>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <input type="time" value={companyDraft.businessHours[day]?.[0] || '08:00'} disabled={!canEditCompany}
                        onChange={e => setHour(day, 0, e.target.value)}
                        className="input-base py-1 text-sm flex-1 min-w-0 disabled:bg-slate-50 disabled:text-slate-400" />
                      <span className="text-slate-400 text-sm flex-shrink-0">to</span>
                      <input type="time" value={companyDraft.businessHours[day]?.[1] || '17:00'} disabled={!canEditCompany}
                        onChange={e => setHour(day, 1, e.target.value)}
                        className="input-base py-1 text-sm flex-1 min-w-0 disabled:bg-slate-50 disabled:text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
              {canEditCompany && (
                <Btn variant="primary" size="sm" onClick={saveCompany} disabled={savingCompany} className="mt-4">
                  {savingCompany ? 'Saving...' : 'Save Business Hours'}
                </Btn>
              )}
            </Card>
          </div>

          <div className="space-y-5">
            {canEditCompany && (
              <Card className="p-5">
                <h3 className="font-bold text-slate-800 font-display mb-1">Staff Sign-Up Code</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Required to create a new account, so only people you share this with can sign up. Change it any time — existing accounts are unaffected.
                </p>
                <div className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Input value={companyDraft.signupCode} onChange={v => setCompanyDraft(c => ({ ...c, signupCode: v }))} placeholder="e.g. EDMILSON2025" />
                  </div>
                  <button onClick={() => navigator.clipboard?.writeText(companyDraft.signupCode)} title="Copy"
                    className="px-2.5 py-2 text-slate-400 hover:text-indigo-600 border border-slate-200 rounded-lg transition-colors">
                    <Copy size={14} />
                  </button>
                </div>
                <Btn variant="primary" size="sm" onClick={saveSignupCode} disabled={savingCode} className="mt-3">
                  {savingCode ? 'Saving...' : 'Save Code'}
                </Btn>
              </Card>
            )}

            <Card className="p-5">
              <h3 className="font-bold text-slate-800 font-display mb-4">Company Logo</h3>
              <div className="w-full aspect-square bg-indigo-600 rounded-2xl flex items-center justify-center mb-3 max-w-[120px] mx-auto overflow-hidden">
                {companySettings?.logoUrl ? (
                  <img src={companySettings.logoUrl} alt="Company logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-3xl font-bold font-display">{(companySettings?.name || 'P').charAt(0)}</span>
                )}
              </div>
              {canEditCompany ? (
                <>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploadingLogo}
                    className="w-full py-2 text-sm text-indigo-600 font-semibold border border-dashed border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50">
                    {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                  </button>
                </>
              ) : (
                <p className="text-xs text-slate-400 text-center">Only Managers and the Owner can change the logo.</p>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="font-bold text-slate-800 font-display mb-3">Quick Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Plan</span>
                  <span className="font-semibold text-indigo-600">Business</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Staff Seats</span>
                  <span className="font-semibold text-slate-800">8 / 15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Storage</span>
                  <span className="font-semibold text-slate-800">12 GB / 50 GB</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'Profile' && (
        <Card className="p-6 max-w-xl">
          <h3 className="font-bold text-slate-800 font-display mb-4">Profile Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar initials={profile?.avatar || '?'} src={profile?.avatarUrl} size="lg" />
              <div>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
                <Btn variant="outline" size="sm" onClick={() => avatarInputRef.current?.click()} disabled={uploadingAvatar}>
                  {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                </Btn>
                <p className="text-xs text-slate-400 mt-1">JPG or PNG, shown across the app.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="First Name" value={profileDraft.firstName} onChange={v => setProfileDraft(p => ({ ...p, firstName: v }))} />
              <Input label="Last Name" value={profileDraft.lastName} onChange={v => setProfileDraft(p => ({ ...p, lastName: v }))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Username" value={profile?.username ? `@${profile.username}` : ''} disabled />
              <Input label="Recovery Email" type="email" value={profile?.email || ''} disabled />
            </div>
            <Input label="Phone" value={profileDraft.phone} onChange={v => setProfileDraft(p => ({ ...p, phone: v }))} />
            <Input label="Position" value={profileDraft.position} onChange={v => setProfileDraft(p => ({ ...p, position: v }))} />
            <Btn variant="primary" size="sm" onClick={saveProfile} disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </Btn>
          </div>
        </Card>
      )}

      {tab === 'Security' && (
        <Card className="p-6 max-w-xl">
          <h3 className="font-bold text-slate-800 font-display mb-4">Security Settings</h3>
          <div className="space-y-4">
            {pwError && <Alert type="error" message={pwError} onClose={() => setPwError('')} />}
            <Input label="Current Password" type="password" placeholder="Enter current password" value={pwCurrent} onChange={setPwCurrent} />
            <Input label="New Password" type="password" placeholder="Enter new password" value={pwNew} onChange={setPwNew} />
            <Input label="Confirm New Password" type="password" placeholder="Confirm new password" value={pwConfirm} onChange={setPwConfirm} />
            <Btn variant="primary" size="sm" onClick={submitPasswordChange} disabled={pwSaving}>
              {pwSaving ? 'Changing...' : 'Change Password'}
            </Btn>

            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5"><ShieldCheck size={13} /> Two-Factor Authentication</p>

              {activeFactor ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">Your account is protected with an authenticator app.</p>
                  <Btn variant="outline" size="sm" onClick={disableMfa} disabled={mfaBusy}>Disable 2FA</Btn>
                </div>
              ) : mfaSetup ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">Scan this in your authenticator app (Google Authenticator, Authy, etc.):</p>
                  <div className="bg-white rounded-lg p-3 border border-slate-200 flex justify-center">
                    <img src={mfaSetup.qrCode} alt="2FA QR code" className="w-40 h-40" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Can't scan? Enter manually:</span>
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">{mfaSetup.secret}</code>
                    <button onClick={() => navigator.clipboard?.writeText(mfaSetup.secret)} className="text-indigo-600 hover:text-indigo-700">
                      <Copy size={12} />
                    </button>
                  </div>
                  {mfaError && <p className="text-xs text-red-600">{mfaError}</p>}
                  <div className="flex gap-2">
                    <input value={mfaCode} onChange={e => setMfaCode(e.target.value)} maxLength={6}
                      placeholder="6-digit code" className="input-base py-1.5 text-sm flex-1" />
                    <Btn variant="primary" size="sm" onClick={confirmMfa} disabled={mfaBusy || mfaCode.length < 6}>Verify</Btn>
                    <Btn variant="secondary" size="sm" onClick={() => { setMfaSetup(null); setMfaCode(''); setMfaError(''); }}>Cancel</Btn>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">Enable 2FA via authenticator app</p>
                  <Btn variant="primary" size="sm" onClick={startMfaEnroll} disabled={mfaBusy}>
                    {mfaBusy ? 'Starting...' : 'Enable 2FA'}
                  </Btn>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {tab === 'Notifications' && (
        <Card className="p-6 max-w-xl">
          <h3 className="font-bold text-slate-800 font-display mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            {NOTIF_PREFS.map(item => {
              const val = profile?.notificationPrefs?.[item.key] ?? false;
              return (
                <div key={item.key} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  <button onClick={() => toggleNotifPref(item.key)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${val ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${val ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {tab === 'Preferences' && (
        <Card className="p-6 max-w-xl">
          <h3 className="font-bold text-slate-800 font-display mb-4">System Preferences</h3>
          {!canEditCompany && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-500 mb-4">
              <Lock size={12} className="flex-shrink-0" /> Only Managers and the Owner can edit these — you're viewing this read-only.
            </div>
          )}
          <div className="space-y-4">
            <Select label="Default Date Format" value={companyDraft.dateFormat} disabled={!canEditCompany}
              onChange={v => setCompanyDraft(c => ({ ...c, dateFormat: v }))} options={[
                { label: 'DD/MM/YYYY (e.g. 18/09/2025)', value: 'dmy' },
                { label: 'MM/DD/YYYY (e.g. 09/18/2025)', value: 'mdy' },
                { label: 'YYYY-MM-DD (e.g. 2025-09-18)', value: 'ymd' },
              ]} />
            <Select label="Attendance Late Threshold" value={companyDraft.lateThresholdMinutes} disabled={!canEditCompany}
              onChange={v => setCompanyDraft(c => ({ ...c, lateThresholdMinutes: v }))} options={[
                { label: '5 minutes after start time', value: '5' },
                { label: '10 minutes after start time', value: '10' },
                { label: '15 minutes after start time', value: '15' },
                { label: '30 minutes after start time', value: '30' },
              ]} />
            <Select label="Low Stock Warning" value={companyDraft.lowStockWarning} disabled={!canEditCompany}
              onChange={v => setCompanyDraft(c => ({ ...c, lowStockWarning: v }))} options={[
                { label: 'At minimum stock level', value: 'min' },
                { label: '10% above minimum', value: '10' },
                { label: '25% above minimum', value: '25' },
              ]} />
            {canEditCompany && (
              <Btn variant="primary" size="sm" onClick={savePreferences} disabled={savingCompany}>
                {savingCompany ? 'Saving...' : 'Save Preferences'}
              </Btn>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
