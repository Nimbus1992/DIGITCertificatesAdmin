import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  Bell,
  Upload,
  Search,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  Users,
  Settings,
  Play,
  Pencil,
  PlusCircle,
  Workflow,
  LayoutList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { tradeTemplate, type ServiceTemplate } from "@/data/serviceTemplates";

interface Props {
  template?: ServiceTemplate;
  onUseTemplate?: () => void;
  onPreview?: () => void;
  onBack: () => void;
}

/* ── tiny helpers ──────────────────────────────────── */

const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({
  title,
  children,
  className,
}) => (
  <section className={`space-y-4 ${className ?? ""}`}>
    <h3 className="text-xl font-bold text-foreground">{title}</h3>
    {children}
  </section>
);

const IconCard: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
    <span className="shrink-0 text-accent">{icon}</span>
    <span className="text-sm text-foreground">{text}</span>
  </div>
);

const FlowStep: React.FC<{ icon: React.ReactNode; label: string; isLast?: boolean }> = ({
  icon,
  label,
  isLast,
}) => (
  <div className="flex items-center gap-2">
    <div className="flex flex-col items-center gap-1">
      <div className="w-10 h-10 rounded-full bg-accent/15 text-accent flex items-center justify-center">
        {icon}
      </div>
      <span className="text-xs text-muted-foreground text-center max-w-[80px]">{label}</span>
    </div>
    {!isLast && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-[-16px]" />}
  </div>
);

const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="space-y-1.5">
    {items.map((item) => (
      <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-accent shrink-0" /> {item}
      </li>
    ))}
  </ul>
);

/* ── main component ───────────────────────────────── */

