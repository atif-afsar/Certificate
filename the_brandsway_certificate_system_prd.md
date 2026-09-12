# PRD — The BrandsWay Workshop Certificate System

## 1. Product Overview

Build a simple, professional web application for **The BrandsWay Skill Academy** that automatically generates personalized workshop participation certificates.

After the workshop, participants will:
1. Scan a QR code.
2. Open the certificate webpage.
3. Enter their name and email.
4. Submit the form.
5. The system validates the participant.
6. A unique certificate ID is generated.
7. A personalized certificate PDF is generated using the provided certificate design.
8. The participant can download their certificate.
9. The certificate contains a verification URL/QR code.
10. Anyone can verify the certificate online using the certificate ID.

Use free/open-source or free-tier services wherever possible.

## 2. Brand Information

- Organization: The BrandsWay Skill Academy
- Workshop: AI for Real Opportunities
- Tagline: Explore. Learn. Build. Grow.
- Certificate type: Certificate of Participation
- Date: 13 September 2026
- Location: Aligarh, India
- Brand messaging: Learn / Build / Grow
- Additional message: Same Skills / A Brighter / Tomorrow
- Footer: People | Skills | Opportunities | A Brighter Tomorrow

## 3. Primary Goal

Create a frictionless certificate-generation experience:

`Workshop Ends → QR → Certificate Website → Name + Email → Validation → Generate → Preview → Download → Verify`

The participant flow should ideally take less than 30 seconds.

## 4. User Roles

### Participant
- Scan QR
- Enter name
- Enter email
- Submit certificate request
- View generated certificate
- Download certificate
- Copy verification link
- Verify certificate

### Admin
- Login
- View/add/import participants
- Search participants
- Mark participants eligible/ineligible
- View certificate status
- Generate/regenerate certificates
- Download certificates

## 5. Technology Stack

Prefer this stack:

- Frontend: React + Vite + Tailwind CSS (or HTML/CSS/JS if the project is already plain HTML)
- Backend: Supabase
- Database: Supabase PostgreSQL
- Authentication: Supabase Auth for admin
- Storage: Supabase Storage
- Server-side generation: Supabase Edge Function
- PDF: `pdf-lib`
- QR: reliable open-source QR-code library
- Hosting: Vercel or Netlify

Do not introduce unnecessary frameworks.

## 6. Certificate Design

Use the **provided certificate design/image as the official certificate template**. Do not redesign it automatically.

Maintain:
- Warm white/premium white background
- Navy/purple brand colors
- Gold accents
- Elegant typography
- Premium academic/corporate appearance
- The BrandsWay branding
- Decorative borders
- Certificate seal/emblem

Dynamic fields:
- Participant Name
- Certificate ID
- Issue Date
- Verification QR

Fixed fields:
- AI for Real Opportunities
- 13 September 2026
- Aligarh, India

The participant name must be centered, prominent, and never overlap other design elements.

## 7. Participant Landing Page

Route: `/certificate`

Example: `https://yourdomain.com/certificate`

Page copy:

**THE BRANDS WAY**  
**SKILL ACADEMY**

**Your Certificate Is Ready**

AI for Real Opportunities

Get your official certificate of participation.

Form:
- Full Name
- Email Address
- Generate My Certificate

The name must be displayed exactly as entered after trimming leading/trailing spaces. Do not force uppercase unless configured.

## 8. Form Validation

Name:
- Required
- Minimum 2 characters
- Maximum 100 characters
- Reject empty/only-space values
- Trim leading/trailing spaces

Email:
- Required
- Validate standard email format

Friendly errors:
- `Please enter your full name.`
- `Please enter a valid email address.`
- `We couldn't find your registration. Please contact the workshop team.`

## 9. Participant Validation

Maintain an eligible participant list.

Suggested `participants` table:
- id
- name
- email
- eligible
- created_at

On submit:

`User submits email → Search participants → If found AND eligible, continue → Otherwise show error`

