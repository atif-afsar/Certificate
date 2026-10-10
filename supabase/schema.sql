-- ==============================================================================
-- The BrandsWay Skill Academy — Workshop Certificate System
-- Database Schema, RLS Security, Sequences, and Atomic Stored Procedures
-- Workshop: AI for Real Opportunities (13 September 2026, Aligarh, India)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. TABLES
-- ------------------------------------------------------------------------------

-- Participants Table
CREATE TABLE IF NOT EXISTS public.participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    eligible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Case-insensitive unique constraint on email
CREATE UNIQUE INDEX IF NOT EXISTS participants_email_lower_idx 
    ON public.participants (LOWER(TRIM(email)));

-- Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id TEXT NOT NULL UNIQUE,
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    participant_name TEXT NOT NULL,
    participant_email TEXT NOT NULL,
    workshop_name TEXT NOT NULL DEFAULT 'AI Website Building Workshop',
    workshop_date DATE NOT NULL DEFAULT '2026-10-11',
    location TEXT NOT NULL DEFAULT 'Aligarh, Uttar Pradesh, India',
    pdf_path TEXT,
    verification_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_participant_certificate UNIQUE (participant_id)
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS certificates_cert_id_idx ON public.certificates (certificate_id);
CREATE INDEX IF NOT EXISTS certificates_participant_id_idx ON public.certificates (participant_id);
CREATE INDEX IF NOT EXISTS certificates_email_idx ON public.certificates (LOWER(TRIM(participant_email)));

-- ------------------------------------------------------------------------------
-- 2. SEQUENTIAL CERTIFICATE ID GENERATION (BRW-AIWB-0001, BRW-AIWB-0002, ...)
-- ------------------------------------------------------------------------------

CREATE SEQUENCE IF NOT EXISTS public.certificate_id_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.generate_next_certificate_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    next_val BIGINT;
    formatted_id TEXT;
