import React, { useMemo, useState } from "react";
import { ArrowRight, ArrowLeft, Plus, Trash2, Users, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AuthShell from "./AuthShell";
import { usePersona } from "@/contexts/PersonaContext";
import { TEMPLATE_OPTIONS, ROLE_DESCRIPTIONS } from "@/data/personaSeeds";
import { toast } from "sonner";

interface Props {
  onComplete: () => void;
  onBack?: () => void;
}

const InviteTeam: React.FC<Props> = ({ onComplete, onBack }) => {
  const { persona, addInvitedUser, removeInvitedUser } = usePersona();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"administrator" | "service_owner">("administrator");
  const [tmpl, setTmpl] = useState<string>("");

  const desc = ROLE_DESCRIPTIONS[role];
  const activeTemplates = TEMPLATE_OPTIONS.filter((t) => t.active);

  const canAdd = useMemo(() => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
    if (role === "service_owner" && !tmpl) return false;
    return true;
  }, [email, role, tmpl]);

  const add = () => {
    if (!canAdd) return;
    addInvitedUser({ email, role, assignedTemplate: role === "service_owner" ? tmpl : undefined });
    toast.success(`Invited ${email}`);
    setEmail("");
    setTmpl("");
  };

  return (
    <AuthShell step="Step 3 · Invite Team Members" contentMaxWidth="max-w-[960px]">
      <div className="mb-5 flex items-center gap-3">
        <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Invite your team</h1>
          <p className="text-xs text-muted-foreground">Add Administrators and Service Owners. You can do more later from Users & Access.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-5">
        <Card className="border-border shadow-sm">
          <div className="px-6 py-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-medium">Email address</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@org.demo" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Role</Label>
                <Select value={role} onValueChange={(v: any) => { setRole(v); setTmpl(""); }}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrator">Administrator</SelectItem>
                    <SelectItem value="service_owner">Service Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {role === "service_owner" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Assigned Template</Label>
                  <Select value={tmpl} onValueChange={setTmpl}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select a template" /></SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_OPTIONS.map((t) => (
                        <SelectItem key={t.value} value={t.value} disabled={!t.active}>
                          {t.label}{!t.active && " (coming soon)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    Assigning a template activates that service and makes this user the owner responsible for configuring and publishing it.
                  </p>
                </div>
              )}
            </div>

            <div>
              <Button onClick={add} disabled={!canAdd} size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add invite
              </Button>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[11px] uppercase tracking-wide">Email</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wide">Role</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wide">Assigned Template</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wide">Status</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {persona.invitedUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-8">
                        No invites yet. Add one above.
                      </TableCell>
                    </TableRow>
                  )}
                  {persona.invitedUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="text-sm">{u.email}</TableCell>
                      <TableCell><Badge variant="outline">{ROLE_DESCRIPTIONS[u.role].title}</Badge></TableCell>
                      <TableCell className="text-xs">{u.assignedTemplate || "—"}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                          {u.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => removeInvitedUser(u.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 px-6 py-3 border-t border-border bg-muted/30">
            {onBack ? (
              <Button variant="ghost" size="sm" onClick={onBack} className="h-9 gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </Button>
            ) : <span />}
            <Button onClick={onComplete} className="gap-2 h-10 px-5">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        <Card className="border-border shadow-sm h-fit">
          <div className="px-5 py-5 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Role description</p>
            <div>
              <h3 className="text-sm font-semibold">{desc.title}</h3>
            </div>
            <div>
              <p className="text-[11px] font-medium text-foreground mb-1.5">Can:</p>
              <ul className="space-y-1">
                {desc.can.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
            {desc.cannot && (
              <div>
                <p className="text-[11px] font-medium text-foreground mb-1.5">Cannot:</p>
                <ul className="space-y-1">
                  {desc.cannot.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <XCircle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AuthShell>
  );
};

export default InviteTeam;