const TemplateIntroduction: React.FC<Props> = ({ template = tradeTemplate, onUseTemplate, onPreview, onBack }) => {
  const Icon = template.icon;
  const isComingSoon = !!template.comingSoon;
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* 1 ─ Header */}
        <header className="flex flex-col sm:flex-row items-start gap-5 animate-slide-up">
          <div className="w-14 h-14 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
            <Icon className="h-7 w-7" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-bold text-foreground">{template.name}</h2>
              {isComingSoon && (
                <Badge variant="outline" className="text-[10px] uppercase tracking-wide border-accent/40 text-accent">
                  Coming Soon
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {template.description}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              {!isComingSoon && onUseTemplate && <Button onClick={onUseTemplate}>Use Template</Button>}
              {!isComingSoon && onPreview && (
                <Button variant="outline" onClick={onPreview} className="gap-1.5">
                  <Play className="h-4 w-4" /> Preview Application
                </Button>
              )}
              <Button variant="ghost" onClick={onBack} className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Back to Templates
              </Button>
            </div>
          </div>
        </header>

        {/* 2 ─ Overview */}
        <Section title="What is Business License Template">
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Business License template helps governments and organizations manage business licensing
            digitally. It allows you to accept applications, review them, approve requests, issue
            licenses, and manage renewals — all in one place.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This template comes pre-configured with a complete licensing workflow, forms,
            notifications, and dashboards that you can customize as needed.
          </p>
        </Section>

        {/* 3 ─ What You Can Do */}
        <Section title="What You Can Do with This Template">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <IconCard icon={<ClipboardList className="h-5 w-5" />} text="Accept business license applications online" />
            <IconCard icon={<Search className="h-5 w-5" />} text="Review and verify submitted applications" />
            <IconCard icon={<ShieldCheck className="h-5 w-5" />} text="Approve or reject applications" />
            <IconCard icon={<FileText className="h-5 w-5" />} text="Issue digital business licenses" />
            <IconCard icon={<RefreshCw className="h-5 w-5" />} text="Manage license renewals" />
            <IconCard icon={<LayoutList className="h-5 w-5" />} text="Track application status" />
            <IconCard icon={<Bell className="h-5 w-5" />} text="Notify applicants automatically" />
            <IconCard icon={<Upload className="h-5 w-5" />} text="Maintain license records and documents" />
          </div>
        </Section>

        {/* 4 ─ How It Works */}
        <Section title="How This Works">
          <div className="flex flex-wrap items-start gap-2 overflow-x-auto py-2">
            <FlowStep icon={<ClipboardList className="h-5 w-5" />} label="Citizen Applies" />
            <FlowStep icon={<Search className="h-5 w-5" />} label="Application Reviewed" />
            <FlowStep icon={<ShieldCheck className="h-5 w-5" />} label="Approval Decision" />
            <FlowStep icon={<FileText className="h-5 w-5" />} label="License Issued" />
            <FlowStep icon={<Bell className="h-5 w-5" />} label="Renewal Reminder" />
            <FlowStep icon={<RefreshCw className="h-5 w-5" />} label="Renewal Process" isLast />
          </div>
        </Section>

        {/* 5 ─ Modules */}
        <Section title="Flows Included in This Template">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Application Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">
                  This module allows applicants to apply for a new business license.
                </p>
                <BulletList
                  items={[
                    "Application submission",
                    "Document upload",
                    "Review process",
                    "Approval or rejection",
                    "License issuance",
                  ]}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Renewal Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">
                  This module allows applicants to renew their business license.
                </p>
                <BulletList
                  items={[
                    "Renewal application",
                    "Expiry tracking",
                    "Review process",
                    "Renewal approval",
                    "Updated license issuance",
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* 6 ─ Workflow Overview */}
        <Section title="Pre-Configured Workflow">
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Application Workflow</h4>
              <div className="flex flex-wrap items-center gap-2">
                {["Apply", "Review", "Approval", "License Issued"].map((s, i, a) => (
                  <React.Fragment key={s}>
                    <Badge variant="secondary">{s}</Badge>
                    {i < a.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Renewal Workflow</h4>
              <div className="flex flex-wrap items-center gap-2">
                {["Renew", "Review", "Approval", "Renewed"].map((s, i, a) => (
                  <React.Fragment key={s}>
                    <Badge variant="secondary">{s}</Badge>
                    {i < a.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* 7 ─ Roles */}
        <Section title="Roles Involved">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: "Citizen", icon: <Users className="h-5 w-5" />, tasks: ["Applies for license", "Uploads documents"] },
              { name: "Reviewer", icon: <Search className="h-5 w-5" />, tasks: ["Reviews application", "Verifies details"] },
              { name: "Approver", icon: <UserCheck className="h-5 w-5" />, tasks: ["Approves or rejects"] },
              { name: "Administrator", icon: <Settings className="h-5 w-5" />, tasks: ["Configures application", "Manages users"] },
            ].map((r) => (
              <Card key={r.name} className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-accent">{r.icon}</span>
                  <span className="font-semibold text-sm text-foreground">{r.name}</span>
                </div>
                <ul className="space-y-1">
                  {r.tasks.map((t) => (
                    <li key={t} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-accent" /> {t}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Section>

        {/* 8 ─ Forms */}
        <Section title="Forms Included">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-4">
              <h4 className="font-semibold text-sm text-foreground mb-2">Application Form</h4>
              <BulletList items={["Business Details", "Owner Details", "Address", "Supporting Documents"]} />
            </Card>
            <Card className="p-4">
              <h4 className="font-semibold text-sm text-foreground mb-2">Renewal Form</h4>
              <BulletList items={["License Number", "Updated Details", "Supporting Documents"]} />
            </Card>
          </div>
        </Section>

        {/* 9 ─ Notifications */}
        <Section title="Automated Notifications">
          <p className="text-sm text-muted-foreground mb-3">
            This template includes notifications for:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              "Application submitted",
              "Application approved",
              "Application rejected",
              "License issued",
              "Renewal reminder",
            ].map((n) => (
              <div key={n} className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
                <Bell className="h-4 w-4 text-accent shrink-0" />
                <span className="text-sm text-foreground">{n}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* 10 ─ Customization */}
        <Section title="You Can Customize Everything">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { icon: <Pencil className="h-4 w-4" />, text: "Modify forms" },
              { icon: <Workflow className="h-4 w-4" />, text: "Update workflow" },
              { icon: <Users className="h-4 w-4" />, text: "Add roles" },
              { icon: <Bell className="h-4 w-4" />, text: "Change notifications" },
              { icon: <PlusCircle className="h-4 w-4" />, text: "Add fields" },
              { icon: <FileText className="h-4 w-4" />, text: "Modify documents" },
            ].map((c) => (
              <div key={c.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-accent">{c.icon}</span> {c.text}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground italic mt-2">
            This template is fully customizable to match your requirements.
          </p>
        </Section>

        {/* 11 ─ Video placeholder */}
        <Section title="See How It Works">
          <div className="relative rounded-xl border border-border bg-muted/40 flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <div className="w-14 h-14 rounded-full bg-accent/15 text-accent flex items-center justify-center">
                <Play className="h-6 w-6" />
              </div>
              <span className="text-sm">Watch demo</span>
            </div>
          </div>
        </Section>

        {/* 12 ─ Bottom CTA */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center py-4">
          {!isComingSoon && onUseTemplate && (
            <Button onClick={onUseTemplate} size="lg">
              Use Template
            </Button>
          )}
          {!isComingSoon && onPreview && (
            <Button onClick={onPreview} size="lg" variant="outline" className="gap-1.5">
              <Play className="h-4 w-4" /> Preview Application
            </Button>
          )}
          <Button variant="ghost" onClick={onBack} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Templates
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TemplateIntroduction;
