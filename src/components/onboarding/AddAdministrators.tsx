import React, { useMemo, useState } from "react";
import { ArrowRight, ArrowLeft, Plus, Trash2, ShieldCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AuthShell from "./AuthShell";
import { usePersona } from "@/contexts/PersonaContext";
import { toast } from "sonner";

interface Props {
  onComplete: () => void;
  onBack?: () => void;
}

const AddAdministrators: React.FC<Props> = ({ onComplete, onBack }) => {
  const { persona, addInvitedUser, removeInvitedUser } = usePersona();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const administrators = persona.invitedUsers.filter((u) => u.role === "administrator");

  const valid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);

  const add = () => {
    if (!valid) return;
    if (administrators.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      toast.error("That administrator is already invited");
      return;
    }
    addInvitedUser({ email: email.trim().toLowerCase(), role: "administrator" });
    toast.success(`Invited ${email}`);
    setEmail("");
    setName("");
  };

  return (
    <AuthShell step="Step 3 of 3 · Add Administrators" contentMaxWidth="max-w-[760px]">
      <div className="mb-5 flex items-start gap-3">
        <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight leading-tight">Add platform administrators</h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-prose">
            Administrators can activate templates, assign service owners, and manage platform-level settings.
            You can add service-specific teams later from inside each service.
          </p>
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <div className="px-6 py-5 border-b border-border">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2.5 items-end">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Email</label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@city.gov"
                  className="h-9 pl-8"
                  onKeyDown={(e) => e.key === "Enter" && add()}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Name (optional)</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className="h-9"
                onKeyDown={(e) => e.key === "Enter" && add()}
              />
            </div>
            <Button onClick={add} disabled={!valid} size="sm" className="h-9 gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>
        </div>

        <div>
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground h-9">Administrator</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground h-9 w-[140px]">Status</TableHead>
                <TableHead className="w-12 h-9" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {administrators.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={3} className="text-center py-10">
                    <p className="text-sm text-muted-foreground">No administrators added yet.</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">You can skip this and invite them later from Platform Users.</p>
                  </TableCell>
                </TableRow>
              ) : (
                administrators.map((u) => (
                  <TableRow key={u.id} className="border-border">
                    <TableCell className="py-2.5">
                      <div className="text-sm text-foreground">{u.email}</div>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                        {u.status}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeInvitedUser(u.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-3 border-t border-border bg-muted/20">
          {onBack ? (
            <Button variant="ghost" size="sm" onClick={onBack} className="h-8 gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          ) : <span />}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onComplete} className="h-9">Skip for now</Button>
            <Button onClick={onComplete} className="gap-1.5 h-9 px-4">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </AuthShell>
  );
};

export default AddAdministrators;
