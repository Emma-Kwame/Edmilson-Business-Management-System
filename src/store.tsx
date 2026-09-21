import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from './lib/supabase';
import type { Role } from './data/mock';

export interface NotificationPrefs {
  tasks: boolean; projects: boolean; stock: boolean; payments: boolean; attendance: boolean; system: boolean;
}
export interface UserT {
  id: string; name: string; username: string; email: string; role: Role;
  position: string; dept: string; avatar: string; avatarUrl: string | null;
  joined: string; phone: string; status: string;
  notificationPrefs: NotificationPrefs;
}
export interface CompanySettingsT {
  name: string; address: string; phone: string; email: string; currency: string; timezone: string;
  dateFormat: string; lateThresholdMinutes: number; lowStockWarning: string; logoUrl: string | null;
  businessHours: Record<string, [string, string]>; signupCode: string;
}
export interface MfaFactor { id: string; friendlyName?: string; status: string; }
export interface AttendanceT {
  id: number; staffId: string | null; staff: string; date: string;
  clockIn: string | null; clockOut: string | null; hours: string; status: string;
}
export interface TaskT {
  id: number; name: string; project: string; assigned: string;
  priority: string; deadline: string; status: string; description: string;
}
export interface ProjectT {
  id: string; name: string; client: string; budget: number; paid: number; balance: number;
  status: string; priority: string; start: string; deadline: string; staff: string[];
  description: string; category: string;
}
export interface InventoryT {
  id: number; name: string; category: string; qty: number; unit: string; minStock: number;
  status: string; lastUpdated: string; updatedBy: string; cost: number;
}
export interface TransactionT {
  id: string; type: 'income' | 'expense'; client: string; project: string | null; amount: number;
  method: string; status: string; date: string; recordedBy: string; note: string;
}
export interface NotificationT {
  id: number; title: string; message: string; type: string; read: boolean; time: string; icon: string;
}
export interface AuditLogT { id: number; user: string; action: string; module: string; date: string; time: string; ip: string; }
export type CommentT = { id: number; author: string; text: string; time: string };
export interface LineItem { label: string; amount: number; }
export interface DailyClosingT {
  id: number; date: string; time: string; totalAmount: number;
  expenses: LineItem[]; creditors: LineItem[]; hasContract: boolean; contractNote: string; recordedBy: string;
}

// Real "today," now that this runs against a real database instead of a
// frozen demo dataset.
export const TODAY = new Date().toISOString().slice(0, 10);

const timeNow = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const titleCase = (s: string) => s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

/** Real revenue/expenses/profit per calendar month, computed from actual transactions — no illustrative numbers. */
export function monthlySummary(transactions: TransactionT[], monthsBack = 6) {
  const now = new Date();
  const months = Array.from({ length: monthsBack }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1 - i), 1);
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, month: d.toLocaleDateString(undefined, { month: 'short' }), revenue: 0, expenses: 0, profit: 0 };
  });
  const byKey = Object.fromEntries(months.map(m => [m.key, m]));
  for (const t of transactions) {
    const bucket = byKey[t.date.slice(0, 7)];
    if (!bucket) continue;
    if (t.type === 'income') bucket.revenue += t.amount;
    else bucket.expenses += t.amount;
  }
  months.forEach(m => { m.profit = m.revenue - m.expenses; });
  return months;
}

/** % change of the most recent month vs. the one before it — null when there's nothing to compare yet. */
export function momChange(months: { revenue: number; expenses: number }[], key: 'revenue' | 'expenses') {
  if (months.length < 2) return null;
  const prev = months[months.length - 2][key];
  const curr = months[months.length - 1][key];
  if (prev === 0) return null;
  return ((curr - prev) / prev) * 100;
}

/** Real present/late/absent counts per weekday of the current week, from actual attendance records. */
export function weeklyAttendance(attendance: AttendanceT[]) {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const entries = attendance.filter(a => a.date === dateStr);
    return {
      day,
      present: entries.filter(a => a.status === 'present').length,
      late: entries.filter(a => a.status === 'late').length,
      absent: entries.filter(a => a.status === 'absent').length,
    };
  });
}

