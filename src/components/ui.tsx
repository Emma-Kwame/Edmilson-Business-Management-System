import React, { useState } from 'react';
import { X } from 'lucide-react';

// ─── Badge ───────────────────────────────────────────────────────────────────
export function Badge({ status, label }: { status: string; label?: string }) {
  const map: Record<string, string> = {
    present: 'badge-present', late: 'badge-late', absent: 'badge-absent',
    'early-departure': 'badge-late', leave: 'badge-leave', 'on-leave': 'badge-leave',
    'in-progress': 'badge-progress', 'not-started': 'badge-draft', completed: 'badge-done',
    'on-hold': 'badge-hold', overdue: 'badge-overdue', draft: 'badge-draft', pending: 'badge-pending',
    cancelled: 'badge-overdue', urgent: 'badge-urgent', high: 'badge-high',
    medium: 'badge-medium', low: 'badge-low',
    paid: 'badge-paid', 'partially-paid': 'badge-partial', partial: 'badge-partial',
    unpaid: 'badge-unpaid',
    'in-stock': 'badge-instock', 'low-stock': 'badge-lowstock', 'out-of-stock': 'badge-outstock',
    active: 'badge-present', inactive: 'badge-absent',
    income: 'badge-paid', expense: 'badge-overdue',
  };
  const displayMap: Record<string, string> = {
    'in-progress': 'In Progress', 'not-started': 'Not Started', 'on-hold': 'On Hold',
    'early-departure': 'Early Departure', 'on-leave': 'On Leave',
    'in-stock': 'In Stock', 'low-stock': 'Low Stock', 'out-of-stock': 'Out of Stock',
    'partially-paid': 'Partial',
  };
  const cls = map[status] || 'badge-draft';
  const text = label || displayMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${cls}`}>
      {text}
    </span>
  );
}

// ─── Button ──────────────────────────────────────────────────────────────────
export function Btn({
  children, onClick, variant = 'primary', size = 'md', icon, className = '', type = 'button'
}: {
  children?: React.ReactNode; onClick?: () => void; variant?: 'primary'|'secondary'|'ghost'|'danger'|'outline';
  size?: 'sm'|'md'|'lg'; icon?: React.ReactNode; className?: string; type?: 'button'|'submit';
}) {
  const base = 'inline-flex items-center gap-2 font-semibold rounded-lg transition-all cursor-pointer border';
  const variants = {
    primary: 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700',
    secondary: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200',
    ghost: 'bg-transparent text-slate-600 border-transparent hover:bg-slate-100',
    danger: 'bg-red-600 text-white border-red-600 hover:bg-red-700',
    outline: 'bg-white text-slate-700 border-slate-300 hover:border-indigo-400 hover:text-indigo-600',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-sm' };
  return (
    <button type={type} onClick={onClick} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return <div className={`bg-white rounded-xl border border-slate-200 ${className}`} onClick={onClick}>{children}</div>;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({
  label, value, sub, icon, accent, trend
}: {
  label: string; value: string | number; sub?: string; icon: React.ReactNode;
  accent?: string; trend?: { dir: 'up'|'down'; val: string };
}) {
  const accents: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    purple: 'bg-purple-50 text-purple-600',
    slate: 'bg-slate-100 text-slate-600',
  };
  const iconCls = accents[accent || 'indigo'];
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-900 font-display">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
          {trend && (
            <p className={`text-xs font-semibold mt-2 ${trend.dir === 'up' ? 'text-green-600' : 'text-red-500'}`}>
              {trend.dir === 'up' ? '↑' : '↓'} {trend.val} vs last month
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconCls} flex-shrink-0 ml-3`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-bold text-slate-800 font-display">{title}</h2>
      {action}
    </div>
  );
}

// ─── Page Header ──────────────────────────────────────────────────────────────
export function PageHeader({ title, sub, actions, breadcrumb }: {
  title: string; sub?: string; actions?: React.ReactNode; breadcrumb?: string[];
}) {
  return (
    <div className="mb-6">
      {breadcrumb && (
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
          {breadcrumb.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span>/</span>}
              <span className={i === breadcrumb.length - 1 ? 'text-slate-600 font-medium' : ''}>{b}</span>
            </React.Fragment>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-display">{title}</h1>
          {sub && <p className="text-sm text-slate-500 mt-0.5">{sub}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────
export function Table({ headers, children, empty }: {
  headers: string[]; children: React.ReactNode; empty?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {headers.map(h => (
              <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {empty ? (
            <tr><td colSpan={headers.length} className="text-center py-12 text-slate-400 text-sm">No records found</td></tr>
          ) : children}
        </tbody>
      </table>
    </div>
  );
}

export function Td({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <td className={`px-4 py-3 text-slate-700 ${mono ? 'font-mono text-xs' : ''}`}>
      {children}
    </td>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 'max-w-lg' }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; width?: string;
}) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${width} max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 font-display">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, type = 'text', value, onChange, placeholder, required }: {
  label?: string; type?: string; value?: string; onChange?: (v: string) => void;
  placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      {label && <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <input type={type} value={value} onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder} className="input-base" />
    </div>
  );
}

export function Select({ label, value, onChange, options }: {
  label?: string; value?: string; onChange?: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div>
      {label && <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>}
      <select value={value} onChange={e => onChange?.(e.target.value)} className="input-base">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function Textarea({ label, value, onChange, placeholder, rows = 3 }: {
  label?: string; value?: string; onChange?: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <div>
      {label && <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>}
      <textarea value={value} onChange={e => onChange?.(e.target.value)} rows={rows}
        placeholder={placeholder} className="input-base resize-none" />
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }: {
  tabs: string[]; active: string; onChange: (t: string) => void;
}) {
  return (
    <div className="flex gap-0.5 bg-slate-100 p-1 rounded-lg w-fit">
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)}
          className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
            active === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}>
          {t}
        </button>
      ))}
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ initials, size = 'md', color }: { initials: string; size?: 'sm'|'md'|'lg'; color?: string }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
  const colors = ['bg-indigo-100 text-indigo-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700',
    'bg-pink-100 text-pink-700', 'bg-cyan-100 text-cyan-700', 'bg-purple-100 text-purple-700'];
  const c = color || colors[initials.charCodeAt(0) % colors.length];
  return (
    <div className={`${sizes[size]} ${c} rounded-full flex items-center justify-center font-bold font-display flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ─── Toast / Alert ────────────────────────────────────────────────────────────
export function Alert({ type, message, onClose }: { type: 'success'|'error'|'warning'|'info'; message: string; onClose?: () => void }) {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };
  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium ${styles[type]}`}>
      <span className="font-bold">{icons[type]}</span>
      <span className="flex-1">{message}</span>
      {onClose && <button onClick={onClose} className="opacity-60 hover:opacity-100"><X size={14} /></button>}
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, max, color = 'indigo' }: { value: number; max: number; color?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const colors: Record<string, string> = { indigo: 'bg-indigo-500', green: 'bg-green-500', amber: 'bg-amber-500', red: 'bg-red-500' };
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colors[color] || 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-slate-500 w-8 text-right">{pct}%</span>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, sub, action }: { icon: string; title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-base font-semibold text-slate-700 font-display">{title}</p>
      {sub && <p className="text-sm text-slate-400 mt-1">{sub}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── Search Input ─────────────────────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || 'Search...'}
        className="input-base pl-9 pr-4 py-2" />
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
