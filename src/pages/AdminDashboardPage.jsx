import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  CheckCircle, 
  Award, 
  Clock, 
  Search, 
  UploadCloud, 
  UserPlus, 
  Edit3, 
  Download, 
  ExternalLink, 
  RefreshCw, 
  FileSpreadsheet, 
  Check, 
  X, 
  AlertCircle,
  Shield,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getParticipantsWithCertificates, 
  addParticipant, 
  toggleEligibility, 
  regenerateCertificateName, 
  importParticipantsFromCSV 
} from '../services/participantService';
import { issueCertificate } from '../services/certificateService';
import { generateCertificatePDF, downloadPDFBlob, getSanitizedPDFFilename, WORKSHOP_CONFIG } from '../utils/pdfGenerator';

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ISSUED, PENDING, INELIGIBLE

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);

  // Form states
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [csvResult, setCsvResult] = useState(null);

  // Regeneration state
  const [targetParticipant, setTargetParticipant] = useState(null);
  const [correctedName, setCorrectedName] = useState('');

  // Action feedback toast
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login');
    }
  }, [user, authLoading, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getParticipantsWithCertificates();
      setParticipants(data);
    } catch (err) {
      console.error('Failed to load participants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Metric Computations
  const metrics = useMemo(() => {
    const total = participants.length;
    const eligible = participants.filter(p => p.eligible).length;
    const generated = participants.filter(p => p.certificate).length;
    const remaining = Math.max(0, eligible - generated);

    return { total, eligible, generated, remaining };
  }, [participants]);

  // Filtering and Searching
  const filteredParticipants = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return participants.filter(p => {
      const matchesSearch = 
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.certificate?.certificate_id && p.certificate.certificate_id.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (statusFilter === 'ISSUED') return Boolean(p.certificate);
      if (statusFilter === 'PENDING') return !p.certificate && p.eligible;
      if (statusFilter === 'INELIGIBLE') return !p.eligible;
      return true;
    });
  }, [participants, searchQuery, statusFilter]);

  // Handler: Toggle Eligibility
  const handleToggleEligibility = async (p) => {
    try {
      const updated = await toggleEligibility(p.id, !p.eligible);
      setParticipants(prev => prev.map(item => item.id === p.id ? { ...item, eligible: updated.eligible } : item));
      showToast(`Eligibility updated for ${p.name}`);
    } catch (err) {
      showToast(`Error updating eligibility: ${err.message}`);
    }
  };

  // Handler: Single Participant Add
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!newName.trim() || !newEmail.trim()) {
      setFormError('Name and email are required.');
      return;
    }
    try {
      await addParticipant({ name: newName, email: newEmail, eligible: true });
      setShowAddModal(false);
      setNewName('');
      setNewEmail('');
      await loadData();
      showToast('Participant registered successfully!');
    } catch (err) {
      setFormError(err.message || 'Failed to add participant.');
    }
  };

  // Handler: Generate certificate directly from admin
  const handleAdminGenerate = async (p) => {
    try {
      showToast(`Generating certificate for ${p.name}...`);
      await issueCertificate({ email: p.email, name: p.name, baseUrl: window.location.origin });
      await loadData();
      showToast(`Certificate created for ${p.name}!`);
    } catch (err) {
      showToast(`Generation failed: ${err.message}`);
    }
  };

  // Handler: Download Certificate PDF from admin
  const handleAdminDownload = async (p) => {
    if (!p.certificate) return;
    try {
      showToast(`Rendering PDF for ${p.certificate.certificate_id}...`);
      const participantName = p.certificate.participant_name || p.name;
      const pdfBlob = await generateCertificatePDF({
        participantName,
        certificateId: p.certificate.certificate_id,
        workshopName: p.certificate.workshop_name || WORKSHOP_CONFIG.workshopTitle,
        workshopDate: p.certificate.workshop_date || WORKSHOP_CONFIG.date,
        location: p.certificate.location || WORKSHOP_CONFIG.location,
        verificationUrl: window.location.origin + '/verify/' + p.certificate.certificate_id
      });
      const filename = getSanitizedPDFFilename(participantName);
      downloadPDFBlob(pdfBlob, filename);
      showToast(`Downloaded certificate for ${participantName}`);
    } catch (err) {
      showToast(`Download failed: ${err.message}`);
    }
  };

  // Handler: Correct Name & Regenerate
  const handleOpenRegenModal = (p) => {
    setTargetParticipant(p);
    setCorrectedName(p.certificate?.participant_name || p.name);
    setShowRegenModal(true);
  };

  const handleRegenSubmit = async (e) => {
    e.preventDefault();
    if (!correctedName.trim() || !targetParticipant) return;
    try {
      await regenerateCertificateName(targetParticipant.id, correctedName);
      setShowRegenModal(false);
      setTargetParticipant(null);
      await loadData();
      showToast(`Certificate name updated to "${correctedName}". ID preserved.`);
    } catch (err) {
      alert(`Regeneration failed: ${err.message}`);
    }
  };

  // Handler: CSV Import
  const handleCSVImport = async (e) => {
    e.preventDefault();
    if (!csvContent.trim()) return;
    try {
      const res = await importParticipantsFromCSV(csvContent);
      setCsvResult(res);
      await loadData();
      showToast(res.message);
    } catch (err) {
      setCsvResult({ error: err.message });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setCsvContent(evt.target.result || '');
    };
    reader.readAsText(file);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-mesh-white flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-brand-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-mesh-white py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-white border border-brand-purple-300 shadow-soft-lg text-slate-800 text-sm flex items-center gap-2.5 backdrop-blur-md animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Workshop Organizer Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-purple-50 text-brand-purple-700 border border-brand-purple-200">
              Admin
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            "AI Website Building Workshop" • Sunday, 11 October 2026 • Brandsway Skill Academy • Aligarh, UP, India
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => { setShowCSVModal(true); setCsvResult(null); }}
            className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-soft-sm transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-brand-purple-600" />
            <span>CSV Import</span>
          </button>

          <button
            onClick={() => { setShowAddModal(true); setFormError(''); }}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-purple-600 to-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-purple-glow hover:brightness-105 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Participant</span>
          </button>

          <button
            onClick={loadData}
            title="Refresh participant records"
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 shadow-soft-sm transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Total Participants
            </span>
            <Users className="w-4 h-4 text-brand-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-sans">
            {metrics.total}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Eligible
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-sans">
            {metrics.eligible}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Certificates Issued
            </span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600 font-sans">
            {metrics.generated}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Remaining
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 font-sans">
            {metrics.remaining}
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-soft-sm">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email, ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:bg-white focus:outline-none focus:border-brand-purple-600 focus:ring-2 focus:ring-brand-purple-100 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'ISSUED', label: 'Issued' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'INELIGIBLE', label: 'Ineligible' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-brand-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

      </div>

      {/* Participants Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-soft-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-4 sm:px-6">Participant Name</th>
                <th className="py-4 px-4">Email</th>
                <th className="py-4 px-4 text-center">Eligible</th>
                <th className="py-4 px-4">Certificate Status</th>
                <th className="py-4 px-4">Certificate ID</th>
                <th className="py-4 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-brand-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading participant records...
                  </td>
                </tr>
              ) : filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No participants match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p) => {
                  const hasCert = Boolean(p.certificate);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Name */}
                      <td className="py-4 px-4 sm:px-6 font-bold text-slate-900">
                        {p.certificate?.participant_name || p.name}
                        {p.certificate?.participant_name && p.certificate.participant_name !== p.name && (
                          <span className="ml-2 text-[10px] text-brand-purple-700 font-semibold" title={`Registered as: ${p.name}`}>
                            (Renamed)
                          </span>
                        )}
                      </td>

                      {/* Email */}
                      <td className="py-4 px-4 text-slate-600 font-mono text-[11px]">
                        {p.email}
                      </td>

                      {/* Eligible Toggle */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleEligibility(p)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                            p.eligible
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                          title="Click to toggle participant eligibility"
                        >
                          {p.eligible ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {p.eligible ? 'Eligible' : 'Ineligible'}
                        </button>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          hasCert
                            ? 'bg-brand-purple-50 text-brand-purple-700 border border-brand-purple-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {hasCert ? 'ISSUED' : 'PENDING'}
                        </span>
                      </td>

                      {/* Certificate ID */}
                      <td className="py-4 px-4 font-mono font-bold text-brand-purple-700">
                        {p.certificate?.certificate_id || '—'}
                      </td>

                      {/* Actions: View, Generate, Download, Regenerate */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {hasCert ? (
                            <>
                              {/* View / Verify */}
                              <Link
                                to={`/verify/${p.certificate.certificate_id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-brand-purple-700 hover:bg-slate-200 transition-colors"
                                title="Verify online"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>

                              {/* Download PDF */}
                              <button
                                onClick={() => handleAdminDownload(p)}
                                className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-emerald-700 hover:bg-slate-200 transition-colors cursor-pointer"
                                title="Download PDF"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>

                              {/* Regenerate / Correct Name */}
                              <button
                                onClick={() => handleOpenRegenModal(p)}
                                className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-brand-purple-700 hover:bg-slate-200 transition-colors cursor-pointer"
                                title="Correct participant name & regenerate"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            /* Manual generate */
                            <button
                              onClick={() => handleAdminGenerate(p)}
                              disabled={!p.eligible}
                              className="px-3 py-1.5 rounded-xl bg-brand-purple-600 hover:bg-brand-purple-700 text-white text-[11px] font-bold disabled:opacity-40 cursor-pointer shadow-sm"
                            >
                              Generate
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Single Participant Add */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Add Workshop Participant</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-brand-purple-600 focus:ring-2 focus:ring-brand-purple-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-brand-purple-600 focus:ring-2 focus:ring-brand-purple-100"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-purple-600 text-white text-xs font-bold hover:bg-brand-purple-700"
                >
                  Add Participant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: CSV Bulk Import */}
      {showCSVModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-brand-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Bulk CSV Import</h3>
              </div>
              <button onClick={() => setShowCSVModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Import participant roster using a standard CSV with columns: <span className="font-mono font-bold text-brand-purple-700">name,email</span>.
            </p>

            {csvResult && (
              <div className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                csvResult.error
                  ? 'bg-rose-50 border border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              }`}>
                {csvResult.error ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle className="w-4 h-4 text-emerald-600" />}
                <span>{csvResult.error || csvResult.message}</span>
              </div>
            )}

            <form onSubmit={handleCSVImport} className="space-y-4">
              <div>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-brand-purple-700 hover:file:bg-brand-purple-50 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Or paste CSV contents directly:
                </label>
                <textarea
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  placeholder={`name,email\nRahul Sharma,rahul@example.com\nAyesha Khan,ayesha@example.com`}
                  rows="6"
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:border-brand-purple-600 focus:ring-2 focus:ring-brand-purple-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCSVModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={!csvContent.trim()}
                  className="px-4 py-2 rounded-xl bg-brand-purple-600 text-white text-xs font-bold hover:bg-brand-purple-700 disabled:opacity-50"
                >
                  Import Participants
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Name Correction / Regeneration */}
      {showRegenModal && targetParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Correct Name & Regenerate</h3>
              <button onClick={() => setShowRegenModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Fix spelling or casing. The Certificate ID (<span className="font-mono font-bold text-brand-purple-700">{targetParticipant.certificate?.certificate_id}</span>) remains unchanged.
            </p>

            <form onSubmit={handleRegenSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Corrected Full Name
                </label>
                <input
                  type="text"
                  value={correctedName}
                  onChange={(e) => setCorrectedName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-brand-purple-600 focus:ring-2 focus:ring-brand-purple-100"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegenModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-purple-600 text-white text-xs font-bold hover:bg-brand-purple-700"
                >
                  Save & Regenerate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
