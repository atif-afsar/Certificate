import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are live or placeholder
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==============================================================================
// LOCAL DEMO / FALLBACK ENGINE (Ensures full functionality during local review)
// ==============================================================================
const STORAGE_KEY_PARTICIPANTS = 'brandsway_participants_db';
const STORAGE_KEY_CERTIFICATES = 'brandsway_certificates_db';
const STORAGE_KEY_COUNTER = 'brandsway_certificate_counter';

const INITIAL_PARTICIPANTS = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Rahul Sharma', email: 'rahul@example.com', eligible: true, created_at: new Date().toISOString() },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Ayesha Khan', email: 'ayesha@example.com', eligible: true, created_at: new Date().toISOString() },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Mohammed Ali', email: 'mohammed@example.com', eligible: true, created_at: new Date().toISOString() },
  { id: '44444444-4444-4444-4444-444444444444', name: 'Zoya Farooqui', email: 'zoya@example.com', eligible: true, created_at: new Date().toISOString() },
  { id: '55555555-5555-5555-5555-555555555555', name: 'Arjun Verma', email: 'arjun@example.com', eligible: true, created_at: new Date().toISOString() },
  { id: '66666666-6666-6666-6666-666666666666', name: 'Fatima Sana', email: 'fatima@example.com', eligible: true, created_at: new Date().toISOString() },
  { id: '77777777-7777-7777-7777-777777777777', name: 'Bilal Ahmed', email: 'bilal@example.com', eligible: false, created_at: new Date().toISOString() },
];

function getStored(key, defaultVal) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setStored(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

// Initialize seed data if not present
if (!localStorage.getItem(STORAGE_KEY_PARTICIPANTS)) {
  setStored(STORAGE_KEY_PARTICIPANTS, INITIAL_PARTICIPANTS);
}
if (!localStorage.getItem(STORAGE_KEY_CERTIFICATES)) {
  setStored(STORAGE_KEY_CERTIFICATES, []);
}
if (!localStorage.getItem(STORAGE_KEY_COUNTER)) {
  setStored(STORAGE_KEY_COUNTER, 0);
}

export const mockBackend = {
  getParticipants: () => getStored(STORAGE_KEY_PARTICIPANTS, INITIAL_PARTICIPANTS),
  setParticipants: (p) => setStored(STORAGE_KEY_PARTICIPANTS, p),
  getCertificates: () => getStored(STORAGE_KEY_CERTIFICATES, []),
  setCertificates: (c) => setStored(STORAGE_KEY_CERTIFICATES, c),
  
  issueOrGetCertificate: (email, name, baseUrl = window.location.origin) => {
    const participants = getStored(STORAGE_KEY_PARTICIPANTS, INITIAL_PARTICIPANTS);
    const certificates = getStored(STORAGE_KEY_CERTIFICATES, []);
    
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // 1. Auto-register / store participant in database if not found
    let participant = participants.find(p => p.email.trim().toLowerCase() === cleanEmail);
    if (!participant) {
      participant = {
        id: crypto.randomUUID ? crypto.randomUUID() : 'part-' + Date.now(),
        name: cleanName,
        email: cleanEmail,
        eligible: true,
        created_at: new Date().toISOString()
      };
      participants.push(participant);
      setStored(STORAGE_KEY_PARTICIPANTS, participants);
    } else if (cleanName && cleanName !== participant.name) {
      participant.name = cleanName;
      setStored(STORAGE_KEY_PARTICIPANTS, participants);
    }

    // 2. Duplicate check (Idempotent)
    const existing = certificates.find(c => c.participant_id === participant.id);
    if (existing) {
      return {
        success: true,
        is_duplicate: true,
        certificate: existing
      };
    }

    // 3. Issue new
    let counter = getStored(STORAGE_KEY_COUNTER, 0) + 1;
    setStored(STORAGE_KEY_COUNTER, counter);
    const certId = `BRW-AIWB-${String(counter).padStart(4, '0')}`;
    const verificationUrl = `${baseUrl.replace(/\/$/, '')}/verify/${certId}`;

    const newCert = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'cert-' + Date.now(),
      certificate_id: certId,
      participant_id: participant.id,
      participant_name: cleanName || participant.name,
      participant_email: participant.email,
      workshop_name: 'AI Website Building Workshop',
      workshop_date: 'Sunday, 11 October 2026',
      location: 'Aligarh, Uttar Pradesh, India',
      verification_url: verificationUrl,
      created_at: new Date().toISOString()
    };

    certificates.push(newCert);
    setStored(STORAGE_KEY_CERTIFICATES, certificates);

    return {
      success: true,
      is_duplicate: false,
      certificate: newCert
    };
  },

  verifyCertificate: (certId) => {
    const certificates = getStored(STORAGE_KEY_CERTIFICATES, []);
    const cleanId = (certId || '').trim().toUpperCase();
    const cert = certificates.find(c => c.certificate_id.toUpperCase() === cleanId);
    
    if (!cert) {
      return {
        valid: false,
        message: "Certificate Not Found. We could not verify this certificate. Please check the certificate ID and try again."
      };
    }

    // PRD Section 27: Privacy strictly respected (no email or database IDs)
    return {
      valid: true,
      certificate_id: cert.certificate_id,
      participant_name: cert.participant_name,
      workshop_name: cert.workshop_name || 'AI Website Building Workshop',
      workshop_date: cert.workshop_date || 'Sunday, 11 October 2026',
      location: cert.location || 'Aligarh, Uttar Pradesh, India',
      issued_by: 'Brandsway Skill Academy',
      issue_date: cert.created_at,
      verification_url: cert.verification_url
    };
  }
};
