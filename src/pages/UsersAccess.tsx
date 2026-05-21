import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Users, ShieldCheck, Briefcase, MailPlus, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboarding } from "@/contexts/OnboardingContext";
import {
  ROLES_SEED, USERS_SEED, DEFAULT_ROLE_PERMISSIONS, DEFAULT_SERVICES, STORAGE_KEY, relativeTime,
} from "@/data/usersAccess";
import type {
  AccessLevel, RoleDef, RolePermissions, ServiceStageAccess, UserRow, UserStatus,
} from "@/data/usersAccess";
import { InviteUserSheet } from "@/components/users-access/InviteUserSheet";
import { RoleDetailSheet } from "@/components/users-access/RoleDetailSheet";
import { toast } from "@/hooks/use-toast";

type UserFilter = "all" | "system" | "service" | "invited";

interface PersistedState {
  users: UserRow[];
  rolePerms: RolePermissions;
  roleScopes: Record<string, string[]>; // roleId -> services
  stageAccess: ServiceStageAccess;
}

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {
    users: USERS_SEED,
    rolePerms: DEFAULT_ROLE_PERMISSIONS,
    roleScopes: {
      document_verifier: ["Trade License"],
      field_inspector: ["Building Permit", "Fire NOC"],
      approver: ["Trade License"],
      counter_operator: ["Trade License", "Building Permit", "Fire NOC"],
      viewer: ["Trade License"],
    },
    stageAccess: {
      approver: { "Trade License": ["Approval"] },
      field_inspector: { "Building Permit": ["Inspection"], "Fire NOC": ["Inspection"] },
      document_verifier: { "Trade License": ["Document Verification"] },
    },
  };
}

const avatarTone: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/15 text-accent",
  warning: "bg-warning/15 text-warning",
  success: "bg-success/15 text-success",
};

