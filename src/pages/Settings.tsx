import React, { useState } from 'react';
import { Card, PageHeader, Btn, Input, Select, Textarea, Tabs, Alert } from '../components/ui';

export default function Settings() {
  const [tab, setTab] = useState('Company');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" sub="Manage your business preferences and account" breadcrumb={['Home', 'Settings']} />

      {saved && <Alert type="success" message="Settings saved successfully." onClose={() => setSaved(false)} />}

      <Tabs tabs={['Company', 'Profile', 'Security', 'Notifications', 'Preferences']} active={tab} onChange={setTab} />

      {tab === 'Company' && (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <Card className="p-6">
              <h3 className="font-bold text-slate-800 font-display mb-4">Company Information</h3>
              <div className="space-y-4">
                <Input label="Company Name" value="PrintCraft Ghana Ltd" onChange={() => {}} />
                <Textarea label="Address" value="12 Accra Ring Road, Accra, Ghana" onChange={() => {}} rows={2} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Phone" value="+233 30 295 1234" onChange={() => {}} />
                  <Input label="Email" type="email" value="info@printcraft.gh" onChange={() => {}} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Currency" value="GHS" onChange={() => {}} options={[
                    { label: 'GHS — Ghana Cedi (GH₵)', value: 'GHS' },
                    { label: 'USD — US Dollar ($)', value: 'USD' },
                    { label: 'EUR — Euro (€)', value: 'EUR' },
                  ]} />
                  <Select label="Time Zone" value="Africa/Accra" onChange={() => {}} options={[
                    { label: 'GMT+0 — Accra, Ghana', value: 'Africa/Accra' },
                    { label: 'GMT+1 — Lagos, Nigeria', value: 'Africa/Lagos' },
                  ]} />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-slate-800 font-display mb-4">Business Hours</h3>
              <div className="space-y-3">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                  <div key={day} className="flex items-center gap-3">
                    <span className="text-sm text-slate-600 w-24">{day}</span>
                    <div className="flex items-center gap-2 flex-1">
                      <input type="time" defaultValue="08:00" className="input-base py-1 text-sm" />
                      <span className="text-slate-400 text-sm">to</span>
                      <input type="time" defaultValue="17:00" className="input-base py-1 text-sm" />
                    </div>
                  </div>
                ))}
                {['Saturday'].map(day => (
                  <div key={day} className="flex items-center gap-3">
                    <span className="text-sm text-slate-600 w-24">{day}</span>
                    <div className="flex items-center gap-2 flex-1">
                      <input type="time" defaultValue="09:00" className="input-base py-1 text-sm" />
                      <span className="text-slate-400 text-sm">to</span>
                      <input type="time" defaultValue="13:00" className="input-base py-1 text-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="p-5">
              <h3 className="font-bold text-slate-800 font-display mb-4">Company Logo</h3>
              <div className="w-full aspect-square bg-indigo-600 rounded-2xl flex items-center justify-center mb-3 max-w-[120px] mx-auto">
                <span className="text-white text-3xl font-bold font-display">P</span>
              </div>
              <button className="w-full py-2 text-sm text-indigo-600 font-semibold border border-dashed border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors">
                Upload Logo
              </button>
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
            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name" value="Kwame" onChange={() => {}} />
              <Input label="Last Name" value="Asante" onChange={() => {}} />
            </div>
            <Input label="Email Address" type="email" value="kwame@printcraft.gh" onChange={() => {}} />
            <Input label="Phone" value="+233 24 123 4567" onChange={() => {}} />
            <Input label="Position" value="Owner & CEO" onChange={() => {}} />
          </div>
        </Card>
      )}

      {tab === 'Security' && (
        <Card className="p-6 max-w-xl">
          <h3 className="font-bold text-slate-800 font-display mb-4">Security Settings</h3>
          <div className="space-y-4">
            <Input label="Current Password" type="password" placeholder="Enter current password" />
            <Input label="New Password" type="password" placeholder="Enter new password" />
            <Input label="Confirm New Password" type="password" placeholder="Confirm new password" />
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs font-semibold text-slate-600 mb-2">Two-Factor Authentication</p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Enable 2FA via authenticator app</p>
                <button className="px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-lg">Enable 2FA</button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {tab === 'Notifications' && (
        <Card className="p-6 max-w-xl">
          <h3 className="font-bold text-slate-800 font-display mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            {[
              { label: 'Task Reminders', desc: 'Notify when tasks are due or overdue', val: true },
              { label: 'Project Updates', desc: 'Notify on project status changes', val: true },
              { label: 'Low Stock Alerts', desc: 'Notify when inventory falls below minimum', val: true },
              { label: 'Payment Received', desc: 'Notify when a payment is recorded', val: false },
              { label: 'Staff Attendance', desc: 'Notify on late or absent staff', val: false },
              { label: 'System Alerts', desc: 'System maintenance and updates', val: true },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
                <button className={`relative w-10 h-5 rounded-full transition-colors ${item.val ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${item.val ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'Preferences' && (
        <Card className="p-6 max-w-xl">
          <h3 className="font-bold text-slate-800 font-display mb-4">System Preferences</h3>
          <div className="space-y-4">
            <Select label="Default Date Format" options={[
              { label: 'DD/MM/YYYY (e.g. 18/09/2025)', value: 'dmy' },
              { label: 'MM/DD/YYYY (e.g. 09/18/2025)', value: 'mdy' },
              { label: 'YYYY-MM-DD (e.g. 2025-09-18)', value: 'ymd' },
            ]} />
            <Select label="Attendance Late Threshold" options={[
              { label: '5 minutes after start time', value: '5' },
              { label: '10 minutes after start time', value: '10' },
              { label: '15 minutes after start time', value: '15' },
              { label: '30 minutes after start time', value: '30' },
            ]} />
            <Select label="Low Stock Warning" options={[
              { label: 'At minimum stock level', value: 'min' },
              { label: '10% above minimum', value: '10' },
              { label: '25% above minimum', value: '25' },
            ]} />
          </div>
        </Card>
      )}

      <div className="flex gap-2">
        <Btn variant="primary" onClick={handleSave}>Save Settings</Btn>
        <Btn variant="secondary">Reset to Defaults</Btn>
      </div>
    </div>
  );
}
