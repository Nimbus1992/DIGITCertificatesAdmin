import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Rocket, CheckCircle2, Info, ChevronLeft } from "lucide-react";
import { BoundarySource, DEFAULT_JURISDICTION } from "@/data/boundarySeeds";
import { ReviewConfig } from "./StepReviewGeographic";

interface Props {
  source: BoundarySource;
  review: ReviewConfig;
  defaultName?: string;
  levels: string[];
  onBack: () => void;
  onSave: (name: string) => void;
}

const SOURCE_LABEL: Record<BoundarySource, string> = {
  preloaded: "Pre-loaded (OSM via Geofabrik)",
  shapefile: "Uploaded shapefile",
  excel: "Uploaded Excel",
};

export default function StepConfirm({ source, review, defaultName = "Administrative Hierarchy", levels, onBack, onSave }: Props) {
  const [name, setName] = useState(defaultName);
  const mode = source === "excel" ? "Limited (Excel)" : "Geographic";
  const renamedLevels = levels.map((l) => review.labels[l] ?? l);
  const opLevel = review.labels[review.operationalLevel] ?? review.operationalLevel;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Proceed with this boundary configuration?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review the configuration below. Once confirmed, this service will use this hierarchy. Boundary data can be changed later from Boundary Management.
        </p>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Name this boundary hierarchy</label>
        <Input className="mt-1.5 h-11" value={name} onChange={(e) => setName(e.target.value)} />
        <p className="text-xs text-muted-foreground mt-1.5">This name will appear in service configuration and the boundary setup page.</p>
      </div>

      <div className="rounded-xl border border-border divide-y divide-border">
        <div className="p-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Jurisdiction</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">{DEFAULT_JURISDICTION.name}</p>
          </div>
          <Badge variant="outline" className="text-xs">Admin level {DEFAULT_JURISDICTION.adminLevel}</Badge>
        </div>
        <div className="p-4">
          <p className="text-xs text-muted-foreground">Data source</p>
          <p className="text-sm font-semibold text-foreground mt-0.5">{SOURCE_LABEL[source]}</p>
        </div>
        <div className="p-4">
          <p className="text-xs text-muted-foreground">Mode</p>
          <p className="text-sm font-semibold text-foreground mt-0.5">{mode}</p>
        </div>
        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-2">Hierarchy levels</p>
          <div className="flex flex-wrap gap-1.5">
            {renamedLevels.map((l, i) => (
              <Badge key={l + i} variant="outline" className="text-xs">{i + 1}. {l}</Badge>
            ))}
          </div>
        </div>
        <div className="p-4">
          <p className="text-xs text-muted-foreground">Operational level</p>
          <p className="text-sm font-semibold text-foreground mt-0.5">{opLevel}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Citizens will file applications at {opLevel}. Inspectors will be assigned at {opLevel}.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 flex gap-2.5">
        <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-accent">This configuration will be inherited by this service.</p>
          <p className="text-xs text-muted-foreground mt-1">Service Owners can choose a different hierarchy when setting up their service.</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground flex items-start gap-1.5">
        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        Boundary data can be corrected at any time after setup by uploading a shapefile — this does not need to be finalised today.
      </p>

      <div className="flex items-center gap-3 pt-2">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <Button
          className="flex-1 h-11 bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
          onClick={() => onSave(name)}
        >
          <Rocket className="h-4 w-4" /> Save boundary configuration
        </Button>
      </div>
    </div>
  );
}
