import { jsPDF } from "jspdf";
import type { PreviewApplication } from "@/components/preview/PreviewContext";

const fmtDate = (ts: number) =>
  new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export function downloadDemandNoticePdf(app: PreviewApplication, serviceName: string) {
  if (!app.demand) return;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // Subtle single frame
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.75);
  doc.rect(36, 36, W - 72, H - 72);

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
  doc.setFontSize(16);
  doc.setTextColor(20, 20, 20);
  doc.text("DEMAND NOTICE / FEE BILL", cx, y, { align: "center", charSpace: 1.2 });
  doc.setDrawColor(11, 79, 108);
  doc.setLineWidth(1.2);
  doc.line(cx - 28, y + 6, cx + 28, y + 6);
  y += 30;

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

  // Application reference (2-column)
  const labelLX = 70;
  const valueLX = 170;
  const labelRX = W / 2 + 10;
  const valueRX = W / 2 + 110;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("Application ID", labelLX, y);
  doc.text("Applicant", labelRX, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text(app.applicationNumber, valueLX, y, { maxWidth: (W / 2) - 100 });
  doc.text(app.formData.fullName || app.formData.f1 || "—", valueRX, y, { maxWidth: W - valueRX - 60 });
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("Issued On", labelLX, y);
  doc.text("Business", labelRX, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text(fmtDate(app.demand.generatedAt), valueLX, y);
  doc.text(app.formData.businessName || app.formData.f5 || "—", valueRX, y, { maxWidth: W - valueRX - 60 });
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("Application", labelLX, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text(serviceName, valueLX, y);
  y += 22;

  dashed(y);
  y += 18;

  // Fee breakdown table
  const itemX = 70;
  const amtX = W - 70;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("ITEM", itemX, y, { charSpace: 1 });
  doc.text("AMOUNT", amtX, y, { align: "right", charSpace: 1 });
  y += 8;
  dashed(y);
  y += 14;

  const rupee = (n: number | string) =>
    typeof n === "number" ? `Rs. ${n.toLocaleString("en-IN")}` : String(n);

  const rows: [string, string, boolean?][] = [
    ["Base Fee", rupee(app.demand.fee)],
    ["Area Fee", "—", true],
    ["Hazard Fee", "—", true],
    ["Tax / GST", rupee(app.demand.tax)],
    ["Multiplier", "—", true],
  ];

  doc.setFontSize(10);
  rows.forEach(([k, v, muted]) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(muted ? 160 : 40, muted ? 160 : 40, muted ? 160 : 40);
    doc.text(k, itemX, y);
    doc.text(v, amtX, y, { align: "right" });
    y += 16;
  });

  y += 4;
  dashed(y);
  y += 22;

  // Total
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  doc.text("TOTAL AMOUNT PAYABLE", itemX, y, { charSpace: 1 });
  doc.setFontSize(14);
  doc.text(rupee(app.demand.total), amtX, y, { align: "right" });
  y += 14;
  dashed(y);
  y += 24;

  // Instructions
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text("Please complete payment to proceed with license issuance.", cx, y, { align: "center" });

  // Footer
  const fy = H - 70;
  dashed(fy - 14);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated on ${fmtDate(Date.now())}`, cx, fy, { align: "center" });
  doc.text("This is a system-generated demand notice. No physical signature required.", cx, fy + 12, { align: "center" });

  doc.save(`demand-notice-${app.applicationNumber}.pdf`);
}
