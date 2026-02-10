
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const adminFlag = localStorage.getItem('csp_admin');
      
      if (adminFlag !== 'true') {
        navigate('/login');
      } else {
        setIsVerifying(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('csp_admin');
    localStorage.removeItem('csp_user');
    navigate('/');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] font-black tracking-[0.3em] text-gray-500 uppercase">Verifying Authorization</p>
      </div>
    );
  }

  const navItems = [
    { label: 'DASHBOARD', path: '/admin/dashboard' },
    { label: 'PROJECTS', path: '/admin/projects' },
    { label: 'MESSAGES', path: '/admin/messages' },
    { label: 'SETTINGS', path: '/admin/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-[#050505] overflow-x-hidden">
      <aside className={`w-72 bg-[#0a0a0a] border-r border-gray-900 p-8 flex flex-col fixed inset-y-0 z-[60] transition-transform duration-500 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-12">
          <span className="text-xl font-bold font-heading uppercase text-white">DAT<span className="text-red-500">CLOUDE</span></span>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map(item => (
            <Link 
              key={item.label}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center px-6 py-4 rounded-2xl text-sm font-bold transition-all ${location.pathname === item.path ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-gray-500 hover:text-white hover:bg-gray-900'}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button onClick={handleLogout} className="mt-auto flex items-center px-6 py-4 rounded-2xl text-sm font-bold text-gray-500 hover:text-red-500 transition-all">LOGOUT</button>
      </aside>
      <main className="flex-1 lg:ml-72 p-12 min-w-0">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
      
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-[70] w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
        </svg>
      </button>
    </div>
  );
};

export default AdminLayout;
