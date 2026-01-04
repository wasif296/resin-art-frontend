import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, ShoppingCart, TrendingUp, FileText, Plus, Search, Printer, 
  Trash2, X, Phone, MapPin, Package, Heart, LogOut, Pencil, Tag, Instagram, Users, BarChart3
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
    const subtotal = Number(formData.unitPrice || 0) * Number(formData.quantity || 1);
    const finalTotal = subtotal - Number(formData.discount || 0);
    setFormData((prev: any) => ({ ...prev, totalPrice: finalTotal }));
  }, [formData.unitPrice, formData.quantity, formData.discount]);

  // --- STATS CALCULATIONS ---
  const salesRecords = records.filter(r => r.type === 'Sale');
  const purchaseRecords = records.filter(r => r.type === 'Purchase');
  const totalSales = salesRecords.reduce((acc, curr) => acc + Number(curr.totalPrice), 0);
  const totalPurchases = purchaseRecords.reduce((acc, curr) => acc + Number(curr.totalPrice), 0);
  const totalProfit = salesRecords.reduce((acc, curr) => acc + (Number(curr.profit) || 0), 0);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyProfit = salesRecords.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).reduce((acc, curr) => acc + (Number(curr.profit) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateRecord(editingId, formData);
        toast.success("Updated Successfully! ✨");
      } else {
        await addRecord(formData);
        toast.success("Record Saved! ✨");
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

  // --- FIXED SEARCH LOGIC ---
  const filteredData = records.filter(r => {
    const query = searchQuery.toLowerCase();
    return (
      r.itemName?.toLowerCase().includes(query) || 
      r.customerName?.toLowerCase().includes(query) ||
      r.customerPhone?.includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col md:flex-row font-sans text-slate-700">
      <Toaster position="top-right" />

      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 shadow-sm z-50">
        <div className="p-8">
          <div className="flex flex-row items-center  mb-12">
            <img src={logo} alt="Logo" className="w-14 h-14 object-contain" />
            <div>
              <h1 className="font-black text-slate-900 text-lg leading-tight tracking-tighter">Resin Art</h1>
              <p className="text-[9px] text-pink-400 font-black uppercase tracking-widest">by Ayesha</p>
            </div>
          </div>
          <nav className="space-y-4">
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
        <div className="mt-auto p-8 border-t border-slate-50">
          <button onClick={() => { localStorage.removeItem("isLoggedIn"); navigate("/login"); }} className="flex items-center gap-3 text-slate-400 hover:text-red-500 text-sm font-bold mb-4 w-full">
            <LogOut size={18} /> Logout
          </button>
          <p className="text-[9px] text-slate-300 font-black tracking-widest text-center">CRAFTED WITH 💖 LOVE</p>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="mb-8">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{activeTab} Details</h2>
          <p className="text-slate-400 text-sm font-bold italic tracking-tighter">Studio Recording System</p>
        </header>

        {/* --- STATS CARDS --- */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="bg-[#fdf2f8] p-5 rounded-2xl border border-pink-100 flex justify-between items-center shadow-sm">
            <div><p className="text-pink-400 text-[9px] font-black uppercase mb-1">Total Sales</p><h3 className="text-xl font-black text-slate-800">Rs {totalSales.toLocaleString()}</h3></div>
            <ShoppingBag className="text-pink-200" size={20}/>
          </div>
          <div className="bg-[#fef3c7] p-5 rounded-2xl border border-amber-100 flex justify-between items-center shadow-sm">
            <div><p className="text-amber-600 text-[9px] font-black uppercase mb-1">Stock Purchases</p><h3 className="text-xl font-black text-slate-800">Rs {totalPurchases.toLocaleString()}</h3></div>
            <ShoppingCart className="text-amber-200" size={20}/>
          </div>
          <div className="bg-[#f0fdfa] p-5 rounded-2xl border border-teal-100 flex justify-between items-center shadow-sm">
            <div><p className="text-teal-600 text-[9px] font-black uppercase mb-1">Monthly Profit</p><h3 className="text-xl font-black text-slate-800">Rs {monthlyProfit.toLocaleString()}</h3></div>
            <BarChart3 className="text-teal-200" size={20}/>
          </div>
          <div className="bg-[#ecfdf5] p-5 rounded-2xl border border-emerald-100 flex justify-between items-center shadow-sm">
            <div><p className="text-emerald-600 text-[9px] font-black uppercase mb-1">Business Total Profit</p><h3 className="text-xl font-black text-slate-800">Rs {totalProfit.toLocaleString()}</h3></div>
            <TrendingUp className="text-emerald-200" size={20}/>
          </div>
        </section>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
          
          {/* SALES HISTORY TAB */}
          {activeTab === 'Sales' && (
            <div className="overflow-x-auto">
              <div className="p-8 border-b border-slate-50">
                <div className="relative w-full md:w-1/2">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  <input type="text" placeholder="Search sales..." className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-medium text-sm shadow-inner" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                  <tr><th className="px-6 py-5">Date</th><th className="px-6 py-5">Item</th><th className="px-6 py-5">Customer</th><th className="px-6 py-5">Phone</th><th className="px-6 py-5 text-center">Qty</th><th className="px-6 py-5 text-right">Total Price</th><th className="px-6 py-5 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredData.filter(r => r.type === 'Sale').map((r) => (
                    <tr key={r._id} className="text-sm hover:bg-slate-50 transition-all group">
                      <td className="px-6 py-5 text-slate-400">{r.date}</td>
                      <td className="px-6 py-5 font-black text-slate-700">{r.itemName}</td>
                      <td className="px-6 py-5 font-bold text-slate-500">{r.customerName}</td>
                      <td className="px-6 py-5 text-slate-400 font-mono text-xs">{r.customerPhone}</td>
                      <td className="px-6 py-5 text-center font-black text-pink-500">x{r.quantity}</td>
                      <td className="px-6 py-5 text-right font-black text-slate-900">Rs {r.totalPrice.toLocaleString()}</td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                           <button onClick={() => setShowReceipt(r)} className="p-2 text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-600 hover:text-white transition-all"><Printer size={16}/></button>
                           <button onClick={() => startEdit(r)} className="p-2 text-blue-500 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Pencil size={16}/></button>
                           <button onClick={async () => { if(window.confirm("Delete?")) { await deleteRecord(r._id!); loadData(); } }} className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PURCHASE HISTORY TAB */}
          {activeTab === 'Purchases' && (
            <div className="overflow-x-auto">
              {!isPurchaseFormOpen ? (
                <>
                  <div className="p-6 flex justify-between items-center border-b border-slate-50">
                    <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Purchase History</h4>
                    <button onClick={() => { setFormData({...formData, type: 'Purchase'}); setIsPurchaseFormOpen(true); }} className="bg-[#d4af37] text-white px-6 py-3 rounded-xl font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-100 active:scale-95 transition-all">
                      <Plus size={16}/> Add Purchase
                    </button>
                  </div>
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                      <tr><th className="px-6 py-5">Item Name</th><th className="px-6 py-5 text-center">Qty</th><th className="px-6 py-5 text-center">Date</th><th className="px-6 py-5 text-right">Purchase Price</th><th className="px-6 py-5 text-right">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredData.filter(r => r.type === 'Purchase').map((r) => (
                        <tr key={r._id} className="text-sm hover:bg-slate-50 transition-all">
                          <td className="px-6 py-5 font-black text-slate-700">{r.itemName}</td>
                          <td className="px-6 py-5 text-center text-slate-500">x{r.quantity}</td>
                          <td className="px-6 py-5 text-center text-slate-400 font-mono text-xs">{r.date}</td>
                          <td className="px-6 py-5 text-right font-black text-slate-900">Rs {r.totalPrice.toLocaleString()}</td>
                          <td className="px-6 py-5 text-right flex justify-end gap-2">
                             <button onClick={() => startEdit(r)} className="p-2 text-blue-500 bg-blue-50 rounded-lg hover:bg-blue-500 hover:text-white transition-all"><Pencil size={16}/></button>
                             <button onClick={async () => { if(window.confirm("Delete?")) { await deleteRecord(r._id!); loadData(); } }} className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <div className="p-10 max-w-2xl mx-auto animate-in fade-in">
                  <h4 className="text-center font-black text-[#d4af37] text-xl mb-10 tracking-widest uppercase">Add Material Purchase</h4>
                  <form onSubmit={handleSubmit} className="space-y-6 bg-slate-50/50 p-8 rounded-3xl border">
                    <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Item Name</label>
                    <input required className="w-full bg-white border-none p-4 rounded-xl font-bold shadow-inner" value={formData.itemName} onChange={e => setFormData({...formData, itemName: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Quantity</label>
                      <input type="number" required className="w-full bg-white border-none p-4 rounded-xl font-black shadow-inner" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} /></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Purchase Price (PKR)</label>
                      <input type="number" required className="w-full bg-white border-none p-4 rounded-xl font-black text-[#d4af37] shadow-inner" value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: parseInt(e.target.value)})} /></div>
                    </div>
                    <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Date</label>
                    <input type="date" required className="w-full bg-white border-none p-4 rounded-xl font-bold shadow-inner" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
                    <div className="flex gap-4 pt-4">
                      <button type="button" onClick={() => setIsPurchaseFormOpen(false)} className="flex-1 py-4 border-2 rounded-xl font-bold text-slate-400 uppercase text-[10px]">Back</button>
                      <button type="submit" className="flex-[2] py-4 bg-[#d4af37] text-white font-black rounded-xl shadow-lg uppercase text-[10px]">Record Purchase</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* PROFIT ANALYTICS TAB */}
          {activeTab === 'Profit' && (
            <div className="p-8 space-y-6">
              <div className="bg-[#fdf2f8] p-12 rounded-[3rem] border border-pink-100 flex justify-between items-center shadow-md relative overflow-hidden group">
                  <div className="absolute right-0 top-0 w-64 h-64 bg-white/20 rounded-full -translate-y-20 translate-x-20 group-hover:scale-110 transition-transform"></div>
                  <div className="relative z-8">
                    <p className="text-pink-400 text-sm font-black uppercase tracking-widest mb-1">Net Business profit</p>
                    <h3 className="text-5xl font-black text-slate-800 tracking-tighter italic">Rs {totalProfit.toLocaleString()}</h3>
                  </div>
                  <div className="bg-[#f0fdfa] p-8 rounded-[2rem] text-teal-400 shadow-sm border border-teal-50 relative z-10"><TrendingUp size={48}/></div>
              </div>
              <div className="overflow-hidden border border-slate-100 rounded-3xl bg-white shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-100 font-black text-[10px] text-slate-400 uppercase tracking-widest">Profit Breakdown List</div>
                <table className="w-full text-left">
                  <thead className="bg-white text-[10px] font-black text-slate-300 uppercase tracking-widest border-b">
                    <tr><th className="px-8 py-5">Item Name</th><th className="px-6 py-5">Date</th><th className="px-6 py-5">Customer</th><th className="px-6 py-5 text-right">Net Profit</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {records.filter(r => r.type === 'Sale').map((r) => (
                      <tr key={r._id} className="text-sm hover:bg-teal-50/10 transition-all">
                        <td className="px-8 py-6 font-black text-slate-700">{r.itemName}</td>
                        <td className="px-6 py-6 text-slate-400 italic text-xs">{r.date}</td>
                        <td className="px-6 py-6 font-bold text-slate-500 uppercase text-[10px] tracking-tighter">{r.customerName}</td>
                        <td className="px-6 py-6 text-right font-black text-teal-600">Rs {r.profit?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CREATE BILL TAB */}
          {activeTab === 'Bill' && (
            <div className="p-10 max-w-6xl mx-auto">
              <div className="flex items-center gap-4 mb-12 border-b border-slate-50 pb-8 justify-center">
                 <img src={logo} className="w-12 h-12 object-contain" alt="mini logo" />
                 <div className="text-center"><h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Create Sales Bill</h3></div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="space-y-8">
                    <h5 className="text-[10px] font-black text-pink-400 uppercase tracking-[0.3em] border-b border-pink-100 pb-2 flex items-center gap-2"><Users size={14}/> Client Information</h5>
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Name</label>
                    <input required className="w-full bg-slate-50 border-none p-5 rounded-2xl focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none font-bold text-sm shadow-inner" value={formData.customerName} onChange={e => setFormData((p: any) => ({...p, customerName: e.target.value}))} /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <input required className="w-full bg-slate-50 border-none p-5 rounded-2xl focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none font-bold text-sm shadow-inner" value={formData.customerPhone} onChange={e => setFormData((p: any) => ({...p, customerPhone: e.target.value}))} /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Delivery Address</label>
                    <textarea required className="w-full bg-slate-50 border-none p-5 rounded-2xl focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none font-bold text-sm h-32 shadow-inner" value={formData.deliveryAddress} onChange={e => setFormData((p: any) => ({...p, deliveryAddress: e.target.value}))} /></div>
                  </div>
                  <div className="space-y-8">
                    <h5 className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.3em] border-b border-amber-100 pb-2 flex items-center gap-2"><Package size={14}/> Product Details</h5>
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Artwork Name</label>
                    <input required className="w-full bg-slate-50 border-none p-5 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-200 outline-none font-bold text-sm shadow-inner" value={formData.itemName} onChange={e => setFormData((p: any) => ({...p, itemName: e.target.value}))} /></div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Qty</label>
                      <input type="number" required className="w-full bg-slate-50 border-none p-5 rounded-2xl font-black text-slate-800" value={formData.quantity} onChange={e => setFormData((p: any) => ({...p, quantity: parseInt(e.target.value)}))} /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Price</label>
                      <input type="number" required className="w-full bg-slate-50 border-none p-5 rounded-2xl font-black text-slate-800" value={formData.unitPrice} onChange={e => setFormData((p: any) => ({...p, unitPrice: parseInt(e.target.value)}))} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="bg-teal-50/50 p-5 rounded-[2rem] border border-teal-100 space-y-2">
                        <label className="text-[9px] font-black text-teal-600 uppercase tracking-widest italic">Net Profit</label>
                        <input type="number" className="w-full bg-white border border-teal-100 p-3 rounded-xl outline-none font-black text-teal-600 text-sm shadow-sm" value={formData.profit} onChange={e => setFormData((p: any) => ({...p, profit: parseInt(e.target.value)}))} /></div>
                       <div className="space-y-2">
                        <label className="text-[9px] font-black text-pink-500 uppercase ml-1 italic tracking-widest">Discount (PKR)</label>
                        <input type="number" className="w-full bg-white border-2 border-pink-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-pink-100 font-black text-pink-500 shadow-sm" value={formData.discount} onChange={e => setFormData((p: any) => ({...p, discount: parseInt(e.target.value) || 0}))} /></div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-slate-50 pt-10 mt-6">
                   <div className="text-slate-300 font-black text-xl uppercase tracking-widest">Payable Total:</div>
                   <div className="text-5xl font-black text-slate-900 tracking-tighter underline decoration-[#d4af37] decoration-8 underline-offset-8 italic">Rs {formData.totalPrice?.toLocaleString()}</div>
                </div>
                <button type="submit" className="w-full bg-[#d4af37] text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                   <FileText size={18}/> SAVE RECORD & SHOW RECEIPT
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* --- RECEIPT MODAL --- */}
      {showReceipt && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-12 relative border-[12px] border-white/5 animate-in zoom-in-95">
             <button onClick={() => setShowReceipt(null)} className="absolute top-10 right-10 p-2 hover:bg-slate-100 rounded-full text-slate-300 transition-all font-black"><X size={24} /></button>
             <div className="text-center">
                <img src={logo} alt="Receipt Logo" className="w-16 h-16 mx-auto mb-4 object-contain" />
                <h4 className="text-3xl font-black text-slate-800 tracking-tighter mb-0 italic">Resin Art by Ayesha</h4>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1 italic">Handcrafted Resin Creations</p>
                <div className="flex justify-between items-center border-y border-slate-50 py-5 my-8 text-[9px] font-bold text-slate-400 tracking-widest uppercase">
                  <span>#INV-${showReceipt.invoiceNo || '0001'}</span>
                  <span>{new Date(showReceipt.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="text-left space-y-4 mb-10 text-[11px] font-bold">
                  <div className="flex flex-col"><span className="text-[8px] font-black text-slate-200 uppercase tracking-widest mb-1 uppercase">Customer Details</span><span className="font-black text-slate-800 uppercase text-base leading-none underline decoration-pink-100 decoration-2">{showReceipt.customerName}</span></div>
                  <div className="space-y-1"><p className="text-slate-400">{showReceipt.customerPhone}</p><p className="text-slate-400 italic font-medium leading-relaxed max-w-[250px]">{showReceipt.deliveryAddress}</p></div>
                </div>
                <div className="border-t border-slate-100 pt-6 space-y-4">
                   <div className="flex justify-between items-center text-[9px] font-black text-slate-200 uppercase tracking-[0.2em]"><span>Artwork Item</span><span>Total Price</span></div>
                   <div className="flex justify-between items-start text-left">
                      <div className="flex flex-col"><span className="font-black text-slate-700 text-sm tracking-tight uppercase italic">{showReceipt.itemName}</span><span className="text-[10px] font-bold text-slate-300 mt-1 italic">Qty: {showReceipt.quantity} × Rs {showReceipt.unitPrice?.toLocaleString()}</span></div>
                      <span className="font-black text-slate-900 text-sm tabular-nums">Rs {(Number(showReceipt.unitPrice) * Number(showReceipt.quantity)).toLocaleString()}</span>
                   </div>
                </div>
                <div className="mt-8 border-t-2 border-dashed border-slate-100 pt-8 space-y-3">
                   {Number(showReceipt.discount) > 0 && (
                      <div className="flex justify-between items-center text-pink-400 font-bold italic text-sm">
                        <span className="text-[10px] uppercase tracking-widest">Artistic Discount</span>
                        <span className="tabular-nums">-Rs {showReceipt.discount?.toLocaleString()}</span>
                      </div>
                   )}
                   <div className="flex justify-between items-center font-black border-t-2 border-slate-50 pt-4">
                      <span className="text-slate-400 uppercase text-xs tracking-widest">Total Amount</span>
                      <span className="text-4xl text-slate-900 tracking-tighter tabular-nums italic underline decoration-[#d4af37] decoration-4 underline-offset-4">PKR {showReceipt.totalPrice.toLocaleString()}</span>
                   </div>
                </div>
                <div className="mt-12 text-center text-slate-300">
                   <div className="flex items-center justify-center gap-2 text-pink-500 font-bold text-[10px] mb-4 uppercase tracking-[0.1em] border p-2 rounded-xl w-fit mx-auto">
                      <Instagram size={14}/> @resin.art_by_ayesha
                   </div>
                   <p className="text-[9px] font-black uppercase tracking-[0.5em] italic">Handcrafted with love ✨</p>
                </div>
             </div>
             <div className="flex gap-5 mt-10">
                <button onClick={() => window.print()} className="flex-[2] py-5 bg-[#d4af37] text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-100 active:scale-95">Print Invoice</button>
                <button onClick={() => setShowReceipt(null)} className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-3xl font-black text-xs uppercase tracking-widest border border-slate-100 transition-all hover:bg-slate-100">Close</button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;