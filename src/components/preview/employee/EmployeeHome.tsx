import React, { useMemo } from "react";
import { usePreview } from "../PreviewContext";
import { Inbox, Search, FileCheck2, IndianRupee, Clock, CheckCircle2, Store, Building2, CalendarDays, Activity, ChevronRight } from "lucide-react";
import EmployeeTopBar from "./EmployeeTopBar";

const WorkbenchIllustration: React.FC = () => (
  <svg viewBox="0 0 200 140" className="w-36 h-28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* paper stack behind */}
    <rect x="40" y="38" width="80" height="92" rx="6" fill="hsl(var(--accent) / 0.12)" />
    <rect x="50" y="30" width="80" height="92" rx="6" fill="hsl(var(--background))" stroke="hsl(var(--accent) / 0.35)" strokeWidth="1.5" />
    <line x1="60" y1="48" x2="118" y2="48" stroke="hsl(var(--accent) / 0.35)" strokeWidth="2" strokeLinecap="round" />
    <line x1="60" y1="60" x2="108" y2="60" stroke="hsl(var(--muted-foreground) / 0.35)" strokeWidth="2" strokeLinecap="round" />
    <line x1="60" y1="72" x2="115" y2="72" stroke="hsl(var(--muted-foreground) / 0.35)" strokeWidth="2" strokeLinecap="round" />
    <line x1="60" y1="84" x2="100" y2="84" stroke="hsl(var(--muted-foreground) / 0.35)" strokeWidth="2" strokeLinecap="round" />
    {/* clipboard */}
    <rect x="115" y="55" width="60" height="74" rx="6" fill="hsl(var(--primary))" />
    <rect x="120" y="60" width="50" height="64" rx="3" fill="white" />
    <rect x="135" y="50" width="20" height="10" rx="2" fill="hsl(var(--primary) / 0.7)" />
    <line x1="128" y1="74" x2="162" y2="74" stroke="hsl(var(--muted-foreground) / 0.4)" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="128" y1="84" x2="158" y2="84" stroke="hsl(var(--muted-foreground) / 0.4)" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="128" y1="94" x2="160" y2="94" stroke="hsl(var(--muted-foreground) / 0.4)" strokeWidth="1.5" strokeLinecap="round" />
    {/* checkmark badge */}
    <circle cx="160" cy="42" r="14" fill="hsl(142 71% 45%)" />
    <path d="M154 42l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const CornerBlob: React.FC<{ color: string }> = ({ color }) => (
  <svg className="absolute -right-6 -bottom-6 w-24 h-24 opacity-30" viewBox="0 0 100 100" fill="none" aria-hidden="true">
    <path d="M50 0C75 10 100 25 95 55C90 85 60 100 35 95C10 90 0 65 5 40C10 15 25 -10 50 0Z" fill={color} />
  </svg>
);

