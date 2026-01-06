import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, ShoppingCart, TrendingUp, FileText, Plus, Search, Printer, 
  Trash2, X, Phone, MapPin, Package, Heart, LogOut, Pencil, Tag, Instagram, Users, BarChart3, Fingerprint, DollarSign, Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { getRecords, addRecord, deleteRecord, updateRecord, type RecordData } from "../api";

// --- LOGO IMPORT ---
import logo from "../assets/logo.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<RecordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'Sales' | 'Purchases' | 'Profit' | 'Bill'>('Sales');
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState<any | null>(null);
  const [isPurchaseFormOpen, setIsPurchaseFormOpen] = useState(false);

  const [formData, setFormData] = useState<any>({
    type: 'Sale',
    date: new Date().toISOString().split('T')[0],
    itemName: "",
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    totalPrice: 0,
    customerName: "",
    customerPhone: "",
    deliveryAddress: "",
    profit: 0
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getRecords();
      setRecords(res.data);
    } catch { toast.error("Database connection failed!"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  // --- Auto Calculation Logic ---
  useEffect(() => {
    const qty = Number(formData.quantity) || 0;
    const rate = Number(formData.unitPrice) || 0;
    const disc = Number(formData.discount) || 0;
    const finalTotal = (qty * rate) - disc;
    setFormData((prev: any) => ({ ...prev, totalPrice: isNaN(finalTotal) ? 0 : finalTotal }));
  }, [formData.unitPrice, formData.quantity, formData.discount]);

  // --- STATS ---
  const salesRecords = records.filter(r => r.type === 'Sale');
  const totalSales = salesRecords.reduce((acc, curr) => acc + Number(curr.totalPrice), 0);
  const totalPurchases = records.filter(r => r.type === 'Purchase').reduce((acc, curr) => acc + Number(curr.totalPrice), 0);
  const totalProfit = salesRecords.reduce((acc, curr) => acc + (Number(curr.profit) || 0), 0);

  const currentMonth = new Date().getMonth();
  const monthlyProfit = salesRecords.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === currentMonth;
  }).reduce((acc, curr) => acc + (Number(curr.profit) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateRecord(editingId, formData);
        toast.success("Updated! ✨");
      } else {
        await addRecord(formData);
        toast.success("Saved! ✨");
        if (formData.type === 'Sale') {
          const invNo = (salesRecords.length + 1).toString().padStart(4, '0');
          setShowReceipt({ ...formData, invoiceNo: invNo });
        }
      }
      loadData();
      setEditingId(null);
      setIsPurchaseFormOpen(false);
      setActiveTab(formData.type === 'Sale' ? 'Sales' : 'Purchases');
      resetForm();
    } catch { toast.error("Error saving data!"); }
    finally { setIsSubmitting(false); }
  };

  const resetForm = () => {
    setFormData({
      type: 'Sale', date: new Date().toISOString().split('T')[0],
      itemName: "", quantity: 1, unitPrice: 0, totalPrice: 0, discount: 0,
      customerName: "", customerPhone: "", deliveryAddress: "", profit: 0
    });
  };

  const startEdit = (r: any) => {
    setFormData(r);
    setEditingId(r._id!);
    if (r.type === 'Purchase') {
      setActiveTab('Purchases');
      setIsPurchaseFormOpen(true);
    } else {
      setActiveTab('Bill');
    }
  };

  // --- Handlers ---
  const handleCNICChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 13);
    setFormData((prev: any) => ({ ...prev, cnic: val }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d+]/g, "").slice(0, 13);
    setFormData((prev: any) => ({ ...prev, customerPhone: val }));
  };

  const filteredData = records.filter(r => {
    const q = searchQuery.toLowerCase();
    return r.itemName?.toLowerCase().includes(q) || r.customerName?.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans text-slate-700 tracking-tight">
      <Toaster position="top-right" />

      {/* --- SIDEBAR (Standard Size) --- */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 shadow-sm z-50">
        <div className="p-6">
          <div className="flex flex-row items-center  mb-8">
            <img src={logo} alt="Logo" className="w-14 h-14 object-contain  rounded-lg" />
            <div>
<h4 className="text-xl font-black text-slate-800 tracking-tighter mb-0 italic">Resin Art  </h4>              <p className="text-[9px] text-pink-400 font-bold uppercase tracking-widest">BY AYESHA</p>
            </div>
          </div>
          <nav className="space-y-2">
            {[
              { id: 'Sales', icon: ShoppingBag, label: 'Sales History' },
              { id: 'Purchases', icon: ShoppingCart, label: 'Purchase History' },
              { id: 'Profit', icon: TrendingUp, label: 'Profit Analytics' },
              { id: 'Bill', icon: FileText, label: 'Create Bill' }
            ].map((item) => (
              <button key={item.id} onClick={() => { setActiveTab(item.id as any); setEditingId(null); setIsPurchaseFormOpen(false); }} 
                className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${activeTab === item.id ? 'bg-pink-500 text-white shadow-lg' : 'text-slate-400 hover:text-pink-500 hover:bg-pink-50'}`}>
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-slate-50">
          <button onClick={() => { localStorage.removeItem("isLoggedIn"); navigate("/login"); }} className="flex items-center gap-3 text-slate-400 hover:text-red-500 text-sm font-bold mb-4 w-full transition-colors">
            <LogOut size={18} /> Logout
          </button>
          <p className="text-[9px] text-slate-300 font-black text-center tracking-widest uppercase">Ayesha's workplace</p>
        </div>
      </aside>

      {/* --- MAIN CONTENT (Compact Sizes) --- */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <header className="mb-6">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{activeTab === 'Bill' ? 'Create Sales Invoice' : `${activeTab} Details`}</h2>
          {/* <p className="text-slate-400 text-xs font-bold italic tracking-tighter">Studio Management System</p> */}
        </header>

        {/* --- COMPACT STATS CARDS --- */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
  {/* Total Sales Card */}
  <div className="bg-[#fdf2f8] p-5 rounded-2xl border border-pink-100 flex justify-between items-center shadow-sm transition-all hover:shadow-md">
    <div>
      <p className="text-pink-400 text-[9px] font-black uppercase mb-1 tracking-widest">Total Sales</p>
      <h3 className="text-xl font-bold text-slate-800">Rs {totalSales.toLocaleString()}</h3>
    </div>
    <div className="bg-white/60 p-2 rounded-lg text-pink-300">
      <ShoppingBag size={20} />
    </div>
  </div>

  {/* Total Purchases Card */}
  <div className="bg-[#fef3c7] p-5 rounded-2xl border border-amber-100 flex justify-between items-center shadow-sm transition-all hover:shadow-md">
    <div>
      <p className="text-amber-600 text-[9px] font-black uppercase mb-1 tracking-widest">Stock Purchases</p>
      <h3 className="text-xl font-bold text-slate-800">Rs {totalPurchases.toLocaleString()}</h3>
    </div>
    <div className="bg-white/60 p-2 rounded-lg text-amber-300">
      <ShoppingCart size={20} />
    </div>
  </div>

  {/* Monthly Profit Card */}
  <div className="bg-[#f0fdfa] p-5 rounded-2xl border border-teal-100 flex justify-between items-center shadow-sm transition-all hover:shadow-md">
    <div>
      <p className="text-teal-600 text-[9px] font-black uppercase mb-1 tracking-widest">Monthly Profit</p>
      <h3 className="text-xl font-bold text-slate-800">Rs {monthlyProfit.toLocaleString()}</h3>
    </div>
    <div className="bg-white/60 p-2 rounded-lg text-teal-300">
      <BarChart3 size={20} />
    </div>
  </div>

  {/* Total Net Profit Card */}
  <div className="bg-[#ecfdf5] p-5 rounded-2xl border border-emerald-100 flex justify-between items-center shadow-sm transition-all hover:shadow-md">
    <div>
      <p className="text-emerald-600 text-[9px] font-black uppercase mb-1 tracking-widest">Total Net Profit</p>
      <h3 className="text-xl font-bold text-slate-800">Rs {totalProfit.toLocaleString()}</h3>
    </div>
    <div className="bg-white/60 p-2 rounded-lg text-emerald-300">
      <TrendingUp size={20} />
    </div>
  </div>
</section>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
          
          {/* SEARCH & ADD (FOR HISTORIES) */}
          {activeTab !== 'Bill' && (
            <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-1/2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                <input type="text" placeholder="Search by name, item or phone..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none font-bold text-sm shadow-inner transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              {activeTab === 'Purchases' && !isPurchaseFormOpen && (
                <button onClick={() => { setFormData({...formData, type: 'Purchase'}); setIsPurchaseFormOpen(true); }} className="bg-[#d4af37] text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-amber-100 active:scale-95 transition-all">
                  <Plus size={14}/> Add Purchase
                </button>
              )}
            </div>
          )}

          {/* TABLES AREA (Compact Padding) */}
          {(activeTab === 'Sales' || (activeTab === 'Purchases' && !isPurchaseFormOpen)) && (
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b">
                  <tr>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-4 py-3.5">Item Description</th>
                    {activeTab === 'Sales' && <><th className="px-4 py-3.5">Customer</th><th className="px-4 py-3.5">Contact</th><th className="px-4 py-3.5">Address</th></>}
                    <th className="px-4 py-3.5 text-center">Qty</th>
                    <th className="px-4 py-3.5 text-right">Price</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 font-bold">
                  {filteredData.filter(r => r.type === (activeTab === 'Purchases' ? 'Purchase' : 'Sale')).map((r) => (
                    <tr key={r._id} className="text-xs hover:bg-slate-50 transition-all group">
                      <td className="px-6 py-3.5 text-slate-400 font-normal italic">{r.date}</td>
                      <td className="px-4 py-3.5 text-slate-800">{r.itemName}</td>
                      {activeTab === 'Sales' && (
                        <>
                          <td className="px-4 py-3.5 uppercase text-[10px] tracking-tighter text-slate-500">{r.customerName}</td>
                          <td className="px-4 py-3.5 font-mono text-[10px]">{r.customerPhone}</td>
                          <td className="px-4 py-3.5 italic text-slate-300 text-[10px] truncate max-w-[150px]">{r.deliveryAddress}</td>
                        </>
                      )}
                      <td className="px-4 py-3.5 text-center font-black text-pink-500">x{r.quantity}</td>
                      <td className="px-4 py-3.5 text-right font-black text-slate-900 tabular-nums">Rs {r.totalPrice.toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                           {r.type === 'Sale' && <button onClick={() => setShowReceipt(r)} className="p-1.5 text-teal-600 bg-teal-50 hover:bg-teal-500 hover:text-white rounded-lg transition-all"><Printer size={14}/></button>}
                           <button onClick={() => startEdit(r)} className="p-1.5 text-blue-500 bg-blue-50 hover:bg-blue-500 hover:text-white rounded-lg transition-all"><Pencil size={14}/></button>
                           <button onClick={async () => { if(window.confirm("Delete?")) { await deleteRecord(r._id!); loadData(); } }} className="p-1.5 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PURCHASE FORM */}
          {activeTab === 'Purchases' && isPurchaseFormOpen && (
            <div className="p-10 max-w-2xl mx-auto">
              <h4 className="text-center font-black text-[#d4af37] text-xl mb-6 tracking-tighter uppercase underline decoration-2 decoration-amber-100 underline-offset-8">Add New Stock Record</h4>
              <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50/50 p-8 rounded-3xl border shadow-inner">
                <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase ml-1">Material Name</label><input required className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold shadow-sm outline-none focus:ring-2 focus:ring-amber-200" placeholder="e.g. Epoxy Resin (5L)" value={formData.itemName} onChange={e => setFormData({...formData, itemName: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase ml-1">Quantity</label><input type="number" required className="w-full bg-white border border-slate-200 p-3 rounded-xl font-black shadow-sm outline-none" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} /></div>
                  <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase ml-1">Purchase Price (PKR)</label><input type="number" required className="w-full bg-white border border-slate-200 p-3 rounded-xl font-black text-[#d4af37] shadow-sm outline-none" placeholder="Enter Amount" value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: Number(e.target.value)})} /></div>
                </div>
                <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase ml-1">Transaction Date</label><input type="date" required className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold shadow-sm outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsPurchaseFormOpen(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-400 uppercase text-[9px] hover:bg-white">Back</button>
                  <button type="submit" disabled={isSubmitting} className="flex-[2] py-3 bg-[#d4af37] text-white font-black rounded-xl shadow-lg uppercase text-[9px] tracking-widest">{isSubmitting ? "Syncing..." : "Record Purchase"}</button>
                </div>
              </form>
            </div>
          )}

          {/* PROFIT ANALYTICS TAB (Compact) */}
          {activeTab === 'Profit' && (
            <div className="p-6 space-y-6">
              <div className="bg-[#fdf2f8] p-8 rounded-3xl border border-pink-100 flex justify-between items-center shadow-sm relative overflow-hidden group transition-all hover:shadow-md">
                  <div className="relative z-10"><p className="text-pink-400 text-xs font-black uppercase tracking-widest mb-1">Business Net Profit</p><h3 className="text-4xl font-black text-slate-800 tracking-tighter italic">Rs {totalProfit.toLocaleString()}</h3></div>
                  <TrendingUp size={48} className="text-teal-400" />
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[9px] font-black text-slate-300 uppercase tracking-widest border-b">
                  <tr><th className="px-6 py-4 border-b">Art Description</th><th className="px-6 py-4 border-b">Date</th><th className="px-6 py-4 border-b">Customer</th><th className="px-6 py-4 border-b text-right">Net Profit</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-bold">
                  {records.filter(r => r.type === 'Sale').map((r) => (
                    <tr key={r._id} className="text-xs hover:bg-teal-50/10 transition-all">
                      <td className="px-6 py-4 font-black">{r.itemName}</td>
                      <td className="px-6 py-4 text-slate-400 font-normal italic text-[10px]">{r.date}</td>
                      <td className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px]">{r.customerName}</td>
                      <td className="px-6 py-4 text-right font-black text-teal-600 tabular-nums">+Rs {r.profit?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CREATE BILL TAB (Sales ONLY - Standard Split View) */}
          {activeTab === 'Bill' && (
            <div className="p-6 md:p-10 max-w-6xl mx-auto">
              <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6 justify-center">
                 <img src={logo} className="w-14 h-14 object-contain shadow-sm rounded-2xl" alt="studio logo" />
                 <div className="text-center"><h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Customer Sales Portal</h3><p className="text-[9px] font-black text-[#d4af37] uppercase tracking-[0.2em] mt-1 underline decoration-amber-100 underline-offset-4 decoration-2">Premium Invoice Generator</p></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h5 className="text-[10px] font-black text-pink-400 uppercase tracking-[0.2em] border-b border-pink-50 pb-2 flex items-center gap-2"><Users size={14}/> Client Details</h5>
                    <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Customer Name</label><input required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-100 outline-none font-bold text-sm shadow-inner transition-all" placeholder="e.g. ayesha" value={formData.customerName} onChange={e => setFormData((p: any) => ({...p, customerName: e.target.value}))} /></div>
                    <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Contact Number</label><input required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-100 outline-none font-bold text-sm shadow-inner transition-all" placeholder="+92 300 1234567" value={formData.customerPhone} onChange={handlePhoneChange} /></div>
                    <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Delivery Address</label><textarea required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-100 outline-none font-bold text-sm h-24 shadow-inner" placeholder="Complete address for shipping" value={formData.deliveryAddress} onChange={e => setFormData((p: any) => ({...p, deliveryAddress: e.target.value}))} /></div>
                  </div>

                  <div className="space-y-6">
                    <h5 className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.2em] border-b border-amber-50 pb-2 flex items-center gap-2"><Package size={14}/> Product Selection</h5>
                    <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Item Description</label><input required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-200 outline-none font-bold text-sm shadow-inner transition-all" placeholder="Resin Ocean Wave Set" value={formData.itemName} onChange={e => setFormData((p: any) => ({...p, itemName: e.target.value}))} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Quantity</label><input type="number" required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-black text-slate-800" placeholder="1" value={formData.quantity} onChange={e => setFormData((p: any) => ({...p, quantity: Number(e.target.value)}))} /></div>
                      <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Unit Price</label><input type="number" required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-black text-slate-800" placeholder="0" value={formData.unitPrice} onChange={e => setFormData((p: any) => ({...p, unitPrice: Number(e.target.value)}))} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100 space-y-1"><label className="text-[9px] font-black text-teal-600 uppercase italic">Net Profit Amount</label><input type="number" className="w-full bg-white border border-teal-100 p-2 rounded-lg outline-none font-black text-teal-600 text-sm shadow-sm" placeholder="0" value={formData.profit} onChange={e => setFormData((p: any) => ({...p, profit: Number(e.target.value)}))} /></div>
                       <div className="space-y-1"><label className="text-[9px] font-black text-pink-500 uppercase ml-1 italic tracking-widest">Discount (PKR)</label><input type="number" className="w-full bg-white border-2 border-pink-50 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-pink-100 font-black text-pink-500 shadow-sm" placeholder="0" value={formData.discount} onChange={e => setFormData((p: any) => ({...p, discount: Number(e.target.value) || 0}))} /></div>
                    </div>
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Transaction Date</label><input type="date" required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-bold shadow-inner outline-none focus:ring-2 focus:ring-teal-100 transition-all" value={formData.date} onChange={e => setFormData((p: any) => ({...p, date: e.target.value}))} /></div>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 pt-8 mt-6 bg-slate-50 p-6 rounded-3xl border shadow-inner">
                   <div className="text-slate-400 font-bold text-lg uppercase tracking-widest">Payable Net Amount:</div>
                   <div className="text-4xl font-black text-slate-900 tracking-tighter italic">Rs {formData.totalPrice?.toLocaleString()}</div>
                </div>

                <button 
  type="submit" 
  disabled={isSubmitting} 
  className="w-full bg-[#d4af37] text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-amber-100/50 active:scale-[0.98] transition-all flex items-center justify-center gap-3 hover:bg-[#c4a132]"
>
  {isSubmitting ? (
    <TrendingUp className="animate-spin" size={16}/>
  ) : (
    <Printer size={18}/>
  )} 
  {isSubmitting ? "Processing..." : "Save & Print Receipt"}
</button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* --- RECEIPT MODAL (NaN Fixed & Labels Restored) --- */}
      {showReceipt && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4 overflow-y-auto font-sans">
           <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 relative border-[10px] border-white/5 my-10 animate-in zoom-in-95">
             <button onClick={() => setShowReceipt(null)} className="absolute top-4 right-4 p-1 hover:bg-slate-50 rounded-full text-slate-300 transition-all"> </button>
             <div className="text-center">
                <img src={logo} alt="Receipt Logo" className="w-16 h-16 mx-auto mb-4 object-contain" />
                <h4 className="text-2xl font-black text-slate-800 tracking-tighter mb-0 italic uppercase">Resin Art by Ayesha</h4>
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1 italic tracking-tighter">Handcrafted Resin Creations</p>
                
                <div className="flex justify-between items-center border-y border-slate-100 py-4 my-6 text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
                  {/* <span>#INV-${showReceipt.invoiceNo || '0001'}</span> */}
                  <span>{new Date(showReceipt.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>

                <div className="text-left space-y-4 mb-8 text-[11px] font-bold">
                  <div className="flex flex-col"><span className="text-[8px] font-black text-slate-200 uppercase tracking-widest mb-1">Customer Billed To</span><span className="font-black text-slate-800 uppercase text-lg border-b-2 border-pink-100 w-fit pb-1 leading-none">{showReceipt.customerName}</span></div>
                  <div className="space-y-1"><p className="text-slate-400">{showReceipt.customerPhone}</p><p className="text-slate-400 italic font-medium leading-relaxed">{showReceipt.deliveryAddress}</p></div>
                </div>

                <div className="border-t border-slate-100 pt-6 space-y-4">
                   <div className="flex justify-between items-center text-[9px] font-black text-slate-200 uppercase tracking-[0.2em]"><span> Item</span><span>Total Price</span></div>
                   <div className="flex justify-between items-start text-left">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-700 text-sm tracking-tight uppercase italic">{showReceipt.itemName}</span>
                        <span className="text-[10px] font-bold text-slate-300 mt-1 italic font-mono">Qty: {showReceipt.quantity} × Rs {showReceipt.unitPrice?.toLocaleString()}</span>
                      </div>
                      {/* Price Fix for NaN: Using showReceipt.totalPrice directly */}
                      <span className="font-black text-slate-900 text-sm tabular-nums">Rs {(Number(showReceipt.unitPrice) * Number(showReceipt.quantity)).toLocaleString()}</span>
                   </div>
                </div>

                <div className="mt-8 border-t-2 border-dashed border-slate-100 pt-8 space-y-3">
                   {Number(showReceipt.discount) > 0 && (
                      <div className="flex justify-between items-center text-pink-400 font-bold italic text-sm">
                        <span className="text-[10px] uppercase tracking-widest"> Discount</span>
                        <span className="tabular-nums">-Rs {showReceipt.discount?.toLocaleString()}</span>
                      </div>
                   )}
                   <div className="flex justify-between items-center font-black border-t-2 border-slate-100 pt-6">
                      <span className="text-slate-400 uppercase text-xs tracking-[0.2em]">Total Amount</span>
                      <span className="text-3xl text-slate-900 tracking-tighter tabular-nums italic underline decoration-[#d4af37] decoration-4 underline-offset-4 leading-none">Rs {showReceipt.totalPrice.toLocaleString()}</span>
                   </div>
                </div>

                <div className="mt-12 text-center text-slate-300">
                   <div className="flex items-center justify-center gap-2 text-pink-500 font-bold text-[10px] mb-4 uppercase tracking-[0.1em] border p-2 rounded-xl w-fit mx-auto shadow-sm">
                      <Instagram size={14}/> @resin.art_by_ayesha
                   </div>
                   <p className="text-[9px] font-black uppercase tracking-[0.5em] italic">Handcrafted with love</p>
                </div>
             </div>
             <div className="flex gap-4 mt-10">
                <button onClick={() => window.print()} className="flex-[2] py-4 bg-[#d4af37] text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Print Official Receipt</button>
                <button onClick={() => setShowReceipt(null)} className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-3xl font-black text-[10px] uppercase border">Close</button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;