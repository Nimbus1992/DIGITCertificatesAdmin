import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, Plus, Star, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BoundaryHierarchy } from "@/data/boundarySeeds";

interface Props {
  hierarchies: BoundaryHierarchy[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateNew: () => void;
  onContinue: () => void;
}

export default function BoundaryEntry({ hierarchies, selectedId, onSelect, onCreateNew, onContinue }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Use an existing hierarchy</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select a hierarchy already active in this instance, or create a new one for this service.
        </p>
      </div>

      <div className="space-y-3">
        {hierarchies.map((h) => {
          const selected = selectedId === h.id;
          return (
            <button
              key={h.id}
              onClick={() => onSelect(h.id)}
              className={cn(
                "w-full text-left rounded-xl border-2 p-4 transition-all",
                selected ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground/40"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                  selected ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                )}>
                  {selected ? <CheckCircle2 className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">{h.name}</p>
                    {h.isDefault && (
                      <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 text-[10px] gap-1">
                        <Star className="h-2.5 w-2.5" /> Default
                      </Badge>
                    )}
                    <Badge variant="outline" className={cn(
                      "text-[10px]",
                      h.mode === "geographic" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300" : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300"
                    )}>
                      {h.mode === "geographic" ? "Geographic" : "Limited Mode"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {h.source === "preloaded" ? "Pre-loaded" : h.source === "shapefile" ? "Shapefile" : "Excel"} · {h.levels.length} levels · Used by {h.usedByServiceCount} service{h.usedByServiceCount === 1 ? "" : "s"}
                  </p>
                  {selected && (
                    <p className="text-xs text-accent mt-2">
                      This service will inherit future updates made to this hierarchy.
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        <button
          onClick={onCreateNew}
          className="w-full text-left rounded-xl border-2 border-dashed border-border p-4 hover:border-muted-foreground/40 transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Plus className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Add a new hierarchy for this service</p>
              <p className="text-xs text-muted-foreground mt-1">Upload a shapefile or Excel file, or review pre-loaded boundary data.</p>
            </div>
          </div>
        </button>
      </div>

      <Button
        className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90"
        disabled={!selectedId}
        onClick={onContinue}
      >
        Continue
      </Button>
    </div>
  );
}