function Avatar({ name, tone }: { name: string; tone: string }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0", avatarTone[tone] || avatarTone.primary)}>
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  const map: Record<UserStatus, { dot: string; label: string; cls: string }> = {
    active: { dot: "bg-success", label: "Active", cls: "text-foreground" },
    invited: { dot: "bg-warning", label: "Invited", cls: "text-foreground" },
    disabled: { dot: "bg-muted-foreground", label: "Disabled", cls: "text-muted-foreground" },
  };
  const s = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs", s.cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

function MetricCard({ icon: Icon, label, value, hint }: { icon: any; label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 flex items-start gap-3">
      <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
        <div className="text-2xl font-semibold leading-tight">{value}</div>
        {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
      </div>
    </div>
  );
}

export default function UsersAccess() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "roles" ? "roles" : "users";
  const setTab = (v: string) => setSearchParams({ tab: v }, { replace: true });

  const { state: onboarding } = useOnboarding();
  const servicesFromCtx = useMemo(() => {
    const fromCtx = (onboarding.services || []).map((s) => s.name).filter(Boolean);
    return Array.from(new Set([...DEFAULT_SERVICES, ...fromCtx]));
  }, [onboarding.services]);

  const [state, setState] = useState<PersistedState>(() => loadState());
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);

  const roles = ROLES_SEED;
  const rolesById = useMemo(() => Object.fromEntries(roles.map((r) => [r.id, r])), []);

  // Metrics
  const total = state.users.length;
  const systemCount = state.users.filter((u) => rolesById[u.roleId]?.type === "system").length;
  const serviceCount = state.users.filter((u) => rolesById[u.roleId]?.type === "service").length;
  const invitedCount = state.users.filter((u) => u.status === "invited").length;

  // Users table state
  const [filter, setFilter] = useState<UserFilter>("all");
  const [query, setQuery] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    return state.users.filter((u) => {
      const role = rolesById[u.roleId];
      if (filter === "system" && role?.type !== "system") return false;
      if (filter === "service" && role?.type !== "service") return false;
      if (filter === "invited" && u.status !== "invited") return false;
      if (query) {
        const q = query.toLowerCase();
        if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !role?.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [state.users, filter, query, rolesById]);

  const filterPills: { id: UserFilter; label: string; count: number }[] = [
    { id: "all", label: "All Users", count: total },
    { id: "system", label: "System", count: systemCount },
    { id: "service", label: "Service", count: serviceCount },
    { id: "invited", label: "Invited", count: invitedCount },
  ];

  function addUsers(rows: UserRow[]) { setState((s) => ({ ...s, users: [...rows, ...s.users] })); }

  function setUserStatus(id: string, status: UserStatus) {
    setState((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, status } : u)) }));
  }
  function removeUser(id: string) {
    setState((s) => ({ ...s, users: s.users.filter((u) => u.id !== id) }));
    toast({ title: "User removed" });
  }
  function resendInvite(u: UserRow) {
    toast({ title: "Invite resent", description: u.email });
  }

  // Role detail
  const [activeRole, setActiveRole] = useState<RoleDef | null>(null);

  function openRole(role: RoleDef) { setActiveRole(role); }
  function saveRole(roleId: string, next: { permissions: Record<string, AccessLevel>; scopedServices: string[]; stageAccess: Record<string, string[]> }) {
    setState((s) => ({
      ...s,
      rolePerms: { ...s.rolePerms, [roleId]: next.permissions },
      roleScopes: { ...s.roleScopes, [roleId]: next.scopedServices },
      stageAccess: { ...s.stageAccess, [roleId]: next.stageAccess },
    }));
  }

  function usersForRole(roleId: string) { return state.users.filter((u) => u.roleId === roleId).length; }

  const systemRoles = roles.filter((r) => r.type === "system");
  const serviceRoles = roles.filter((r) => r.type === "service");

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users & Access</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage people, roles, and service permissions across your platform.
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Invite User
        </Button>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>

        {/* USERS */}
        <TabsContent value="users" className="space-y-5 mt-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard icon={Users} label="Total Users" value={total} hint="Across all services" />
            <MetricCard icon={ShieldCheck} label="System Users" value={systemCount} hint="Platform-level access" />
            <MetricCard icon={Briefcase} label="Service Users" value={serviceCount} hint="Scoped to services" />
            <MetricCard icon={MailPlus} label="Pending Invites" value={invitedCount} hint="Awaiting acceptance" />
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="inline-flex rounded-md border border-border bg-card p-0.5">
              {filterPills.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setFilter(p.id)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded transition-colors inline-flex items-center gap-1.5",
                    filter === p.id ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {p.label}
                  <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-normal">{p.count}</Badge>
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email, or role"
                className="pl-8 w-[280px] h-9"
              />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40 sticky top-0">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[11px] uppercase tracking-wide font-medium">User</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide font-medium">Role</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide font-medium">Service Scope</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide font-medium">Status</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide font-medium">Last Active</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-sm text-muted-foreground">
                      No users match your filters.
                    </TableCell>
                  </TableRow>
                )}
                {filteredUsers.map((u) => {
                  const role = rolesById[u.roleId];
                  const visible = u.services.slice(0, 2);
                  const extra = u.services.length - visible.length;
                  return (
                    <TableRow key={u.id} className="hover:bg-muted/40">
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} tone={u.avatarColor} />
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{u.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <Badge variant={role?.type === "system" ? "secondary" : "outline"} className="font-normal">
                          {role?.name || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {visible.map((s) => (
                            <Badge key={s} variant="outline" className="text-[10px] font-normal bg-muted/40">{s}</Badge>
                          ))}
                          {extra > 0 && <Badge variant="outline" className="text-[10px] font-normal">+{extra}</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5"><StatusBadge status={u.status} /></TableCell>
                      <TableCell className="py-2.5 text-xs text-muted-foreground">{relativeTime(u.lastActiveISO)}</TableCell>
                      <TableCell className="py-2.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openRole(role!)} disabled={!role}>
                              <Settings2 className="h-4 w-4 mr-2" /> Edit role
                            </DropdownMenuItem>
                            {u.status === "invited" && (
                              <DropdownMenuItem onClick={() => resendInvite(u)}>
                                <MailPlus className="h-4 w-4 mr-2" /> Resend invite
                              </DropdownMenuItem>
                            )}
                            {u.status === "active" && (
                              <DropdownMenuItem onClick={() => setUserStatus(u.id, "disabled")}>
                                Disable user
                              </DropdownMenuItem>
                            )}
                            {u.status === "disabled" && (
                              <DropdownMenuItem onClick={() => setUserStatus(u.id, "active")}>
                                Re-enable user
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => removeUser(u.id)}>
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-border text-xs text-muted-foreground">
              <span>{filteredUsers.length} of {total}</span>
              <span>Page 1 of 1</span>
            </div>
          </div>
        </TabsContent>

        {/* ROLES */}
        <TabsContent value="roles" className="space-y-7 mt-5">
          {[
            { label: "System Roles", helper: "Platform-level roles that span the whole organization.", items: systemRoles },
            { label: "Service Roles", helper: "Operational roles scoped to one or more services.", items: serviceRoles },
          ].map((section) => (
            <section key={section.label} className="space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <h2 className="text-sm font-semibold flex items-center gap-2">
                    {section.label}
                    <Badge variant="secondary" className="text-[10px] font-normal">{section.items.length}</Badge>
                  </h2>
                  <p className="text-xs text-muted-foreground">{section.helper}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {section.items.map((r) => {
                  const count = usersForRole(r.id);
                  const scope = state.roleScopes[r.id] || [];
                  return (
                    <div key={r.id} className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3 hover:border-foreground/20 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold">{r.name}</div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{r.description}</p>
                        </div>
                        <Badge variant={r.type === "system" ? "secondary" : "default"} className="text-[10px] uppercase tracking-wide shrink-0">
                          {r.type}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap min-h-[20px]">
                        <span className="font-medium text-foreground">{count}</span> {count === 1 ? "user" : "users"}
                        {r.type === "service" && scope.length > 0 && (
                          <>
                            <span className="text-border">·</span>
                            <span className="truncate">{scope.slice(0, 2).join(", ")}{scope.length > 2 ? ` +${scope.length - 2}` : ""}</span>
                          </>
                        )}
                        {r.type === "system" && <><span className="text-border">·</span><span>Platform-wide</span></>}
                      </div>
                      <div className="flex items-center gap-1 pt-1 border-t border-border -mx-4 px-4 -mb-1">
                        <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => openRole(r)}>
                          Manage permissions
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs h-8 ml-auto" onClick={() => { setFilter("all"); setQuery(r.name); setTab("users"); }}>
                          View users
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </TabsContent>
      </Tabs>

      <InviteUserSheet
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        roles={roles}
        services={servicesFromCtx}
        onInvite={addUsers}
      />

      <RoleDetailSheet
        open={!!activeRole}
        onOpenChange={(v) => !v && setActiveRole(null)}
        role={activeRole}
        userCount={activeRole ? usersForRole(activeRole.id) : 0}
        services={servicesFromCtx}
        permissions={activeRole ? state.rolePerms[activeRole.id] || {} : {}}
        scopedServices={activeRole ? state.roleScopes[activeRole.id] || [] : []}
        stageAccess={activeRole ? state.stageAccess[activeRole.id] || {} : {}}
        onSave={(next) => activeRole && saveRole(activeRole.id, next)}
      />
    </div>
  );
}
