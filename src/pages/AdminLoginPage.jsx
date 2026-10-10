import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) {
    navigate('/admin', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-mesh-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-purple-600 flex items-center justify-center text-white mx-auto mb-3 shadow-purple-glow">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1">
            Admin Portal Login
          </h1>
          <div className="text-xs text-brand-purple-700 font-bold uppercase tracking-widest">
            Brandsway Skill Academy
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft-lg backdrop-blur-md">
          
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Organizer Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@brandsway.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:border-brand-purple-600 focus:ring-4 focus:ring-brand-purple-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:border-brand-purple-600 focus:ring-4 focus:ring-brand-purple-100 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-purple-600 to-indigo-700 text-white font-bold text-sm shadow-purple-glow hover:shadow-purple-glow-lg hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
