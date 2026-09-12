import { PDFDocument } from 'pdf-lib';
import QRCode from 'qrcode';

/**
 * Renders the exact official The BrandsWay Certificate of Participation
 * faithful to the user's reference design at ultra-crisp resolution (2400 x 1600).
 */
export async function renderCertificateCanvas(canvas, certData) {
  const width = 2400;
  const height = 1600;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const {
    participantName = 'Participant Name',
    certificateId = 'BRW-AIRO-0001',
    workshopName = 'AI for Real Opportunities',
    workshopDate = '13 SEPT 2026',
    location = 'ALIGARH, INDIA',
    verificationUrl = `${window.location.origin}/verify/${certificateId}`,
  } = certData;

  // =========================================================================
  // 1. BASE BACKGROUND: Luxury White Paper with Subtle Soft Warm Shading
  // =========================================================================
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#FFFFFF');
  bgGrad.addColorStop(0.5, '#FAF9F6');
  bgGrad.addColorStop(1, '#F7F5F0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle silk / paper grain diagonal sheen
  const sheenGrad = ctx.createLinearGradient(0, 0, width, height * 0.7);
  sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  sheenGrad.addColorStop(0.4, 'rgba(245, 243, 238, 0.4)');
  sheenGrad.addColorStop(1, 'rgba(238, 235, 228, 0.2)');
  ctx.fillStyle = sheenGrad;
  ctx.fillRect(0, 0, width, height);

  // =========================================================================
  // 2. RIGHT SIDE VERTICAL WATERMARK: "BRANDSWAY"
  // =========================================================================
  ctx.save();
  ctx.translate(width - 110, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 115px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(15, 23, 42, 0.04)';
  ctx.letterSpacing = '18px';
  ctx.fillText('BRANDSWAY', 0, 0);
  ctx.restore();

  // =========================================================================
  // 3. LEFT DECORATIVE DIAGONAL BANNER (Purple with Gold Trim)
  // =========================================================================
  ctx.save();
  // Purple Fold Shadow
  ctx.shadowColor = 'rgba(15, 23, 42, 0.18)';
  ctx.shadowBlur = 35;
  ctx.shadowOffsetX = 12;

  // Main Purple Polygon
  ctx.beginPath();
  ctx.moveTo(0, 240);
  ctx.lineTo(240, 520);
  ctx.lineTo(160, 640);
  ctx.lineTo(0, 920);
  ctx.closePath();

  const purpleGrad = ctx.createLinearGradient(0, 240, 240, 640);
  purpleGrad.addColorStop(0, '#1E1233');
  purpleGrad.addColorStop(0.5, '#2A164D');
  purpleGrad.addColorStop(1, '#180B2B');
  ctx.fillStyle = purpleGrad;
  ctx.fill();

  // Outer Gold Line Trim
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 240);
  ctx.lineTo(240, 520);
  ctx.lineTo(160, 640);
  ctx.lineTo(0, 920);
  ctx.stroke();

  // Secondary Thin Gold Accent Line
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 260);
  ctx.lineTo(225, 520);
  ctx.lineTo(145, 640);
  ctx.lineTo(0, 900);
  ctx.stroke();

  // Text inside Left Ribbon: SAME SKILLS A BRIGHTER TOMORROW
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 15px "Plus Jakarta Sans", sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillText('SAME', 85, 470);
  ctx.fillText('SKILLS', 85, 510);
  ctx.fillText('A BRIGHTER', 85, 550);
  ctx.fillText('TOMORROW', 85, 590);

  // Small gold separator under ribbon text
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(45, 620);
  ctx.lineTo(125, 620);
  ctx.stroke();
  ctx.restore();

  // =========================================================================
  // 4. BOTTOM-RIGHT CORNER ACCENT (Purple with Gold Trim)
  // =========================================================================
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(width - 240, height);
  ctx.lineTo(width, height - 190);
  ctx.lineTo(width, height);
  ctx.closePath();

  const brGrad = ctx.createLinearGradient(width - 240, height, width, height - 190);
  brGrad.addColorStop(0, '#1E1233');
  brGrad.addColorStop(1, '#2A164D');
  ctx.fillStyle = brGrad;
  ctx.fill();

  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(width - 240, height);
  ctx.lineTo(width, height - 190);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width - 215, height);
  ctx.lineTo(width, height - 170);
  ctx.stroke();
  ctx.restore();

  // =========================================================================
  // 5. TOP-LEFT BRAND LOGO: "The BrandsWay Skill Academy"
  // =========================================================================
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // "The Brands" (Black)
  ctx.font = '900 38px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#0F172A';
  ctx.fillText('The Brands', 160, 110);

  const tbWidth = ctx.measureText('The Brands').width;

  // "Way" (Electric BrandsWay Purple)
  ctx.fillStyle = '#7C3AED';
  ctx.fillText('Way', 160 + tbWidth, 110);

  // "Skill Academy" (Subtitle)
  ctx.font = '700 17px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#475569';
  ctx.letterSpacing = '1px';
  ctx.fillText('Skill Academy', 160, 160);
  ctx.restore();

  // =========================================================================
  // 6. TOP-RIGHT TEXT: "LEARN BUILD GROW"
  // =========================================================================
  ctx.save();
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.font = '800 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#334155';
  ctx.letterSpacing = '4px';
  ctx.fillText('LEARN', width - 180, 105);
  ctx.fillText('BUILD', width - 180, 130);
  ctx.fillText('GROW', width - 180, 155);

  // Gold line under GROW
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width - 235, 185);
  ctx.lineTo(width - 180, 185);
  ctx.stroke();
  ctx.restore();

  // =========================================================================
  // 7. CENTER HEADER: "CERTIFICATE OF PARTICIPATION"
  // =========================================================================
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // "C E R T I F I C A T E   O F"
  ctx.font = '700 22px "Cinzel", "Playfair Display", serif';
  ctx.fillStyle = '#1E293B';
  ctx.letterSpacing = '12px';
  ctx.fillText('C E R T I F I C A T E   O F', width / 2, 270);

  // "PARTICIPATION" (Large Bold Serif with Rich Indigo/Purple Gradient)
  const partGrad = ctx.createLinearGradient(width / 2, 310, width / 2, 420);
  partGrad.addColorStop(0, '#0F172A');
  partGrad.addColorStop(0.5, '#1E1233');
  partGrad.addColorStop(1, '#4C1D95');
  ctx.fillStyle = partGrad;
  ctx.font = '800 102px "Playfair Display", Georgia, serif';
  ctx.letterSpacing = '6px';
  ctx.fillText('PARTICIPATION', width / 2, 360);

  // "—— THIS IS TO CERTIFY THAT ——"
  const lineY = 445;
  const ruleLen = 220;
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1.2;

  // Left rule line
  ctx.beginPath();
  ctx.moveTo(width / 2 - 380, lineY);
  ctx.lineTo(width / 2 - 380 + ruleLen, lineY);
  ctx.stroke();

  // Right rule line
  ctx.beginPath();
  ctx.moveTo(width / 2 + 380 - ruleLen, lineY);
  ctx.lineTo(width / 2 + 380, lineY);
  ctx.stroke();

  ctx.font = '700 17px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#475569';
  ctx.letterSpacing = '5px';
  ctx.fillText('THIS IS TO CERTIFY THAT', width / 2, lineY);
  ctx.restore();

  // =========================================================================
  // 8. PARTICIPANT NAME & PURPLE UNDERLINE (Centerpiece)
  // =========================================================================
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';

  const cleanName = (participantName || 'Participant Name').trim();
  const nameY = 575;

  // Dynamic font sizing for short and long participant names
  let nameSize = 62;
  ctx.font = `700 ${nameSize}px "Playfair Display", Georgia, serif`;
  const maxNameWidth = 920;
  while (ctx.measureText(cleanName).width > maxNameWidth && nameSize > 28) {
    nameSize -= 2;
    ctx.font = `700 ${nameSize}px "Playfair Display", Georgia, serif`;
  }

  // Dark rich slate gradient for name
  const nameGrad = ctx.createLinearGradient(width / 2 - 250, 0, width / 2 + 250, 0);
  nameGrad.addColorStop(0, '#0F172A');
  nameGrad.addColorStop(0.5, '#1E1B4B');
  nameGrad.addColorStop(1, '#0F172A');
  ctx.fillStyle = nameGrad;
  ctx.fillText(cleanName, width / 2, nameY);

  // Purple designated underline
  ctx.strokeStyle = '#A78BFA';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 380, nameY + 12);
  ctx.lineTo(width / 2 + 380, nameY + 12);
  ctx.stroke();
  ctx.restore();

  // =========================================================================
  // 9. WORKSHOP DETAILS & APPRECIATION
  // =========================================================================
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // "has actively participated in the workshop"
  ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#334155';
  ctx.letterSpacing = '0.5px';
  ctx.fillText('has actively participated in the workshop', width / 2, 635);

  // Workshop Title: "AI for Real Opportunities"
  // "AI for" in Bold Slate, "Real Opportunities" in Electric Purple
  ctx.font = '900 46px "Plus Jakarta Sans", sans-serif';
  const aiText = 'AI for ';
  const roText = 'Real Opportunities';
  const aiWidth = ctx.measureText(aiText).width;
  const roWidth = ctx.measureText(roText).width;
  const totalWorkshopW = aiWidth + roWidth;
  const startWX = width / 2 - totalWorkshopW / 2;

  ctx.textAlign = 'left';
  ctx.fillStyle = '#0F172A';
  ctx.fillText(aiText, startWX, 700);

  const roGrad = ctx.createLinearGradient(startWX + aiWidth, 0, startWX + totalWorkshopW, 0);
  roGrad.addColorStop(0, '#7C3AED');
  roGrad.addColorStop(1, '#6D28D9');
  ctx.fillStyle = roGrad;
  ctx.fillText(roText, startWX + aiWidth, 700);

  // Tagline: "Explore. Learn. Build. Grow."
  ctx.textAlign = 'center';
  ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#475569';
  ctx.letterSpacing = '1px';
  ctx.fillText('Explore. Learn. Build. Grow.', width / 2, 755);

  // Appreciation Message
  ctx.font = '500 16.5px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('We appreciate your curiosity, enthusiasm, and commitment to learning', width / 2, 805);
  ctx.fillText('the skills that shape a smarter tomorrow.', width / 2, 832);
  ctx.restore();

  // =========================================================================
  // 10. OFFICIAL SCALLOPED EMBOSSED SEAL (Center Bottom)
  // =========================================================================
  ctx.save();
  const sealX = width / 2;
  const sealY = 1070;
  const sealRadius = 88;

  // Soft seal shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;

  // Scalloped 32-point gold outer trim
  ctx.translate(sealX, sealY);
  ctx.fillStyle = '#D4AF37';
  for (let i = 0; i < 32; i++) {
    ctx.rotate((Math.PI * 2) / 32);
    ctx.beginPath();
    ctx.moveTo(0, sealRadius + 10);
    ctx.lineTo(10, sealRadius);
    ctx.lineTo(-10, sealRadius);
    ctx.closePath();
    ctx.fill();
  }

  // Deep Purple Seal Body
  ctx.shadowColor = 'transparent';
  ctx.beginPath();
  ctx.arc(0, 0, sealRadius, 0, Math.PI * 2);
  const sealGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, sealRadius);
  sealGrad.addColorStop(0, '#2E1065');
  sealGrad.addColorStop(1, '#180838');
  ctx.fillStyle = sealGrad;
  ctx.fill();

  // Gold Inner Ring
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#D4AF37';
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
  ctx.beginPath();
  ctx.arc(0, 0, sealRadius - 7, 0, Math.PI * 2);
  ctx.stroke();

  // Embossed Seal Text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FAF9F6';
  ctx.font = '700 13px "Cinzel", serif';
  ctx.letterSpacing = '3px';
  ctx.fillText('THE', 0, -26);

  ctx.font = '800 17px "Cinzel", serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('BRANDSWAY', 0, -2);

  ctx.font = '600 11.5px "Plus Jakarta Sans", sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillStyle = '#D4AF37';
  ctx.fillText('SKILL ACADEMY', 0, 22);
  ctx.restore();

  // =========================================================================
  // 11. FOUNDER SIGNATURE (Yasir Ali, Founder) — Lower Left Area
  // =========================================================================
  ctx.save();
  const sigX = 540;
  const sigY = 1120;

  // Elegant Cursive Signature in dark ink
  ctx.textAlign = 'center';
  ctx.font = '700 52px "Alex Brush", "Great Vibes", cursive';
  ctx.fillStyle = '#1E1B4B';
  ctx.shadowColor = 'rgba(30, 27, 75, 0.12)';
  ctx.shadowBlur = 4;
  ctx.fillText('Yasir Ali', sigX, sigY - 14);

  // Signature rule line
  ctx.shadowColor = 'transparent';
  ctx.beginPath();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#CBD5E1';
  ctx.moveTo(sigX - 120, sigY);
  ctx.lineTo(sigX + 120, sigY);
  ctx.stroke();

  // Printed Name
  ctx.font = '800 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#0F172A';
  ctx.letterSpacing = '1px';
  ctx.fillText('YASIR ALI', sigX, sigY + 22);

  // Title
  ctx.font = '700 12.5px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#7C3AED'; // BrandsWay Purple
  ctx.letterSpacing = '0.5px';
  ctx.fillText('Founder, The BrandsWay Skill Academy', sigX, sigY + 42);
  ctx.restore();

  // =========================================================================
  // 12. DIGITAL VERIFICATION QR CODE & CREDENTIAL ID — Lower Right Area
  // =========================================================================
  ctx.save();
  const qrX = width - 540;
  const qrY = 1120;
  const qrSize = 105;

  try {
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: qrSize,
      margin: 1,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF'
      }
    });

    const qrImg = new Image();
    await new Promise((resolve, reject) => {
      qrImg.onload = resolve;
      qrImg.onerror = reject;
      qrImg.src = qrDataUrl;
    });

    // Clean white card frame for QR code
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    const qrCardPad = 6;
    ctx.beginPath();
    ctx.roundRect(qrX - qrSize / 2 - qrCardPad, qrY - qrSize - 16 - qrCardPad, qrSize + qrCardPad * 2, qrSize + qrCardPad * 2, 8);
    ctx.fill();
    ctx.stroke();

    ctx.drawImage(qrImg, qrX - qrSize / 2, qrY - qrSize - 16, qrSize, qrSize);

    // QR Label
    ctx.textAlign = 'center';
    ctx.font = '800 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#475569';
    ctx.shadowColor = 'transparent';
    ctx.letterSpacing = '0.5px';
    ctx.fillText('SCAN TO VERIFY ONLINE', qrX, qrY + 12);

    // Unique Certificate ID
    ctx.font = '800 14px "Plus Jakarta Sans", monospace';
    ctx.fillStyle = '#7C3AED';
    ctx.letterSpacing = '1px';
    ctx.fillText(`ID: ${certificateId}`, qrX, qrY + 30);

    ctx.font = '600 10.5px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('OFFICIAL DIGITAL CREDENTIAL', qrX, qrY + 46);

  } catch (err) {
    console.error('QR rendering error on canvas:', err);
  }
  ctx.restore();

  // =========================================================================
  // 13. BOTTOM-LEFT: "SKILLS TODAY / OPPORTUNITIES TOMORROW"
  // =========================================================================
  ctx.save();
  ctx.textAlign = 'left';
  ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#334155';
  ctx.letterSpacing = '2px';
  ctx.fillText('SKILLS TODAY', 230, height - 150);
  ctx.fillText('OPPORTUNITIES TOMORROW', 230, height - 128);

  // Subtle rule line to the left
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(150, height - 140);
  ctx.lineTo(215, height - 140);
  ctx.stroke();
  ctx.restore();

  // =========================================================================
  // 14. BOTTOM-RIGHT: "13 SEPT 2026 / ALIGARH, INDIA"
  // =========================================================================
  ctx.save();
  ctx.textAlign = 'right';
  ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#334155';
  ctx.letterSpacing = '2px';
  ctx.fillText(workshopDate, width - 260, height - 150);
  ctx.fillText(location, width - 260, height - 128);

  // Subtle rule line above
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width - 420, height - 165);
  ctx.lineTo(width - 260, height - 165);
  ctx.stroke();
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

  pdfDoc.setTitle(`Certificate of Participation - ${certData.participantName}`);
  pdfDoc.setAuthor('Yasir Ali, Founder - The BrandsWay Skill Academy');
  pdfDoc.setSubject(`AI for Real Opportunities - Certificate ${certData.certificateId}`);
  pdfDoc.setKeywords(['Certificate', 'The BrandsWay', 'AI Workshop', certData.certificateId, 'Yasir Ali']);
  pdfDoc.setCreationDate(new Date());

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Triggers direct browser download of the certificate PDF
 */
export function downloadPDFBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'TheBrandsWay_Certificate.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