Do not allow arbitrary users to generate certificates.

## 10. Database

### participants

- `id` UUID primary key
- `name` text
- `email` text unique
- `eligible` boolean
- `created_at` timestamptz

### certificates

- `id` UUID primary key
- `certificate_id` text unique
- `participant_id` UUID
- `participant_name` text
- `participant_email` text
- `workshop_name` text
- `workshop_date` date
- `location` text
- `pdf_path` text
- `verification_url` text
- `created_at` timestamptz

Recommended unique constraints:
- `participants.email`
- `certificates.certificate_id`
- `certificates.participant_id`

## 11. Certificate ID

Every certificate must have a unique ID.

Format:
- `BRW-AIRO-0001`
- `BRW-AIRO-0002`
- `BRW-AIRO-0003`

Generate IDs server-side or with a database-backed mechanism so uniqueness is guaranteed. Never rely only on client-side generation.

## 12. Certificate Generation

When a valid participant submits:

`POST /generate-certificate`

Backend must:
1. Validate request.
2. Validate participant eligibility.
3. Check whether a certificate already exists.
4. If it exists, return the existing certificate.
5. Otherwise create a unique certificate ID.
6. Save the certificate record.
7. Load the certificate template.
8. Add participant name.
9. Add certificate ID.
10. Add verification QR.
11. Generate high-quality PDF.
12. Upload PDF to Supabase Storage.
13. Save PDF path/URL.
14. Return certificate information.

## 13. Duplicate Prevention

If a participant already has a certificate, do not generate another one.

Example:
`Rahul Sharma + rahul@example.com → BRW-AIRO-0001`

If submitted again, return the existing certificate instead of creating BRW-AIRO-0002.

Enforce this server-side.

## 14. PDF Requirements

- A4 landscape
- High-quality output
- Preserve original certificate proportions/design
- Participant name clearly visible
- Certificate ID included
- Workshop name/date/location included
- Verification QR included
- No text overlap

## 15. Certificate Verification QR

Every certificate should contain a small QR code pointing to:

`/verify/{certificate_id}`

Example:
`https://yourdomain.com/verify/BRW-AIRO-0001`

Scanning it opens the verification page.

## 16. Verification Page

Route: `/verify/:certificateId`

For a valid certificate, display:

**VERIFIED CERTIFICATE**

This certificate is authentic.

Certificate of Participation

AI for Real Opportunities

Awarded to: **Rahul Sharma**

Certificate ID: **BRW-AIRO-0001**

Date: **13 September 2026**

Location: **Aligarh, India**

Issued by: **The BrandsWay Skill Academy**

For an invalid ID:

**Certificate Not Found**

We could not verify this certificate. Please check the certificate ID and try again.

Do not expose database internals.

## 17. Manual Certificate Verification

Provide a public verification section:

**Verify a Certificate**

Input: Enter Certificate ID

Button: Verify Certificate

Example: `BRW-AIRO-0001`

## 18. Admin Dashboard

Route: `/admin`

Dashboard metrics:
- Total Participants
- Eligible Participants
- Certificates Generated
- Certificates Remaining

Participants table:
- Name
- Email
- Eligible
- Certificate status
- Certificate ID
- Created date
- Actions

Actions:
- View
- Generate
- Download
- Regenerate

Search by:
- Name
- Email
- Certificate ID

## 19. CSV Import

Admin should upload CSV files like:

```csv
name,email
Rahul Sharma,rahul@example.com
Ayesha Khan,ayesha@example.com
Mohammed Ali,mohammed@example.com
```

After import show a clear result, e.g.:
`250 participants imported successfully.`

Handle duplicate emails safely and report skipped duplicates.

## 20. Admin Regeneration

Admin can correct a participant's name and regenerate their certificate.

Example:
- Original: Rahul sharma
- Corrected: Rahul Sharma

The certificate ID may remain unchanged.

## 21. Security

