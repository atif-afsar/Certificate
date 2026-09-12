import { supabase, isSupabaseConfigured, mockBackend } from './supabase';

/**
 * Service to issue or retrieve certificates with duplicate prevention
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

      if (error) {
        console.error('Supabase RPC error:', error);
        throw new Error('Something went wrong while processing your certificate. Please try again.');
      }

      if (!data.success) {
        throw new Error(data.message || 'Validation failed.');
      }

      return {
        isDuplicate: data.is_duplicate,
        certificate: data.certificate,
      };
    } catch (err) {
      console.error('Certificate issuance failure:', err);
      throw err;
    }
  }

  // Graceful fallback / Local Demo Mode
  await new Promise(r => setTimeout(r, 600)); // realistic network delay
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

      if (error) {
        console.error('Verification RPC error:', error);
        throw new Error('Something went wrong while verifying this certificate.');
      }

      return data;
    } catch (err) {
      console.error('Verification failure:', err);
      throw err;
    }
  }

  // Fallback / Local Demo Mode
  await new Promise(r => setTimeout(r, 400));
  return mockBackend.verifyCertificate(certificateId);
}
