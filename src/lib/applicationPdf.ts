import { jsPDF } from "jspdf";
import type { PreviewApplication, FormSectionConfig, WorkflowStateConfig } from "@/components/preview/PreviewContext";

const fmtDateTime = (ts: number) =>
  new Date(ts).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });


interface DownloadOptions {
  includeDocuments?: boolean;
  includeChecklists?: boolean;
}

export function downloadApplicationPdf(
  app: PreviewApplication,
  serviceName: string,
  formSections: FormSectionConfig[],
  workflowStates: WorkflowStateConfig[],
  options: DownloadOptions = {}
) {
  const { includeDocuments = false, includeChecklists = false } = options;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 40; // margin
  let y = M;

  const ensureSpace = (needed: number) => {
    if (y + needed > H - M - 30) {
      addFooter();
      doc.addPage();
      y = M;
    }
  };

  const addFooter = () => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(
      `Generated ${fmtDateTime(Date.now())} • DIGIT Studio Preview`,
      W / 2, H - 24, { align: "center" }
    );
  };

  // Header banner
  doc.setFillColor(11, 79, 108);
  doc.rect(0, 0, W, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(`${serviceName} — Application`, M, 32);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(app.applicationNumber, M, 52);
  doc.text(`Status: ${app.status}`, W - M, 52, { align: "right" });
  y = 100;

  doc.setTextColor(20, 20, 20);

  // Quick info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  const meta: [string, string][] = [
    ["Type", app.type === "RENEWAL" ? "Renewal" : "New Application"],
    ["Submitted", fmtDateTime(app.createdAt)],
  ];
  if (app.demand) meta.push(["Total Fee", `Rs. ${app.demand.total.toLocaleString()}`]);
  if (app.paymentStatus) meta.push(["Payment", app.paymentStatus === "paid" ? "Paid" : "Pending"]);
  if (app.license) meta.push(["License No.", app.license.number]);

  meta.forEach(([k, v]) => {
    ensureSpace(16);
    doc.setFont("helvetica", "bold");
    doc.text(k, M, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(v), M + 110, y, { maxWidth: W - M - 110 });
    y += 16;
  });
  y += 6;

  // Form sections
  formSections.forEach((section) => {
    const fields = section.fields.filter((f) => app.formData[f.id]);
    if (fields.length === 0) return;
    ensureSpace(40);
    doc.setFillColor(240, 248, 250);
    doc.rect(M, y - 12, W - M * 2, 22, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(11, 79, 108);
    doc.setFontSize(11);
    doc.text(section.name.toUpperCase(), M + 8, y + 3);
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(10);
    y += 22;
    fields.forEach((f) => {
      ensureSpace(16);
      doc.setFont("helvetica", "bold");
      doc.text(f.label, M + 8, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(app.formData[f.id]), M + 180, y, { maxWidth: W - M - 200 });
      y += 16;
    });
    y += 6;
  });

  // Documents
  if (includeDocuments && app.documents.length > 0) {
    ensureSpace(40);
    doc.setFillColor(240, 248, 250);
    doc.rect(M, y - 12, W - M * 2, 22, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(11, 79, 108);
    doc.setFontSize(11);
    doc.text("DOCUMENTS", M + 8, y + 3);
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(10);
    y += 22;

    // Table header
    doc.setFont("helvetica", "bold");
    doc.text("Type", M + 8, y);
    doc.text("File", M + 160, y);
    doc.text("Status", W - M - 80, y);
    y += 4;
    doc.setDrawColor(200, 200, 200);
    doc.line(M, y, W - M, y);
    y += 12;
    doc.setFont("helvetica", "normal");

    app.documents.forEach((d) => {
      ensureSpace(16);
      doc.text(d.type, M + 8, y, { maxWidth: 140 });
      doc.text(d.name, M + 160, y, { maxWidth: 200 });
      doc.text(d.status + (d.reused ? " (Reused)" : ""), W - M - 80, y);
      y += 14;
    });
    y += 10;
  }

  // Checklists
  if (includeChecklists && Object.keys(app.checklists).length > 0) {
    ensureSpace(40);
    doc.setFillColor(240, 248, 250);
    doc.rect(M, y - 12, W - M * 2, 22, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(11, 79, 108);
    doc.setFontSize(11);
    doc.text("CHECKLISTS", M + 8, y + 3);
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(10);
    y += 22;

    Object.entries(app.checklists).forEach(([stateId, items]) => {
      const stateName = workflowStates.find((s) => s.id === stateId)?.name ?? stateId;
      ensureSpace(20);
      doc.setFont("helvetica", "bold");
      doc.text(stateName, M + 8, y);
      y += 14;
      doc.setFont("helvetica", "normal");
      items.forEach((it) => {
        ensureSpace(14);
        doc.text(`${it.checked ? "[x]" : "[ ]"}  ${it.text}`, M + 16, y, { maxWidth: W - M - 24 });
        y += 14;
      });
      y += 6;
    });
  }

  // Timeline
  if (app.timeline.length > 0) {
    ensureSpace(40);
    doc.setFillColor(240, 248, 250);
    doc.rect(M, y - 12, W - M * 2, 22, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(11, 79, 108);
    doc.setFontSize(11);
    doc.text("TIMELINE", M + 8, y + 3);
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(10);
    y += 22;
    app.timeline.forEach((t) => {
      ensureSpace(16);
      doc.setFont("helvetica", "bold");
      doc.text(t.state, M + 8, y);
      doc.setFont("helvetica", "normal");
      doc.text(`${t.actor} • ${fmtDateTime(t.at)}`, M + 180, y, { maxWidth: W - M - 200 });
      y += 14;
      if (t.note) {
        ensureSpace(14);
        doc.setTextColor(110, 110, 110);
        doc.text(t.note, M + 16, y, { maxWidth: W - M - 24 });
        doc.setTextColor(20, 20, 20);
        y += 14;
      }
    });
  }

  addFooter();
  doc.save(`${app.applicationNumber}.pdf`);
}
