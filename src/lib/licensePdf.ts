import { jsPDF } from "jspdf";
import type { PreviewApplication } from "@/components/preview/PreviewContext";

const fmtDate = (ts: number) =>
  new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export function downloadLicensePdf(app: PreviewApplication, serviceName: string) {
  if (!app.license) return;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // Subtle single frame
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.75);
  doc.rect(36, 36, W - 72, H - 72);

  // ===== Header (centered, no fill) =====
  const cx = W / 2;
  let y = 80;

  // Emblem placeholder
  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(0.6);
  doc.rect(cx - 14, y - 14, 28, 28);
  doc.setFillColor(60, 60, 60);
  doc.rect(cx - 10, y - 10, 8, 8, "F");
  doc.rect(cx + 2, y - 10, 8, 8, "F");
  doc.rect(cx - 10, y + 2, 8, 8, "F");
  doc.rect(cx + 2, y + 2, 8, 8, "F");
  y += 30;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text("GOVERNMENT OF INDIA", cx, y, { align: "center", charSpace: 1.5 });
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110, 110, 110);
  doc.text("Department of Municipal Administration", cx, y, { align: "center" });
  y += 26;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(20, 20, 20);
  doc.text("BUSINESS LICENSE CERTIFICATE", cx, y, { align: "center", charSpace: 1.2 });
  // Accent underline
  doc.setDrawColor(11, 79, 108);
  doc.setLineWidth(1.2);
  doc.line(cx - 28, y + 6, cx + 28, y + 6);
  y += 36;

  // ===== License number — primary =====
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("LICENSE NO.", cx - 6, y, { align: "right", charSpace: 1 });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(20, 20, 20);
  doc.text(app.license.number, cx + 6, y, { align: "left" });
  y += 22;

  // Dashed divider helper
  const dashed = (yy: number) => {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    const xs = 60;
    const xe = W - 60;
    const dash = 3;
    const gap = 3;
    let x = xs;
    while (x < xe) {
      doc.line(x, yy, Math.min(x + dash, xe), yy);
      x += dash + gap;
    }
  };

  dashed(y);
  y += 18;

  // ===== Details + QR =====
  const detailsTop = y;
  const labelX = 70;
  const valueX = 170;
  const rowH = 18;

  const rows: [string, string][] = [
    ["Applicant", app.formData.f1 || "—"],
    ["Business", app.formData.f5 || "—"],
    ["Type", app.formData.f6 || "—"],
    ["Application", serviceName],
  ];

  doc.setFontSize(10);
  rows.forEach(([k, v], i) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(k, labelX, detailsTop + i * rowH);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text(String(v), valueX, detailsTop + i * rowH, { maxWidth: W - valueX - 130 });
  });

  // QR placeholder top-right
  const qrSize = 70;
  const qrX = W - 60 - qrSize;
  const qrY = detailsTop - 10;
  doc.setDrawColor(120, 120, 120);
  doc.setLineWidth(0.8);
  doc.rect(qrX, qrY, qrSize, qrSize);
  // simple QR-ish pattern
  doc.setFillColor(40, 40, 40);
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      if ((i * 7 + j) % 3 === 0) {
        doc.rect(qrX + 6 + i * 10, qrY + 6 + j * 10, 6, 6, "F");
      }
    }
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("Scan to verify", qrX + qrSize / 2, qrY + qrSize + 12, { align: "center" });

  y = detailsTop + rows.length * rowH + 14;

  dashed(y);
  y += 18;

  // ===== Validity =====
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("Issued", labelX, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text(fmtDate(app.license.issuedAt), valueX, y);
  y += rowH;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("Valid Till", labelX, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(21, 128, 61); // green
  doc.text(fmtDate(app.license.validTill), valueX, y);
  y += 24;

  dashed(y);
  y += 40;

  // ===== Issuing authority =====
  const sigRight = W - 70;
  const sigW = 160;
  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(0.6);
  doc.line(sigRight - sigW, y, sigRight, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text("Issuing Authority", sigRight, y + 14, { align: "right" });
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("(Signature)", sigRight, y + 28, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 150);
  doc.text("DIGITALLY GENERATED", sigRight, y + 42, { align: "right", charSpace: 1 });

  // ===== Footer =====
  const fy = H - 70;
  dashed(fy - 14);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("This is a system-generated certificate.", cx, fy, { align: "center" });
  doc.text("No physical signature required.", cx, fy + 12, { align: "center" });

  doc.save(`${app.license.number.replace(/\//g, "-")}.pdf`);
}
