import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, AlertTriangle, UserPlus, Building2, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useOnboarding, OrgMember, ServiceOwnerAssignment } from "@/contexts/OnboardingContext";

const AssignOwners: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateState } = useOnboarding();

  const targetServices = state.services.filter((s) =>
    state.pendingActivatedServiceIds.length > 0
      ? state.pendingActivatedServiceIds.includes(s.id)
      : !state.serviceOwners.some((o) => o.serviceId === s.id),
  );

  const existingOwnerFor = (id: string) => state.serviceOwners.find((o) => o.serviceId === id);

  const [drafts, setDrafts] = useState<Record<string, { mode: "existing" | "invite"; value: string }>>(() => {
    const init: Record<string, { mode: "existing" | "invite"; value: string }> = {};
    targetServices.forEach((s) => {
      const existing = existingOwnerFor(s.id);
      init[s.id] = existing ? { mode: "existing", value: existing.ownerEmail } : { mode: "existing", value: "" };
    });
    return init;
  });

  const setMode = (id: string, mode: "existing" | "invite") =>
    setDrafts((d) => ({ ...d, [id]: { mode, value: "" } }));
  const setValue = (id: string, value: string) =>
    setDrafts((d) => ({ ...d, [id]: { ...d[id], value } }));

  const handleFinish = () => {
    const newOwners: ServiceOwnerAssignment[] = [];
    const newMembers: OrgMember[] = [];
    Object.entries(drafts).forEach(([sid, d]) => {
      if (!d.value) return;
      if (d.mode === "invite") {
        if (!/\S+@\S+\.\S+/.test(d.value)) return;
        if (!state.orgMembers.some((m) => m.email === d.value)) {
          newMembers.push({
            id: crypto.randomUUID(),
            email: d.value,
            role: "service_owner",
            status: "invited",
            invitedAt: new Date().toISOString(),
          });
        }
      }
      newOwners.push({ serviceId: sid, ownerEmail: d.value, assignedAt: new Date().toISOString() });
    });

    const remaining = state.serviceOwners.filter((o) => !newOwners.some((n) => n.serviceId === o.serviceId));
    updateState({
      serviceOwners: [...remaining, ...newOwners],
      orgMembers: [...state.orgMembers, ...newMembers],
      pendingActivatedServiceIds: [],
      setupComplete: true,
    });
    if (newOwners.length > 0) toast.success(`Assigned ${newOwners.length} service owner${newOwners.length > 1 ? "s" : ""}`);
    navigate("/dashboard");
  };

  const assignableUsers = state.orgMembers;
  const allUnassigned = targetServices.every((s) => !drafts[s.id]?.value);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">Step 4 of 4</p>
        <h1 className="text-2xl font-bold text-foreground mt-1">Assign Service Owners</h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Every activated service needs an owner who will configure and run it.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {targetServices.length === 0 && (
            <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">
              No services to assign. Activate services first.
            </CardContent></Card>
          )}
          {targetServices.map((s) => {
            const d = drafts[s.id] ?? { mode: "existing" as const, value: "" };
            return (
              <Card key={s.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base">{s.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">Draft service</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={d.mode === "existing" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMode(s.id, "existing")}
                    >Assign existing user</Button>
                    <Button
                      variant={d.mode === "invite" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMode(s.id, "invite")}
                      className="gap-1.5"
                    ><UserPlus className="h-3.5 w-3.5" /> Invite new user</Button>
                  </div>

                  {d.mode === "existing" ? (
                    <div className="space-y-1.5">
                      <Label className="text-xs">Select user</Label>
                      {assignableUsers.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">No users yet — invite a new user instead.</p>
                      ) : (
                        <Select value={d.value} onValueChange={(v) => setValue(s.id, v)}>
                          <SelectTrigger className="h-10"><SelectValue placeholder="Choose user" /></SelectTrigger>
                          <SelectContent>
                            {assignableUsers.map((m) => (
                              <SelectItem key={m.id} value={m.email}>{m.email}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Label className="text-xs">Email</Label>
                      <Input
                        type="email"
                        value={d.value}
                        onChange={(e) => setValue(s.id, e.target.value)}
                        placeholder="owner@organization.gov"
                        className="h-10"
                      />
                    </div>
                  )}

                  {!d.value && (
                    <div className="flex items-start gap-2 rounded-md bg-warning/10 border border-warning/30 px-3 py-2">
                      <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                      <p className="text-xs text-foreground">
                        No Service Owner assigned. This service cannot be configured until ownership is assigned.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div>
          <Card>
            <CardHeader><CardTitle className="text-sm">Service Owner role</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <p className="font-medium text-foreground mb-1.5 flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-600" /> Can</p>
                <ul className="space-y-1 text-muted-foreground pl-5 list-disc">
                  <li>Configure service</li>
                  <li>Manage service users</li>
                  <li>Monitor adoption</li>
                  <li>Publish service</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1.5 flex items-center gap-1.5"><X className="h-3.5 w-3.5 text-destructive" /> Cannot</p>
                <ul className="space-y-1 text-muted-foreground pl-5 list-disc">
                  <li>Manage organization settings</li>
                  <li>Manage billing</li>
                  <li>Manage other services</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6">
        <Button variant="ghost" onClick={() => navigate("/setup/activate-services")}>Back</Button>
        <div className="flex items-center gap-3">
          {allUnassigned && targetServices.length > 0 && (
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
              <AlertTriangle className="h-3 w-3 mr-1" /> No owners assigned
            </Badge>
          )}
          <Button onClick={handleFinish} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            Finish Organization Setup <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssignOwners;
