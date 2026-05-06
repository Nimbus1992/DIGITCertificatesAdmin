import { jsPDF } from "jspdf";
import type { PreviewApplication } from "@/components/preview/PreviewContext";

const fmtDate = (ts: number) =>
  new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const fmtDateTime = (ts: number) =>
  new Date(ts).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function downloadInvoicePdf(app: PreviewApplication, serviceName: string) {
  if (!app.paymentDetails || !app.demand) return;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.75);
  doc.rect(36, 36, W - 72, H - 72);

  const cx = W / 2;
  let y = 80;

  // Emblem
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
  doc.text("PAYMENT INVOICE", cx, y, { align: "center", charSpace: 1.2 });
  doc.setDrawColor(11, 79, 108);
  doc.setLineWidth(1.2);
  doc.line(cx - 28, y + 6, cx + 28, y + 6);
  y += 30;

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

  const labelLX = 70;
  const valueLX = 170;
  const labelRX = W / 2 + 10;
  const valueRX = W / 2 + 110;

  // Invoice details
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("Invoice No", labelLX, y);
  doc.text("Payment Date", labelRX, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text(app.paymentDetails.invoiceNumber || "—", valueLX, y);
  doc.text(fmtDate(app.paymentDetails.paidAt), valueRX, y);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("Transaction ID", labelLX, y);
  doc.text("Mode", labelRX, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text(app.paymentDetails.txnId, valueLX, y);
  doc.text("Online (Mock)", valueRX, y);
  y += 22;

  dashed(y);
  y += 18;

  // Application reference
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
  doc.text("Application", labelLX, y);
  doc.text("Business", labelRX, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text(serviceName, valueLX, y);
  doc.text(app.formData.businessName || app.formData.f5 || "—", valueRX, y, { maxWidth: W - valueRX - 60 });
  y += 22;

  dashed(y);
  y += 18;

  // Payment table
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

  const rupee = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text("Total Amount", itemX, y);
  doc.text(rupee(app.demand.total), amtX, y, { align: "right" });
  y += 16;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text("Amount Paid", itemX, y);
  doc.text(rupee(app.paymentDetails.amount), amtX, y, { align: "right" });
  y += 18;

  dashed(y);
  y += 26;

  // Status
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(21, 128, 61);
  doc.text("PAYMENT SUCCESSFUL", cx, y, { align: "center", charSpace: 1.5 });
  y += 18;

  // Footer
  const fy = H - 70;
  dashed(fy - 14);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated on ${fmtDateTime(Date.now())}`, cx, fy, { align: "center" });
  doc.text("This is a system-generated receipt. No physical signature required.", cx, fy + 12, { align: "center" });

  doc.save(`invoice-${app.paymentDetails.invoiceNumber || app.applicationNumber}.pdf`);
}