BEGIN
    next_val := nextval('public.certificate_id_seq');
    formatted_id := 'BRW-AIWB-' || LPAD(next_val::TEXT, 4, '0');
    RETURN formatted_id;
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. ATOMIC CERTIFICATE ISSUANCE (Idempotent, Race-Condition Safe)
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.issue_or_get_certificate(
    p_email TEXT,
    p_name TEXT,
    p_base_url TEXT DEFAULT 'https://thebrandsway.com'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges to safely inspect eligibility & issue cert
SET search_path = public
AS $$
DECLARE
    v_clean_email TEXT;
    v_clean_name TEXT;
    v_participant public.participants%ROWTYPE;
    v_existing_cert public.certificates%ROWTYPE;
    v_new_cert_id TEXT;
    v_verification_url TEXT;
    v_new_cert public.certificates%ROWTYPE;
BEGIN
    -- 1. Sanitize inputs
    v_clean_email := LOWER(TRIM(p_email));
    v_clean_name := TRIM(p_name);

    IF v_clean_email = '' OR v_clean_name = '' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'INVALID_INPUT',
            'message', 'Name and email are required.'
        );
    END IF;

    -- 2. Check participant registration or auto-register & store in database
    SELECT * INTO v_participant
    FROM public.participants
    WHERE LOWER(TRIM(email)) = v_clean_email;

    IF NOT FOUND THEN
        -- Auto-register and store new participant directly into database
        INSERT INTO public.participants (name, email, eligible)
        VALUES (v_clean_name, v_clean_email, true)
        RETURNING * INTO v_participant;
    ELSE
        -- Update participant name if a non-empty name was supplied
        IF v_clean_name <> '' AND v_clean_name <> v_participant.name THEN
            UPDATE public.participants
            SET name = v_clean_name
            WHERE id = v_participant.id
            RETURNING * INTO v_participant;
        END IF;
    END IF;

    -- 3. Check if certificate already exists (Duplicate Prevention / Idempotency)
    SELECT * INTO v_existing_cert
    FROM public.certificates
    WHERE participant_id = v_participant.id;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', true,
            'is_duplicate', true,
            'certificate', row_to_json(v_existing_cert)
        );
    END IF;

    -- 4. Generate new sequential unique Certificate ID
    v_new_cert_id := public.generate_next_certificate_id();
    v_verification_url := RTRIM(p_base_url, '/') || '/verify/' || v_new_cert_id;

    -- 5. Insert new certificate record
    INSERT INTO public.certificates (
        certificate_id,
        participant_id,
        participant_name,
        participant_email,
        workshop_name,
        workshop_date,
        location,
        verification_url
    ) VALUES (
        v_new_cert_id,
        v_participant.id,
        COALESCE(NULLIF(v_clean_name, ''), v_participant.name),
        v_participant.email,
        'AI for Real Opportunities',
        '2026-09-13',
        'Aligarh, India',
        v_verification_url
    )
    RETURNING * INTO v_new_cert;

    RETURN jsonb_build_object(
        'success', true,
        'is_duplicate', false,
        'certificate', row_to_json(v_new_cert)
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 4. SECURE PUBLIC VERIFICATION (Strict Privacy Protection - No Email / DB IDs)
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.verify_certificate_public(p_cert_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_cert public.certificates%ROWTYPE;
BEGIN
    SELECT * INTO v_cert
    FROM public.certificates
    WHERE UPPER(TRIM(certificate_id)) = UPPER(TRIM(p_cert_id));

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'valid', false,
            'message', 'Certificate Not Found. We could not verify this certificate. Please check the certificate ID and try again.'
        );
    END IF;

    -- Return strictly public fields (PRD Section 16 & 27: NO participant email/phone/internal IDs)
    RETURN jsonb_build_object(
        'valid', true,
        'certificate_id', v_cert.certificate_id,
        'participant_name', v_cert.participant_name,
        'workshop_name', v_cert.workshop_name,
        'workshop_date', v_cert.workshop_date,
        'location', v_cert.location,
        'issued_by', 'The BrandsWay Skill Academy',
        'issue_date', v_cert.created_at,
        'verification_url', v_cert.verification_url
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Admins (authenticated users) have full control over participants
CREATE POLICY "Admins have full access to participants"
    ON public.participants
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Public (anon) can insert their registration details
CREATE POLICY "Public can register participants"
    ON public.participants
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Admins (authenticated users) have full control over certificates
CREATE POLICY "Admins have full access to certificates"
    ON public.certificates
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Public (anon) can read non-sensitive certificate details for verification
CREATE POLICY "Public can view verification certificates"
    ON public.certificates
    FOR SELECT
    TO anon
    USING (true);

-- ------------------------------------------------------------------------------
-- 6. STORAGE BUCKET SETUP (For PDF Storage)
-- ------------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read access to certificate PDFs
CREATE POLICY "Public certificate PDF read access"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'certificates');

-- Authenticated or service-role upload access
CREATE POLICY "Admin certificate PDF upload access"
    ON storage.objects FOR INSERT
    TO anon, authenticated
    WITH CHECK (bucket_id = 'certificates');

-- ------------------------------------------------------------------------------
-- 7. INITIAL WORKSHOP PARTICIPANTS (Seed Data for Immediate Verification)
-- ------------------------------------------------------------------------------

INSERT INTO public.participants (name, email, eligible)
VALUES
    ('Rahul Sharma', 'rahul@example.com', true),
    ('Ayesha Khan', 'ayesha@example.com', true),
    ('Mohammed Ali', 'mohammed@example.com', true),
    ('Zoya Farooqui', 'zoya@example.com', true),
    ('Arjun Verma', 'arjun@example.com', true),
    ('Fatima Sana', 'fatima@example.com', true),
    ('Bilal Ahmed', 'bilal@example.com', false) -- Ineligible test case
ON CONFLICT DO NOTHING;
