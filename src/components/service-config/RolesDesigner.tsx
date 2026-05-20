import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { ArrowLeft, Plus, Search, User, Pencil, Trash2, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  useServiceRoles,
  isCitizenRole,
  type ServiceRoleRecord,
} from "@/lib/useServiceRoles";

type Persona = "citizen" | "employee";

// Count workflow transitions assigned to each role for the current module.
function useTransitionCountByRole(serviceId: string, moduleName: string) {
  const key = `workflow-transitions-v4:${serviceId}:${moduleName}`;
  return React.useMemo(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return {} as Record<string, number>;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return {};
      const counts: Record<string, number> = {};
      parsed.forEach((t: { roleId?: string }) => {
        if (!t?.roleId) return;
        counts[t.roleId] = (counts[t.roleId] ?? 0) + 1;
      });
      return counts;
    } catch {
      return {} as Record<string, number>;
    }
  }, [key]);
}

interface Props {
  moduleName: string;
  onBack: () => void;
}

// Banner palette cycled per role index — soft tints inspired by the reference.
const BANNER_PALETTE = [
  "bg-orange-100/70",
  "bg-emerald-100/70",
  "bg-sky-100/70",
  "bg-violet-100/70",
  "bg-amber-100/70",
  "bg-rose-100/70",
];

interface DraftState {
  id: string | null; // null = creating
  name: string;
  description: string;
  persona: Persona;
}

const emptyDraft = (): DraftState => ({
  id: null, name: "", description: "", persona: "employee",
});

const personaPermissions = (persona: Persona): string[] =>
  persona === "citizen"
    ? ["create_application", "edit_application", "view_application"]
    : ["view_application", "view_checklist"];

const RolesDesigner: React.FC<Props> = ({ moduleName, onBack }) => {
  const { id: serviceId = "service" } = useParams();
  const [roles, setRoles] = useServiceRoles(serviceId, moduleName);
  const transitionCountByRole = useTransitionCountByRole(serviceId, moduleName);

  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ServiceRoleRecord | null>(null);

  const filtered = useMemo(
    () => roles.filter(
      (r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase())
    ),
    [roles, search],
  );

  const openCreate = () => setDraft(emptyDraft());
  const openEdit = (role: ServiceRoleRecord) => setDraft({
    id: role.id,
    name: role.name,
    description: role.description,
    persona: isCitizenRole(role) ? "citizen" : "employee",
  });

  const saveDraft = () => {
    if (!draft) return;
    const name = draft.name.trim();
    if (!name) {
      toast({ title: "Role name required", variant: "destructive" });
      return;
    }
    const permissions = personaPermissions(draft.persona);
    if (draft.id) {
      setRoles((prev) => prev.map((r) => r.id === draft.id ? {
        ...r, name, description: draft.description.trim(), permissions,
      } : r));
      toast({ title: "Role updated" });
    } else {
      // Generate a stable snake_case id from the name; suffix to avoid collisions.
      const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "role";
      let id = base; let i = 1;
      while (roles.some((r) => r.id === id)) { i += 1; id = `${base}_${i}`; }
      setRoles((prev) => [
        ...prev,
        { id, name, description: draft.description.trim(), permissions },
      ]);
      toast({ title: "Role created" });
    }
    setDraft(null);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    setRoles((prev) => prev.filter((r) => r.id !== pendingDelete.id));
    toast({ title: `Deleted "${pendingDelete.name}"` });
    setPendingDelete(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="font-bold text-foreground">Roles Designer</h1>
            <p className="text-xs text-muted-foreground">Define who can access and act on this service</p>
          </div>
          <Button onClick={openCreate} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5">
            <Plus className="h-4 w-4" /> Create New Role
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-5">
        <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 flex items-start gap-3">
          <Info className="h-4 w-4 text-accent mt-0.5 shrink-0" />
          <p className="text-sm text-foreground">
            Changes to roles automatically flow into Workflow steps, the Service Preview and every related configuration.
          </p>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search role"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-12">
            No roles match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((role, idx) => {
              const banner = BANNER_PALETTE[roles.findIndex((r) => r.id === role.id) % BANNER_PALETTE.length];
              return (
                <Card key={role.id} className="overflow-hidden group">
                  <div className={`relative ${banner} h-28 flex items-center justify-center`}>
                    <div className="w-16 h-12 rounded-md bg-card shadow-sm flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEdit(role)}
                        aria-label="Edit role"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {!role.isDefault && (
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setPendingDelete(role)}
                          aria-label="Delete role"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground text-sm">{role.name}</h3>
                        {role.isDefault && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Default</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 min-h-[1rem]">
                        {role.description || "—"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge
                        variant="outline"
                        className="text-[10px] px-2 py-0.5 bg-accent/5 text-accent border-accent/20 font-normal"
                      >
                        {isCitizenRole(role) ? "Citizen" : "Employee"}
                      </Badge>
                      {(() => {
                        const tx = transitionCountByRole[role.id] ?? 0;
                        return (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground border-border font-normal"
                          >
                            {tx === 0 ? "No workflow steps" : `${tx} workflow step${tx > 1 ? "s" : ""}`}
                          </Badge>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Create / Edit dialog */}
      <Dialog open={draft !== null} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit Role" : "Create New Role"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="space-y-4">
              <div>
                <Label>Role Name</Label>
                <Input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="e.g. Finance Officer"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  placeholder="Brief description of this role"
                  rows={2}
                />
              </div>
              <div>
                <Label className="mb-2 block">Persona</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["citizen", "employee"] as Persona[]).map((p) => {
                    const selected = draft.persona === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setDraft({ ...draft, persona: p })}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          selected ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"
                        }`}
                      >
                        <p className="text-sm font-medium text-foreground capitalize">{p}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {p === "citizen"
                            ? "Submits and tracks applications"
                            : "Reviews and acts on applications"}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Workflow steps assignable to this role are managed in Workflow Designer.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>Cancel</Button>
            <Button
              onClick={saveDraft}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {draft?.id ? "Save Changes" : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={pendingDelete !== null} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role "{pendingDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Workflow steps assigned to this role will need to be reassigned manually.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RolesDesigner;
