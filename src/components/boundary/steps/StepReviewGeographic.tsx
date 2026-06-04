import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Search, MapPin, Check, Info, ChevronLeft } from "lucide-react";
import BoundaryMap from "../BoundaryMap";
import { BoundaryHierarchy, BoundaryPolygon, DEFAULT_JURISDICTION, SAMPLE_POLYGONS } from "@/data/boundarySeeds";
import { cn } from "@/lib/utils";

export interface ReviewConfig {
  labels: Record<string, string>; // original level name -> renamed
  operationalLevel: string;
}

interface Props {
  source: "preloaded" | "shapefile";
  initialLevels?: string[]; // defaults to Municipality/Sub-council/Ward
  onBack: () => void;
  onConfirm: (cfg: ReviewConfig) => void;
}

const DEFAULT_LEVELS = ["Municipality", "Sub-council", "Ward"];

export default function StepReviewGeographic({ source, initialLevels = DEFAULT_LEVELS, onBack, onConfirm }: Props) {
  const [phase, setPhase] = useState<"confirm-jurisdiction" | "review">("confirm-jurisdiction");
  const [labels, setLabels] = useState<Record<string, string>>(
    Object.fromEntries(initialLevels.map((l) => [l, l]))
  );
  const [activeLevel, setActiveLevel] = useState(initialLevels[0]);
  const [search, setSearch] = useState("");
  const [highlightedId, setHighlightedId] = useState<string | undefined>();
  const [operationalLevel, setOperationalLevel] = useState(initialLevels[initialLevels.length - 1]);

  const polygons = SAMPLE_POLYGONS;
  const byLevel = useMemo(() => {
    const map: Record<string, BoundaryPolygon[]> = {};
    for (const lvl of initialLevels) map[lvl] = polygons.filter((p) => p.level === lvl);
    return map;
  }, [polygons, initialLevels]);

  const filtered = (byLevel[activeLevel] ?? []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (phase === "confirm-jurisdiction") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Confirm your jurisdiction</h2>
          <p className="text-sm text-muted-foreground mt-1">
            This is the jurisdiction recorded when your account was created. The pre-loaded boundary data covers this area.
          </p>
        </div>

        <BoundaryMap polygons={[polygons.find((p) => p.level === "Municipality")!]} height={320} />

        <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/40 p-4">
          <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
            <MapPin className="h-4 w-4 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-foreground">{DEFAULT_JURISDICTION.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{DEFAULT_JURISDICTION.full}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">Admin level {DEFAULT_JURISDICTION.adminLevel}</Badge>
                <Badge variant="outline" className="text-xs">{DEFAULT_JURISDICTION.areaKm2.toLocaleString()} km²</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <Button onClick={() => setPhase("review")} className="flex-1 h-11 bg-accent text-accent-foreground hover:bg-accent/90">
            <Check className="h-4 w-4" /> Yes, proceed with this jurisdiction
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Review {source === "preloaded" ? "pre-loaded" : "uploaded"} boundary data</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Verify the boundaries, rename hierarchy labels to match your government's terminology, and select the operational level.
        </p>
      </div>

      <Badge variant="outline" className="text-xs bg-secondary/60 font-normal">
        Source: {source === "preloaded" ? "OSM via Geofabrik · Updated 2024-11-20" : "Uploaded shapefile"}
      </Badge>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <BoundaryMap polygons={byLevel[activeLevel] ?? []} highlightedId={highlightedId} height={380} />

        <div className="rounded-lg border border-border p-3 flex flex-col min-h-[380px]">
          <div className="flex gap-1 mb-3">
            {initialLevels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => { setActiveLevel(lvl); setHighlightedId(undefined); }}
                className={cn(
                  "text-xs px-2.5 py-1.5 rounded-md font-medium transition-colors",
                  activeLevel === lvl ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {labels[lvl] ?? lvl} <span className="text-muted-foreground/70">({byLevel[lvl]?.length ?? 0})</span>
              </button>
            ))}
          </div>
          <div className="relative mb-2">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${labels[activeLevel] ?? activeLevel}…`} className="h-8 pl-7 text-xs" />
          </div>
          <div className="space-y-1 overflow-auto flex-1">
            {filtered.map((p) => (
              <button
                key={p.id}
                onMouseEnter={() => setHighlightedId(p.id)}
                onMouseLeave={() => setHighlightedId(undefined)}
                className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-secondary flex items-center gap-2"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {p.name}
              </button>
            ))}
            {filtered.length === 0 && <p className="text-xs text-muted-foreground py-2">No matches.</p>}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rename hierarchy labels (optional)</p>
          <p className="text-xs text-muted-foreground flex items-start gap-1.5 mt-1">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            Renamed labels will appear in application filing forms, staff assignment screens, and dashboards for all services on this instance.
          </p>
        </div>

        {initialLevels.map((lvl) => (
          <div key={lvl} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Original: {lvl}</p>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={labels[lvl] ?? lvl}
                  onChange={(e) => setLabels({ ...labels, [lvl]: e.target.value })}
                  className="h-8 text-sm font-medium border-0 shadow-none px-0 focus-visible:ring-0 max-w-xs"
                />
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
            <Badge variant="outline" className="text-xs">{byLevel[lvl]?.length ?? 0} boundaries</Badge>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select operational level</p>
        {initialLevels.map((lvl) => {
          const renamed = labels[lvl] ?? lvl;
          const selected = operationalLevel === lvl;
          return (
            <button
              key={lvl}
              onClick={() => setOperationalLevel(lvl)}
              className={cn(
                "w-full text-left rounded-lg border-2 p-4 transition-all",
                selected ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground/40"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{renamed}</p>
                  {selected && (
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Applications will be filed at {renamed}. Staff will be assigned at {renamed}. Dashboards will aggregate data by {renamed}.
                    </p>
                  )}
                </div>
                {selected && <Check className="h-4 w-4 text-accent shrink-0" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button variant="outline" onClick={() => setPhase("confirm-jurisdiction")}>
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <Button
          className="flex-1 h-11 bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={() => onConfirm({ labels, operationalLevel })}
        >
          Review and confirm
        </Button>
      </div>
    </div>
  );
}
