# Antigravity PRD: Fix Brandsway Skill Academy Certificate Project

## Objective
Update the **existing project in place**. It already has a QR → form → personalized certificate workflow, but the event data is outdated and certificate download has issues. Inspect the repository, find the real causes, fix them, and test the full flow. **Do not rebuild from scratch or break working features.**

## 1. Current workshop details
Use these details consistently in the form, generated certificate, success screen, PDF metadata, and verification page:

- Organization: **Brandsway Skill Academy**
- Workshop title: **AI Website Building Workshop**
- Certificate type: **Certificate of Participation**
- Date: **Sunday, 11 October 2026**
- Location: **Aligarh, Uttar Pradesh, India**

Remove outdated current-event references such as “AI for Real Opportunities” and “13 September 2026.” If historical certificates must remain valid, preserve their records and verification. Use event-specific data per certificate rather than overwriting old records globally.

## 2. Preserve the existing flow
1. Participant scans the existing QR code.
2. QR opens the existing certificate form.
3. Participant enters required details.
4. Input and eligibility are validated using the project's existing rules.
5. A personalized certificate is generated.
6. A success screen displays a prominent **Download Certificate (PDF)** button.
7. A returning participant can retrieve their existing certificate if supported.
8. If the project already includes certificate verification QR codes, they must continue to open the correct verification page.

Keep existing public routes and QR destinations working unless a verified bug requires a change.

## 3. Fix PDF generation and download
Inspect the actual PDF generation and download implementation. Fix the root cause, not just the appearance.

- Reuse the existing approved certificate template and authorized logo/signature assets.
- Include the participant's submitted name, correct workshop title, date, location, and certificate wording.
- Keep the layout professional, preferably A4 landscape unless the approved template specifies otherwise.
- Ensure text is legible, aligned, and not clipped or overlapping.
- Embed/load fonts correctly and support common non-English characters where feasible.
- Generate a real, valid PDF that opens in standard PDF readers.
- Show **Download Certificate (PDF)** as soon as generation succeeds.
- The button must download the actual PDF, not an HTML page, blank file, or preview image.
- Use a meaningful, sanitized filename, e.g. `Brandsway-AI-Website-Building-Certificate-[ParticipantName].pdf`.
- Verify the downloaded file is non-empty and opens correctly.
- If using remote storage, handle permissions, CORS, redirects, and download headers correctly. Use the project's existing secure storage/download approach.
- If using a browser Blob, use the correct PDF MIME type, trigger download reliably, and revoke temporary object URLs after use.
- On mobile, provide an **Open Certificate PDF** fallback if direct download behavior differs by browser.
- Do not show success until the PDF exists and is accessible. On failure, show a clear message and safe retry option.

## 4. Form and duplicate handling
- Clearly identify the event as **AI Website Building Workshop — 11 October 2026**.
- Keep the form short and preserve necessary existing fields.
- Trim whitespace; reject empty names and invalid email addresses if email is required.
- Show a loading state and disable submit while processing.
- Prevent accidental repeated submissions and duplicate certificate IDs.
- If the participant already has a valid certificate, retrieve it or provide a clear recovery path rather than issuing duplicates.
- Show clear validation, success, and error messages. Never expose stack traces, secrets, or internal server details.
- Do not collect or expose unnecessary personal information.

## 5. Data, storage, and verification
Inspect the repository before choosing an implementation. The prior setup may use React/Vite/Tailwind, Supabase PostgreSQL/Storage/Edge Functions, `pdf-lib`, a QR library, and Vercel/Netlify, but **confirm what this project actually uses** and reuse it rather than adding unnecessary services.

- Never hard-code API keys or service-role secrets in frontend code.
- Keep stored PDF files and certificate records linked to a stable unique ID.
- If a verification QR exists, ensure it points to the correct public verification route and certificate ID.
- Show only approved public verification details.
- Do not expose all participant records or make storage public merely to enable downloads.
- Use safe, backward-compatible migrations if needed. Never delete production data.

## 6. UI requirements
Keep the Brandsway Skill Academy look and improve usability without an unnecessary redesign:
- Responsive on phones, tablets, and desktops.
- Clear form instructions and event details.
- Obvious loading, error, and success states.
- Prominent download button on the success screen.
- Accessible labels, readable contrast, and mobile-friendly button sizes.
- The participant should not need to understand technical URLs or storage to download the certificate.

## 7. Debugging workflow
Before editing, trace and inspect:
- QR destination and route
- Form component and submit handler
- API route or Edge Function
- Certificate template and PDF generation
- Storage upload/retrieval logic
- Download link/button
- Verification QR and route
- Environment variables and deployment configuration
- Relevant browser console and server logs

Identify the actual failure cause, then make the smallest reliable fix. Preserve unrelated functionality.

## 8. Acceptance tests
Run and verify the complete workflow:
1. Open the QR destination and confirm the correct form loads.
2. Confirm the new workshop title, date, and organization are displayed.
3. Submit a valid test participant.
4. Confirm invalid/empty fields are rejected.
5. Confirm the generated certificate has the correct participant name and current event details.
6. Inspect the PDF for clipping, overlap, missing fonts, or broken assets.
7. Download the PDF and confirm it is non-empty and opens correctly.
8. Test on desktop and a mobile browser if available.
9. Refresh/revisit and confirm expected certificate retrieval behavior.
10. Retry or double-click submit and verify no accidental duplicate is created.
11. Test the verification QR if the project supports it.
12. Ensure historical certificates remain verifiable if required.
13. Check for console/server errors and exposed secrets.

If a test cannot be performed because credentials, environment variables, or deployment access are missing, say exactly what is missing. Do not claim an untested fix works.

## Final instructions
Work directly in the existing project. Inspect first, implement the fixes, run the project, test the end-to-end workflow, and fix regressions. Do not stop at a plan.

When done, report:
- Root cause(s)
- Files changed
- Event details updated
- How PDF generation/download was fixed
- Tests actually run and results
- Any manual environment or deployment steps remaining

**Success condition:** A participant scans the QR, fills the form, receives a personalized Certificate of Participation for the Brandsway Skill Academy AI Website Building Workshop on 11 October 2026, and can easily download a valid PDF.
