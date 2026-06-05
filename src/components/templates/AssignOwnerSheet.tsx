import React, { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Mail, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { useOnboarding, type ServiceItem } from "@/contexts/OnboardingContext";
import { usePersona } from "@/contexts/PersonaContext";
import { PERSONA_SEEDS } from "@/data/personaSeeds";

interface Props {
  service: ServiceItem | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const AssignOwnerSheet: React.FC<Props> = ({ service, open, onOpenChange }) => {
  const { setServiceOwners } = useOnboarding();
  const { persona } = usePersona();
  const [owners, setOwners] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
    if (service) setOwners(service.assignedOwners ?? []);
  }, [service?.id, open]);

  const suggestions = useMemo(() => {
    const seeded = PERSONA_SEEDS.filter((p) => p.role === "service_owner").map((p) => p.email);
    const invited = persona.invitedUsers
      .filter((u) => u.role === "service_owner")
      .map((u) => u.email.toLowerCase());
    return Array.from(new Set([...seeded, ...invited])).filter((e) => !owners.includes(e));
  }, [persona.invitedUsers, owners]);

  if (!service) return null;

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail);
  const add = (email: string) => {
    const e = email.trim().toLowerCase();
    if (!e) return;
    if (owners.includes(e)) return;
    setOwners((prev) => [...prev, e]);
    setNewEmail("");
  };

  const save = () => {
    setServiceOwners(service.id, owners);
    toast.success(owners.length ? `${owners.length} owner${owners.length === 1 ? "" : "s"} assigned` : "Owners cleared");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[440px] flex flex-col p-0">
        <SheetHeader className="px-6 py-5 border-b border-border">
          <SheetTitle className="text-base">Assign service owners</SheetTitle>
          <SheetDescription className="text-xs">
            Service owners assigned to <span className="font-medium text-foreground">{service.name}</span> can configure
            and manage it. They will only see this service in their workspace.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-auto px-6 py-5 space-y-5">
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Add by email</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="owner@city.gov"
                  className="h-9 pl-8"
                  onKeyDown={(e) => e.key === "Enter" && valid && add(newEmail)}
                />
              </div>
              <Button size="sm" disabled={!valid} onClick={() => add(newEmail)} className="h-9 gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
          </div>

          {suggestions.length > 0 && (
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Suggestions</Label>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => add(s)}
                    className="text-xs px-2.5 py-1 rounded-md border border-border bg-card hover:border-primary/40 hover:bg-muted/40 transition-colors flex items-center gap-1.5"
                  >
                    <Briefcase className="h-3 w-3 text-muted-foreground" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Assigned owners</Label>
              <Badge variant="secondary" className="text-[10px] rounded-full h-5 px-2">{owners.length}</Badge>
            </div>
            {owners.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center border border-dashed border-border rounded-md">
                No owners assigned yet.
              </p>
            ) : (
              <ul className="divide-y divide-border border border-border rounded-md">
                {owners.map((e) => (
                  <li key={e} className="flex items-center justify-between px-3 py-2 hover:bg-muted/30">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-[10px] font-semibold flex items-center justify-center shrink-0">
                        {e[0]?.toUpperCase()}
                      </span>
                      <span className="text-sm truncate">{e}</span>
                    </div>
                    <button
                      onClick={() => setOwners((prev) => prev.filter((x) => x !== e))}
                      className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <SheetFooter className="px-6 py-3 border-t border-border bg-muted/20">
          <div className="flex w-full justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-9">Cancel</Button>
            <Button size="sm" onClick={save} className="h-9 px-4">Save assignments</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AssignOwnerSheet;
