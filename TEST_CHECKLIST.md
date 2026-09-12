# Acceptance Test Checklist — The BrandsWay Certificate System

This checklist verifies all requirements and acceptance tests defined in **PRD Section 36 & Section 40**.

| Test Case | Description | Test Procedure | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Test 1 — Valid Participant** | Registered user generates certificate | Enter "Rahul Sharma" & `rahul@example.com` on `/certificate` and submit | System validates participant, displays step progress, generates `BRW-AIRO-0001`, and presents PDF preview + download button | ✅ PASSED |
| **Test 2 — Duplicate Request** | Idempotency & duplicate prevention | Submit "Rahul Sharma" & `rahul@example.com` a second time | System returns existing `BRW-AIRO-0001` without incrementing sequence counter or creating a duplicate record | ✅ PASSED |
| **Test 3 — Unregistered Participant** | Non-registered user rejection | Submit "Unknown Guest" & `unregistered@test.com` on `/certificate` | Certificate issuance is rejected with friendly message: *"We couldn't find your registration. Please contact the workshop team."* | ✅ PASSED |
| **Test 4 — QR Verification** | Authentic certificate verification | Navigate to `/verify/BRW-AIRO-0001` or search `BRW-AIRO-0001` | Displays authentic green badge, participant name, workshop title, date, location, and issuer seal. **No private emails or internal IDs exposed.** | ✅ PASSED |
| **Test 5 — Invalid Certificate ID** | Fraudulent / non-existent certificate check | Search or navigate to `/verify/BRW-AIRO-999999` | Displays "Certificate Not Found" card with troubleshooting steps. | ✅ PASSED |
| **Test 6 — Ineligible Participant** | Ineligible registered participant | Submit "Bilal Ahmed" & `bilal@example.com` (marked ineligible) | Rejection message indicates registration is ineligible. | ✅ PASSED |
| **Test 7 — Admin Dashboard & Metrics** | Admin authentication & overview | Log in at `/admin/login` using `admin@brandsway.com` / `admin123` | Dashboard displays 4 live metrics: Total Participants, Eligible, Issued, Remaining. | ✅ PASSED |
| **Test 8 — CSV Bulk Import** | Bulk roster import | In Admin Dashboard, click "CSV Import" and paste sample CSV with duplicates | Displays success message with imported count and skipped duplicate count. | ✅ PASSED |
| **Test 9 — Admin Name Correction** | Name typo fix & regeneration | Click edit icon on a participant with a typo (e.g. "rahul sharma" -> "Rahul Sharma") | Updates name on certificate while preserving the original `certificate_id`. | ✅ PASSED |
| **Test 10 — Long Name Auto-scaling** | Name formatting without overlap | Submit a very long name (e.g. "Dr. Mohammad Abdul Rahman Al-Mansoor Jr.") | Font size dynamically adjusts on canvas and PDF so it never clips or overlaps borders. | ✅ PASSED |
| **Test 11 — Security & Privacy** | Secret key safety & privacy compliance | Inspect client bundle and DOM | No `SUPABASE_SERVICE_ROLE_KEY` is present. Verification page displays no email addresses. | ✅ PASSED |
| **Test 12 — Mobile Responsiveness** | Responsive UI (< 30s flow) | View on mobile viewport | Full width inputs, touch-friendly 44px+ buttons, clean single column flow with no horizontal scroll. | ✅ PASSED |
