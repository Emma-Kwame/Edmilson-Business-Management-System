import React, { useState } from 'react';
import { useData } from '../store';
import { Badge, Btn, Card, PageHeader, SearchInput, Table, Td, Modal, Input, Select, Textarea, StatCard, Alert } from '../components/ui';
import { Plus, Package, AlertTriangle, XCircle } from 'lucide-react';

const emptyItemForm = { name: '', category: 'paper', unit: 'pieces', qty: '', minStock: '', cost: '' };

export default function Inventory() {
  const { inventory: INVENTORY, projects: PROJECTS, addInventoryItem, adjustStock } = useData();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [stockOpen, setStockOpen] = useState<'add'|'remove'|null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('');
  const [relatedProjectId, setRelatedProjectId] = useState('');
  const [txnType, setTxnType] = useState('added');
  const [showSuccess, setShowSuccess] = useState('');

  const selectedItem = INVENTORY.find(i => i.id === selectedItemId) || null;

  const filtered = INVENTORY.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || i.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const lowStock = INVENTORY.filter(i => i.status === 'low-stock');
  const outOfStock = INVENTORY.filter(i => i.status === 'out-of-stock');

  const closeStockModal = () => { setStockOpen(null); setSelectedItemId(null); setQty(''); setReason(''); setRelatedProjectId(''); setTxnType('added'); };
  const confirmStock = () => {
    if (!selectedItem || !qty) return;
    const delta = stockOpen === 'add' ? Number(qty) : -Number(qty);
    const relatedProject = PROJECTS.find(p => p.id === relatedProjectId)?.name;
    const note = stockOpen === 'add'
      ? { added: 'New Purchase', returned: 'Stock Returned', adjustment: 'Stock Adjustment' }[txnType]
      : [relatedProject, reason].filter(Boolean).join(' — ') || undefined;
    adjustStock(selectedItem.id, delta, note);
    setShowSuccess(stockOpen === 'add'
      ? `Stock added successfully for ${selectedItem.name}.`
      : `Stock usage recorded for ${selectedItem.name}.`);
    closeStockModal();
  };

  const closeAddItem = () => { setAddOpen(false); setItemForm(emptyItemForm); };
  const submitAddItem = () => {
    if (!itemForm.name.trim()) return;
    addInventoryItem({
      name: itemForm.name, category: itemForm.category, unit: itemForm.unit,
      qty: Number(itemForm.qty) || 0, minStock: Number(itemForm.minStock) || 0, cost: Number(itemForm.cost) || 0,
    });
    setShowSuccess(`${itemForm.name} added to inventory.`);
    closeAddItem();
  };

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
        <Table headers={['Item', 'Category', 'Qty', 'Unit', 'Min Stock', 'Unit Cost', 'Status', 'Last Updated', 'Actions']} empty={filtered.length === 0}>
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
                  <button onClick={() => { setSelectedItemId(item.id); setStockOpen('add'); }}
                    className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors">
                    +Add
                  </button>
                  <button onClick={() => { setSelectedItemId(item.id); setStockOpen('remove'); }}
                    disabled={item.qty === 0}
                    className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    Use
                  </button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>

      {/* Add/Remove Stock Modal */}
      <Modal open={!!stockOpen} onClose={closeStockModal}
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
                <Select label="Related Project" value={relatedProjectId} onChange={setRelatedProjectId} options={[
                  { label: 'No project', value: '' },
                  ...PROJECTS.map(p => ({ label: p.name, value: p.id })),
                ]} />
                <Textarea label="Reason for Use" value={reason} onChange={setReason}
                  placeholder="Why is this stock being removed?" rows={2} />
              </>
            )}

            {stockOpen === 'add' && (
              <Select label="Transaction Type" value={txnType} onChange={setTxnType} options={[
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
              <Btn variant={stockOpen === 'add' ? 'primary' : 'danger'} size="md" onClick={confirmStock}>
                {stockOpen === 'add' ? 'Add Stock' : 'Confirm Use'}
              </Btn>
              <Btn variant="secondary" size="md" onClick={closeStockModal}>Cancel</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Item Modal */}
      <Modal open={addOpen} onClose={closeAddItem} title="Add Inventory Item" width="max-w-lg">
        <div className="space-y-4">
          <Input label="Item Name" placeholder="e.g. A4 Paper (80gsm)" required
            value={itemForm.name} onChange={v => setItemForm(f => ({ ...f, name: v }))} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select label="Category" value={itemForm.category} onChange={v => setItemForm(f => ({ ...f, category: v }))} options={[
              { label: 'Paper', value: 'Paper' }, { label: 'Ink & Toner', value: 'Ink & Toner' },
              { label: 'Print Materials', value: 'Print Materials' }, { label: 'Binding', value: 'Binding' },
              { label: 'Lamination', value: 'Lamination' }, { label: 'Stationery', value: 'Stationery' },
              { label: 'Packaging', value: 'Packaging' }, { label: 'Other', value: 'Other' },
            ]} />
            <Select label="Unit" value={itemForm.unit} onChange={v => setItemForm(f => ({ ...f, unit: v }))} options={[
              { label: 'Reams', value: 'Reams' }, { label: 'Packs', value: 'Packs' },
              { label: 'Pieces', value: 'Pieces' }, { label: 'Boxes', value: 'Boxes' },
              { label: 'Units', value: 'Units' }, { label: 'Rolls', value: 'Rolls' },
            ]} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Initial Quantity" type="number" placeholder="0" value={itemForm.qty} onChange={v => setItemForm(f => ({ ...f, qty: v }))} />
            <Input label="Minimum Stock" type="number" placeholder="0" value={itemForm.minStock} onChange={v => setItemForm(f => ({ ...f, minStock: v }))} />
          </div>
          <Input label="Unit Cost (GH₵)" type="number" placeholder="0.00" value={itemForm.cost} onChange={v => setItemForm(f => ({ ...f, cost: v }))} />
          <div className="flex gap-2 pt-2">
            <Btn variant="primary" size="md" onClick={submitAddItem}>Add Item</Btn>
            <Btn variant="secondary" size="md" onClick={closeAddItem}>Cancel</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
