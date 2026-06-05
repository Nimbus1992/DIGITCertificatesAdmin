import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useOnboarding, type ServiceItem } from "@/contexts/OnboardingContext";
import { usePersona } from "@/contexts/PersonaContext";
import { allTemplates, type ServiceTemplate } from "@/data/serviceTemplates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Search,
  MoreHorizontal,
  Plus,
  Settings,
  UserPlus,
  ExternalLink,
  Trash2,
  ArrowRight,
  Eye,
  Sparkles,
  AlertTriangle,
  Power,
  LayoutTemplate,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AssignOwnerSheet from "@/components/templates/AssignOwnerSheet";
import { toast } from "sonner";

type Row =
  | { kind: "service"; service: ServiceItem; template?: ServiceTemplate }
  | { kind: "template"; template: ServiceTemplate };

type FilterKey = "all" | "live" | "draft" | "available";

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

const StatusDot: React.FC<{ kind: "live" | "draft" | "available" }> = ({ kind }) => {
  const color =
    kind === "live"
      ? "bg-success"
      : kind === "draft"
      ? "bg-warning"
      : "bg-muted-foreground/40";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={cn("h-1.5 w-1.5 rounded-full", color, kind === "live" && "ring-2 ring-success/20")} />
      <span className="capitalize">{kind}</span>
    </span>
  );
};

const SectionHeader: React.FC<{ label: string; count: number; description?: string }> = ({ label, count, description }) => (
  <tr className="bg-muted/30 border-t border-border first:border-t-0">
    <td colSpan={5} className="px-4 py-2">
      <div className="flex items-baseline gap-2">
        <span className="text-[10px] uppercase tracking-[0.08em] font-semibold text-muted-foreground">{label}</span>
        <span className="text-[10px] text-muted-foreground/60">{count}</span>
        {description && <span className="text-[11px] text-muted-foreground/70 ml-1">· {description}</span>}
      </div>
    </td>
  </tr>
);

const TemplatesDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { state, deleteService } = useOnboarding();
  const { persona } = usePersona();
  const [params, setParams] = useSearchParams();
  const recentId = params.get("recent");

  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [assignTarget, setAssignTarget] = useState<ServiceItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ServiceItem | null>(null);

  const isServiceOwner = persona.role === "service_owner";
  const canActivate = !isServiceOwner;

  const visibleServices = useMemo(() => {
    const all = state.services;
    if (!isServiceOwner) return all;
    return all.filter((s) => (s.assignedOwners ?? []).includes(persona.email.toLowerCase()));
  }, [state.services, isServiceOwner, persona.email]);

  const activatedTemplateIds = useMemo(
    () => new Set(visibleServices.map((s) => s.templateId)),
    [visibleServices],
  );

  const availableTemplates = useMemo(() => {
    if (isServiceOwner) return [] as ServiceTemplate[];
    return allTemplates.filter((t) => !activatedTemplateIds.has(t.id));
  }, [activatedTemplateIds, isServiceOwner]);

  const liveServices = visibleServices.filter((s) => s.isLive);
  const draftServices = visibleServices.filter((s) => !s.isLive);

  // Pin recent to top of drafts within the session
  const pinnedDrafts = useMemo(() => {
    if (!recentId) return draftServices;
    const idx = draftServices.findIndex((s) => s.id === recentId);
    if (idx <= 0) return draftServices;
    const copy = [...draftServices];
    const [item] = copy.splice(idx, 1);
    return [item, ...copy];
  }, [draftServices, recentId]);

  const attention = useMemo(
    () => draftServices.filter((s) => !(s.assignedOwners ?? []).length).length,
    [draftServices],
  );

  const matchesQuery = (label: string) =>
    !query || label.toLowerCase().includes(query.toLowerCase());

  const showLive = filter === "all" || filter === "live";
  const showDrafts = filter === "all" || filter === "draft";
  const showAvailable = !isServiceOwner && (filter === "all" || filter === "available");

  const filteredLive = liveServices.filter((s) => matchesQuery(s.name));
  const filteredDrafts = pinnedDrafts.filter((s) => matchesQuery(s.name));
  const filteredAvailable = availableTemplates.filter((t) => matchesQuery(t.name));

  const noResults =
    (!showLive || filteredLive.length === 0) &&
    (!showDrafts || filteredDrafts.length === 0) &&
    (!showAvailable || filteredAvailable.length === 0);

  const totalServices = visibleServices.length;

  const goConfigure = (s: ServiceItem) => navigate(`/service/${s.id}/configure`, { state: { mode: "configure" } });
  const goWorkspace = (s: ServiceItem) => navigate(`/service/${s.id}/configure`, { state: { mode: "overview" } });
  const goPreview = (s: ServiceItem) => navigate(`/service/${s.id}/configure`, { state: { mode: "preview" } });
  const goActivate = (t: ServiceTemplate) => {
    if (t.comingSoon) {
      toast.info(`${t.name} is coming soon`);
      return;
    }
    navigate(`/templates/${t.id}/setup`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1280px] mx-auto px-8 py-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-6 mb-5">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {isServiceOwner ? "My services" : "Templates"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isServiceOwner
                ? "Services assigned to you. Configure and publish when ready."
                : "Activate templates, manage drafts, and operate live services."}
            </p>
          </div>
          {canActivate && availableTemplates.length > 0 && (
            <Button size="sm" className="h-9 gap-1.5" onClick={() => setFilter("available")}>
              <Plus className="h-3.5 w-3.5" /> Activate template
            </Button>
          )}
        </div>

        {/* Stat strip */}
        <div className="flex items-center gap-6 px-4 py-2.5 rounded-md border border-border bg-card mb-4">
          <Stat label="Live" value={liveServices.length} dot="bg-success" />
          <Divider />
          <Stat label="Draft" value={draftServices.length} dot="bg-warning" />
          {!isServiceOwner && (
            <>
              <Divider />
              <Stat label="Available" value={availableTemplates.length} dot="bg-muted-foreground/40" />
            </>
          )}
          {attention > 0 && (
            <>
              <Divider />
              <button
                onClick={() => setFilter("draft")}
                className="inline-flex items-center gap-1.5 text-xs text-warning font-medium hover:underline"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                {attention} need owner{attention === 1 ? "" : "s"}
              </button>
            </>
          )}
          <div className="ml-auto text-[11px] text-muted-foreground hidden md:block">
            {totalServices} service{totalServices === 1 ? "" : "s"}
          </div>
        </div>

        {/* Filters + search */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="inline-flex items-center rounded-md border border-border bg-card p-0.5">
            {([
              { key: "all", label: "All" },
              { key: "live", label: "Live" },
              { key: "draft", label: "Draft" },
              ...(!isServiceOwner ? [{ key: "available" as const, label: "Available" }] : []),
            ] as { key: FilterKey; label: string }[]).map((p) => (
              <button
                key={p.key}
                onClick={() => setFilter(p.key)}
                className={cn(
                  "px-3 h-7 text-xs font-medium rounded-[5px] transition-colors",
                  filter === p.key
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="relative w-64 max-w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search templates and services…"
              className="h-8 pl-8 text-sm"
            />
          </div>
        </div>

        {/* Empty state (entire dashboard is empty) */}
        {totalServices === 0 && availableTemplates.length === 0 && (
          <EmptyState role={persona.role} />
        )}

        {totalServices === 0 && availableTemplates.length > 0 && !isServiceOwner && filter === "all" && (
          <FirstRunBanner onActivate={() => setFilter("available")} />
        )}

        {/* Table */}
        {(totalServices > 0 || availableTemplates.length > 0) && (
          <div className="rounded-md border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border">
                <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-medium px-4 h-9">Service / Template</th>
                  <th className="text-left font-medium px-4 h-9 w-[120px]">Status</th>
                  <th className="text-left font-medium px-4 h-9 w-[220px]">Owner</th>
                  <th className="text-left font-medium px-4 h-9 w-[110px]">Updated</th>
                  <th className="text-right font-medium px-4 h-9 w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {showLive && filteredLive.length > 0 && (
                  <>
                    <SectionHeader label="Live services" count={filteredLive.length} description="Operating in production" />
                    {filteredLive.map((s) => (
                      <ServiceRow
                        key={s.id}
                        service={s}
                        kind="live"
                        canManage={!isServiceOwner}
                        onOpen={() => goWorkspace(s)}
                        onConfigure={() => goConfigure(s)}
                        onAssign={() => setAssignTarget(s)}
                        onDelete={() => setPendingDelete(s)}
                      />
                    ))}
                  </>
                )}

                {showDrafts && filteredDrafts.length > 0 && (
                  <>
                    <SectionHeader label="Draft services" count={filteredDrafts.length} description="In configuration" />
                    {filteredDrafts.map((s) => (
                      <ServiceRow
                        key={s.id}
                        service={s}
                        kind="draft"
                        recent={s.id === recentId}
                        canManage={!isServiceOwner}
                        onOpen={() => goWorkspace(s)}
                        onConfigure={() => goConfigure(s)}
                        onAssign={() => setAssignTarget(s)}
                        onDelete={() => setPendingDelete(s)}
                      />
                    ))}
                  </>
                )}

                {showAvailable && filteredAvailable.length > 0 && (
                  <>
                    <SectionHeader label="Available templates" count={filteredAvailable.length} description="Ready to activate" />
                    {filteredAvailable.map((t) => (
                      <TemplateRow key={t.id} template={t} onActivate={() => goActivate(t)} />
                    ))}
                  </>
                )}

                {noResults && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <p className="text-sm text-muted-foreground">No results for "{query}".</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

const Stat: React.FC<{ label: string; value: number; dot: string }> = ({ label, value, dot }) => (
  <div className="flex items-center gap-2">
    <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-sm font-semibold tabular-nums text-foreground">{value}</span>
  </div>
);

const Divider = () => <span className="h-4 w-px bg-border" />;

const OwnerCell: React.FC<{ owners: string[]; onAssign?: () => void }> = ({ owners, onAssign }) => {
  if (owners.length === 0) {
    return onAssign ? (
      <button
        onClick={onAssign}
        className="text-xs text-warning hover:underline inline-flex items-center gap-1"
      >
        <UserPlus className="h-3 w-3" />
        Unassigned
      </button>
    ) : (
      <span className="text-xs text-muted-foreground">Unassigned</span>
    );
  }
  const first = owners[0];
  const rest = owners.length - 1;
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold flex items-center justify-center shrink-0">
        {first[0]?.toUpperCase()}
      </span>
      <span className="text-sm text-foreground truncate">{first}</span>
      {rest > 0 && <span className="text-[11px] text-muted-foreground">+{rest}</span>}
    </div>
  );
};

const ServiceRow: React.FC<{
  service: ServiceItem;
  kind: "live" | "draft";
  recent?: boolean;
  canManage: boolean;
  onOpen: () => void;
  onConfigure: () => void;
  onAssign: () => void;
  onDelete: () => void;
}> = ({ service, kind, recent, canManage, onOpen, onConfigure, onAssign, onDelete }) => {
  const owners = service.assignedOwners ?? [];
  return (
    <tr className="border-t border-border hover:bg-muted/40 transition-colors group">
      <td className="px-4 py-2.5">
        <button onClick={onOpen} className="text-left">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium text-foreground truncate">{service.name}</span>
            {recent && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                Just created
              </span>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {service.customModules.length > 0 ? service.customModules.join(" · ") : "—"}
          </div>
        </button>
      </td>
      <td className="px-4 py-2.5">
        <StatusDot kind={kind} />
      </td>
      <td className="px-4 py-2.5">
        <OwnerCell owners={owners} onAssign={canManage ? onAssign : undefined} />
      </td>
      <td className="px-4 py-2.5 text-xs text-muted-foreground tabular-nums">
        {formatRelative(service.updatedAt ?? service.createdAt)}
      </td>
      <td className="px-4 py-2.5">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onConfigure}
            className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {kind === "live" ? "Manage" : "Continue"}
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={onOpen}>
                <Eye className="h-3.5 w-3.5 mr-2" /> Open workspace
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onConfigure}>
                <Settings className="h-3.5 w-3.5 mr-2" /> {kind === "live" ? "Manage configuration" : "Continue configuration"}
              </DropdownMenuItem>
              {canManage && (
                <DropdownMenuItem onClick={onAssign}>
                  <UserPlus className="h-3.5 w-3.5 mr-2" /> Assign owners
                </DropdownMenuItem>
              )}
              {kind === "live" && (
                <DropdownMenuItem disabled>
                  <ExternalLink className="h-3.5 w-3.5 mr-2" /> View public URL
                </DropdownMenuItem>
              )}
              {canManage && (
                <>
                  <DropdownMenuSeparator />
                  {kind === "live" ? (
                    <DropdownMenuItem disabled>
                      <Power className="h-3.5 w-3.5 mr-2" /> Deactivate
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete service
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
};

const TemplateRow: React.FC<{ template: ServiceTemplate; onActivate: () => void }> = ({ template, onActivate }) => {
  const Icon = template.icon;
  return (
    <tr className="border-t border-border hover:bg-muted/40 transition-colors group">
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="h-7 w-7 rounded-md bg-muted flex items-center justify-center shrink-0">
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-medium text-foreground truncate">
              {template.name}
              {template.comingSoon && (
                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-normal">
                  Coming soon
                </span>
              )}
            </div>
            <div className="text-[11px] text-muted-foreground truncate max-w-[480px]">
              {template.description}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-2.5">
        <StatusDot kind="available" />
      </td>
      <td className="px-4 py-2.5 text-xs text-muted-foreground">—</td>
      <td className="px-4 py-2.5 text-xs text-muted-foreground">{template.estimatedSetupTime}</td>
      <td className="px-4 py-2.5">
        <div className="flex items-center justify-end">
          <Button
            size="sm"
            variant={template.comingSoon ? "ghost" : "outline"}
            onClick={onActivate}
            disabled={template.comingSoon}
            className="h-7 px-3 text-xs gap-1"
          >
            <Plus className="h-3 w-3" /> Activate
          </Button>
        </div>
      </td>
    </tr>
  );
};

const EmptyState: React.FC<{ role: string | null }> = ({ role }) => (
  <div className="rounded-md border border-dashed border-border bg-card px-6 py-16 text-center">
    <div className="h-10 w-10 mx-auto rounded-md bg-muted flex items-center justify-center mb-3">
      <LayoutTemplate className="h-5 w-5 text-muted-foreground" />
    </div>
    {role === "service_owner" ? (
      <>
        <h2 className="text-sm font-semibold text-foreground">No services assigned</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Your administrator will give you access once a service is activated. Check back shortly.
        </p>
      </>
    ) : (
      <>
        <h2 className="text-sm font-semibold text-foreground">Nothing to show yet</h2>
        <p className="text-xs text-muted-foreground mt-1">Templates will appear here once available.</p>
      </>
    )}
  </div>
);

const FirstRunBanner: React.FC<{ onActivate: () => void }> = ({ onActivate }) => (
  <div className="mb-3 rounded-md border border-border bg-muted/30 px-4 py-3 flex items-center justify-between gap-4">
    <div className="flex items-center gap-3 min-w-0">
      <Sparkles className="h-4 w-4 text-primary shrink-0" />
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">Activate your first service</div>
        <div className="text-xs text-muted-foreground truncate">
          Choose a ready-to-use template to begin. You can assign an owner after activation.
        </div>
      </div>
    </div>
    <Button size="sm" onClick={onActivate} className="h-8 gap-1.5 shrink-0">
      Browse templates <ArrowRight className="h-3.5 w-3.5" />
    </Button>
  </div>
);

export default TemplatesDashboard;