// ─── snake_case (Postgres) ⇄ camelCase (app) mappers ───────────────────────
const mapProfile = (r: any): UserT => ({
  id: r.id, name: r.name, username: r.username, email: r.email, role: r.role, position: r.position,
  dept: r.dept, avatar: r.avatar, avatarUrl: r.avatar_url || null, joined: r.joined, phone: r.phone, status: r.status,
  notificationPrefs: r.notification_prefs || { tasks: true, projects: true, stock: true, payments: false, attendance: false, system: true },
});
const mapCompanySettings = (r: any): CompanySettingsT => ({
  name: r.name, address: r.address, phone: r.phone, email: r.email, currency: r.currency,
  timezone: r.timezone, dateFormat: r.date_format, lateThresholdMinutes: r.late_threshold_minutes,
  lowStockWarning: r.low_stock_warning, logoUrl: r.logo_url, businessHours: r.business_hours || {},
  signupCode: r.signup_code || '',
});
const mapProject = (r: any): ProjectT => ({
  id: r.id, name: r.name, client: r.client, budget: Number(r.budget), paid: Number(r.paid),
  balance: Number(r.balance), status: r.status, priority: r.priority, start: r.start,
  deadline: r.deadline, staff: r.staff || [], description: r.description, category: r.category,
});
const mapTask = (r: any): TaskT => ({
  id: r.id, name: r.name, project: r.project, assigned: r.assigned,
  priority: r.priority, deadline: r.deadline, status: r.status, description: r.description,
});
const mapInventory = (r: any): InventoryT => ({
  id: r.id, name: r.name, category: r.category, qty: Number(r.qty), unit: r.unit,
  minStock: Number(r.min_stock), status: r.status, lastUpdated: r.last_updated,
  updatedBy: r.updated_by, cost: Number(r.cost),
});
const mapTransaction = (r: any): TransactionT => ({
  id: r.id, type: r.type, client: r.client, project: r.project, amount: Number(r.amount),
  method: r.method, status: r.status, date: r.date, recordedBy: r.recorded_by, note: r.note,
});
const mapAttendance = (r: any): AttendanceT => ({
  id: r.id, staffId: r.staff_id, staff: r.staff, date: r.date,
  clockIn: r.clock_in, clockOut: r.clock_out, hours: r.hours, status: r.status,
});
const mapNotification = (r: any): NotificationT => ({
  id: r.id, title: r.title, message: r.message, type: r.type, read: r.read, time: r.time, icon: r.icon,
});
const mapAudit = (r: any): AuditLogT => ({
  id: r.id, user: r.user_name, action: r.action, module: r.module, date: r.date, time: r.time, ip: r.ip,
});
const mapClosing = (r: any): DailyClosingT => ({
  id: r.id, date: r.date, time: r.time, totalAmount: Number(r.total_amount),
  expenses: r.expenses || [], creditors: r.creditors || [],
  hasContract: r.has_contract, contractNote: r.contract_note, recordedBy: r.recorded_by,
});

interface DataContextValue {
  // Auth
  configured: boolean;
  session: Session | null;
  profile: UserT | null;
  role: Role;
  currentUserName: string;
  loading: boolean;
  authLoading: boolean;
  authError: string | null;
  lastError: string | null;
  clearLastError: () => void;
  signIn: (username: string, password: string) => Promise<boolean>;
  signUp: (name: string, username: string, email: string, password: string, role: Role, signupCode: string) => Promise<{ ok: boolean; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ ok: boolean; error: string | null }>;

  mfaFactors: MfaFactor[];
  mfaEnroll: () => Promise<{ factorId: string; qrCode: string; secret: string } | null>;
  mfaVerify: (factorId: string, code: string) => Promise<boolean>;
  mfaUnenroll: (factorId: string) => Promise<void>;

  companySettings: CompanySettingsT | null;
  updateCompanySettings: (patch: Partial<CompanySettingsT>) => Promise<void>;
  uploadLogo: (file: File) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;

  users: UserT[];
  attendance: AttendanceT[];
  tasks: TaskT[];
  projects: ProjectT[];
  inventory: InventoryT[];
  transactions: TransactionT[];
  notifications: NotificationT[];
  auditLogs: AuditLogT[];
  dailyClosings: DailyClosingT[];
  taskComments: Record<number, CommentT[]>;
  unreadCount: number;

