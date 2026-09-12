import React from 'react';
import { Award, Shield, Sparkles, MapPin, Calendar, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50/80 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Col 1: Brand info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-brand-purple-600 flex items-center justify-center text-white shadow-sm">
                <Award className="w-4 h-4" />
              </div>
              <span className="text-lg font-extrabold text-slate-900 tracking-tight">
                The Brands<span className="text-brand-purple-600">Way</span>
              </span>
            </div>
            <p className="text-xs text-brand-purple-700 font-bold uppercase tracking-wider mb-2">
              Skill Academy
            </p>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm mb-3">
              Empowering students and ambitious professionals with industry-grade AI skills. 
              Explore. Learn. Build. Grow.
            </p>
            <a 
              href="https://thebrandsway.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-purple-700 hover:text-brand-purple-800 underline"
            >
              <span>Visit Official Website: thebrandsway.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Col 2: Workshop details */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-purple-600" /> Official Workshop
            </h4>
            <p className="text-sm font-bold text-slate-900">
              AI for Real Opportunities
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-brand-purple-600" />
              <span>13 September 2026</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-brand-purple-600" />
              <span>Aligarh, India</span>
            </div>
          </div>

          {/* Col 3: Brand Philosophy */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" /> Tamper-Proof Verification
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Every certificate issued carries an encrypted QR code and a unique sequential certificate ID for instant verification.
            </p>
            <div className="text-xs font-serif italic text-slate-500">
              "Same Skills • A Brighter • Tomorrow"
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p className="tracking-wide">
            © {new Date().getFullYear()} The BrandsWay Skill Academy. All rights reserved.
          </p>
          <p className="text-slate-600 font-semibold tracking-wider text-center sm:text-right">
            PEOPLE  |  SKILLS  |  OPPORTUNITIES  |  A BRIGHTER TOMORROW
          </p>
        </div>
      </div>
    </footer>
  );
}
