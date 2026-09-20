import React, { useState } from 'react';
import { USERS } from '../data/mock';
import { Card, PageHeader, Table, Td, Badge, Btn, Avatar, Modal, Input, Select } from '../components/ui';
import { Plus, ShieldCheck } from 'lucide-react';

const PERMISSIONS = [
  { id: 'view', label: 'View' },
  { id: 'create', label: 'Create' },
  { id: 'edit', label: 'Edit' },
  { id: 'delete', label: 'Delete' },
  { id: 'approve', label: 'Approve' },
  { id: 'export', label: 'Export' },
];

const MODULES = ['Projects', 'Tasks', 'Inventory', 'Finance', 'Staff', 'Reports', 'Settings', 'Audit Log'];

const ROLE_PERMS: Record<string, Record<string, string[]>> = {
  staff: { Projects: ['view'], Tasks: ['view', 'edit'], Inventory: ['view'], Finance: [], Staff: [], Reports: [], Settings: ['view'], 'Audit Log': [] },
  accountant: { Projects: ['view'], Tasks: ['view'], Inventory: ['view'], Finance: ['view', 'create', 'edit', 'export'], Staff: ['view'], Reports: ['view', 'export'], Settings: ['view'], 'Audit Log': ['view'] },
  manager: { Projects: ['view', 'create', 'edit', 'approve'], Tasks: ['view', 'create', 'edit', 'delete', 'approve'], Inventory: ['view', 'create', 'edit'], Finance: ['view', 'export'], Staff: ['view', 'create', 'edit'], Reports: ['view', 'export'], Settings: ['view', 'edit'], 'Audit Log': ['view'] },
  owner: { Projects: ['view', 'create', 'edit', 'delete', 'approve', 'export'], Tasks: ['view', 'create', 'edit', 'delete', 'approve', 'export'], Inventory: ['view', 'create', 'edit', 'delete', 'export'], Finance: ['view', 'create', 'edit', 'delete', 'approve', 'export'], Staff: ['view', 'create', 'edit', 'delete', 'approve'], Reports: ['view', 'export'], Settings: ['view', 'edit'], 'Audit Log': ['view', 'export'] },
};

export default function Users() {
  const [addOpen, setAddOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<'staff'|'accountant'|'manager'|'owner'>('owner');

  const roleColors: Record<string, string> = {
    owner: 'bg-indigo-100 text-indigo-700', manager: 'bg-purple-100 text-purple-700',
    accountant: 'bg-amber-100 text-amber-700', staff: 'bg-cyan-100 text-cyan-700',
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Users & Roles" sub="Manage access control and permissions" breadcrumb={['Home', 'Users & Roles']}
        actions={<Btn onClick={() => setAddOpen(true)} variant="primary" size="sm" icon={<Plus size={14} />}>Add User</Btn>} />

      {/* Users Table */}
      <Card>
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 font-display">All Users</h3>
        </div>
        <Table headers={['User', 'Email', 'Role', 'Status', 'Last Login', 'Actions']}>
          {USERS.map(u => (
            <tr key={u.id}>
              <Td>
                <div className="flex items-center gap-2">
                  <Avatar initials={u.avatar} size="sm" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.position}</p>
                  </div>
                </div>
              </Td>
              <Td mono><span className="text-xs text-slate-500">{u.email}</span></Td>
              <Td>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${roleColors[u.role]}`}>
                  {u.role === 'owner' ? 'Owner/Admin' : u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                </span>
              </Td>
              <Td><Badge status={u.status} /></Td>
              <Td mono><span className="text-xs text-slate-400">2025-09-18</span></Td>
              <Td>
                <div className="flex gap-2">
                  <button className="text-xs text-indigo-600 font-semibold hover:underline">Edit</button>
                  <button className="text-xs text-red-500 font-semibold hover:underline">Disable</button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>

      {/* Permission Matrix */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck size={18} className="text-indigo-600" />
          <h3 className="font-bold text-slate-800 font-display">Permission Matrix</h3>
        </div>

        {/* Role tabs */}
        <div className="flex gap-2 mb-4">
          {(['staff', 'accountant', 'manager', 'owner'] as const).map(r => (
            <button key={r} onClick={() => setActiveRole(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeRole === r ? `${roleColors[r]} border-2 border-current` : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}>
              {r === 'owner' ? 'Owner/Admin' : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 py-2 pr-4 w-32">Module</th>
                {PERMISSIONS.map(p => (
                  <th key={p.id} className="text-center text-xs font-semibold text-slate-500 py-2 px-3">{p.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map(module => {
                const perms = ROLE_PERMS[activeRole][module] || [];
                return (
                  <tr key={module} className="border-b border-slate-50">
                    <td className="py-2 pr-4 font-semibold text-slate-700">{module}</td>
                    {PERMISSIONS.map(p => (
                      <td key={p.id} className="text-center py-2 px-3">
                        {perms.includes(p.id) ? (
                          <span className="text-green-600 text-base">✓</span>
                        ) : (
                          <span className="text-slate-200 text-base">–</span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New User" width="max-w-lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" placeholder="First name" required />
            <Input label="Last Name" placeholder="Last name" required />
          </div>
          <Input label="Email Address" type="email" placeholder="email@printcraft.gh" required />
          <Select label="Role" options={[
            { label: 'Staff', value: 'staff' }, { label: 'Accountant', value: 'accountant' },
            { label: 'Manager', value: 'manager' }, { label: 'Owner / Admin', value: 'owner' },
          ]} />
          <div className="flex gap-2 pt-2">
            <Btn variant="primary" size="md">Send Invite</Btn>
            <Btn variant="secondary" size="md" onClick={() => setAddOpen(false)}>Cancel</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
