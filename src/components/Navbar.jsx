import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Award, ShieldCheck, UserCheck, LogOut, Menu, X, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { user, logout, isSupabaseConfigured } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/certificate', label: 'Get Certificate', icon: Award },
    { path: '/verify', label: 'Verify Certificate', icon: ShieldCheck },
    { path: '/admin', label: 'Admin Portal', icon: UserCheck },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-soft-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Name (matching thebrandsway.com) */}
          <Link to="/certificate" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-purple-glow group-hover:scale-105 transition-transform duration-300">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 leading-none">
                The Brands<span className="text-brand-purple-600">Way</span>
              </div>
              <div className="text-xs font-semibold text-slate-500 tracking-wider uppercase mt-1 flex items-center gap-2">
                Skill Academy
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-brand-purple-50 text-brand-purple-700 border border-brand-purple-200">
                  Workshop
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path || (path === '/verify' && location.pathname.startsWith('/verify'));
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-purple-50 text-brand-purple-700 shadow-sm border border-brand-purple-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-purple-600' : 'text-slate-400'}`} />
                  {label}
                </Link>
              );
            })}

            {/* Official Company Website Link */}
            <a
              href="https://thebrandsway.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-brand-purple-700 hover:bg-slate-100/80 border border-slate-200 transition-all ml-1"
              title="Visit The BrandsWay Official Website"
            >
              <span>thebrandsway.com</span>
              <ExternalLink className="w-3.5 h-3.5 text-brand-purple-600" />
            </a>

            {/* Admin Logout */}
            {user && (
              <button
                onClick={logout}
                className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
                title="Log out of Admin Dashboard"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 bg-white border-b border-slate-200 space-y-2 shadow-lg">
          {navLinks.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-slate-700 hover:bg-brand-purple-50 hover:text-brand-purple-700"
            >
              <Icon className="w-5 h-5 text-brand-purple-600" />
              {label}
            </Link>
          ))}
          <a
            href="https://thebrandsway.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-100"
          >
            <span>Visit thebrandsway.com</span>
            <ExternalLink className="w-4 h-4 text-brand-purple-600" />
          </a>
          {user && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end text-xs text-slate-500 px-2">
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="text-rose-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <LogOut className="w-3 h-3" /> Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
