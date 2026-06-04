import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, ArrowRight, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useOnboarding, OrgMember } from "@/contexts/OnboardingContext";

const isEmail = (v: string) => /\S+@\S+\.\S+/.test(v);

const InviteAdmins: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateState } = useOnboarding();
  const [drafts, setDrafts] = useState<{ email: string }[]>([{ email: "" }]);

  const update = (i: number, email: string) => {
    setDrafts((d) => d.map((row, idx) => (idx === i ? { email } : row)));
  };

  const addRow = () => setDrafts((d) => [...d, { email: "" }]);
  const removeRow = (i: number) => setDrafts((d) => d.filter((_, idx) => idx !== i));

  const handleContinue = () => {
    const valid = drafts.filter((d) => isEmail(d.email));
    if (valid.length > 0) {
      const newMembers: OrgMember[] = valid.map((d) => ({
        id: crypto.randomUUID(),
        email: d.email.trim(),
        role: "admin",
        status: "invited",
        invitedAt: new Date().toISOString(),
      }));
      updateState({ orgMembers: [...state.orgMembers, ...newMembers] });
      toast.success(`Invited ${newMembers.length} administrator${newMembers.length > 1 ? "s" : ""}`);
    }
    navigate("/setup/activate-services");
  };

  const existingAdmins = state.orgMembers.filter((m) => m.role === "admin");

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">Step 2 of 4</p>
        <h1 className="text-2xl font-bold text-foreground mt-1">Invite additional administrators</h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Add colleagues who will help manage this government workspace. Administrators can manage users, activate services, and oversee operations.
        </p>
      </div>

      {existingAdmins.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Current administrators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {existingAdmins.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground truncate">{m.email}</span>
                </div>
                <Badge variant="outline" className={m.status === "active" ? "bg-green-100 text-green-700 border-green-300" : "bg-warning/15 text-warning border-warning/30"}>
                  {m.status === "active" ? "Active" : "Invited"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Add new administrators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {drafts.map((d, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input
                  type="email"
                  value={d.email}
                  onChange={(e) => update(i, e.target.value)}
                  placeholder="colleague@organization.gov"
                  className="h-10"
                />
              </div>
              <div className="w-44 space-y-1.5">
                <Label className="text-xs">Role</Label>
                <Input value="Admin" disabled className="h-10" />
              </div>
              {drafts.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => removeRow(i)} className="h-10 w-10 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addRow} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add another admin
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" onClick={() => navigate("/setup/activate-services")}>Skip</Button>
        <Button onClick={handleContinue} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default InviteAdmins;
