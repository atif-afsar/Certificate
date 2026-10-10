import { supabase, isSupabaseConfigured, mockBackend } from './supabase';

/**
 * Service to issue or retrieve certificates with duplicate prevention.
 * Uses atomic Supabase stored procedure if available, with seamless local fallback.
 */
export async function issueCertificate({ email, name, baseUrl }) {
  const effectiveBaseUrl = baseUrl || window.location.origin;

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Call atomic stored procedure on Supabase
      const { data, error } = await supabase.rpc('issue_or_get_certificate', {
        p_email: email,
        p_name: name,
        p_base_url: effectiveBaseUrl,
      });

      if (!error && data && data.success) {
        return {
          isDuplicate: data.is_duplicate,
          certificate: data.certificate,
        };
      }
      console.warn('Supabase RPC unavailable or returned error, utilizing local resilient engine:', error || data?.message);
    } catch (err) {
      console.warn('Supabase issuance network error, utilizing local resilient engine:', err);
    }
  }

  // Graceful fallback / Local Demo Mode
  await new Promise(r => setTimeout(r, 400));
  const res = mockBackend.issueOrGetCertificate(email, name, effectiveBaseUrl);
  if (!res.success) {
    throw new Error(res.message);
  }
  return {
    isDuplicate: res.is_duplicate,
    certificate: res.certificate,
  };
}

/**
 * Service for public certificate verification (Strictly privacy safe)
 */
export async function verifyCertificate(certificateId) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.rpc('verify_certificate_public', {
        p_cert_id: certificateId,
      });

      if (!error && data && data.valid) {
        return data;
      }
      console.warn('Supabase verification unavailable, checking local database:', error);
    } catch (err) {
      console.warn('Supabase verification network error, checking local database:', err);
    }
  }

  // Fallback / Local Demo Mode
  await new Promise(r => setTimeout(r, 300));
  return mockBackend.verifyCertificate(certificateId);
}
