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
  ArrowRight,
  ExternalLink,
  Sparkles,
  Download,
  Copy,
  Check,
  Eye
} from 'lucide-react';
import { verifyCertificate } from '../services/certificateService';
import { 
  generateCertificatePDF, 
  downloadPDFBlob, 
  openPDFBlob,
  getSanitizedPDFFilename,
  WORKSHOP_CONFIG 
} from '../utils/pdfGenerator';
import CertificateCanvas from '../components/CertificateCanvas';

export default function VerifyPage() {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [inputCertId, setInputCertId] = useState(certificateId || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [openingTab, setOpeningTab] = useState(false);
  const [copied, setCopied] = useState(false);

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
          workshop_name: location.state.certificate.workshop_name || WORKSHOP_CONFIG.workshopTitle,
          workshop_date: location.state.certificate.workshop_date || WORKSHOP_CONFIG.date,
          location: location.state.certificate.location || WORKSHOP_CONFIG.location,
          issued_by: WORKSHOP_CONFIG.organization,
        });
        setHasSearched(true);
      } else {
        performVerification(certificateId);
      }
    }
  }, [certificateId, location.state]);

  const performVerification = async (idToVerify) => {
    const cleanId = (idToVerify || '').trim();
    if (!cleanId) return;

    setLoading(true);
    setHasSearched(true);
    setResult(null);

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

  const getActiveCertData = () => {
    if (!result || !result.valid) return null;
    return {
      participantName: result.participant_name,
      certificateId: result.certificate_id,
      workshopName: result.workshop_name || WORKSHOP_CONFIG.workshopTitle,
      workshopDate: result.workshop_date || WORKSHOP_CONFIG.date,
      location: result.location || WORKSHOP_CONFIG.location,
      verificationUrl: window.location.origin + '/verify/' + result.certificate_id
    };
  };

  const handleDownloadFromVerify = async () => {
    const certData = getActiveCertData();
    if (!certData) return;
    try {
      setDownloading(true);
      const pdfBlob = await generateCertificatePDF(certData);
      const filename = getSanitizedPDFFilename(certData.participantName);
      downloadPDFBlob(pdfBlob, filename);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Unable to generate PDF at this time.');
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenFromVerify = async () => {
    const certData = getActiveCertData();
    if (!certData) return;
    try {
      setOpeningTab(true);
      const pdfBlob = await generateCertificatePDF(certData);
      openPDFBlob(pdfBlob);
    } catch (err) {
      console.error('Error opening PDF:', err);
      alert('Unable to open PDF preview.');
    } finally {
      setOpeningTab(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const certData = getActiveCertData();

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
            Verify Certificate Authenticity
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Brandsway Skill Academy verifies the authenticity of official workshop participation certificates.
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
                placeholder="Enter Certificate ID (e.g. BRW-AIWB-0001 or BRW-AIRO-0001)"
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
            <p className="text-slate-700 font-semibold">Validating record with Brandsway Skill Academy registry...</p>
          </div>
        )}

        {!loading && hasSearched && result && (
          <>
            {result.valid ? (
              <div className="space-y-6">
                
                {/* 1. Verified Screen Banner (NO TIMER AUTO-REDIRECTION) */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-emerald-500/50 shadow-soft-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-50 rounded-full blur-2xl pointer-events-none" />

                  <div className="relative z-10">
                    
                    {location.state?.justIssued && (
                      <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-sm">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>Registration Successful • Certificate Verified</span>
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
                            Verified by Brandsway Skill Academy
                          </h2>
                        </div>
                      </div>

                      <div className="px-4 py-2 rounded-xl bg-brand-purple-50 border border-brand-purple-200 text-sm font-mono font-bold text-brand-purple-800 self-start sm:self-auto shadow-sm">
                        ID: {result.certificate_id}
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed mb-5">
                      Authenticity officially verified for <strong className="text-slate-900 font-bold">{result.participant_name}</strong> for participation in <span className="text-brand-purple-700 font-bold">"{result.workshop_name || WORKSHOP_CONFIG.workshopTitle}"</span>.
                    </p>

                    {/* Action Buttons: Download PDF, Open PDF, Share Link, Company Website (NO TIMER) */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={handleDownloadFromVerify}
                        disabled={downloading}
                        className="py-3 px-5 rounded-2xl bg-gradient-to-r from-brand-purple-600 to-indigo-700 hover:brightness-105 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-purple-glow transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Download className="w-4 h-4" />
                        <span>{downloading ? 'Preparing PDF...' : 'Download Certificate PDF'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleOpenFromVerify}
                        disabled={openingTab}
                        className="py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Eye className="w-4 h-4 text-indigo-600" />
                        <span>{openingTab ? 'Opening...' : 'Open PDF in Tab'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span className="text-emerald-700">Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-slate-500" />
                            <span>Share Link</span>
                          </>
                        )}
                      </button>

                      <a
                        href="https://thebrandsway.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>Visit thebrandsway.com</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      </a>
                    </div>

                  </div>
                </div>

                {/* 2. Full Certificate Details Card */}
                <div id="certificate-details-card" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft-lg">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        Official Certificate Registry Details
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Verified credential issued by Brandsway Skill Academy
                      </p>
                    </div>

                    <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Record
                    </div>
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
                        {result.workshop_name || WORKSHOP_CONFIG.workshopTitle}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Issued By
                      </div>
                      <div className="text-base font-bold text-slate-800">
                        Brandsway Skill Academy
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Date of Workshop
                      </div>
                      <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-brand-purple-600" />
                        {result.workshop_date || WORKSHOP_CONFIG.date}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Location
                      </div>
                      <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-brand-purple-600" />
                        {result.location || WORKSHOP_CONFIG.location}
                      </div>
                    </div>

                  </div>

                  {/* High Definition Certificate Canvas Preview */}
                  {certData && (
                    <div className="mb-6">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Official Certificate Preview
                      </div>
                      <CertificateCanvas certData={certData} />
                    </div>
                  )}

                  {/* Actions footer */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">
                      Tamper-proof digital certificate issued by Brandsway Skill Academy.
                    </p>
                    <button
                      onClick={handleDownloadFromVerify}
                      disabled={downloading}
                      className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-gradient-to-r from-brand-purple-600 to-indigo-700 hover:brightness-105 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{downloading ? 'Preparing...' : 'Download Official PDF'}</span>
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
                    <li>Verify the exact ID format (e.g. <span className="font-mono text-brand-purple-700 font-bold">BRW-AIWB-0001</span> or <span className="font-mono text-brand-purple-700 font-bold">BRW-AIRO-0001</span>).</li>
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
