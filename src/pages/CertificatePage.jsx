import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Sparkles, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, User, Mail } from 'lucide-react';
import { validateCertificateForm } from '../utils/validation';
import { issueCertificate } from '../services/certificateService';
import StepProgress from '../components/StepProgress';

export default function CertificatePage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const validation = validateCertificateForm(name, email);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    setCurrentStep(1);

    try {
      // Step 1: Saving details to database
      await new Promise(r => setTimeout(r, 500));
      setCurrentStep(2);

      // Step 2: Issue / Fetch Certificate
      const result = await issueCertificate({
        email: validation.cleanEmail,
        name: validation.cleanName,
        baseUrl: window.location.origin
      });

      setCurrentStep(3);
      await new Promise(r => setTimeout(r, 400));

      // Direct navigation to the official verified page for this certificate
      navigate(`/verify/${result.certificate.certificate_id}`, {
        state: {
          justIssued: true,
          certificate: result.certificate,
          isDuplicate: result.isDuplicate,
        }
      });
    } catch (err) {
      console.error('Generation error:', err);
      setServerError(
        err.message || "We couldn't process your certificate right now. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-mesh-white flex flex-col justify-center py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decorative Floating Ambient Rings (Inspired by thebrandsway.com 3D graphics) */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-br from-brand-purple-200/40 via-purple-100/20 to-amber-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-[450px] h-[450px] bg-brand-purple-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl mx-auto w-full relative z-10">

        {/* Brand Banner / Title Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-purple-50 border border-brand-purple-200 text-brand-purple-700 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-purple-600" />
            Official Workshop Certificate
          </div>
          
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            The Brands<span className="text-brand-purple-600">Way</span>
          </div>
          <div className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-4">
            Skill Academy
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-sans mb-3">
            Your Certificate Is Ready
          </h1>
          
          <div className="inline-block px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-bold text-sm sm:text-base mb-3">
            Workshop: <span className="text-brand-purple-700">AI for Real Opportunities</span>
          </div>

          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Enter your full name and email to register and instantly receive your official certificate of participation.
          </p>
        </div>

        {/* Loading State or Certificate Form */}
        {isSubmitting ? (
          <StepProgress currentStep={currentStep} />
        ) : (
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 sm:p-9 shadow-soft-lg relative">
            
            {/* Server Error Alert */}
            {serverError && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-rose-900">Registration Error</p>
                  <p className="text-xs text-rose-700 mt-0.5">{serverError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              
              {/* Full Name Field */}
              <div>
                <label htmlFor="fullName" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Full Name <span className="text-brand-purple-600">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="fullName"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: null });
                    }}
                    placeholder="e.g. Rahul Sharma"
                    className={`w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50/70 border text-slate-900 placeholder-slate-400 text-base focus:bg-white focus:outline-none focus:ring-4 transition-all ${
                      fieldErrors.name
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-50'
                        : 'border-slate-200 focus:border-brand-purple-600 focus:ring-brand-purple-100'
                    }`}
                    autoComplete="name"
                  />
                </div>
                {fieldErrors.name ? (
                  <p className="mt-1.5 text-xs font-medium text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {fieldErrors.name}
                  </p>
                ) : (
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    Your name will be printed on the official certificate exactly as entered.
                  </p>
                )}
              </div>

              {/* Email Address Field */}
              <div>
                <label htmlFor="emailAddress" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Email Address <span className="text-brand-purple-600">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="emailAddress"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
                    }}
                    placeholder="e.g. rahul@example.com"
                    className={`w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50/70 border text-slate-900 placeholder-slate-400 text-base focus:bg-white focus:outline-none focus:ring-4 transition-all ${
                      fieldErrors.email
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-50'
                        : 'border-slate-200 focus:border-brand-purple-600 focus:ring-brand-purple-100'
                    }`}
                    autoComplete="email"
                  />
                </div>
                {fieldErrors.email ? (
                  <p className="mt-1.5 text-xs font-medium text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {fieldErrors.email}
                  </p>
                ) : (
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    Your certificate will be securely registered to this email address.
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="generate-cert-btn"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-purple-600 via-purple-600 to-indigo-700 text-white font-bold text-base shadow-purple-glow hover:shadow-purple-glow-lg hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Generate My Certificate</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        )}

        {/* Feature Badges */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-soft-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
            <div className="text-xs font-bold text-slate-800">100% Verified</div>
            <div className="text-[10px] text-slate-500">Tamper-proof</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-soft-sm">
            <Award className="w-5 h-5 text-brand-purple-600 mx-auto mb-1.5" />
            <div className="text-xs font-bold text-slate-800">Print Quality</div>
            <div className="text-[10px] text-slate-500">A4 Landscape</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-soft-sm">
            <CheckCircle2 className="w-5 h-5 text-indigo-600 mx-auto mb-1.5" />
            <div className="text-xs font-bold text-slate-800">Instant Download</div>
            <div className="text-[10px] text-slate-500">Direct PDF</div>
          </div>
        </div>

      </div>
    </div>
  );
}
