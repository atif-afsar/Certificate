# Acceptance Test Checklist — Brandsway Skill Academy Certificate System

This checklist verifies all requirements and acceptance tests defined in **PRD Section 36 & Section 40** and the **Fix PRD (October 2026)**.

| Test Case | Description | Test Procedure | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Test 1 — Valid Participant Issuance** | Participant generates certificate | Enter "Rahul Sharma" & `rahul@example.com` on `/certificate` and submit | System validates participant, saves registration, generates `BRW-AIWB-XXXX`, and redirects to `/success` | ✅ PASSED |
| **Test 2 — Highly Visible Download Option** | Success screen action bar | View `/success` screen after form completion | Displays large prominent "Download Certificate (PDF)" primary gradient button, "Open PDF in Tab" mobile fallback, and high-res canvas preview | ✅ PASSED |
| **Test 3 — Current Workshop Details** | Verified metadata inspection | Check form, success screen, PDF canvas, and verification page | All pages show: **Brandsway Skill Academy**, **AI Website Building Workshop**, **Sunday, 11 October 2026**, **Aligarh, Uttar Pradesh, India** | ✅ PASSED |
| **Test 4 — Duplicate Request (Idempotency)** | Idempotent certificate retrieval | Submit "Rahul Sharma" & `rahul@example.com` a second time | Retrieves existing certificate ID safely without creating duplicates | ✅ PASSED |
| **Test 5 — Removed Timer Redirection** | Tamper-proof verification page | Navigate to `/verify/:id` and observe screen | Authenticity badge and details displayed. **NO countdown timer**, **NO auto-redirection**, page stays open stably indefinitely | ✅ PASSED |
| **Test 6 — PDF Generation & Download** | PDF validity and sanitized naming | Click "Download Certificate (PDF)" | Generates valid A4 Landscape PDF with filename `Brandsway-AI-Website-Building-Certificate-[ParticipantName].pdf` | ✅ PASSED |
| **Test 7 — Mobile View Fallback** | Mobile-friendly PDF view | Click "Open PDF in Tab" on `/success` | Opens clean PDF blob preview in a new browser tab | ✅ PASSED |
| **Test 8 — Admin Access & Credentials** | Organizer authentication | Go to `/admin/login`, use `admin@brandsway.com` / `admin123` or "Fill Credentials" | Instant authentication and redirection to `/admin` dashboard | ✅ PASSED |
| **Test 9 — Admin Metrics & Management** | Live dashboard metrics & table | View `/admin` | Displays 4 live metrics (Total, Eligible, Issued, Remaining), search/filter pills, and participant actions | ✅ PASSED |
| **Test 10 — CSV Bulk Import** | Bulk roster import | In Admin Dashboard, click "CSV Import" and submit CSV | Successfully imports participants and detects duplicate emails | ✅ PASSED |
| **Test 11 — Admin Name Correction** | Name correction & re-issuance | Click edit icon on a participant record | Updates name on certificate while preserving original certificate ID | ✅ PASSED |
| **Test 12 — Tamper-Proof QR Code** | Embedded verification QR | Scan or verify QR code on certificate | Opens `/verify/:id` showing verified status without exposing emails or private keys | ✅ PASSED |
| **Test 13 — Backward Compatibility** | Historical certificates | Search or verify `BRW-AIRO-XXXX` | Historical certificates remain verifiable with their original recorded workshop title and date | ✅ PASSED |
| **Test 14 — Security & Privacy** | Secret key safety & privacy compliance | Inspect client bundle and DOM | Zero service-role keys exposed in browser bundle. No email addresses exposed on public verification route | ✅ PASSED |
