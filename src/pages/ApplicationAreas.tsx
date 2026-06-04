import { useNavigate } from "react-router-dom";
import { MapPin, Layers, History, Plus, Pencil, PowerOff, Split, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SEED_HIERARCHIES } from "@/data/boundarySeeds";

const MANAGEMENT_TILES = [
  { icon: Layers, title: "Active Hierarchies", description: "View hierarchies in use across services." },
  { icon: History, title: "Version History", description: "Audit trail of boundary changes." },
  { icon: Plus, title: "Add Boundary", description: "Append new boundaries within a hierarchy." },
  { icon: Pencil, title: "Rename Boundary", description: "Update boundary labels safely." },
  { icon: PowerOff, title: "Deactivate Boundary", description: "Retire boundaries no longer in use." },
  { icon: Split, title: "Split Boundary", description: "Divide an existing boundary into children." },
];

export default function ApplicationAreas() {
  const navigate = useNavigate();

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Application areas</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Configure geographic or administrative boundaries that determine where applications are filed,
            how staff are assigned, and how dashboards aggregate data.
          </p>
        </div>
        <Button
          className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
          onClick={() => navigate("/boundary?from=areas")}
        >
          <Plus className="h-4 w-4" /> Configure boundary
        </Button>
      </div>

      <section className="mb-10">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Active hierarchies</p>
        <div className="space-y-3">
          {SEED_HIERARCHIES.map((h) => (
            <Card key={h.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/boundary?from=areas")}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">{h.name}</p>
                    {h.isDefault && <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 text-[10px]">Default</Badge>}
                    <Badge variant="outline" className="text-[10px]">{h.mode === "geographic" ? "Geographic" : "Limited Mode"}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {h.levels.join(" → ")} · Used by {h.usedByServiceCount} service{h.usedByServiceCount === 1 ? "" : "s"}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Boundary management</p>
        <p className="text-xs text-muted-foreground mb-4">
          These actions become available once a service goes live with this hierarchy.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MANAGEMENT_TILES.map((t) => {
            const Icon = t.icon;
            return (
              <Card key={t.title} className="opacity-60">
                <CardContent className="p-4">
                  <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center mb-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{t.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                  <Badge variant="outline" className="text-[10px] mt-3">Available after go-live</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
