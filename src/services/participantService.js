import { supabase, isSupabaseConfigured, mockBackend } from './supabase';

/**
 * Fetch all participants with their certificate status
 */
export async function getParticipantsWithCertificates() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: participants, error: pErr } = await supabase
        .from('participants')
        .select('*')
        .order('created_at', { ascending: false });

      if (!pErr && participants) {
        const { data: certificates } = await supabase
          .from('certificates')
          .select('*');

        const certs = certificates || [];
        return participants.map(p => {
          const cert = certs.find(c => c.participant_id === p.id);
          return {
            ...p,
            certificate: cert || null,
            certificate_status: cert ? 'ISSUED' : 'PENDING',
          };
        });
      }
      console.warn('Supabase fetch failed, falling back to local database:', pErr);
    } catch (err) {
      console.warn('Supabase participant fetch error, falling back to local database:', err);
    }
  }

  // Local fallback
  const participants = mockBackend.getParticipants();
  const certificates = mockBackend.getCertificates();

  return participants.map(p => {
    const cert = certificates.find(c => c.participant_id === p.id);
    return {
      ...p,
      certificate: cert || null,
      certificate_status: cert ? 'ISSUED' : 'PENDING',
    };
  });
}

/**
 * Add a new participant
 */
export async function addParticipant({ name, email, eligible = true }) {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('participants')
        .insert([{ name: cleanName, email: cleanEmail, eligible }])
        .select()
        .single();

      if (!error && data) {
        return data;
      }
      console.warn('Supabase insert failed, falling back to local database:', error);
    } catch (err) {
      console.warn('Supabase addParticipant error, falling back to local database:', err);
    }
  }

  const participants = mockBackend.getParticipants();
  if (participants.some(p => p.email.toLowerCase() === cleanEmail)) {
    throw new Error('A participant with this email address already exists.');
  }

  const newP = {
    id: crypto.randomUUID ? crypto.randomUUID() : 'part-' + Date.now(),
    name: cleanName,
    email: cleanEmail,
    eligible,
    created_at: new Date().toISOString()
  };

  participants.unshift(newP);
  mockBackend.setParticipants(participants);
  return newP;
}

/**
 * Toggle participant eligibility
 */
export async function toggleEligibility(participantId, newStatus) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('participants')
        .update({ eligible: newStatus })
        .eq('id', participantId)
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('Supabase toggleEligibility error, falling back to local database:', err);
    }
  }

  const participants = mockBackend.getParticipants();
  const index = participants.findIndex(p => p.id === participantId);
  if (index !== -1) {
    participants[index].eligible = newStatus;
    mockBackend.setParticipants(participants);
    return participants[index];
  }
  throw new Error('Participant not found.');
}

/**
 * Regenerate / Correct participant name on existing certificate (PRD Section 20)
 * The certificate ID remains unchanged.
 */
export async function regenerateCertificateName(participantId, correctedName) {
  const cleanName = correctedName.trim();
  if (!cleanName) throw new Error('Valid name is required.');

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Update participant record
      await supabase
        .from('participants')
        .update({ name: cleanName })
        .eq('id', participantId);

      // 2. Update certificate record
      const { data, error } = await supabase
        .from('certificates')
        .update({ participant_name: cleanName })
        .eq('participant_id', participantId)
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('Supabase regenerateCertificateName error, falling back to local database:', err);
    }
  }

  const participants = mockBackend.getParticipants();
  const certificates = mockBackend.getCertificates();

  const p = participants.find(part => part.id === participantId);
  if (p) p.name = cleanName;

  const cert = certificates.find(c => c.participant_id === participantId);
  if (cert) cert.participant_name = cleanName;

  mockBackend.setParticipants(participants);
  mockBackend.setCertificates(certificates);

  return cert;
}

/**
 * Import participants from CSV string (PRD Section 19)
 */
export async function importParticipantsFromCSV(csvText) {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    throw new Error('CSV is empty or missing data rows.');
  }

  const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const nameIdx = header.findIndex(h => h.includes('name'));
  const emailIdx = header.findIndex(h => h.includes('email'));

  if (nameIdx === -1 || emailIdx === -1) {
    throw new Error('CSV must contain "name" and "email" columns in header row.');
  }

  const validEntries = [];
  const existingParticipants = await getParticipantsWithCertificates();
  const existingEmails = new Set(existingParticipants.map(p => p.email.toLowerCase()));
  let skippedDuplicates = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
    const name = cols[nameIdx];
    const email = cols[emailIdx]?.toLowerCase();

    if (!name || !email || !email.includes('@')) continue;

    if (existingEmails.has(email)) {
      skippedDuplicates++;
    } else {
      existingEmails.add(email);
      validEntries.push({ name, email, eligible: true });
    }
  }

  if (validEntries.length === 0) {
    return {
      importedCount: 0,
      skippedDuplicates,
      message: `No new participants to import. ${skippedDuplicates} duplicate(s) skipped.`
    };
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('participants').insert(validEntries);
      if (!error) {
        return {
          importedCount: validEntries.length,
          skippedDuplicates,
          message: `${validEntries.length} participants imported successfully. (${skippedDuplicates} duplicates skipped)`
        };
      }
    } catch (err) {
      console.warn('Supabase CSV insert error, falling back to local database:', err);
    }
  }

  const current = mockBackend.getParticipants();
  const newItems = validEntries.map(v => ({
    id: crypto.randomUUID ? crypto.randomUUID() : 'part-' + Math.random(),
    name: v.name,
    email: v.email,
    eligible: true,
    created_at: new Date().toISOString()
  }));
  mockBackend.setParticipants([...newItems, ...current]);

  return {
    importedCount: validEntries.length,
    skippedDuplicates,
    message: `${validEntries.length} participants imported successfully. (${skippedDuplicates} duplicates skipped)`
  };
}
