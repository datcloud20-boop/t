import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dataService } from '../services/dataService.ts';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await dataService.login(email.trim(), password);
      
      localStorage.setItem('csp_admin', response.user.isAdmin ? 'true' : 'false');
      localStorage.setItem('csp_user', JSON.stringify(response.user));

      if (response.user.isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Access Denied: Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-600/10 via-transparent to-gray-900/20 pointer-events-none" />
      
      <div className="w-full max-w-lg relative z-10 py-20">
        <div className="text-center mb-10">
          <Link to="/" className="text-4xl font-black font-heading mb-4 inline-block text-white uppercase tracking-tighter">
            DAT<span className="text-red-500">CLOUDE</span>
          </Link>
          <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">
            SECURE SYSTEM LOGIN
          </p>
        </div>

        <div className="bg-[#0d0d0d]/80 backdrop-blur-2xl p-10 md:p-12 rounded-[2.5rem] border border-gray-800/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleAuth} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-600/10 border border-red-600/30 rounded-2xl text-red-500 text-[10px] font-black text-center uppercase tracking-widest">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="datcloud20@gmail.com"
                className="w-full bg-black border border-gray-800 rounded-2xl p-5 focus:ring-1 focus:ring-red-600 outline-none transition-all text-sm font-bold text-white placeholder:text-gray-800"
                required
              />
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full bg-black border border-gray-800 rounded-2xl p-5 focus:ring-1 focus:ring-red-600 outline-none transition-all text-sm font-bold text-white placeholder:text-gray-800"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-6 bg-red-600 rounded-2xl font-black text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 active:scale-[0.98] disabled:opacity-50 uppercase tracking-tighter text-white"
            >
              {loading ? 'AUTHENTICATING...' : 'ACCESS SYSTEM'}
            </button>
            
            <div className="text-center space-y-4 pt-4">
              <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">
                <Link to="/signup" className="hover:text-red-400 transition-colors">New to the studio? Create Account</Link>
              </p>
              <Link to="/" className="inline-block text-[10px] font-bold text-gray-700 hover:text-white transition-colors uppercase tracking-[0.2em]">← Back to Headquarters</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;