  addTask: (t: Omit<TaskT, 'id'>) => Promise<TaskT | undefined>;
  updateTask: (id: number, patch: Partial<TaskT>) => Promise<void>;

  addProject: (p: Omit<ProjectT, 'id' | 'paid' | 'balance'> & { budget: number }) => Promise<ProjectT | undefined>;
  updateProject: (id: string, patch: Partial<ProjectT>) => Promise<void>;

  addInventoryItem: (i: Omit<InventoryT, 'id' | 'status' | 'lastUpdated' | 'updatedBy'>) => Promise<InventoryT | undefined>;
  adjustStock: (id: number, delta: number, note?: string) => Promise<void>;

  addTransaction: (t: Omit<TransactionT, 'id'>) => Promise<TransactionT | undefined>;

  addDailyClosing: (input: {
    date: string; time: string; totalAmount: number;
    expenses: LineItem[]; creditors: LineItem[]; hasContract: boolean; contractNote: string;
  }) => Promise<DailyClosingT | undefined>;

  addStaff: (u: Omit<UserT, 'id' | 'username' | 'notificationPrefs' | 'avatarUrl'>) => Promise<UserT | undefined>;
  updateStaff: (id: string, patch: Partial<UserT>) => Promise<void>;
  toggleStaffStatus: (id: string) => Promise<void>;

  clockIn: () => Promise<void>;
  clockOut: () => Promise<void>;
  myClockInAt: Date | null;

  markNotificationRead: (id: number) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  addComment: (taskId: number, text: string) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserT | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const [users, setUsers] = useState<UserT[]>([]);
  const [attendance, setAttendance] = useState<AttendanceT[]>([]);
  const [tasks, setTasks] = useState<TaskT[]>([]);
  const [projects, setProjects] = useState<ProjectT[]>([]);
  const [inventory, setInventory] = useState<InventoryT[]>([]);
  const [transactions, setTransactions] = useState<TransactionT[]>([]);
  const [notifications, setNotifications] = useState<NotificationT[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogT[]>([]);
  const [dailyClosings, setDailyClosings] = useState<DailyClosingT[]>([]);
  const [taskComments, setTaskComments] = useState<Record<number, CommentT[]>>({});
  const [myClockInAt, setMyClockInAt] = useState<Date | null>(null);
  const [companySettings, setCompanySettings] = useState<CompanySettingsT | null>(null);
  const [mfaFactors, setMfaFactors] = useState<MfaFactor[]>([]);

  const role: Role = profile?.role || 'staff';
  const currentUserName = profile?.name || '';
  const unreadCount = notifications.filter(n => !n.read).length;

  const clearLastError = () => setLastError(null);
  const handleError = (err: any, fallback: string) => {
    const raw = err?.message || '';
    setLastError(
      raw.toLowerCase().includes('row-level security') || raw.toLowerCase().includes('policy')
        ? "You don't have permission to do that."
        : (raw || fallback)
    );
  };

  // ─── Auth session lifecycle ───────────────────────────────────────────
  useEffect(() => {
    if (!supabaseConfigured) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabaseConfigured) return;
    if (!session) { setProfile(null); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (cancelled) return;
      if (error || !data) {
        setAuthError('Signed in, but no staff profile was found for this account. Ask an Owner to check Supabase → profiles.');
        setLoading(false);
        return;
      }
      if (data.status === 'inactive') {
        await supabase.auth.signOut();
        if (cancelled) return;
        setAuthError('This account has been disabled. Contact your manager or the business owner.');
        setLoading(false);
        return;
      }
      setProfile(mapProfile(data));
      await fetchAll();
      await refreshMfaFactors();
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id]);

  const fetchAll = async () => {
    const [usersRes, attRes, taskRes, prjRes, invRes, txRes, notifRes, auditRes, closeRes, commentRes, companyRes] = await Promise.all([
      supabase.from('profiles').select('*').order('name'),
      supabase.from('attendance').select('*').order('id', { ascending: false }),
      supabase.from('tasks').select('*').order('id', { ascending: false }),
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('inventory').select('*').order('id'),
      supabase.from('transactions').select('*').order('created_at', { ascending: false }),
      supabase.from('notifications').select('*').order('created_at', { ascending: false }),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('daily_closings').select('*').order('created_at', { ascending: false }),
      supabase.from('task_comments').select('*').order('created_at'),
      supabase.from('company_settings').select('*').eq('id', 1).single(),
    ]);
    if (usersRes.data) setUsers(usersRes.data.map(mapProfile));
    if (attRes.data) setAttendance(attRes.data.map(mapAttendance));
    if (taskRes.data) setTasks(taskRes.data.map(mapTask));
    if (prjRes.data) setProjects(prjRes.data.map(mapProject));
    if (invRes.data) setInventory(invRes.data.map(mapInventory));
    if (txRes.data) setTransactions(txRes.data.map(mapTransaction));
    if (notifRes.data) setNotifications(notifRes.data.map(mapNotification));
    if (auditRes.data) setAuditLogs(auditRes.data.map(mapAudit));
    if (closeRes.data) setDailyClosings(closeRes.data.map(mapClosing));
    if (companyRes.data) setCompanySettings(mapCompanySettings(companyRes.data));
    if (commentRes.data) {
      const grouped: Record<number, CommentT[]> = {};
      for (const c of commentRes.data) {
        (grouped[c.task_id] ||= []).push({ id: c.id, author: c.author, text: c.text, time: c.time });
      }
      setTaskComments(grouped);
    }
  };

  const refreshMfaFactors = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    if (data) setMfaFactors((data.totp || []).map(f => ({ id: f.id, friendlyName: f.friendly_name, status: f.status })));
  };

