import React, { useState } from 'react';
import { INVENTORY } from '../data/mock';
import { Badge, Btn, Card, PageHeader, SearchInput, Table, Td, Modal, Input, Select, Textarea, StatCard, Alert } from '../components/ui';
import { Plus, Package, AlertTriangle, XCircle } from 'lucide-react';

export default function Inventory() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState<'add'|'remove'|null>(null);
  const [selectedItem, setSelectedItem] = useState<typeof INVENTORY[0] | null>(null);
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('');
  const [showSuccess, setShowSuccess] = useState('');

  const filtered = INVENTORY.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || i.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const lowStock = INVENTORY.filter(i => i.status === 'low-stock');
  const outOfStock = INVENTORY.filter(i => i.status === 'out-of-stock');

  return (
    <div className="space-y-5">
      <PageHeader title="Inventory" sub={`${INVENTORY.length} items tracked`} breadcrumb={['Home', 'Inventory']}
        actions={<Btn onClick={() => setAddOpen(true)} variant="primary" size="sm" icon={<Plus size={14} />}>Add Item</Btn>} />

      {/* Alerts */}
      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="space-y-2">
          {outOfStock.length > 0 && (
            <Alert type="error" message={`${outOfStock.length} item(s) are OUT OF STOCK: ${outOfStock.map(i => i.name).join(', ')}`} />
          )}
          {lowStock.length > 0 && (
            <Alert type="warning" message={`${lowStock.length} item(s) are running LOW: ${lowStock.map(i => i.name).join(', ')}`} />
          )}
        </div>
      )}

      {showSuccess && (
        <Alert type="success" message={showSuccess} onClose={() => setShowSuccess('')} />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Items" value={INVENTORY.length} sub="Categories tracked" icon={<Package size={18} />} accent="indigo" />
        <StatCard label="In Stock" value={INVENTORY.filter(i => i.status === 'in-stock').length} sub="Well stocked" icon={<Package size={18} />} accent="green" />
        <StatCard label="Low Stock" value={lowStock.length} sub="Reorder soon" icon={<AlertTriangle size={18} />} accent="amber" />
        <StatCard label="Out of Stock" value={outOfStock.length} sub="Urgent reorder" icon={<XCircle size={18} />} accent="red" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] max-w-xs">
          <SearchInput value={search} onChange={setSearch} placeholder="Search items or categories..." />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-base w-auto py-1.5 text-sm">
          <option value="all">All Statuses</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>

      {/* Table */}
      <Card>
        <Table headers={['Item', 'Category', 'Qty', 'Unit', 'Min Stock', 'Unit Cost', 'Status', 'Last Updated', 'Actions']}>
          {filtered.map(item => (
            <tr key={item.id} className={item.status === 'out-of-stock' ? 'bg-red-50/50' : item.status === 'low-stock' ? 'bg-amber-50/50' : ''}>
              <Td>
                <div className="flex items-center gap-2">
                  {item.status !== 'in-stock' && (
                    <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'out-of-stock' ? 'bg-red-500' : 'bg-amber-500'}`} />
                  )}
                  <p className="text-xs font-semibold text-slate-800">{item.name}</p>
                </div>
              </Td>
              <Td><span className="text-xs text-slate-500">{item.category}</span></Td>
              <Td>
                <span className={`text-sm font-bold font-mono ${
                  item.qty === 0 ? 'text-red-600' : item.qty <= item.minStock ? 'text-amber-700' : 'text-slate-800'
                }`}>{item.qty}</span>
              </Td>
              <Td><span className="text-xs text-slate-500">{item.unit}</span></Td>
              <Td mono><span className="text-xs text-slate-400">{item.minStock}</span></Td>
              <Td mono><span className="text-xs text-slate-600">GH₵ {item.cost}</span></Td>
              <Td><Badge status={item.status} /></Td>
              <Td>
                <div>
                  <p className="text-xs font-mono text-slate-500">{item.lastUpdated}</p>
                  <p className="text-xs text-slate-400">{item.updatedBy}</p>
                </div>
              </Td>
              <Td>
                <div className="flex gap-1">
                  <button onClick={() => { setSelectedItem(item); setStockOpen('add'); }}
                    className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors">
                    +Add
                  </button>
                  <button onClick={() => { setSelectedItem(item); setStockOpen('remove'); }}
                    className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors">
                    Use
                  </button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>

      {/* Add/Remove Stock Modal */}
      <Modal open={!!stockOpen} onClose={() => { setStockOpen(null); setQty(''); setReason(''); }}
        title={stockOpen === 'add' ? `Add Stock — ${selectedItem?.name}` : `Use Stock — ${selectedItem?.name}`}>
        {selectedItem && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Current Stock</p>
                <p className="text-xl font-bold text-slate-900 font-mono">{selectedItem.qty} <span className="text-sm font-normal text-slate-500">{selectedItem.unit}</span></p>
              </div>
              <Badge status={selectedItem.status} />
            </div>

            <Input label={`Quantity to ${stockOpen === 'add' ? 'Add' : 'Use'}`}
              type="number" value={qty} onChange={setQty}
              placeholder="Enter quantity" required />

            {stockOpen === 'remove' && (
              <>
                <Select label="Related Project" options={[
                  { label: 'No project', value: '' },
                  { label: 'Mensah Wedding Package', value: 'prj-1024' },
                  { label: 'TechGhana Corp Branding', value: 'prj-1025' },
                  { label: 'UG Graduation 2025', value: 'prj-1028' },
                ]} />
                <Textarea label="Reason for Use" value={reason} onChange={setReason}
                  placeholder="Why is this stock being removed?" rows={2} />
              </>
            )}

            {stockOpen === 'add' && (
              <Select label="Transaction Type" options={[
                { label: 'Stock Added (New Purchase)', value: 'added' },
                { label: 'Stock Returned', value: 'returned' },
                { label: 'Stock Adjustment', value: 'adjustment' },
              ]} />
            )}

            {qty && (
              <div className={`rounded-lg p-3 text-sm font-semibold ${stockOpen === 'add' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                New quantity will be: <span className="font-bold font-mono">
                  {stockOpen === 'add' ? selectedItem.qty + Number(qty) : Math.max(0, selectedItem.qty - Number(qty))} {selectedItem.unit}
                </span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Btn variant={stockOpen === 'add' ? 'primary' : 'danger'} size="md"
                onClick={() => {
                  setStockOpen(null); setQty(''); setReason('');
                  setShowSuccess(stockOpen === 'add'
                    ? `Stock added successfully for ${selectedItem.name}.`
                    : `Stock usage recorded for ${selectedItem.name}.`);
                }}>
                {stockOpen === 'add' ? 'Add Stock' : 'Confirm Use'}
              </Btn>
              <Btn variant="secondary" size="md" onClick={() => setStockOpen(null)}>Cancel</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Item Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Inventory Item" width="max-w-lg">
        <div className="space-y-4">
          <Input label="Item Name" placeholder="e.g. A4 Paper (80gsm)" required />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Category" options={[
              { label: 'Paper', value: 'paper' }, { label: 'Ink & Toner', value: 'ink' },
              { label: 'Print Materials', value: 'print' }, { label: 'Binding', value: 'binding' },
              { label: 'Lamination', value: 'lamination' }, { label: 'Stationery', value: 'stationery' },
              { label: 'Packaging', value: 'packaging' }, { label: 'Other', value: 'other' },
            ]} />
            <Select label="Unit" options={[
              { label: 'Reams', value: 'reams' }, { label: 'Packs', value: 'packs' },
              { label: 'Pieces', value: 'pieces' }, { label: 'Boxes', value: 'boxes' },
              { label: 'Units', value: 'units' }, { label: 'Rolls', value: 'rolls' },
            ]} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Initial Quantity" type="number" placeholder="0" />
            <Input label="Minimum Stock" type="number" placeholder="0" />
          </div>
          <Input label="Unit Cost (GH₵)" type="number" placeholder="0.00" />
          <div className="flex gap-2 pt-2">
            <Btn variant="primary" size="md">Add Item</Btn>
            <Btn variant="secondary" size="md" onClick={() => setAddOpen(false)}>Cancel</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
