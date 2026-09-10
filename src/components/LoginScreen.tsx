import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  LogIn, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Crown, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Key,
  Globe,
  ArrowRight
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { loginUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = loginUser(email, password);
    if (!res.success) {
      setError(res.error || 'Invalid credentials');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-slate-100 overflow-y-auto p-4 sm:p-6 font-sans">
      
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-slate-900/90 border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl z-10 my-auto">
        
        {/* LEFT PANEL: SAAS BRANDING & MULTI-TENANT PROMO */}
        <div className="md:col-span-5 bg-gradient-to-br from-indigo-900/90 via-slate-900 to-violet-950 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 relative overflow-hidden">
          
          <div className="relative z-10 space-y-6">
            
            {/* Brand Identity */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/30">
                HV
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white">HotelVista ERP</h1>
                <p className="text-xs text-indigo-300 font-semibold">Multi-Tenant Hotel Platform</p>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-4 pt-4">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                SaaS Enterprise Capabilities
              </h2>
              
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Multi-Property Tenant Isolation & Cloud Billing</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Integrated Front Desk, Restaurant, Bar & Laundry POS</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Super Admin Global Control & Property Onboarding</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Role-Based Access Security & Audit Logging</span>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Badge */}
          <div className="pt-8 relative z-10">
            <div className="p-3 bg-slate-900/60 rounded-2xl border border-indigo-500/20 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Status: <strong className="text-emerald-400">All Servers Online</strong></span>
              <span className="font-mono text-[10px] text-indigo-400">v1.0.4 Enterprise</span>
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: LOGIN FORM */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-between space-y-6">
          
          <div>
            
            {/* Header Title */}
            <div>
              <h2 className="text-xl font-black text-white">
                Sign In to HotelVista ERP
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your credentials to access your hotel property or SaaS portal.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mt-4 p-3 bg-rose-950/60 border border-rose-500/30 text-rose-300 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mt-6 text-xs">
              
              <div className="space-y-1.5">
                <label className="font-bold text-slate-400 block">Username / Email ID *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. superAdmin or name@hotel.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-400 block">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>

          </div>

          {/* Secure Access Footer Notice */}
          <div className="pt-4 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500">
              Protected by Enterprise Multi-Tenant RBAC Security • HotelVista ERP
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