Never expose the Supabase service-role key in frontend code.

Never put it in:
- HTML
- CSS
- Browser JavaScript
- Public GitHub

Use environment variables.

Frontend:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Server-side only:
- `SUPABASE_SERVICE_ROLE_KEY`

Use proper Supabase Row Level Security policies.

## 22. Rate Limiting

Protect certificate-generation endpoints from abuse using reasonable rate limiting by IP and/or participant/email.

Keep MVP implementation simple.

## 23. Storage

Store PDFs in Supabase Storage.

Suggested structure:

```text
certificates/
  2026/
    BRW-AIRO-0001.pdf
    BRW-AIRO-0002.pdf
    BRW-AIRO-0003.pdf
```

Use appropriate storage policies.

## 24. Success Page

Display:

**Congratulations!**

Your certificate is ready.

AI for Real Opportunities

Certificate issued to: Rahul Sharma

Certificate ID: BRW-AIRO-0001

Buttons:
- Download Certificate
- Verify Certificate
- Copy Verification Link

## 25. Loading State

During generation show:

`Generating your certificate...`

Progress:
- ✓ Participant verified
- ✓ Certificate created
- ✓ Certificate ready

Then show the download button.

## 26. Error Handling

Invalid participant:
`We couldn't find your registration. Please contact the workshop team.`

Database error:
`Something went wrong while processing your certificate. Please try again.`

PDF generation error:
`We couldn't generate your certificate right now. Please try again.`

Network error:
`Please check your internet connection and try again.`

Never expose stack traces or internal errors to participants.

## 27. Privacy

Public verification pages must NOT display:
- Participant email
- Phone number
- Registration details
- Internal database IDs

Publicly show only:
- Participant name
- Workshop
- Date
- Location
- Certificate ID
- Issuer

## 28. Mobile-First UX

Most participants will use phones.

Support:
- Android
- iPhone
- Chrome
- Safari

Use:
- Large inputs
- Large buttons
- Readable typography
- Responsive layout
- Fast loading
- No horizontal scrolling
- Minimal animation

Do not require participant accounts, passwords, OTP, or social login for MVP.

## 29. Workshop QR

Create a QR code pointing to:

`https://yourdomain.com/certificate`

Use it on:
- Final presentation slide
- Workshop screen
- Printed material
- WhatsApp message

Suggested final slide:

**GET YOUR CERTIFICATE**

AI for Real Opportunities

**Scan the QR**

Enter your name & email

Download your certificate

## 30. Performance

Certificate generation should ideally complete within 1–5 seconds.

If a certificate already exists, return the existing certificate instead of regenerating it.

## 31. SEO / Sharing

Verification pages should have useful metadata such as:
`The BrandsWay Skill Academy — Certificate Verification`

Never expose participant email addresses in metadata or public pages.

## 32. Suggested Project Structure

If using React:

```text
src/
  components/
    CertificateForm.jsx
    CertificatePreview.jsx
    QRCode.jsx
    LoadingState.jsx

  pages/
    CertificatePage.jsx
    SuccessPage.jsx
    VerifyPage.jsx
    AdminPage.jsx

  services/
    supabase.js
    certificate.js
    participant.js

  utils/
    validation.js
    certificateId.js

  assets/
    certificate-template.png

supabase/
  functions/
    generate-certificate/
      index.ts
```

## 33. MVP Scope

Must include:
- QR landing page
- Name field
- Email field
- Validation
- Participant eligibility check
- Certificate generation
- High-quality PDF
- Certificate ID
- Certificate QR
- Verification URL
- Verification page
- Admin login
- Participant management
- Search
- CSV upload
- Certificate status
- Download

## 34. Out of Scope for MVP

Do not build initially:
- Payment system
- AI features
- Mobile app
- Complex analytics
- Social login
- Complex user accounts
- WhatsApp automation
- Email automation
- Multiple event management
- Digital badges
- LinkedIn integration

Build the core system first.

