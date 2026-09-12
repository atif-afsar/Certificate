import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Download, ExternalLink, Copy, Check, Sparkles, Award, ArrowLeft, ShieldCheck } from 'lucide-react';
import CertificateCanvas from '../components/CertificateCanvas';
import { generateCertificatePDF, downloadPDFBlob } from '../utils/pdfGenerator';

export default function SuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const certificate = location.state?.certificate;
  const isDuplicate = location.state?.isDuplicate;

  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!certificate) {
      navigate('/certificate', { replace: true });
      return;
    }

    try {
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#7C3AED', '#4F46E5', '#D4AF37', '#10B981', '#F59E0B']
      });
    } catch (e) {
      // Ignore
    }
  }, [certificate, navigate]);

  if (!certificate) return null;

  const verificationUrl = certificate.verification_url || `${window.location.origin}/verify/${certificate.certificate_id}`;

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
      const pdfBlob = await generateCertificatePDF({
        participantName: certificate.participant_name,
        certificateId: certificate.certificate_id,
        workshopName: certificate.workshop_name || 'AI for Real Opportunities',
        workshopDate: certificate.workshop_date ? new Date(certificate.workshop_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '13 September 2026',
        location: certificate.location || 'Aligarh, India',
        verificationUrl
      });
      
      downloadPDFBlob(pdfBlob, `${certificate.certificate_id}_${certificate.participant_name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF download error:', err);
      alert("We couldn't generate your certificate right now. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-mesh-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation back */}
        <div className="mb-6">
          <Link
            to="/certificate"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-purple-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Certificate Form
          </Link>
        </div>

        {/* Success Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> 
            {isDuplicate ? 'Certificate Already Issued' : 'Registration Complete • Certificate Ready'}
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-2">
            Congratulations!
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Your official Certificate of Participation is ready.
          </p>
          <p className="text-sm text-brand-purple-700 font-bold mt-1">
            "AI for Real Opportunities" • 13 September 2026 • The BrandsWay Skill Academy
          </p>
        </div>

        {/* Certificate Details Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft-sm">
            <div className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1">
              Awarded To
            </div>
            <div className="text-lg font-bold text-slate-900 truncate">
              {certificate.participant_name}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft-sm">
            <div className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1">
              Certificate ID
            </div>
            <div className="text-lg font-bold text-brand-purple-700 font-mono">
              {certificate.certificate_id}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft-sm">
            <div className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1">
              Issuer
            </div>
            <div className="text-lg font-bold text-slate-900 truncate">
              The BrandsWay Skill Academy
            </div>
          </div>
        </div>

        {/* High Definition Interactive Certificate Canvas Preview */}
        <div className="mb-8">
          <CertificateCanvas
            certData={{
              participantName: certificate.participant_name,
              certificateId: certificate.certificate_id,
              workshopName: certificate.workshop_name || 'AI for Real Opportunities',
              workshopDate: '13 September 2026',
              location: certificate.location || 'Aligarh, India',
              verificationUrl
            }}
          />
          <p className="text-center text-xs text-slate-400 mt-2.5">
            Tip: Click the expand icon on the top right for a fullscreen inspection.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-soft-lg">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* 1. Download Certificate */}
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-brand-purple-600 via-purple-600 to-indigo-700 text-white font-bold text-sm shadow-purple-glow hover:shadow-purple-glow-lg hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Preparing PDF...' : 'Download Certificate PDF'}</span>
            </button>

            {/* 2. Verify Certificate */}
            <Link
              to={`/verify/${certificate.certificate_id}`}
              className="w-full py-4 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verify Certificate</span>
            </Link>

            {/* 3. Copy Verification Link */}
            <button
              onClick={handleCopyLink}
              className="w-full py-4 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
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

          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <span className="truncate">Direct verification link: <span className="font-mono text-slate-800 font-semibold">{verificationUrl}</span></span>
            <a
              href="https://thebrandsway.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-purple-700 hover:underline font-semibold flex items-center gap-1"
            >
              <span>Visit thebrandsway.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
