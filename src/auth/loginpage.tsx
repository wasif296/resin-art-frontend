import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, Heart, ShieldCheck } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { loginUser } from '../api'; // Path check karlein agar error aaye

// --- LOGO IMPORT ---
import logo from "../assets/logo.png";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // --- 1. BACK BUTTON PROTECTION ---
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  // --- 2. BACKEND LOGIN LOGIC ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await loginUser({ email, password });
      
      if (response.status === 200) {
        localStorage.setItem("isLoggedIn", "true");
        toast.success("Welcome back to your Studio Ayesha! ✨");
        // replace: true history stack se login page ko nikaal deta hai
        navigate("/dashboard", { replace: true });
      }
    } catch {
      toast.error("wrong Email or Password! try again. ❌");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FFF5F7] font-sans selection:bg-pink-100">
      <Toaster position="top-center" />
      
      <div className="max-w-md w-full bg-white rounded-[3.5rem] shadow-2xl shadow-pink-100/50 p-10 md:p-14 border border-white relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
        
        {/* --- HEADER (Logo next to Name) --- */}
        <div className="text-center mb-12 relative z-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="bg-white p-2 rounded-2xl shadow-lg border border-pink-50 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-black text-slate-800 tracking-tighter leading-tight uppercase italic">Resin Art</h1>
              <p className="text-[10px] text-pink-400 font-black uppercase tracking-[0.3em] leading-none">By Ayesha</p>
            </div>
          </div>
          <div className="h-1 w-20 bg-[#d4af37] mx-auto rounded-full mb-4"></div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Admin Control Center</p>
        </div>

        {/* --- FORM --- */}
        <form onSubmit={handleLogin} className="space-y-7 relative z-10">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-pink-400 transition-colors" size={18} />
              <input 
                type="email" 
                className="w-full pl-14 pr-5 py-5 bg-slate-50 border-2 border-transparent rounded-[1.8rem] focus:bg-white focus:border-pink-200 outline-none text-sm font-bold text-slate-700 transition-all shadow-inner" 
                placeholder="admin@studio.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Secret Password</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-pink-400 transition-colors" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                className="w-full pl-14 pr-14 py-5 bg-slate-50 border-2 border-transparent rounded-[1.8rem] focus:bg-white focus:border-pink-200 outline-none text-sm font-bold text-slate-700 transition-all shadow-inner" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              {/* Eye Toggle Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-pink-500 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Login Button (Golden Theme) */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full bg-[#d4af37] hover:bg-[#b8962d] text-white font-black py-5 rounded-[2rem] transition-all shadow-xl shadow-amber-100 flex items-center justify-center gap-3 active:scale-[0.97] uppercase tracking-[0.2em] text-xs ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              "Verifying Access..."
            ) : (
              <>
                <ShieldCheck size={18} /> Sign In to Dashboard
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-12 text-center border-t border-slate-50 pt-8">
           <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
             Handcrafted with <Heart size={12} className="text-pink-400 fill-current" /> by MobileHub
           </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;