## 35. Development Phases

1. Project setup
2. Supabase database and RLS
3. Participant form
4. Participant validation
5. PDF certificate generation
6. Unique certificate IDs
7. Verification QR
8. Verification page
9. Admin dashboard
10. CSV import
11. Testing
12. Deployment

## 36. Acceptance Tests

### Test 1 — Valid participant
Admin imports John Doe / john@example.com.
John submits valid details.
System generates BRW-AIRO-0001.
PDF contains John Doe.
PDF downloads successfully.

### Test 2 — Duplicate request
John submits again.
System returns BRW-AIRO-0001.
No duplicate certificate is created.

### Test 3 — Unregistered participant
Unregistered user submits arbitrary details.
System refuses certificate generation.

### Test 4 — QR verification
Scan certificate QR.
It opens `/verify/BRW-AIRO-0001`.
Verification page shows correct participant and workshop information.

### Test 5 — Invalid ID
Enter BRW-AIRO-999999.
System displays Certificate Not Found.

## 37. Design Direction

The application should feel:
- Premium
- Minimal
- Elegant
- Modern
- Trustworthy
- Professional

Visual language:
- Navy
- Deep Purple
- Gold
- Warm White

Avoid:
- Excessive gradients
- Excessive animations
- Cartoon illustrations
- Generic Bootstrap appearance
- Clutter
- Unnecessary cards

Use the supplied certificate as the primary visual reference.

## 38. Critical Implementation Instruction

**Do not build a mockup only. Build a fully functional end-to-end application.**

The final system must actually support:

`QR → Website → Form → Supabase → Validation → Certificate generation → PDF → Storage → Download → Verification`

Do not use fake participant data in the final implementation.

Do not hardcode participant names.

Do not expose Supabase service credentials.

Use environment variables.

Use the supplied certificate design as the certificate template.

## 39. Final User Experience

At the workshop, the final slide should say:

**GET YOUR CERTIFICATE**

AI for Real Opportunities

Scan the QR code.

Participant scans:
`QR → Name → Email → Generate → Download`

Within a few seconds they receive a personalized Certificate of Participation from The BrandsWay Skill Academy containing:
- Their name
- Workshop name
- Date
- Location
- Unique certificate ID
- Verification QR

The system should be reusable for future The BrandsWay Skill Academy workshops by changing event configuration rather than rewriting the application.

## 40. Antigravity Execution Rules

Before coding:
1. Inspect the existing project structure.
2. Reuse the existing stack where practical.
3. Do not overwrite existing working functionality without reason.
4. Ask only when a genuinely blocking requirement is missing; otherwise make sensible defaults.
5. Keep secrets in environment variables.

During coding:
1. Build the database schema and security first.
2. Build participant flow end-to-end before the admin dashboard.
3. Make PDF generation deterministic and test it with long and short names.
4. Make certificate generation idempotent.
5. Validate all important rules on the server, not only the client.
6. Keep the UI mobile-first.
7. Use the supplied certificate image as the visual reference/template.

Before declaring complete:
1. Test valid participant generation.
2. Test duplicate generation.
3. Test invalid participant.
4. Test invalid certificate verification.
5. Test certificate QR.
6. Test CSV import.
7. Test admin access.
8. Test long participant names.
9. Test mobile layout.
10. Verify that no secret key is exposed to the browser.
11. Provide clear setup instructions and required environment variables.
12. Provide deployment instructions for the chosen hosting platform.

## 41. Required Deliverables

Antigravity must deliver:
- Fully working source code
- Supabase SQL/schema
- RLS policies
- Edge Function/backend code for secure generation
- Participant certificate page
- Success/download page
- Public verification page
- Admin dashboard
- CSV import
- Certificate PDF generation
- QR generation
- Environment variable example file
- README with local setup
- README with Supabase setup
- README with deployment steps
- Test checklist

The finished product must be production-ready for the workshop and easy to reuse for future workshops.
