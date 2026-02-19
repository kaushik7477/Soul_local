
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, PieChart, 
  Settings, Globe, CreditCard, Ticket, LogOut, ShieldCheck, Camera,
  RefreshCw, Wrench
} from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

interface AdminLayoutProps {
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ isAdmin, setIsAdmin }) => {
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAdmin(true);
        localStorage.setItem('soul_admin_logged_in', '1');
      } else {
        setIsAdmin(false);
        localStorage.removeItem('soul_admin_logged_in');
      }
    });
    return () => unsubscribe();
  }, [setIsAdmin]);

  const handleLogin = () => {
    const email = adminEmail.trim();
    const password = adminPassword;
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        setIsAdmin(true);
        localStorage.setItem('soul_admin_logged_in', '1');
      })
      .catch((error: any) => {
        const code = error?.code || '';
        if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
          alert('Invalid admin password');
        } else if (code === 'auth/user-not-found') {
          alert('Admin account not found');
        } else {
          alert('Failed to login. Please try again.');
        }
      });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-white/10 p-10 rounded-3xl shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-green-500 p-4 rounded-2xl mb-6">
              <ShieldCheck className="w-10 h-10 text-black" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Terminal Access</h1>
            <p className="text-zinc-500 text-sm mt-2">Enter your clearance codes</p>
          </div>
          <div className="space-y-6">
            <input 
              type="email" 
              placeholder="Admin Email" 
              value={adminEmail}
              onChange={e => setAdminEmail(e.target.value)}
              className="w-full bg-black border border-white/10 px-6 py-4 rounded-xl focus:border-green-500 transition-all" 
            />
            <input 
              type="password" 
              placeholder="Passcode" 
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              className="w-full bg-black border border-white/10 px-6 py-4 rounded-xl focus:border-green-500 transition-all" 
            />
            <button 
              onClick={handleLogin}
              className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-green-500 transition-all"
            >
              Initiate Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    { icon: RefreshCw, label: 'Exchanges', path: '/admin/exchanges' },
    { icon: Users, label: 'Customers', path: '/admin/customers' },
    { icon: PieChart, label: 'Analytics', path: '/admin/analytics' },
    { icon: CreditCard, label: 'Finance', path: '/admin/finance' },
    { icon: Ticket, label: 'Coupons', path: '/admin/coupons' },
    { icon: Camera, label: 'Reviews', path: '/admin/reviews' },
    { icon: Globe, label: 'Website', path: '/admin/website' },
    { icon: Wrench, label: 'Tools', path: '/admin/tools' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-black overflow-hidden font-heading">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-950 border-r border-white/5 hidden md:flex flex-col">
        <div className="p-8">
          <h2 className="text-xl font-black tracking-tighter">SOUL PANEL</h2>
          <p className="text-[10px] tracking-[0.4em] text-zinc-500 uppercase font-light">Root Access</p>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col">
          <nav className="px-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  location.pathname === item.path 
                    ? 'bg-white text-black font-black' 
                    : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-wider">{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="p-8 mt-auto">
            <button 
              onClick={() => {
                signOut(auth).catch(() => {});
                localStorage.removeItem('soul_admin_logged_in');
                setIsAdmin(false);
              }}
              className="flex items-center space-x-3 text-red-500 hover:text-red-400 transition-colors uppercase text-xs font-black tracking-widest"
            >
              <LogOut className="w-4 h-4" />
              <span>Terminate</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto p-8 md:p-12">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
