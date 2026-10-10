import { PDFDocument } from 'pdf-lib';
import QRCode from 'qrcode';

/**
 * Standard Workshop Details (PRD Section 1)
 */
export const WORKSHOP_CONFIG = {
  organization: 'Brandsway Skill Academy',
  workshopTitle: 'AI Website Building Workshop',
  certificateType: 'Certificate of Participation',
  date: 'Sunday, 11 October 2026',
  location: 'Aligarh, Uttar Pradesh, India',
  instructor: 'Yasir Ali',
  instructorRole: 'Founder & Instructor, Brandsway Skill Academy',
  tagline: 'Explore • Learn • Build • Grow',
};

/**
 * Sanitizes participant name for safe PDF filenames (PRD Section 3)
 */
export function getSanitizedPDFFilename(participantName = 'Participant') {
  const cleanName = participantName
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
  return `Brandsway-AI-Website-Building-Certificate-${cleanName || 'Participant'}.pdf`;
}

/**
 * Renders an ultra-high resolution (2400 x 1680) luxury Certificate of Participation.
 * Designed with regal guilloche borders, metallic gold accents, embossed seal,
 * dynamic QR verification, and responsive font-scaling.
 */
export async function renderCertificateCanvas(canvas, certData = {}) {
  // Wait for Google Fonts to be fully loaded to prevent font swap / metric shifts
  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch (e) {
      // Proceed even if font ready promise rejects
    }
  }

  const width = 2400;
  const height = 1680;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const {
    participantName = 'Participant Name',
    certificateId = 'BRW-AIWB-0001',
    workshopName = WORKSHOP_CONFIG.workshopTitle,
    workshopDate = WORKSHOP_CONFIG.date,
    location = WORKSHOP_CONFIG.location,
    verificationUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${certificateId}`,
  } = certData;

  // =========================================================================
  // 1. BASE BACKGROUND & PARCHMENT TEXTURE
  // =========================================================================
  // Warm ivory / pearlescent parchment background
  const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 200, width / 2, height / 2, width * 0.75);
  bgGrad.addColorStop(0, '#FFFFFF');
  bgGrad.addColorStop(0.5, '#FCFAF6');
  bgGrad.addColorStop(0.85, '#F8F4EC');
  bgGrad.addColorStop(1, '#F2ECE0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle silk diagonal sheen
  const sheenGrad = ctx.createLinearGradient(0, 0, width, height);
  sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
  sheenGrad.addColorStop(0.3, 'rgba(253, 248, 237, 0.3)');
  sheenGrad.addColorStop(0.7, 'rgba(240, 233, 218, 0.2)');
  sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0.5)');
  ctx.fillStyle = sheenGrad;
  ctx.fillRect(0, 0, width, height);

  // =========================================================================
  // 2. WATERMARK BACKGROUND BRANDING
  // =========================================================================
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 130px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(124, 58, 237, 0.025)';
  ctx.letterSpacing = '18px';
  ctx.fillText('BRANDSWAY', width / 2, height / 2 - 40);
  ctx.restore();

  // =========================================================================
  // 3. REGAL ORNAMENTAL BORDERS & FRAMING
  // =========================================================================
  const outerMargin = 60;
  const innerMargin = 95;
  const borderW = width - outerMargin * 2;
  const borderH = height - outerMargin * 2;

  // Layer A: Deep Midnight Navy & Royal Purple Outer Border
  ctx.save();
  ctx.strokeStyle = '#1E1233';
  ctx.lineWidth = 14;
  ctx.strokeRect(outerMargin, outerMargin, borderW, borderH);

  // Layer B: Main Metallic Gold Inset Border
  const goldGrad = ctx.createLinearGradient(0, 0, width, height);
  goldGrad.addColorStop(0, '#D4AF37');
  goldGrad.addColorStop(0.25, '#F5DEB3');
  goldGrad.addColorStop(0.5, '#D4AF37');
  goldGrad.addColorStop(0.75, '#AA7C11');
  goldGrad.addColorStop(1, '#D4AF37');

  ctx.strokeStyle = goldGrad;
  ctx.lineWidth = 5;
  ctx.strokeRect(outerMargin + 16, outerMargin + 16, borderW - 32, borderH - 32);

  // Layer C: Thin Pinstripe Inset
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(innerMargin, innerMargin, width - innerMargin * 2, height - innerMargin * 2);

  // Layer D: Geometric Filigree Corners (4 Corners)
  const drawCornerFlourish = (x, y, flipX, flipY) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flipX, flipY);
    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 2.5;

    // Corner L-Bracket
    ctx.beginPath();
    ctx.moveTo(15, 60);
    ctx.lineTo(15, 15);
    ctx.lineTo(60, 15);
    ctx.stroke();

    // Corner Diamond Accent
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.moveTo(28, 20);
    ctx.lineTo(36, 28);
    ctx.lineTo(28, 36);
    ctx.lineTo(20, 28);
    ctx.closePath();
    ctx.fill();

    // Corner Diagonal Accent
    ctx.beginPath();
    ctx.moveTo(0, 45);
    ctx.lineTo(45, 0);
    ctx.stroke();

    ctx.restore();
  };

  drawCornerFlourish(innerMargin, innerMargin, 1, 1);
  drawCornerFlourish(width - innerMargin, innerMargin, -1, 1);
  drawCornerFlourish(innerMargin, height - innerMargin, 1, -1);
  drawCornerFlourish(width - innerMargin, height - innerMargin, -1, -1);

  ctx.restore();

  // =========================================================================
  // 4. TOP BRAND HEADER: BRANDSWAY SKILL ACADEMY
  // =========================================================================
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Small Top Crest Badge / Emblem
  const emblemY = 135;
  ctx.fillStyle = '#7C3AED';
  ctx.beginPath();
  ctx.arc(width / 2, emblemY, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Inner star / letter in emblem
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('B', width / 2, emblemY);

  // "BRANDSWAY SKILL ACADEMY"
  ctx.textBaseline = 'top';
  ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#0F172A';
  ctx.letterSpacing = '5px';
  ctx.fillText('BRANDSWAY SKILL ACADEMY', width / 2, 175);

  // Subtitle / Tagline
  ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.letterSpacing = '3px';
  ctx.fillText('EMPOWERING FUTURE-READY DIGITAL CRAFTSMANSHIP', width / 2, 210);

  // Thin gold rule under academy header
  ctx.strokeStyle = goldGrad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 160, 235);
  ctx.lineTo(width / 2 + 160, 235);
  ctx.stroke();
  ctx.restore();

  // =========================================================================
  // 5. CERTIFICATE TITLE: "CERTIFICATE OF PARTICIPATION"
  // =========================================================================
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // "C E R T I F I C A T E   O F"
  ctx.font = '700 22px "Cinzel", "Playfair Display", Georgia, serif';
  ctx.fillStyle = '#334155';
  ctx.letterSpacing = '14px';
  ctx.fillText('C E R T I F I C A T E   O F', width / 2, 290);

  // "PARTICIPATION" in Grand Regal Indigo-Purple Gradient
  const partGrad = ctx.createLinearGradient(width / 2, 320, width / 2, 430);
  partGrad.addColorStop(0, '#0F172A');
  partGrad.addColorStop(0.4, '#1E1B4B');
  partGrad.addColorStop(1, '#581C87');
  ctx.fillStyle = partGrad;
  ctx.font = '900 106px "Playfair Display", Georgia, serif';
  ctx.letterSpacing = '6px';
  ctx.fillText('PARTICIPATION', width / 2, 380);

  // "—— THIS IS PROUDLY PRESENTED TO ——"
  const lineY = 460;
  const ruleLen = 240;
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1.2;

  // Left rule line
  ctx.beginPath();
  ctx.moveTo(width / 2 - 420, lineY);
  ctx.lineTo(width / 2 - 420 + ruleLen, lineY);
  ctx.stroke();

  // Right rule line
  ctx.beginPath();
  ctx.moveTo(width / 2 + 420 - ruleLen, lineY);
  ctx.lineTo(width / 2 + 420, lineY);
  ctx.stroke();

  // Small gold diamond at center left & right
  ctx.fillStyle = '#D4AF37';
  ctx.fillRect(width / 2 - 420 + ruleLen - 3, lineY - 3, 6, 6);
  ctx.fillRect(width / 2 + 420 - ruleLen - 3, lineY - 3, 6, 6);

  ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.letterSpacing = '5px';
  ctx.fillText('THIS IS PROUDLY PRESENTED TO', width / 2, lineY);
  ctx.restore();

  // =========================================================================
  // 6. PARTICIPANT NAME (Centerpiece with Dynamic Auto-Scaling)
  // =========================================================================
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';

  const cleanName = (participantName || 'Participant Name').trim();
  const nameY = 595;

  // Dynamic font sizing for long & short names to eliminate clipping
  let nameSize = 66;
  ctx.font = `700 ${nameSize}px "Playfair Display", Georgia, serif`;
  const maxNameWidth = 1050;
  while (ctx.measureText(cleanName).width > maxNameWidth && nameSize > 26) {
    nameSize -= 2;
    ctx.font = `700 ${nameSize}px "Playfair Display", Georgia, serif`;
  }

  // Deep obsidian slate gradient for name
  const nameGrad = ctx.createLinearGradient(width / 2 - 280, 0, width / 2 + 280, 0);
  nameGrad.addColorStop(0, '#0F172A');
  nameGrad.addColorStop(0.5, '#1E1B4B');
  nameGrad.addColorStop(1, '#0F172A');
  ctx.fillStyle = nameGrad;
  ctx.fillText(cleanName, width / 2, nameY);

  // Ornamental Dual Gold-Purple Underline
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 420, nameY + 14);
  ctx.lineTo(width / 2 + 420, nameY + 14);
  ctx.stroke();

  // Center Diamond on Underline
  ctx.fillStyle = '#7C3AED';
  ctx.beginPath();
  ctx.moveTo(width / 2, nameY + 7);
  ctx.lineTo(width / 2 + 7, nameY + 14);
  ctx.lineTo(width / 2, nameY + 21);
  ctx.lineTo(width / 2 - 7, nameY + 14);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // =========================================================================
  // 7. WORKSHOP CITATION & DETAILS (AI Website Building Workshop)
  // =========================================================================
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Attribution Lead-in
  ctx.font = '500 21px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#475569';
  ctx.letterSpacing = '0.5px';
  ctx.fillText('for successfully attending and actively participating in the intensive workshop on', width / 2, 660);

  // Workshop Title (Primary Feature)
  const workshopGrad = ctx.createLinearGradient(width / 2 - 350, 0, width / 2 + 350, 0);
  workshopGrad.addColorStop(0, '#1E1B4B');
  workshopGrad.addColorStop(0.5, '#7C3AED');
  workshopGrad.addColorStop(1, '#1E1B4B');
  ctx.fillStyle = workshopGrad;
  ctx.font = '900 50px "Plus Jakarta Sans", sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText(workshopName, width / 2, 730);

  // Tagline: "Explore • Learn • Build • Grow"
  ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.letterSpacing = '2px';
  ctx.fillText(WORKSHOP_CONFIG.tagline, width / 2, 785);

  // Commendation Paragraph
  ctx.font = '500 17px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText(
    'Demonstrating commendable dedication to mastering modern AI web development technologies,',
    width / 2,
    835
  );
  ctx.fillText(
    'hands-on prompt craftsmanship, and future-ready digital implementation.',
    width / 2,
    865
  );
  ctx.restore();

  // =========================================================================
  // 8. EVENT METADATA STRIP: DATE & LOCATION
  // =========================================================================
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const metaBoxY = 930;
  ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#0F172A';
  ctx.letterSpacing = '1.5px';

  const dateText = `DATE: ${workshopDate.toUpperCase()}`;
  const locText = `VENUE: ${location.toUpperCase()}`;
  const fullMeta = `${dateText}    •    ${locText}`;
  ctx.fillText(fullMeta, width / 2, metaBoxY);

  // Subtle separator line under metadata
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 350, metaBoxY + 22);
  ctx.lineTo(width / 2 + 350, metaBoxY + 22);
  ctx.stroke();
  ctx.restore();

  // =========================================================================
  // 9. OFFICIAL SCALLOPED EMBOSSED GOLD SEAL (Center Bottom)
  // =========================================================================
  ctx.save();
  const sealX = width / 2;
  const sealY = 1175;
  const sealRadius = 95;

  // Soft seal shadow
  ctx.shadowColor = 'rgba(15, 23, 42, 0.18)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 10;

  // Scalloped 36-point Radiant Gold Outer Trim
  ctx.translate(sealX, sealY);
  ctx.fillStyle = '#D4AF37';
  for (let i = 0; i < 36; i++) {
    ctx.rotate((Math.PI * 2) / 36);
    ctx.beginPath();
    ctx.moveTo(0, sealRadius + 12);
    ctx.lineTo(10, sealRadius);
    ctx.lineTo(-10, sealRadius);
    ctx.closePath();
    ctx.fill();
  }

  // Deep Royal Indigo / Midnight Purple Seal Core
  ctx.shadowColor = 'transparent';
  ctx.beginPath();
  ctx.arc(0, 0, sealRadius, 0, Math.PI * 2);
  const sealGrad = ctx.createRadialGradient(0, 0, 15, 0, 0, sealRadius);
  sealGrad.addColorStop(0, '#2E1065');
  sealGrad.addColorStop(0.7, '#1E1233');
  sealGrad.addColorStop(1, '#0F091E');
  ctx.fillStyle = sealGrad;
  ctx.fill();

  // Dual Gold Inner Filigree Rings
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = '#D4AF37';
  ctx.stroke();

  ctx.lineWidth = 1.2;
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.7)';
  ctx.beginPath();
  ctx.arc(0, 0, sealRadius - 8, 0, Math.PI * 2);
  ctx.stroke();

  // Embossed Seal Inscriptions
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FAF9F6';
  ctx.font = '800 13px "Cinzel", serif';
  ctx.letterSpacing = '3px';
  ctx.fillText('BRANDSWAY', 0, -28);

  ctx.font = '700 11px "Cinzel", serif';
  ctx.letterSpacing = '2px';
  ctx.fillStyle = '#D4AF37';
  ctx.fillText('SKILL ACADEMY', 0, -6);

  ctx.font = '900 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('★ ★ ★', 0, 16);

  ctx.font = '700 9.5px "Plus Jakarta Sans", sans-serif';
  ctx.letterSpacing = '1.5px';
  ctx.fillStyle = '#E2E8F0';
  ctx.fillText('OFFICIAL SEAL', 0, 36);

  ctx.restore();

  // =========================================================================
  // 10. FOUNDER & INSTRUCTOR SIGNATURE — Lower Left Area
  // =========================================================================
  ctx.save();
  const sigX = 520;
  const sigY = 1200;

  // Cursive Ink Signature
  ctx.textAlign = 'center';
  ctx.font = '700 56px "Alex Brush", "Great Vibes", cursive';
  ctx.fillStyle = '#1E1B4B';
  ctx.shadowColor = 'rgba(30, 27, 75, 0.15)';
  ctx.shadowBlur = 4;
  ctx.fillText('Yasir Ali', sigX, sigY - 14);

  // Signature Base Rule
  ctx.shadowColor = 'transparent';
  ctx.beginPath();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#94A3B8';
  ctx.moveTo(sigX - 140, sigY);
  ctx.lineTo(sigX + 140, sigY);
  ctx.stroke();

  // Printed Name
  ctx.font = '800 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#0F172A';
  ctx.letterSpacing = '1.5px';
  ctx.fillText('YASIR ALI', sigX, sigY + 22);

  // Role Title
  ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#7C3AED';
  ctx.letterSpacing = '0.5px';
  ctx.fillText('Founder & Instructor, Brandsway Skill Academy', sigX, sigY + 44);

  ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('Authorized Signatory', sigX, sigY + 62);
  ctx.restore();

  // =========================================================================
  // 11. VERIFICATION QR CODE & CREDENTIAL ID — Lower Right Area
  // =========================================================================
  ctx.save();
  const qrX = width - 520;
  const qrY = 1200;
  const qrSize = 110;

  try {
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: qrSize,
      margin: 1,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
    });

    const qrImg = new Image();
    await new Promise((resolve, reject) => {
      qrImg.onload = resolve;
      qrImg.onerror = reject;
      qrImg.src = qrDataUrl;
    });

    // Elegant card frame for QR Code
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 4;

    const qrPad = 8;
    ctx.beginPath();
    ctx.roundRect(
      qrX - qrSize / 2 - qrPad,
      qrY - qrSize - 18 - qrPad,
      qrSize + qrPad * 2,
      qrSize + qrPad * 2,
      10
    );
    ctx.fill();
    ctx.stroke();

    ctx.drawImage(qrImg, qrX - qrSize / 2, qrY - qrSize - 18, qrSize, qrSize);

    // QR Label
    ctx.textAlign = 'center';
    ctx.font = '800 11.5px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#334155';
    ctx.shadowColor = 'transparent';
    ctx.letterSpacing = '0.5px';
    ctx.fillText('SCAN TO VERIFY ONLINE', qrX, qrY + 16);

    // Certificate ID in high-visibility purple monospace
    ctx.font = '800 14px "Plus Jakarta Sans", monospace';
    ctx.fillStyle = '#7C3AED';
    ctx.letterSpacing = '1px';
    ctx.fillText(`ID: ${certificateId}`, qrX, qrY + 36);

    ctx.font = '600 10.5px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText('OFFICIAL DIGITAL CREDENTIAL', qrX, qrY + 54);
  } catch (err) {
    console.error('QR rendering error on canvas:', err);
  }
  ctx.restore();

  // =========================================================================
  // 12. BOTTOM CERTIFICATE METADATA FOOTER
  // =========================================================================
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.letterSpacing = '2px';
  ctx.fillText(
    'BRANDSWAY SKILL ACADEMY • TAMPER-PROOF DIGITAL WORKSHOP CERTIFICATE • OFFICIAL REGISTRY',
    width / 2,
    height - outerMargin - 24
  );
  ctx.restore();
}

/**
 * Generates an A4 Landscape PDF from the certificate data using pdf-lib
 */
export async function generateCertificatePDF(certData) {
  const canvas = document.createElement('canvas');
  await renderCertificateCanvas(canvas, certData);

  const pngDataUrl = canvas.toDataURL('image/png', 1.0);
  const pngBytes = await fetch(pngDataUrl).then(res => res.arrayBuffer());

  // Standard A4 Landscape in PDF Points (841.89 x 595.28 pt)
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([841.89, 595.28]);

  const pngImage = await pdfDoc.embedPng(pngBytes);
  page.drawImage(pngImage, {
    x: 0,
    y: 0,
    width: 841.89,
    height: 595.28,
  });

  const participant = certData.participantName || 'Participant';
  const workshop = certData.workshopName || WORKSHOP_CONFIG.workshopTitle;
  const certId = certData.certificateId || 'BRW-AIWB-0001';

  pdfDoc.setTitle(`Certificate of Participation - ${participant}`);
  pdfDoc.setAuthor('Brandsway Skill Academy');
  pdfDoc.setSubject(`${workshop} - Certificate ${certId}`);
  pdfDoc.setKeywords(['Certificate', 'Brandsway Skill Academy', 'AI Website Building Workshop', certId, 'Yasir Ali']);
  pdfDoc.setCreationDate(new Date());

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Triggers direct browser download of the certificate PDF with sanitized filename
 */
export function downloadPDFBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'Brandsway_Certificate.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * Opens the certificate PDF in a new browser tab.
 * Crucial mobile fallback per PRD Section 3 if direct download is blocked.
 */
export function openPDFBlob(blob) {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