const EmployeeHome: React.FC = () => {
  const { setScreen, serviceName, applications, role } = usePreview();

  const stats = useMemo(() => {
    const roleStates: Record<string, string[]> = {
      documentVerifier: ["s1", "s_dv"],
      fieldInspector: ["s_ip"],
      approver: ["s3", "s5"],
    };
    const ownStates = roleStates[role] ?? [];
    const pending = applications.filter((a) => ownStates.includes(a.currentStateId)).length;
    const approved = applications.filter((a) => ["s6", "s9"].includes(a.currentStateId)).length;
    const revenue = applications.reduce((sum, a) => sum + (a.paymentDetails?.amount ?? 0), 0);
    return { total: applications.length, pending, approved, revenue };
  }, [applications, role]);

  const recentActivity = useMemo(() => {
    const all = applications.flatMap((a) =>
      a.timeline.map((t) => ({ ...t, appNumber: a.applicationNumber, appId: a.id }))
    );
    return all.sort((x, y) => y.at - x.at).slice(0, 5);
  }, [applications]);

  const services = [
    {
      id: "trade",
      title: serviceName,
      icon: Store,
      pending: applications.filter((a) => ["s1", "s_dv", "s_ip", "s3", "s4", "s5", "s7"].includes(a.currentStateId)).length,
      approved: applications.filter((a) => ["s6", "s9"].includes(a.currentStateId)).length,
      active: true,
      gradient: "from-emerald-50 via-teal-50 to-sky-50",
      iconBg: "bg-gradient-to-br from-emerald-400 to-teal-500",
      blobColor: "hsl(160 60% 60%)",
    },
    { id: "building", title: "Building Permit", icon: Building2, pending: 0, approved: 0, active: false, gradient: "from-amber-50 via-orange-50 to-rose-50", iconBg: "bg-gradient-to-br from-amber-300 to-orange-400", blobColor: "hsl(30 90% 65%)" },
    { id: "event", title: "Event Permit", icon: CalendarDays, pending: 0, approved: 0, active: false, gradient: "from-violet-50 via-fuchsia-50 to-pink-50", iconBg: "bg-gradient-to-br from-violet-400 to-fuchsia-400", blobColor: "hsl(280 70% 70%)" },
  ];

  const rolePendingStates: Record<string, string[]> = {
    documentVerifier: ["s1", "s_dv"],
    fieldInspector: ["s_ip"],
    approver: ["s3", "s5"],
  };

  const cards: Array<{
    label: string;
    value: string | number;
    icon: typeof FileCheck2;
    gradient: string;
    iconBg: string;
    glow: string;
    filterStates?: string[];
    filterLabel: string;
  }> = [
    { label: "Total", value: stats.total, icon: FileCheck2, gradient: "from-sky-50 to-blue-50", iconBg: "bg-sky-500", glow: "shadow-sky-500/30", filterLabel: "All applications" },
    { label: "Pending", value: stats.pending, icon: Clock, gradient: "from-amber-50 to-orange-50", iconBg: "bg-amber-500", glow: "shadow-amber-500/30", filterStates: rolePendingStates[role] ?? [], filterLabel: "Pending applications" },
    { label: "Issued", value: stats.approved, icon: CheckCircle2, gradient: "from-emerald-50 to-green-50", iconBg: "bg-emerald-500", glow: "shadow-emerald-500/30", filterStates: ["s6", "s9"], filterLabel: "Issued licenses" },
    { label: "Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: IndianRupee, gradient: "from-violet-50 to-fuchsia-50", iconBg: "bg-violet-500", glow: "shadow-violet-500/30", filterStates: ["s5", "s6", "s9"], filterLabel: "Paid applications" },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-background to-sky-50/40">
      <EmployeeTopBar />

      <div className="p-6">
        {/* Hero band */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/10 via-sky-100/40 to-emerald-50 border border-accent/15 p-6 mb-6 flex items-center justify-between">
          <div className="relative z-10">
            <p className="text-[11px] text-accent uppercase tracking-widest font-semibold">Workbench</p>
            <h2 className="text-3xl font-bold text-foreground mt-1">Licenses &amp; Permits</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Process applications across services as the <span className="font-semibold text-foreground">{role === "documentVerifier" ? "Document Verifier" : role === "fieldInspector" ? "Field Inspector" : role === "approver" ? "Approver" : "Citizen"}</span>.
            </p>
          </div>
          <div className="hidden md:block">
            <WorkbenchIllustration />
          </div>
          <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-accent/10 blur-2xl" />
        </div>

        {/* Top metrics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.label}
                onClick={() => setScreen({
                  type: "inbox",
                  ...(c.filterStates ? { filterStates: c.filterStates, filterLabel: c.filterLabel } : {}),
                })}
                className={`group relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${c.gradient} border border-border/50 text-left cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent/40`}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 text-white shadow-lg ${c.iconBg} ${c.glow}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold text-foreground">{c.value}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {c.label}
                  <span className="text-[9px] text-muted-foreground/70">· this period</span>
                </p>
                <span className="absolute top-2 right-2 inline-flex items-center gap-0.5 text-[9px] font-semibold text-accent bg-accent/10 px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  View <ChevronRight className="h-2.5 w-2.5" />
                </span>
                {/* sparkline accent */}
                <svg className="absolute right-2 bottom-2 w-12 h-6 opacity-40" viewBox="0 0 48 24" fill="none">
                  <path d="M0 18L8 12L16 16L24 6L32 10L40 4L48 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-foreground/40" />
                </svg>
              </button>
            );
          })}
        </div>

        {/* Service breakdown */}
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Applications</p>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${s.gradient} border border-border/50 ${s.active ? "" : "opacity-60"}`}
              >
                <CornerBlob color={s.blobColor} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-md ${s.active ? s.iconBg : "bg-muted text-muted-foreground"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-foreground flex-1 truncate">{s.title}</p>
                    {!s.active && (
                      <span className="text-[9px] uppercase bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                        Soon
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg py-2 px-2 bg-white/60 backdrop-blur text-center">
                      <p className="text-lg font-bold text-amber-600">{s.pending}</p>
                      <p className="text-[10px] text-muted-foreground">Pending</p>
                    </div>
                    <div className="rounded-lg py-2 px-2 bg-white/60 backdrop-blur text-center">
                      <p className="text-lg font-bold text-emerald-700">{s.approved}</p>
                      <p className="text-[10px] text-muted-foreground">Approved</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main actions + Recent activity */}
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setScreen({ type: "inbox" })}
            className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-accent to-teal-600 text-white text-left flex items-center gap-4 shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-all hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "12px 12px" }} />
            <div className="relative h-12 w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Inbox className="h-6 w-6 text-white" />
            </div>
            <div className="relative flex-1">
              <p className="font-semibold">Inbox</p>
              <p className="text-xs text-white/80">Process pending applications</p>
            </div>
            <ChevronRight className="relative h-5 w-5 text-white/80" />
          </button>
          <button
            onClick={() => setScreen({ type: "search" })}
            className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white text-left flex items-center gap-4 shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 transition-all hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "12px 12px" }} />
            <div className="relative h-12 w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Search className="h-6 w-6 text-white" />
            </div>
            <div className="relative flex-1">
              <p className="font-semibold">Search</p>
              <p className="text-xs text-white/80">Find by number or status</p>
            </div>
            <ChevronRight className="relative h-5 w-5 text-white/80" />
          </button>

          <div className="rounded-xl p-4 bg-card border border-border/50 row-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center">
                <Activity className="h-3.5 w-3.5 text-accent" />
              </div>
              <p className="text-xs font-semibold text-foreground">Recent Activity</p>
            </div>
            {recentActivity.length === 0 ? (
              <p className="text-[11px] text-muted-foreground py-2">No activity yet.</p>
            ) : (
              <ul className="space-y-2 relative">
                <span className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-border" />
                {recentActivity.map((e, i) => (
                  <li key={i} className="text-[11px] flex items-start gap-2.5 relative">
                    <span className="h-2.5 w-2.5 rounded-full bg-accent mt-1 shrink-0 ring-2 ring-background" />
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground truncate">
                        <span className="font-semibold">{e.state}</span>
                        <span className="text-muted-foreground"> by {e.actor}</span>
                      </p>
                      <p className="text-muted-foreground text-[10px] truncate font-mono">{e.appNumber}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHome;
