import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase';
import { 
  Lock, 
  Mail, 
  Building, 
  Phone, 
  MapPin, 
  Key, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  FileText
} from 'lucide-react';

export const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'signup' || params.has('signup') || window.location.hash === '#signup';
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured) return;
    
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Validation for registration
        if (!hotelName.trim()) throw new Error('Hotel name is required.');
        if (!phone.trim()) throw new Error('Contact phone is required.');

        // 1. Create Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Initialize Tenant document and settings in Firestore
        // Use user.uid as tenantId to establish silo
        const tenantRef = doc(db, 'tenants', user.uid);
        await setDoc(tenantRef, {
          hotelName,
          address,
          phone,
          email,
          gstNumber,
          createdAt: new Date().toISOString()
        });

        // Initialize tenant settings
        const settingsRef = doc(db, 'tenants', user.uid, 'settings', 'hotel');
        await setDoc(settingsRef, {
          name: hotelName,
          address: address || 'Default Address',
          phone: phone,
          email: email,
          gstNumber: gstNumber || 'GST-PENDING',
          taxRate: 18,
          barTaxRate: 20,
          invoicePrefix: 'HV-' + hotelName.substring(0, 3).toUpperCase() + '-'
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If Firebase config is missing, show setup assistant UI
  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-slate-100 font-sans">
        <div className="max-w-xl w-full p-8 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl text-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-500">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Firebase Setup Required</h2>
              <p className="text-slate-450 mt-0.5">Your project is not connected to a Firebase instance.</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-slate-350 leading-relaxed text-xs">
              To proceed with the multi-tenant real-time database update, please perform the following steps:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-slate-400">
              <li>Open your Firebase Console and create a new project.</li>
              <li>Enable **Email/Password** Provider in **Authentication** tab.</li>
              <li>Create a **Cloud Firestore** Database in Production or Test mode.</li>
              <li>Create a Web App in Firebase Project Settings and get the config script.</li>
              <li>Create a file named <code className="bg-slate-900 text-indigo-400 px-1 py-0.5 rounded font-mono">.env.local</code> in your project root directory.</li>
            </ol>

            <div className="mt-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <p className="font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-400" /> Expected `.env.local` contents:
              </p>
              <pre className="font-mono text-[10px] text-indigo-300 overflow-x-auto whitespace-pre p-2 bg-slate-950 rounded select-all">
{`VITE_FIREBASE_API_KEY=AIzaSyA...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:12345:web:abcde
VITE_FIREBASE_MEASUREMENT_ID=G-ABCDE123`}
              </pre>
            </div>
            <p className="text-[10px] text-slate-500 italic mt-2">
              Once you add the `.env.local` file, restart the Vite dev server to reload environment variables.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-950 p-6 font-sans relative overflow-hidden">
      
      {/* Decorative gradient glowing circles */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg bg-white/5 dark:bg-slate-900/50 border border-white/10 dark:border-slate-800/80 rounded-3xl shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-300">
        
        {/* Header Section */}
        <div className="p-6 text-center border-b border-white/5 dark:border-slate-800/50 bg-slate-900/20">
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-black shadow-lg shadow-indigo-500/30 text-lg mb-3">
            HV
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            HotelVista Multi-Tenant ERP
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isSignUp ? 'Register your hotel organization account' : 'Sign in to access your hotel console'}
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="p-6 space-y-4 text-xs">
          
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl flex items-start gap-2.5 animate-shake">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Seeding Info Fields */}
          {isSignUp && (
            <div className="space-y-3.5 border-b border-white/5 dark:border-slate-800/50 pb-4 mb-4">
              <span className="font-bold text-[10px] text-indigo-400 uppercase tracking-widest block">Hotel Information</span>
              
              <div className="space-y-1">
                <label className="font-bold text-slate-400">Hotel / Resort Name *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
                    <Building className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={hotelName}
                    onChange={e => setHotelName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 rounded-xl text-white outline-none font-semibold transition-all"
                    placeholder="e.g. Hilltop Heights Resort"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Contact Phone *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 rounded-xl text-white outline-none font-semibold transition-all"
                      placeholder="e.g. +91 99999 88888"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">GSTIN Number (Optional)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
                      <Key className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={gstNumber}
                      onChange={e => setGstNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 rounded-xl text-white outline-none font-mono transition-all"
                      placeholder="e.g. 33AAAAA1111A1ZA"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">Full Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 rounded-xl text-white outline-none transition-all"
                    placeholder="e.g. 12, Lake View Road, Ooty"
                  />
                </div>
              </div>
            </div>
          )}

          {/* User account credentials fields */}
          <div className="space-y-3.5">
            {isSignUp && (
              <span className="font-bold text-[10px] text-indigo-400 uppercase tracking-widest block">Account Administrator</span>
            )}
            
            <div className="space-y-1">
              <label className="font-bold text-slate-400">Owner/Admin Email *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 rounded-xl text-white outline-none font-semibold transition-all"
                  placeholder="name@hotel.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-400">Password *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 rounded-xl text-white outline-none font-mono transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-350"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-indigo-650 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-indigo-500/10 active:scale-[0.99]"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                <span>Processing...</span>
              </span>
            ) : (
              <>
                <span>{isSignUp ? 'Create Tenant Workspace' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Form Switch Trigger */}
          {isSignUp && (
            <div className="text-center pt-2 text-slate-450 font-semibold">
              <p>
                Already have a workspace?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setError('');
                    // Clean up URL parameters
                    window.history.replaceState({}, document.title, window.location.pathname);
                  }}
                  className="text-indigo-400 hover:underline pl-1 focus:outline-none"
                >
                  Log In
                </button>
              </p>
            </div>
          )}

        </form>
      </div>
    </div>
  );
};
