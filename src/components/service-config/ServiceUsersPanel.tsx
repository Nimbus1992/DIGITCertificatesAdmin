import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Trash2, Mail, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { useOnboarding, type ServiceItem, type ServiceUserRole } from "@/contexts/OnboardingContext";
import { SERVICE_USER_ROLES } from "@/data/personaSeeds";
import { cn } from "@/lib/utils";

interface Props {
  service: ServiceItem;
  canManage: boolean;
}

const roleLabel = (r: string) => SERVICE_USER_ROLES.find((x) => x.value === r)?.label ?? r;

const ServiceUsersPanel: React.FC<Props> = ({ service, canManage }) => {
  const { addServiceUser, removeServiceUser } = useOnboarding();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<ServiceUserRole>("document_verifier");
  const [filterRole, setFilterRole] = useState<string>("all");

  const owners = service.assignedOwners ?? [];
  const users = service.serviceUsers ?? [];

  // Show assigned owners + serviceUsers in a single table
  const rows = useMemo(() => {
    const ownerRows = owners.map((email) => ({
      id: `owner:${email}`,
      email,
      role: "service_owner" as ServiceUserRole,
      status: "Active" as const,
      invitedAt: undefined as number | undefined,
      isOwner: true,
    }));
    const userRows = users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      status: u.status,
      invitedAt: u.invitedAt,
      isOwner: false,
    }));
    const combined = [...ownerRows, ...userRows];
    return filterRole === "all" ? combined : combined.filter((r) => r.role === filterRole);
  }, [owners, users, filterRole]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: owners.length + users.length };
    SERVICE_USER_ROLES.forEach((r) => {
      c[r.value] = (r.value === "service_owner" ? owners.length : 0) + users.filter((u) => u.role === r.value).length;
    });
    return c;
  }, [owners, users]);

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const submit = () => {
    if (!valid) return;
    addServiceUser(service.id, { email, name, role });
    toast.success(`Invited ${email} as ${roleLabel(role)}`);
    setEmail("");
    setName("");
    setRole("document_verifier");
    setOpen(false);
  };

  return (
    <div className="max-w-[1100px] mx-auto px-8 py-6">
      <div className="flex items-start justify-between gap-6 mb-5">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Users & Access</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage who can configure, review, and approve applications for <span className="font-medium text-foreground">{service.name}</span>.
          </p>
        </div>
        {canManage && (
          <Button size="sm" className="h-9 gap-1.5" onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Invite user
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1 mb-3">
        {([{ value: "all", label: "All" }, ...SERVICE_USER_ROLES] as { value: string; label: string }[]).map((r) => (
          <button
            key={r.value}
            onClick={() => setFilterRole(r.value)}
            className={cn(
              "px-2.5 h-7 text-xs font-medium rounded-md border transition-colors",
              filterRole === r.value
                ? "border-border bg-muted text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40",
            )}
          >
            {r.label}
            <span className="ml-1.5 text-[10px] text-muted-foreground/80 tabular-nums">{counts[r.value] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="rounded-md border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b border-border">
            <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="text-left font-medium px-4 h-9">User</th>
              <th className="text-left font-medium px-4 h-9 w-[180px]">Role</th>
              <th className="text-left font-medium px-4 h-9 w-[120px]">Status</th>
              <th className="text-right font-medium px-4 h-9 w-[60px]">{""}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center">
                  <UsersIcon className="h-5 w-5 mx-auto mb-2 text-muted-foreground/60" />
                  <p className="text-sm text-muted-foreground">No users yet</p>
                  {canManage && (
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Invite verifiers, inspectors, approvers, and counter operators for this service.
                    </p>
                  )}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-[10px] font-semibold flex items-center justify-center shrink-0">
                        {r.email[0]?.toUpperCase()}
                      </span>
                      <span className="text-sm truncate">{r.email}</span>
                      {r.isOwner && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Owner</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-muted-foreground">{roleLabel(r.role)}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className={cn("h-1.5 w-1.5 rounded-full", r.status === "Active" ? "bg-success" : "bg-warning")} />
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {canManage && !r.isOwner && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              removeServiceUser(service.id, r.id);
                              toast.success(`Removed ${r.email}`);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-[420px] flex flex-col p-0">
          <SheetHeader className="px-6 py-5 border-b border-border">
            <SheetTitle className="text-base">Invite to {service.name}</SheetTitle>
            <SheetDescription className="text-xs">
              Service-scoped users only see this service.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@city.gov" className="h-9 pl-8" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Name (optional)</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Role</Label>
              <Select value={role} onValueChange={(v: ServiceUserRole) => setRole(v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SERVICE_USER_ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      <div>
                        <div className="text-sm">{r.label}</div>
                        <div className="text-[11px] text-muted-foreground">{r.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter className="px-6 py-3 border-t border-border bg-muted/20">
            <div className="flex w-full justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="h-9">Cancel</Button>
              <Button size="sm" onClick={submit} disabled={!valid} className="h-9 px-4">Send invite</Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ServiceUsersPanel;