  // Sign-in only ever asks for a username — Supabase Auth itself still
  // needs an email, so resolve it via a SECURITY DEFINER lookup (safe to
  // call while signed out) before handing it to signInWithPassword.
  const signIn = async (username: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    const { data: email, error: lookupError } = await supabase.rpc('email_for_username', { uname: username.trim() });
    if (lookupError || !email) {
      setAuthLoading(false);
      setAuthError('No account found with that username.');
      return false;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setAuthLoading(false);
    if (error) { setAuthError(error.message); return false; }
    return true;
  };

  // The role picked on the Sign Up screen is passed through as metadata and
  // written to the new profile by the handle_new_user trigger in
  // supabase/schema.sql. The email collected here is kept only for account
  // recovery — it's never shown or used as a login field anywhere else.
  const signUp = async (name: string, username: string, email: string, password: string, role: Role, signupCode: string) => {
    setAuthLoading(true);
    setAuthError(null);
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { name, username: username.trim().toLowerCase(), role, signup_code: signupCode.trim() } },
    });
    setAuthLoading(false);
    if (error) {
      const raw = error.message || '';
      const low = raw.toLowerCase();
      setAuthError(
        low.includes('duplicate') || low.includes('profiles_username_key')
          ? 'That username is already taken — please choose another.'
          : low.includes('database error saving new user') || low.includes('sign-up code') || low.includes('signup code')
          ? 'Invalid sign-up code — check with your Owner or Manager for the correct code.'
          : raw
      );
      return { ok: false, needsConfirmation: false };
    }
    return { ok: true, needsConfirmation: !data.session };
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  // Re-authenticates with the current password first — Supabase's updateUser
  // will happily change a password for whoever's already signed in, so this
  // check is what actually makes "Current Password" mean something.
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!profile) return { ok: false, error: 'Not signed in.' };
    const { error: reauthError } = await supabase.auth.signInWithPassword({ email: profile.email, password: currentPassword });
    if (reauthError) return { ok: false, error: 'Current password is incorrect.' };
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { ok: false, error: error.message };
    await addAuditLog('Changed account password', 'Security');
    return { ok: true, error: null };
  };

  // Real TOTP two-factor auth via Supabase's built-in MFA — scan the QR code
  // with an authenticator app (Google Authenticator, Authy, etc.), then
  // confirm with the 6-digit code it generates.
  const mfaEnroll = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (error || !data) { handleError(error, 'Could not start 2FA setup.'); return null; }
    return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
  };
  const mfaVerify = async (factorId: string, code: string) => {
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError || !challenge) { handleError(challengeError, 'Could not verify that code.'); return false; }
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
    if (error) { handleError(error, 'That code is invalid or expired.'); return false; }
    await refreshMfaFactors();
    await addAuditLog('Enabled two-factor authentication', 'Security');
    return true;
  };
  const mfaUnenroll = async (factorId: string) => {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) return handleError(error, 'Could not disable 2FA.');
    await refreshMfaFactors();
    await addAuditLog('Disabled two-factor authentication', 'Security');
  };

  // ─── Company settings & logo ──────────────────────────────────────────
  const updateCompanySettings: DataContextValue['updateCompanySettings'] = async (patch) => {
    const dbPatch: any = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.address !== undefined) dbPatch.address = patch.address;
    if (patch.phone !== undefined) dbPatch.phone = patch.phone;
    if (patch.email !== undefined) dbPatch.email = patch.email;
    if (patch.currency !== undefined) dbPatch.currency = patch.currency;
    if (patch.timezone !== undefined) dbPatch.timezone = patch.timezone;
    if (patch.dateFormat !== undefined) dbPatch.date_format = patch.dateFormat;
    if (patch.lateThresholdMinutes !== undefined) dbPatch.late_threshold_minutes = patch.lateThresholdMinutes;
    if (patch.lowStockWarning !== undefined) dbPatch.low_stock_warning = patch.lowStockWarning;
    if (patch.logoUrl !== undefined) dbPatch.logo_url = patch.logoUrl;
    if (patch.businessHours !== undefined) dbPatch.business_hours = patch.businessHours;
    if (patch.signupCode !== undefined) dbPatch.signup_code = patch.signupCode;
    dbPatch.updated_at = new Date().toISOString();

    const { data, error } = await supabase.from('company_settings').update(dbPatch).eq('id', 1).select().single();
    if (error || !data) return handleError(error, 'Could not save company settings.');
    setCompanySettings(mapCompanySettings(data));
    await addAuditLog('Updated company settings', 'Settings');
  };

  const uploadLogo = async (file: File) => {
    const ext = file.name.split('.').pop() || 'png';
    const path = `logo-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('company-assets').upload(path, file, { upsert: true });
    if (uploadError) return handleError(uploadError, 'Could not upload the logo.');
    const { data: urlData } = supabase.storage.from('company-assets').getPublicUrl(path);
    await updateCompanySettings({ logoUrl: urlData.publicUrl });
  };

  // Stored at "<my user id>/avatar-<timestamp>.ext" — the storage policies
  // only let each person write inside their own folder.
  const uploadAvatar = async (file: File) => {
    if (!profile) return;
    const ext = file.name.split('.').pop() || 'png';
    const path = `${profile.id}/avatar-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (uploadError) return handleError(uploadError, 'Could not upload your photo.');
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    await updateStaff(profile.id, { avatarUrl: urlData.publicUrl });
  };

  const addAuditLog = async (action: string, module: string) => {
    const { error } = await supabase.from('audit_logs').insert({
      user_name: currentUserName || 'System', action, module, date: TODAY, time: timeNow(), ip: '—',
    });
    if (error) return; // non-fatal — the main action already succeeded
    if (role !== 'staff') {
      const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200);
      if (data) setAuditLogs(data.map(mapAudit));
    }
  };

  // ─── Tasks ─────────────────────────────────────────────────────────────
  const addTask: DataContextValue['addTask'] = async (t) => {
    const { data, error } = await supabase.from('tasks').insert({
      name: t.name, project: t.project, assigned: t.assigned,
      priority: t.priority, deadline: t.deadline, status: t.status, description: t.description,
    }).select().single();
    if (error || !data) return handleError(error, 'Could not create task.'), undefined;
    const created = mapTask(data);
    setTasks(prev => [created, ...prev]);
    await addAuditLog(`Created task "${created.name}" assigned to ${created.assigned}`, 'Tasks');
    return created;
  };
  const updateTask: DataContextValue['updateTask'] = async (id, patch) => {
    const before = tasks.find(t => t.id === id);
    const { data, error } = await supabase.from('tasks').update(patch).eq('id', id).select().single();
    if (error || !data) return handleError(error, 'Could not update task.');
    const updated = mapTask(data);
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
    if (patch.status) await addAuditLog(`Updated task status: "${updated.name}" → ${patch.status}`, 'Tasks');
    else if (before) await addAuditLog(`Edited task "${updated.name}"`, 'Tasks');
  };

  // ─── Projects ──────────────────────────────────────────────────────────
  const addProject: DataContextValue['addProject'] = async (p) => {
    const nextId = `PRJ-${1024 + projects.length}`;
    const { data, error } = await supabase.from('projects').insert({
      id: nextId, name: p.name, client: p.client, budget: p.budget, paid: 0, balance: p.budget,
      status: p.status, priority: p.priority, start: p.start || null, deadline: p.deadline || null,
      staff: p.staff, description: p.description, category: p.category,
    }).select().single();
    if (error || !data) return handleError(error, 'Could not create project.'), undefined;
    const created = mapProject(data);
    setProjects(prev => [created, ...prev]);
    await addAuditLog(`Created project ${created.id}: ${created.name}`, 'Projects');
    return created;
  };
  const updateProject: DataContextValue['updateProject'] = async (id, patch) => {
    const dbPatch: any = { ...patch };
    const { data, error } = await supabase.from('projects').update(dbPatch).eq('id', id).select().single();
    if (error || !data) return handleError(error, 'Could not update project.');
    setProjects(prev => prev.map(p => p.id === id ? mapProject(data) : p));
    await addAuditLog(`Updated project ${id}`, 'Projects');
  };

  // ─── Inventory ─────────────────────────────────────────────────────────
  const inventoryStatus = (qty: number, minStock: number) =>
    qty <= 0 ? 'out-of-stock' : qty <= minStock ? 'low-stock' : 'in-stock';

  const addInventoryItem: DataContextValue['addInventoryItem'] = async (i) => {
    const { data, error } = await supabase.from('inventory').insert({
      name: i.name, category: i.category, qty: i.qty, unit: i.unit, min_stock: i.minStock,
      status: inventoryStatus(i.qty, i.minStock), last_updated: TODAY, updated_by: currentUserName, cost: i.cost,
    }).select().single();
    if (error || !data) return handleError(error, 'Could not add inventory item.'), undefined;
    const created = mapInventory(data);
    setInventory(prev => [created, ...prev]);
    await addAuditLog(`Added new inventory item "${created.name}" (${created.qty} ${created.unit})`, 'Inventory');
    return created;
  };
  const adjustStock: DataContextValue['adjustStock'] = async (id, delta, note) => {
    const item = inventory.find(x => x.id === id);
    if (!item) return;
    const qty = Math.max(0, item.qty + delta);
    const { data, error } = await supabase.from('inventory').update({
      qty, status: inventoryStatus(qty, item.minStock), last_updated: TODAY, updated_by: currentUserName,
    }).eq('id', id).select().single();
    if (error || !data) return handleError(error, 'Could not update stock.');
    setInventory(prev => prev.map(x => x.id === id ? mapInventory(data) : x));
    await addAuditLog(`Updated ${item.name} stock: ${item.qty} → ${qty}${note ? ` (${note})` : ''}`, 'Inventory');
  };

  // ─── Finance ───────────────────────────────────────────────────────────
  const addTransaction: DataContextValue['addTransaction'] = async (t) => {
    const nextId = `TXN-${String(transactions.length + 1).padStart(3, '0')}`;
    const { data, error } = await supabase.from('transactions').insert({
      id: nextId, type: t.type, client: t.client, project: t.project, amount: t.amount,
      method: t.method, status: t.status, date: t.date, recorded_by: t.recordedBy, note: t.note,
    }).select().single();
    if (error || !data) return handleError(error, 'Could not record that transaction.'), undefined;
    const created = mapTransaction(data);
    setTransactions(prev => [created, ...prev]);

    if (created.type === 'income' && created.project) {
      const proj = projects.find(p => p.name === created.project || p.id === created.project);
      if (proj) {
        const paid = proj.paid + created.amount;
        const { data: projData } = await supabase.from('projects')
          .update({ paid, balance: Math.max(0, proj.budget - paid) }).eq('id', proj.id).select().single();
        if (projData) setProjects(prev => prev.map(p => p.id === proj.id ? mapProject(projData) : p));
      }
    }
    await addAuditLog(
      `Recorded ${created.type} of GH₵ ${created.amount.toLocaleString()} ${created.type === 'income' ? 'from' : 'to'} ${created.client}`,
      'Finance'
    );
    return created;
  };

  const addDailyClosing: DataContextValue['addDailyClosing'] = async (input) => {
    const expensesTotal = input.expenses.reduce((s, e) => s + e.amount, 0);
    const creditorsTotal = input.creditors.reduce((s, c) => s + c.amount, 0);

    const { data, error } = await supabase.from('daily_closings').insert({
      date: input.date, time: input.time, total_amount: input.totalAmount,
      expenses: input.expenses, creditors: input.creditors,
      has_contract: input.hasContract, contract_note: input.contractNote, recorded_by: currentUserName,
    }).select().single();
    if (error || !data) return handleError(error, 'Could not save the day closing.'), undefined;
    const created = mapClosing(data);
    setDailyClosings(prev => [created, ...prev]);

    if (input.totalAmount > 0) {
      await addTransaction({
        type: 'income', client: 'Daily Sales — Walk-in Services', project: null,
        amount: input.totalAmount, method: 'Cash', status: 'paid', date: input.date,
        recordedBy: currentUserName, note: `Day closing (${input.time})`,
      });
    }
    if (expensesTotal > 0) {
      await addTransaction({
        type: 'expense', client: 'Daily Operating Expenses', project: null,
        amount: expensesTotal, method: 'Cash', status: 'paid', date: input.date,
        recordedBy: currentUserName, note: input.expenses.map(e => `${e.label}: GH₵ ${e.amount.toLocaleString()}`).join('; '),
      });
    }
    await addAuditLog(
      `Closed the day for ${input.date}: GH₵ ${input.totalAmount.toLocaleString()} sales, ` +
      `GH₵ ${expensesTotal.toLocaleString()} expenses, GH₵ ${creditorsTotal.toLocaleString()} owed by creditors` +
      (input.hasContract ? ', including a contract/big project' : ''),
      'Finance'
    );
    return created;
  };

  // ─── Staff ─────────────────────────────────────────────────────────────
  const addStaff: DataContextValue['addStaff'] = async () => {
    // Creating a brand-new login account needs Supabase's admin API, which
    // must run server-side (an Edge Function) — never with a key shipped to
    // the browser. That's Phase 3 work. Until then, new accounts are created
    // directly in Supabase → Authentication → Users, and their profile row
    // is created automatically by the handle_new_user trigger.
    setLastError(
      'Creating new staff logins needs a small server function that isn\'t built yet. ' +
      'For now, add them in Supabase → Authentication → Users — their profile appears here automatically.'
    );
    return undefined;
  };
  const updateStaff: DataContextValue['updateStaff'] = async (id, patch) => {
    const dbPatch: any = { ...patch };
    if ('notificationPrefs' in dbPatch) {
      dbPatch.notification_prefs = dbPatch.notificationPrefs;
      delete dbPatch.notificationPrefs;
    }
    if ('avatarUrl' in dbPatch) {
      dbPatch.avatar_url = dbPatch.avatarUrl;
      delete dbPatch.avatarUrl;
    }
    const { data, error } = await supabase.from('profiles').update(dbPatch).eq('id', id).select().single();
    if (error || !data) return handleError(error, 'Could not update that profile.');
    const updated = mapProfile(data);
    setUsers(prev => prev.map(u => u.id === id ? updated : u));
    if (profile?.id === id) setProfile(updated);
    if (!('notificationPrefs' in patch)) await addAuditLog(`Updated staff profile: ${data.name}`, 'Staff');
  };
  const toggleStaffStatus: DataContextValue['toggleStaffStatus'] = async (id) => {
    const u = users.find(x => x.id === id);
    if (!u) return;
    const nextStatus = u.status === 'active' ? 'inactive' : 'active';
    const { data, error } = await supabase.from('profiles').update({ status: nextStatus }).eq('id', id).select().single();
    if (error || !data) return handleError(error, 'Could not change that account\'s status.');
    setUsers(prev => prev.map(x => x.id === id ? mapProfile(data) : x));
    await addAuditLog(`${nextStatus === 'inactive' ? 'Disabled' : 'Enabled'} staff account: ${u.name}`, 'Staff');
  };

  // ─── Attendance ────────────────────────────────────────────────────────
  const clockIn = async () => {
    if (!profile) return;
    const now = new Date();
    const label = timeNow();
    const existing = attendance.find(a => a.staffId === profile.id && a.date === TODAY);
    if (existing) {
      const { data, error } = await supabase.from('attendance')
        .update({ clock_in: label, status: 'present' }).eq('id', existing.id).select().single();
      if (error || !data) return handleError(error, 'Could not clock in.');
      setAttendance(prev => prev.map(a => a.id === existing.id ? mapAttendance(data) : a));
    } else {
      const { data, error } = await supabase.from('attendance').insert({
        staff_id: profile.id, staff: profile.name, date: TODAY, clock_in: label, status: 'present',
      }).select().single();
      if (error || !data) return handleError(error, 'Could not clock in.');
      setAttendance(prev => [mapAttendance(data), ...prev]);
    }
    setMyClockInAt(now);
    await addAuditLog('Clocked in', 'Attendance');
  };
  const clockOut = async () => {
    if (!profile) return;
    const now = new Date();
    const label = timeNow();
    let hoursLabel = '-';
    if (myClockInAt) {
      const mins = Math.max(0, Math.round((now.getTime() - myClockInAt.getTime()) / 60000));
      hoursLabel = `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, '0')}m`;
    }
    const existing = attendance.find(a => a.staffId === profile.id && a.date === TODAY);
    if (!existing) return;
    const { data, error } = await supabase.from('attendance')
      .update({ clock_out: label, hours: hoursLabel }).eq('id', existing.id).select().single();
    if (error || !data) return handleError(error, 'Could not clock out.');
    setAttendance(prev => prev.map(a => a.id === existing.id ? mapAttendance(data) : a));
    setMyClockInAt(null);
    await addAuditLog('Clocked out', 'Attendance');
  };

  // ─── Notifications ─────────────────────────────────────────────────────
  const markNotificationRead = async (id: number) => {
    const { data, error } = await supabase.from('notifications').update({ read: true }).eq('id', id).select().single();
    if (error || !data) return handleError(error, 'Could not update that notification.');
    setNotifications(prev => prev.map(n => n.id === id ? mapNotification(data) : n));
  };
  const markAllNotificationsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (!unreadIds.length) return;
    const { error } = await supabase.from('notifications').update({ read: true }).in('id', unreadIds);
    if (error) return handleError(error, 'Could not update notifications.');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // ─── Task comments ─────────────────────────────────────────────────────
  const addComment = async (taskId: number, text: string) => {
    const time = timeNow();
    const { data, error } = await supabase.from('task_comments').insert({
      task_id: taskId, author: currentUserName, text, time,
    }).select().single();
    if (error || !data) return handleError(error, 'Could not post that comment.');
    setTaskComments(prev => ({
      ...prev,
      [taskId]: [...(prev[taskId] || []), { id: data.id, author: data.author, text: data.text, time: data.time }],
    }));
  };

  return (
    <DataContext.Provider value={{
      configured: supabaseConfigured, session, profile, role, currentUserName,
      loading, authLoading, authError, lastError, clearLastError, signIn, signUp, signOut, changePassword,
      mfaFactors, mfaEnroll, mfaVerify, mfaUnenroll,
      companySettings, updateCompanySettings, uploadLogo, uploadAvatar,
      users, attendance, tasks, projects, inventory, transactions, notifications, auditLogs, dailyClosings, taskComments, unreadCount,
      addTask, updateTask,
      addProject, updateProject,
      addInventoryItem, adjustStock,
      addTransaction,
      addDailyClosing,
      addStaff, updateStaff, toggleStaffStatus,
      clockIn, clockOut, myClockInAt,
      markNotificationRead, markAllNotificationsRead,
      addComment,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
}
