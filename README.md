# Brandsway Skill Academy Certificate System

Official production certificate issuance, verification, and management platform for **Brandsway Skill Academy** for the workshop **"AI Website Building Workshop"** (Sunday, 11 October 2026, Aligarh, Uttar Pradesh, India).

---

## 🌟 Key Features

1. **Frictionless Participant Flow (< 30s)**:
   - Participants scan the workshop QR code or visit `/certificate`.
   - Enter their Full Name and Email Address.
   - Real-time validation and instant issuance.
   - Idempotent generation: Returns existing certificate if already generated (prevents duplicate IDs).

2. **High-Visibility Download & Success Screen (`/success`)**:
   - Immediately displayed after form submission.
   - Prominent **Download Certificate (PDF)** primary action button.
   - **Open PDF in Tab** fallback for mobile devices.
   - On-screen interactive certificate canvas preview.
   - Direct verification link and one-click copy.

3. **Tamper-Proof Verification (`/verify/:certificateId`)**:
   - Unique sequential Certificate IDs (`BRW-AIWB-0001`, `BRW-AIWB-0002`, etc.) and backward compatibility with historical certificates (`BRW-AIRO-XXXX`).
   - Embedded QR code on the certificate links directly to verification.
   - **No Auto-Redirect / No Timer**: The verification page remains open stably so users, employers, or reviewers can inspect credentials without being redirected away.
   - **Privacy Compliant**: Publicly displays verified awardee name, workshop title, date, location, and issuer seal. Never exposes email addresses or internal IDs.

4. **Regal High-Resolution A4 Landscape PDF Engine**:
   - Built with `pdf-lib` and high-density Canvas (2400 x 1680, 300 DPI equivalent).
   - Luxury parchment background, midnight royal purple and metallic gold borders.
   - Embossed 36-point radiant gold seal with official academy crest.
   - Dynamic font-scaling for long participant names to eliminate overlap.
   - Meaningful sanitized filename: `Brandsway-AI-Website-Building-Certificate-[ParticipantName].pdf`.

5. **Comprehensive Admin Portal (`/admin`)**:
   - Protected organizer login at `/admin/login`.
   - Credentials: **`admin@brandsway.com`** / **`admin123`** (includes one-click "Fill Credentials" button).
   - Live metrics: Total Participants, Eligible, Issued, Remaining.
   - Search by name, email, or certificate ID with filter pills.
   - Bulk CSV Import (`name,email`) with duplicate detection.
   - Participant Name Correction & Certificate Regeneration (preserving certificate ID).
   - Instant PDF download and eligibility toggle.

6. **Local Resilient Mode / Live Supabase Mode**:
   - Works immediately out of the box in Local Resilient Mode with seed data.
   - Connects to live Supabase once configured, with automatic fallback protection against network failures.

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Local Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Admin Access & Credentials
- **Admin Portal**: Go to `http://localhost:5173/admin/login`
- **Organizer Email**: `admin@brandsway.com`
- **Password**: `admin123`

---

## 🏢 Workshop Information
- **Organization**: Brandsway Skill Academy
- **Workshop**: AI Website Building Workshop
- **Certificate Type**: Certificate of Participation
- **Date**: Sunday, 11 October 2026
- **Location**: Aligarh, Uttar Pradesh, India
- **Tagline**: Explore • Learn • Build • Grow
- **Instructor**: Yasir Ali (Founder & Instructor)
