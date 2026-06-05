import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useOnboarding, type ServiceItem } from "@/contexts/OnboardingContext";
import { usePersona } from "@/contexts/PersonaContext";
import { allTemplates, type ServiceTemplate } from "@/data/serviceTemplates";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  ArrowRight,
  MoreHorizontal,
  Settings,
  UserPlus,
  Trash2,
  Eye,
  LayoutTemplate,
  FileText,
  Rocket,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import AssignOwnerSheet from "@/components/templates/AssignOwnerSheet";
import TemplateCatalogDialog from "@/components/services/TemplateCatalogDialog";
import TemplateCard from "@/components/services/TemplateCard";
import { mockApplicationVolume } from "@/components/services/computeSetupProgress";

const formatRelative = (ts?: number) => {
  if (!ts) return "—";
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
};

/* =========================================================================
 * Page
 * ========================================================================= */

const ServicesWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const { state, deleteService } = useOnboarding();
  const { persona } = usePersona();
  const [params, setParams] = useSearchParams();
  const recentId = params.get("recent");

  const [catalogOpen, setCatalogOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<ServiceItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ServiceItem | null>(null);
  const [templatesExpanded, setTemplatesExpanded] = useState(true);

  const isServiceOwner = persona.role === "service_owner";
  const canManage = !isServiceOwner;

  const templateById = useMemo(() => {
    const map = new Map<string, ServiceTemplate>();
    allTemplates.forEach((t) => map.set(t.id, t));
    return map;
  }, []);

  const usageByTemplate = useMemo(() => {
    const m = new Map<string, number>();
    state.services.forEach((s) => m.set(s.templateId, (m.get(s.templateId) ?? 0) + 1));
    return m;
  }, [state.services]);

  const visibleServices = useMemo(() => {
    const base = state.services.filter((s) => !s.isEphemeralPreview);
    if (!isServiceOwner) return base;
    return base.filter((s) =>
      (s.assignedOwners ?? []).includes(persona.email.toLowerCase()),
    );
  }, [state.services, isServiceOwner, persona.email]);

  const draftServices = useMemo(() => {
    const list = visibleServices.filter((s) => !s.isLive);
    return [...list].sort((a, b) => {
      if (recentId) {
        if (a.id === recentId) return -1;
        if (b.id === recentId) return 1;
      }
      return (b.updatedAt ?? 0) - (a.updatedAt ?? 0);
    });
  }, [visibleServices, recentId]);

  const liveServices = useMemo(
    () =>
      [...visibleServices.filter((s) => s.isLive)].sort(
        (a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0),
      ),
    [visibleServices],
  );

  const goConfigure = (s: ServiceItem) =>
    navigate(`/templates/${s.templateId}/setup?serviceId=${encodeURIComponent(s.id)}`);
  const goManageConfig = (s: ServiceItem) =>
    navigate(`/service/${s.id}/configure`, { state: { mode: "configure" } });
  const goOverview = (s: ServiceItem) =>
    navigate(`/service/${s.id}/configure`, { state: { mode: "overview" } });
  const goOperations = (s: ServiceItem) =>
    navigate(`/service/${s.id}/configure`, { state: { mode: "operate" } });
  const goPreviewService = (s: ServiceItem) => navigate(`/service/${s.id}/preview`);

  const openTemplateDetails = (t: ServiceTemplate) => navigate(`/templates/${t.id}`);
  const openTemplatePreview = (t: ServiceTemplate) => {
    if (t.comingSoon) {
      toast.info(`${t.name} is coming soon`);
      return;
    }
    navigate(`/templates/${t.id}/preview`);
  };

  const activateTemplate = (t: ServiceTemplate) => {
    if (t.comingSoon) {
      toast.info(`${t.name} is coming soon`);
      return;
    }
    navigate(`/templates/${t.id}/activate`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1280px] mx-auto px-8 py-8 text-base">
        {/* =================== Header =================== */}
        <header className="flex items-start justify-between gap-6 mb-8 pb-6 border-b border-border">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {isServiceOwner ? "My services" : "Services"}
            </h1>
            <p className="text-base text-muted-foreground mt-1 max-w-2xl">
              {isServiceOwner
                ? "Services assigned to you. Continue configuration or open the live workspace."
                : "Manage the full lifecycle of your services — from template activation to live operations."}
            </p>
          </div>
          {!isServiceOwner && (
            <Button
              size="default"
              onClick={() => setCatalogOpen(true)}
              className="shrink-0 h-10 px-4 shadow-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Create new service
            </Button>
          )}
        </header>

        {/* =================== Section 1 — Drafts =================== */}
        {draftServices.length > 0 && (
          <section className="mb-10">
            <SectionHeader
              icon={FileText}
              title="Drafts"
              count={draftServices.length}
              subtitle="Services in setup. Continue configuring or preview the experience."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {draftServices.map((s) => (
                <DraftServiceCard
                  key={s.id}
                  service={s}
                  template={templateById.get(s.templateId)}
                  isRecent={s.id === recentId}
                  canManage={canManage}
                  onContinue={() => goOverview(s)}
                  onCompleteSetup={() => goConfigure(s)}
                  onPreview={() => goPreviewService(s)}
                  onAssign={() => setAssignTarget(s)}
                  onDelete={() => setPendingDelete(s)}
                />
              ))}
            </div>
          </section>
        )}

        {/* =================== Section 2 — Live services =================== */}
        {liveServices.length > 0 && (
          <section className="mb-12">
            <SectionHeader
              icon={Rocket}
              title="Live services"
              count={liveServices.length}
              subtitle="Deployed services accepting applications."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveServices.map((s) => (
                <LiveServiceCard
                  key={s.id}
                  service={s}
                  template={templateById.get(s.templateId)}
                  canManage={canManage}
                  onOpen={() => goOverview(s)}
                  onOperations={() => goOperations(s)}
                  onConfigure={() => goManageConfig(s)}
                  onAssign={() => setAssignTarget(s)}
                />
              ))}
            </div>
          </section>
        )}

        {/* =================== Section 3 — Templates =================== */}
        {!isServiceOwner && (
          <section>
            <button
              onClick={() => setTemplatesExpanded((v) => !v)}
              className="w-full flex items-center justify-between gap-3 mb-4 group"
            >
              <div className="flex items-center gap-2">
                <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-base font-semibold text-foreground">Available templates</h2>
                <span className="text-sm text-muted-foreground tabular-nums">{allTemplates.length}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {templatesExpanded ? "Hide" : "Show"}
                <ChevronDown
                  className={cn("h-3.5 w-3.5 transition-transform", templatesExpanded && "rotate-180")}
                />
              </div>
            </button>

            {templatesExpanded && (
              <div className="space-y-6">
                <TemplateGroup
                  label="Live on SaaS"
                  templates={allTemplates.filter((t) => !t.comingSoon)}
                  usageByTemplate={usageByTemplate}
                  onPreview={openTemplatePreview}
                  onDetails={openTemplateDetails}
                  onActivate={activateTemplate}
                />
                <TemplateGroup
                  label="Coming soon"
                  templates={allTemplates.filter((t) => t.comingSoon)}
                  usageByTemplate={usageByTemplate}
                  onPreview={openTemplatePreview}
                  onDetails={openTemplateDetails}
                  onActivate={activateTemplate}
                />
              </div>
            )}
          </section>
        )}
      </div>

      {/* =================== Modals & sheets =================== */}
      <TemplateCatalogDialog
        open={catalogOpen}
        onOpenChange={setCatalogOpen}
        onActivate={activateTemplate}
        onPreview={openTemplatePreview}
        onDetails={openTemplateDetails}
        usageByTemplate={usageByTemplate}
      />

      <AssignOwnerSheet
        service={assignTarget}
        open={!!assignTarget}
        onOpenChange={(o) => !o && setAssignTarget(null)}
      />

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{pendingDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the service and its configuration. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!pendingDelete) return;
                const name = pendingDelete.name;
                deleteService(pendingDelete.id);
                setPendingDelete(null);
                if (recentId === pendingDelete.id) {
                  params.delete("recent");
                  setParams(params, { replace: true });
                }
                toast.success(`"${name}" deleted`);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete service
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

/* =========================================================================
 * Section header
 * ========================================================================= */

const SectionHeader: React.FC<{
  icon: React.ElementType;
  title: string;
  count: number;
  subtitle?: string;
}> = ({ icon: Icon, title, count, subtitle }) => (
  <div className="mb-4">
    <div className="flex items-baseline gap-2">
      <Icon className="h-4 w-4 text-muted-foreground self-center" />
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <span className="text-sm text-muted-foreground tabular-nums">{count}</span>
    </div>
    {subtitle && <p className="text-sm text-muted-foreground mt-1 ml-6">{subtitle}</p>}
  </div>
);

/* =========================================================================
 * Attention row
 * ========================================================================= */

const DraftServiceCard: React.FC<{
  service: ServiceItem;
  template?: ServiceTemplate;
  isRecent: boolean;
  canManage: boolean;
  onContinue: () => void;
  onCompleteSetup: () => void;
  onPreview: () => void;
  onAssign: () => void;
  onDelete: () => void;
}> = ({ service, template, isRecent, canManage, onContinue, onCompleteSetup, onPreview, onAssign, onDelete }) => {
  const owners = service.assignedOwners ?? [];
  const Icon = template?.icon ?? LayoutTemplate;
  const setupComplete = Boolean(service.templateSetup);

  return (
    <div
      className={cn(
        "group rounded-lg border bg-card p-5 transition-all hover:shadow-sm hover:border-foreground/15",
        isRecent ? "border-primary/40 ring-1 ring-primary/15" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span className="h-9 w-9 rounded-md bg-muted flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-foreground truncate">{service.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {template ? `from ${template.name} · ` : ""}
              Updated {formatRelative(service.updatedAt ?? service.createdAt)}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center h-5 px-1.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-warning/10 text-warning ring-1 ring-warning/20 shrink-0">
          {isRecent ? "New" : "Draft"}
        </span>
      </div>

      {!setupComplete && (
        <div className="mt-4">
          <p className="text-[11px] text-muted-foreground">
            Finish template setup to start configuring.
          </p>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 min-w-0">
        {owners.length > 0 ? (
          <>
            <Avatar name={owners[0]} />
            <span className="text-xs text-foreground truncate min-w-0">{owners[0]}</span>
            {owners.length > 1 && (
              <span className="text-[11px] text-muted-foreground shrink-0">+{owners.length - 1}</span>
            )}
          </>
        ) : canManage ? (
          <button onClick={onAssign} className="inline-flex items-center gap-1 text-xs text-warning hover:underline">
            <UserPlus className="h-3 w-3" /> Assign owner
          </button>
        ) : (
          <span className="text-xs text-muted-foreground">Unassigned</span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        {setupComplete ? (
          <>
            <Button size="sm" className="h-8 text-xs flex-1" onClick={onContinue}>
              Continue configuring
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={onPreview}>
              <Eye className="h-3 w-3 mr-1" /> Preview
            </Button>
          </>
        ) : (
          <Button size="sm" className="h-8 text-xs flex-1" onClick={onCompleteSetup}>
            Complete setup
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        )}
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={onAssign}>
                <UserPlus className="h-3.5 w-3.5 mr-2" /> Assign service owner
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete service
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

/* =========================================================================
 * Live service card
 * ========================================================================= */

const Avatar: React.FC<{ name: string }> = ({ name }) => (
  <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold flex items-center justify-center shrink-0">
    {name[0]?.toUpperCase()}
  </span>
);

const LiveServiceCard: React.FC<{
  service: ServiceItem;
  template?: ServiceTemplate;
  canManage: boolean;
  onOpen: () => void;
  onOperations: () => void;
  onConfigure: () => void;
  onAssign: () => void;
}> = ({ service, template, canManage, onOpen, onOperations, onConfigure, onAssign }) => {
  const owners = service.assignedOwners ?? [];
  const Icon = template?.icon ?? LayoutTemplate;
  const volume = mockApplicationVolume(service.id);

  return (
    <div className="group rounded-lg border border-border bg-card p-5 transition-all hover:shadow-sm hover:border-foreground/15">
      <div className="flex items-start justify-between gap-3">
        <button onClick={onOpen} className="flex items-start gap-3 text-left min-w-0 flex-1">
          <span className="h-9 w-9 rounded-md bg-muted flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {service.name}
            </h3>
            {template && (
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">from {template.name}</p>
            )}
          </div>
        </button>
        <span className="inline-flex items-center h-5 px-1.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-success/10 text-success ring-1 ring-success/20 shrink-0">
          Live
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Applications</dt>
          <dd className="text-sm font-semibold text-foreground tabular-nums mt-0.5">
            {volume.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Updated</dt>
          <dd className="text-sm text-foreground mt-0.5">{formatRelative(service.updatedAt ?? service.createdAt)}</dd>
        </div>
      </dl>

      <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 min-w-0">
        {owners.length > 0 ? (
          <>
            <Avatar name={owners[0]} />
            <span className="text-xs text-foreground truncate min-w-0">{owners[0]}</span>
            {owners.length > 1 && (
              <span className="text-[11px] text-muted-foreground shrink-0">+{owners.length - 1}</span>
            )}
          </>
        ) : canManage ? (
          <button onClick={onAssign} className="inline-flex items-center gap-1 text-xs text-warning hover:underline">
            <UserPlus className="h-3 w-3" /> Assign owner
          </button>
        ) : (
          <span className="text-xs text-muted-foreground">Unassigned</span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button size="sm" className="h-8 text-xs flex-1" onClick={onOpen}>
          Open service
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={onOperations}>
          Operations
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={onConfigure}>
              <Settings className="h-3.5 w-3.5 mr-2" /> Manage configuration
            </DropdownMenuItem>
            {canManage && (
              <DropdownMenuItem onClick={onAssign}>
                <UserPlus className="h-3.5 w-3.5 mr-2" /> Assign owners
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

/* =========================================================================
 * Template group
 * ========================================================================= */

const TemplateGroup: React.FC<{
  label: string;
  templates: ServiceTemplate[];
  usageByTemplate: Map<string, number>;
  onPreview: (t: ServiceTemplate) => void;
  onDetails: (t: ServiceTemplate) => void;
  onActivate: (t: ServiceTemplate) => void;
}> = ({ label, templates, usageByTemplate, onPreview, onDetails, onActivate }) => {
  if (templates.length === 0) return null;
  return (
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        {label}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {templates.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            usedBy={usageByTemplate.get(t.id) ?? 0}
            onPreview={() => onPreview(t)}
            onDetails={() => onDetails(t)}
            onActivate={() => onActivate(t)}
          />
        ))}
      </div>
    </div>
  );
};

/* =========================================================================
 * Empty state
 * ========================================================================= */

const EmptyState: React.FC<{
  isServiceOwner: boolean;
  hasAttention: boolean;
  onCreate: () => void;
}> = ({ isServiceOwner, hasAttention, onCreate }) => (
  <div className="rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
    <div className="h-10 w-10 mx-auto rounded-md bg-muted flex items-center justify-center mb-3">
      <Rocket className="h-5 w-5 text-muted-foreground" />
    </div>
    {isServiceOwner ? (
      <>
        <h3 className="text-sm font-semibold text-foreground">No live services yet</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Your services will appear here once they go live.
        </p>
      </>
    ) : (
      <>
        <h3 className="text-sm font-semibold text-foreground">
          {hasAttention ? "No live services yet" : "Get started with your first service"}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          {hasAttention
            ? "Finish configuring a draft above to take it live."
            : "Activate a template to create your first service. You can run multiple services from the same template."}
        </p>
        {!hasAttention && (
          <Button size="sm" className="mt-4 h-8 text-xs" onClick={onCreate}>
            <Plus className="h-3 w-3 mr-1" /> Create new service
          </Button>
        )}
      </>
    )}
  </div>
);

export default ServicesWorkspace;
