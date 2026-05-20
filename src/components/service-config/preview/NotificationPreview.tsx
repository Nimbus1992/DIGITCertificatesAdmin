import React from "react";
import { Mail, MessageSquare, BellRing } from "lucide-react";
import EmulatorFrame from "./EmulatorFrame";

/** Sample tokens used when rendering personalization variables in previews. */
const SAMPLE_TOKENS: Record<string, string> = {
  applicationNumber: "BL-2026-00421",
  applicantName: "Anita Sharma",
  businessName: "Sharma Traders",
  applicationStatus: "Under Review",
};

const renderTokens = (s: string) =>
  s.replace(/\{(\w+)\}/g, (_, k) => SAMPLE_TOKENS[k] ?? `{${k}}`);

interface Props {
  /** "mobile" => citizen-facing; "desktop" => employee-facing. */
  device: "mobile" | "desktop";
  subject: string;
  message: string;
  /** Display only — informs the email "from" line. */
  recipientLabel?: string;
}

const NotificationPreview: React.FC<Props> = ({ device, subject, message, recipientLabel }) => {
  const resolvedSubject = renderTokens(subject || "(no subject)");
  const resolvedMessage = renderTokens(message || "Your message will appear here.");

  return (
    <EmulatorFrame device={device} label={device === "mobile" ? "Citizen view" : "Employee view"}>
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Status bar */}
        <div className="bg-slate-50 border-b px-3 py-2 text-[10px] text-muted-foreground flex items-center justify-between">
          <span>9:41</span>
          <span>● ● ●</span>
        </div>

        {/* SMS bubble */}
        <div className="p-3 space-y-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <MessageSquare className="h-3 w-3" /> SMS preview
          </div>
          <div className="flex">
            <div className="max-w-[85%] bg-emerald-100 text-emerald-950 rounded-2xl rounded-tl-sm px-3 py-2 text-[11px] leading-snug shadow-sm">
              {resolvedMessage}
            </div>
          </div>
          {message.length > 0 && (
            <p className="text-[9px] text-muted-foreground text-right">
              {message.length}/160 chars
            </p>
          )}
        </div>

        <div className="border-t my-1" />

        {/* Email card */}
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Mail className="h-3 w-3" /> Email preview
          </div>
          <div className="border rounded-md overflow-hidden bg-white shadow-sm">
            <div className="border-b px-2.5 py-1.5 bg-slate-50 space-y-0.5">
              <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                <span className="truncate">From: noreply@gov.in</span>
                <span className="shrink-0">9:41 AM</span>
              </div>
              {recipientLabel && (
                <div className="text-[10px] text-muted-foreground truncate">
                  To: {recipientLabel}
                </div>
              )}
              <div className="text-[11px] font-semibold text-foreground line-clamp-2">
                {resolvedSubject}
              </div>
            </div>
            <div className="px-2.5 py-2 text-[11px] text-foreground/90 leading-snug whitespace-pre-wrap">
              {resolvedMessage}
            </div>
          </div>
        </div>

        <div className="border-t my-1" />

        {/* Push */}
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <BellRing className="h-3 w-3" /> Push preview
          </div>
          <div className="rounded-lg bg-slate-100 px-2.5 py-2 text-[11px] shadow-sm">
            <p className="font-semibold truncate">{resolvedSubject}</p>
            <p className="text-muted-foreground line-clamp-2">{resolvedMessage}</p>
          </div>
        </div>
      </div>
    </EmulatorFrame>
  );
};

export default NotificationPreview;
