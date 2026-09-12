-- ==============================================================================
-- RUN THIS IN SUPABASE SQL EDITOR TO ENABLE OPEN REGISTRATION
-- (Auto-stores any user into participants database & generates certificate)
-- ==============================================================================

-- 1. Update the atomic issue procedure to auto-store participants
CREATE OR REPLACE FUNCTION public.issue_or_get_certificate(
    p_email TEXT,
    p_name TEXT,
    p_base_url TEXT DEFAULT 'https://thebrandsway.com'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Elevated privileges to auto-store participant & issue cert
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

    -- 2. Check participant registration OR auto-register & store in database!
    SELECT * INTO v_participant
    FROM public.participants
    WHERE LOWER(TRIM(email)) = v_clean_email;

    IF NOT FOUND THEN
        -- Auto-register: store new attendee in database immediately
        INSERT INTO public.participants (name, email, eligible)
        VALUES (v_clean_name, v_clean_email, true)
        RETURNING * INTO v_participant;
    ELSE
        -- Update participant name if updated name provided
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

-- 2. Allow public to insert participant records if queried directly
CREATE POLICY "Public can register participants"
    ON public.participants
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);
