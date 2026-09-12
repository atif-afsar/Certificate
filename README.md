# The BrandsWay Workshop Certificate System

Official production certificate issuance, verification, and management platform for **The BrandsWay Skill Academy** for the workshop **"AI for Real Opportunities"** (13 September 2026, Aligarh, India).

---

## 🌟 Key Features

1. **Frictionless Participant Flow (< 30s)**:
   - Participants scan the workshop QR code.
   - Enter their registered Full Name and Email Address.
   - Real-time validation against the eligible participant roster.
   - Idempotent generation: Returns existing certificate if already generated (prevents duplicate `BRW-AIRO-XXXX` IDs).

2. **High-Resolution A4 Landscape PDF Engine**:
   - Built with `pdf-lib` and high-density Canvas (300 DPI equivalent).
   - Warm cream / parchment background, navy and gold borders, official The BrandsWay seal.
   - Dynamic font-scaling for long names to eliminate overlap.
   - Direct download and on-screen interactive preview.

3. **Public Tamper-Proof Verification**:
   - Unique sequential Certificate IDs (`BRW-AIRO-0001`, `BRW-AIRO-0002`, etc.).
   - Embedded QR code links directly to `/verify/:certificateId`.
   - **Privacy Compliant**: Publicly displays verified awardee name, workshop date, location, and issuer seal. *Never* exposes participant email, phone number, or database internals.
   - Public manual ID search box.

4. **Comprehensive Admin Dashboard**:
   - Live metrics: Total Participants, Eligible Participants, Certificates Issued, Certificates Remaining.
   - Search by name, email, or certificate ID.
   - Filter by status (All, Issued, Pending, Ineligible).
   - Bulk CSV Import (`name,email`) with duplicate detection and reporting.
   - Participant Name Correction & Certificate Regeneration (preserving certificate ID).
   - Toggle participant eligibility with single click.

5. **Local Demo Mode / Live Supabase Mode**:
   - Works immediately out of the box in Local Demo Mode with mock seed data.
   - Automatically switches to live Supabase once `.env` credentials are configured.

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

### 4. Demo Accounts & Seed Data
In Local Demo Mode, you can test immediately with pre-loaded participants:
- **Participant 1**: `Rahul Sharma` (`rahul@example.com`)
- **Participant 2**: `Ayesha Khan` (`ayesha@example.com`)
- **Participant 3**: `Mohammed Ali` (`mohammed@example.com`)
- **Ineligible Participant**: `Bilal Ahmed` (`bilal@example.com`)
- **Admin Portal**: Go to `/admin/login` and log in with:
  - **Email**: `admin@brandsway.com`
  - **Password**: `admin123`

---

## 🗄️ Supabase Setup Guide

### 1. Create a Supabase Project
1. Go to [database.new](https://database.new) and create a new project.
2. Under **Project Settings** -> **API**, copy:
   - `Project URL`
   - `anon public` key
   - `service_role` secret key

### 2. Configure Database Schema & RLS
1. In the Supabase dashboard, open the **SQL Editor**.
2. Open [supabase/schema.sql](file:///c:/Users/asus/Desktop/Certificate/supabase/schema.sql) from this repository.
3. Paste the contents into the SQL Editor and click **Run**.
   - This creates the `participants` and `certificates` tables.
   - Creates the `certificate_id_seq` sequence.
   - Installs the atomic `issue_or_get_certificate` and `verify_certificate_public` stored procedures.
   - Configures Row Level Security (RLS) policies.
   - Configures the `certificates` storage bucket.
   - Seeds the initial registered participants.

### 3. Set Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your project credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_APP_URL=https://your-domain.com

# Server-Side / Edge Function only (Do not commit)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

### 4. Deploy the Supabase Edge Function (Optional)
If deploying the Edge Function for server-side generation:
```bash
supabase functions deploy generate-certificate --no-verify-jwt
```

---

## 🚢 Deployment Guide

### Deploying to Vercel
1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. Set Build Command: `npm run build`
5. Set Output Directory: `dist`
6. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_URL`
7. Click **Deploy**.

### Deploying to Netlify
1. Connect your repository on [Netlify](https://netlify.com).
2. Set Build Command: `npm run build`
3. Set Publish Directory: `dist`
4. For client-side routing, add a `_redirects` file in `public/` containing:
   ```text
   /*    /index.html   200
   ```
5. Add the environment variables and deploy.

---

## 🔒 Security Architecture

- **Zero Key Exposure**: `SUPABASE_SERVICE_ROLE_KEY` is strictly reserved for backend/server environments. The browser bundle only receives `VITE_SUPABASE_ANON_KEY`.
- **Row Level Security (RLS)**: Public callers cannot directly insert, update, or arbitrarily read full participant rows.
- **Privacy Protection**: The public `/verify` endpoint uses a Postgres security-definer function returning only public verification metadata. Participant emails, phone numbers, and internal UUIDs are strictly omitted.
- **Idempotent Issuance**: Double submissions by participants reuse their existing unique certificate ID without creating duplicates.

---

## 🏢 Brand Information
- **Organization**: The BrandsWay Skill Academy
- **Workshop**: AI for Real Opportunities
- **Date**: 13 September 2026
- **Location**: Aligarh, India
- **Tagline**: Explore. Learn. Build. Grow.
- **Brand Messaging**: Learn / Build / Grow • Same Skills / A Brighter / Tomorrow
- **Footer**: People | Skills | Opportunities | A Brighter Tomorrow
