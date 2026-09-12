import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Award, 
  Calendar, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  Sparkles,
  Download,
  Globe,
  Pause,
  Play,
  Copy,
  Check
} from 'lucide-react';
import { verifyCertificate } from '../services/certificateService';
import { generateCertificatePDF, downloadPDFBlob } from '../utils/pdfGenerator';
import CertificateCanvas from '../components/CertificateCanvas';

const MAIN_WEBSITE_URL = 'https://thebrandsway.com/';
const INITIAL_COUNTDOWN = 8; // 8 seconds countdown to allow viewing or clicking Know More

export default function VerifyPage() {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [inputCertId, setInputCertId] = useState(certificateId || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-redirect states
  const [countdown, setCountdown] = useState(INITIAL_COUNTDOWN);
  const [isRedirectPaused, setIsRedirectPaused] = useState(false);
  const [redirectTriggered, setRedirectTriggered] = useState(false);

  // Confetti on initial issuance
  useEffect(() => {
    if (location.state?.justIssued) {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#7C3AED', '#4F46E5', '#D4AF37', '#10B981', '#F59E0B']
        });
      } catch (e) {
        // ignore
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (certificateId) {
      setInputCertId(certificateId);
      // Instant render if passed from registration flow
      if (location.state?.certificate && location.state.certificate.certificate_id === certificateId) {
        setResult({
          valid: true,
          ...location.state.certificate,
          participant_name: location.state.certificate.participant_name,
          certificate_id: location.state.certificate.certificate_id,
          workshop_name: location.state.certificate.workshop_name || 'AI for Real Opportunities',
          workshop_date: location.state.certificate.workshop_date || '2026-09-13',
          location: location.state.certificate.location || 'Aligarh, India',
        });
        setHasSearched(true);
      } else {
        performVerification(certificateId);
      }
    }
  }, [certificateId, location.state]);

  // Countdown timer when certificate is verified
  useEffect(() => {
    if (!result?.valid || isRedirectPaused || redirectTriggered) {
      return;
    }

    if (countdown <= 0) {
      setRedirectTriggered(true);
      window.location.href = MAIN_WEBSITE_URL;
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setRedirectTriggered(true);
          window.location.href = MAIN_WEBSITE_URL;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [result, isRedirectPaused, countdown, redirectTriggered]);

  const performVerification = async (idToVerify) => {
    const cleanId = (idToVerify || '').trim();
    if (!cleanId) return;

    setLoading(true);
    setHasSearched(true);
    setResult(null);
    setCountdown(INITIAL_COUNTDOWN);
    setIsRedirectPaused(false);
    setRedirectTriggered(false);

    try {
      const data = await verifyCertificate(cleanId);
      setResult(data);
    } catch (err) {
      console.error('Verification query failed:', err);
      setResult({
        valid: false,
        message: "We could not verify this certificate. Please check the certificate ID and try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    const clean = inputCertId.trim();
    if (clean) {
      navigate(`/verify/${clean}`);
    }
  };

  const handleDownloadFromVerify = async () => {
    if (!result || !result.valid) return;
    try {
      setDownloading(true);
      const pdfBlob = await generateCertificatePDF({
        participantName: result.participant_name,
        certificateId: result.certificate_id,
        workshopName: result.workshop_name || 'AI for Real Opportunities',
        workshopDate: '13 September 2026',
        location: result.location || 'Aligarh, India',
        verificationUrl: window.location.origin + '/verify/' + result.certificate_id
      });
      downloadPDFBlob(pdfBlob, `${result.certificate_id}_${result.participant_name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Unable to generate PDF at this time.');
    } finally {
      setDownloading(false);
    }
  };

  const progressPercent = ((INITIAL_COUNTDOWN - countdown) / INITIAL_COUNTDOWN) * 100;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-mesh-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-purple-50 border border-brand-purple-200 text-brand-purple-700 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-purple-600" />
            Official Verification System
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
            Verify a Certificate
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            The BrandsWay Skill Academy verifies the authenticity of official workshop participation certificates.
          </p>
        </div>

        {/* Manual Verification Search Form */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-soft-md mb-8">
          <form onSubmit={handleManualSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={inputCertId}
                onChange={(e) => setInputCertId(e.target.value)}
                placeholder="Enter Certificate ID (e.g. BRW-AIRO-0001)"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:border-brand-purple-600 focus:ring-4 focus:ring-brand-purple-100 uppercase font-mono tracking-wider transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !inputCertId.trim()}
              className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand-purple-600 to-indigo-700 hover:brightness-105 text-white font-bold text-sm shadow-purple-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Verifying...' : 'Verify Certificate'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Verification Loading State */}
        {loading && (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-soft-sm">
            <div className="w-10 h-10 border-4 border-brand-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-700 font-semibold">Validating record with The BrandsWay official registry...</p>
          </div>
        )}

        {!loading && hasSearched && result && (
          <>
            {result.valid ? (
              <div className="space-y-6">
                
                {/* 1. Verified Screen & Auto-Redirect Banner */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-emerald-500/50 shadow-soft-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-50 rounded-full blur-2xl pointer-events-none" />

                  <div className="relative z-10">
                    
                    {location.state?.justIssued && (
                      <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-sm">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>Registration Successful • Your Certificate is Ready & Verified</span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-md">
                          <ShieldCheck className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-700">
                              Official Confirmation
                            </span>
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                            </span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            This Certificate is Verified by The BrandsWay
                          </h2>
                        </div>
                      </div>

                      <div className="px-4 py-2 rounded-xl bg-brand-purple-50 border border-brand-purple-200 text-sm font-mono font-bold text-brand-purple-800 self-start sm:self-auto shadow-sm">
                        ID: {result.certificate_id}
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed mb-5">
                      Authenticity officially verified for <strong className="text-slate-900 font-bold">{result.participant_name}</strong> for participation in <span className="text-brand-purple-700 font-bold">"{result.workshop_name || 'AI for Real Opportunities'}"</span>.
                    </p>

                    {/* Countdown and Redirection Action */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Globe className="w-4 h-4 text-brand-purple-600 animate-pulse" />
                          {!isRedirectPaused ? (
                            <span>
                              Redirecting to company website <strong className="text-brand-purple-700 font-bold">thebrandsway.com</strong> in <strong className="text-emerald-700 font-mono text-sm font-bold">{countdown}s</strong>...
                            </span>
                          ) : (
                            <span className="text-slate-600 font-medium">
                              Auto-redirect paused. You can view or download the certificate below.
                            </span>
                          )}
                        </div>

                        {/* Pause / Resume Button */}
                        <button
                          type="button"
                          onClick={() => setIsRedirectPaused(!isRedirectPaused)}
                          className="text-xs font-bold text-brand-purple-700 hover:text-brand-purple-800 underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                        >
                          {isRedirectPaused ? (
                            <>
                              <Play className="w-3 h-3 text-emerald-600" /> Resume Auto-Redirect
                            </>
                          ) : (
                            <>
                              <Pause className="w-3 h-3 text-amber-600" /> Stay on this page
                            </>
                          )}
                        </button>
                      </div>

                      {/* Animated Progress Bar */}
                      {!isRedirectPaused && (
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-emerald-500 via-teal-500 to-brand-purple-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      )}

                      {/* Action Buttons: Know More, Download PDF, Share Link */}
                      <div className="flex flex-wrap items-center gap-2.5 pt-1">
                        {/* The requested Know More button redirecting to https://thebrandsway.com/ */}
                        <a
                          href={MAIN_WEBSITE_URL}
                          className="flex-1 min-w-[200px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand-purple-600 via-purple-600 to-indigo-700 hover:brightness-105 active:scale-[0.99] text-white font-bold text-sm shadow-purple-glow hover:shadow-purple-glow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group"
                          title="Redirect to The BrandsWay Official Website"
                        >
                          <span>Know More</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>

                        <button
                          type="button"
                          onClick={handleDownloadFromVerify}
                          disabled={downloading}
                          className="py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4 text-brand-purple-600" />
                          <span>{downloading ? 'Preparing...' : 'Download PDF'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(window.location.href);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2500);
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-600" />
                              <span className="text-emerald-700">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-slate-500" />
                              <span>Share Link</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsRedirectPaused(true);
                            document.getElementById('certificate-details-card')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>View Certificate ↓</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 2. Full Certificate Details Card */}
                <div id="certificate-details-card" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft-lg">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        Official Certificate Details
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Verified credential issued by The BrandsWay Skill Academy
                      </p>
                    </div>

                    <a
                      href={MAIN_WEBSITE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-brand-purple-700 hover:text-brand-purple-800 font-bold underline"
                    >
                      <span>thebrandsway.com</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Details Grid (Privacy Safe) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                    
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Awarded To
                      </div>
                      <div className="text-lg font-bold text-slate-900">
                        {result.participant_name}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Certificate Type
                      </div>
                      <div className="text-base font-bold text-slate-800">
                        Certificate of Participation
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Workshop Title
                      </div>
                      <div className="text-base font-bold text-brand-purple-700">
                        {result.workshop_name || 'AI for Real Opportunities'}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Issued By
                      </div>
                      <div className="text-base font-bold text-slate-800">
                        The BrandsWay Skill Academy
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Date of Issue
                      </div>
                      <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-brand-purple-600" />
                        13 September 2026
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Location
                      </div>
                      <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-brand-purple-600" />
                        {result.location || 'Aligarh, India'}
                      </div>
                    </div>

                  </div>

                  {/* High Definition Certificate Canvas Preview */}
                  <div className="mb-6">
                    <CertificateCanvas
                      certData={{
                        participantName: result.participant_name,
                        certificateId: result.certificate_id,
                        workshopName: result.workshop_name || 'AI for Real Opportunities',
                        workshopDate: '13 September 2026',
                        location: result.location || 'Aligarh, India',
                        verificationUrl: window.location.href
                      }}
                    />
                  </div>

                  {/* Actions footer */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">
                      Tamper-proof certificate generated by The BrandsWay Skill Academy
                    </p>
                    <button
                      onClick={handleDownloadFromVerify}
                      disabled={downloading}
                      className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-gradient-to-r from-brand-purple-600 to-indigo-700 hover:brightness-105 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{downloading ? 'Downloading...' : 'Download Official PDF'}</span>
                    </button>
                  </div>

                </div>

              </div>
            ) : (
              /* Invalid State */
              <div className="bg-white border-2 border-rose-200 rounded-3xl p-8 text-center shadow-soft-lg">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto mb-4">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">
                  Certificate Not Found
                </h2>
                <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                  We could not verify this certificate. Please check the certificate ID and try again.
                </p>
                <div className="p-4 rounded-2xl bg-slate-50 text-xs text-slate-600 max-w-md mx-auto space-y-2 text-left">
                  <p className="font-bold text-slate-800">Troubleshooting advice:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Verify the exact ID format (e.g. <span className="font-mono text-brand-purple-700 font-bold">BRW-AIRO-0001</span>).</li>
                    <li>Ensure there are no leading or trailing spaces.</li>
                    <li>Contact the workshop team at <a href="https://thebrandsway.com/" target="_blank" rel="noreferrer" className="text-brand-purple-700 underline font-semibold">thebrandsway.com</a>.</li>
                  </ul>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
