import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  Award, 
  ArrowLeft, 
  ShieldCheck, 
  Eye, 
  Calendar, 
  MapPin, 
  Building2,
  FileCheck
} from 'lucide-react';
import CertificateCanvas from '../components/CertificateCanvas';
import { 
  generateCertificatePDF, 
  downloadPDFBlob, 
  openPDFBlob,
  getSanitizedPDFFilename,
  WORKSHOP_CONFIG 
} from '../utils/pdfGenerator';

export default function SuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const certificate = location.state?.certificate;
  const isDuplicate = location.state?.isDuplicate;

  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [openingTab, setOpeningTab] = useState(false);

  useEffect(() => {
    if (!certificate) {
      navigate('/certificate', { replace: true });
      return;
    }

    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#7C3AED', '#4F46E5', '#D4AF37', '#10B981', '#F59E0B']
      });
    } catch (e) {
      // Ignore in headless / test envs
    }
  }, [certificate, navigate]);

  if (!certificate) return null;

  const verificationUrl = certificate.verification_url || `${window.location.origin}/verify/${certificate.certificate_id}`;
  const participantName = certificate.participant_name || 'Participant';
  const workshopName = certificate.workshop_name || WORKSHOP_CONFIG.workshopTitle;
  const workshopDate = certificate.workshop_date || WORKSHOP_CONFIG.date;
  const workshopLocation = certificate.location || WORKSHOP_CONFIG.location;
  const certId = certificate.certificate_id;

  const certData = {
    participantName,
    certificateId: certId,
    workshopName,
    workshopDate,
    location: workshopLocation,
    verificationUrl
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const pdfBlob = await generateCertificatePDF(certData);
      const filename = getSanitizedPDFFilename(participantName);
      downloadPDFBlob(pdfBlob, filename);
    } catch (err) {
      console.error('PDF download error:', err);
      alert("We couldn't generate your certificate right now. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenInNewTab = async () => {
    try {
      setOpeningTab(true);
      const pdfBlob = await generateCertificatePDF(certData);
      openPDFBlob(pdfBlob);
    } catch (err) {
      console.error('PDF open error:', err);
      alert("Unable to open PDF preview. Please use direct download.");
    } finally {
      setOpeningTab(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-mesh-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation back */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/certificate"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-purple-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Issue Another Certificate
          </Link>
          <div className="text-xs text-slate-500 font-mono">
            Status: <span className="font-bold text-emerald-600">VERIFIED & ISSUED</span>
          </div>
        </div>

        {/* Success Banner Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" /> 
            {isDuplicate ? 'Existing Certificate Retrieved' : 'Registration Complete • Certificate Ready'}
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-2">
            Congratulations, <span className="text-brand-purple-600">{participantName}</span>!
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto">
            Your official Certificate of Participation has been generated and digitally verified by Brandsway Skill Academy.
          </p>
          
          <div className="inline-flex flex-wrap items-center justify-center gap-2 mt-3 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            <span className="font-bold text-brand-purple-700">{workshopName}</span>
            <span>•</span>
            <span>{workshopDate}</span>
            <span>•</span>
            <span>{workshopLocation}</span>
          </div>
        </div>

        {/* =========================================================================
            VERY PROMINENT DOWNLOAD & ACTION HERO CARD (Requested in Prompt)
           ========================================================================= */}
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-white border-2 border-brand-purple-300 shadow-purple-glow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4 text-left">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-purple-glow flex-shrink-0">
                  <FileCheck className="w-9 h-9" />
                </div>
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-widest text-brand-purple-700">
                    Ready For Instant Download
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Download Your Certificate
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Official high-resolution print PDF (A4 Landscape) with embedded verification QR code.
                  </p>
                </div>
              </div>

              <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-left sm:text-right flex-shrink-0">
                <div className="text-[11px] uppercase font-bold text-slate-400">Certificate ID</div>
                <div className="text-lg font-mono font-black text-brand-purple-700">{certId}</div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              
              {/* PRIMARY PROMINENT DOWNLOAD BUTTON */}
              <button
                type="button"
                id="download-cert-pdf-btn"
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="col-span-1 sm:col-span-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-purple-600 via-purple-600 to-indigo-700 hover:brightness-105 active:scale-[0.99] text-white font-extrabold text-base shadow-purple-glow hover:shadow-purple-glow-lg transition-all flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-50"
              >
                <Download className="w-6 h-6 group-hover:-translate-y-0.5 transition-transform" />
                <div className="text-left">
                  <div>{downloading ? 'Preparing High-Res PDF...' : 'Download Certificate (PDF)'}</div>
                  <div className="text-[11px] font-normal text-purple-200">Standard A4 Landscape • Ready to Print</div>
                </div>
              </button>

              {/* MOBILE FALLBACK: OPEN PDF IN NEW TAB */}
              <button
                type="button"
                id="open-cert-pdf-btn"
                onClick={handleOpenInNewTab}
                disabled={openingTab}
                className="py-4 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                title="View directly in browser tab (Mobile Friendly)"
              >
                <Eye className="w-5 h-5 text-indigo-600" />
                <div className="text-left">
                  <div>{openingTab ? 'Opening...' : 'Open PDF in Tab'}</div>
                  <div className="text-[10px] text-slate-500 font-normal">Mobile View Option</div>
                </div>
              </button>

              {/* VERIFY ONLINE / SHARE LINK */}
              <div className="flex flex-col gap-2">
                <Link
                  to={`/verify/${certId}`}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verify Online</span>
                </Link>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-brand-purple-600" />
                      <span>Copy Verification Link</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
              <span className="truncate">
                Public verification URL: <span className="font-mono text-slate-800 font-semibold">{verificationUrl}</span>
              </span>
              <a
                href="https://thebrandsway.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-purple-700 hover:underline font-semibold flex items-center gap-1 flex-shrink-0"
              >
                <span>thebrandsway.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>
        </div>

        {/* Certificate Metadata Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft-sm">
            <div className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1">
              Awarded To
            </div>
            <div className="text-lg font-bold text-slate-900 truncate">
              {participantName}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft-sm">
            <div className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1">
              Certificate Credential ID
            </div>
            <div className="text-lg font-bold text-brand-purple-700 font-mono">
              {certId}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft-sm">
            <div className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1">
              Issuing Organization
            </div>
            <div className="text-lg font-bold text-slate-900 truncate">
              Brandsway Skill Academy
            </div>
          </div>
        </div>

        {/* High Definition Interactive Certificate Canvas Preview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-brand-purple-600" />
              High-Definition Certificate Preview
            </div>
            <span className="text-xs text-slate-400">Click expand on top right for full-screen</span>
          </div>

          <CertificateCanvas certData={certData} />
        </div>

      </div>
    </div>
  );
}
