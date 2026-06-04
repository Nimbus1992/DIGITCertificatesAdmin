import { Database, Upload, Table2, Info, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BoundarySource } from "@/data/boundarySeeds";

interface StepDataSourceProps {
  value: BoundarySource;
  onChange: (v: BoundarySource) => void;
  onContinue: () => void;
  onSkip?: () => void;
}

const options: { id: BoundarySource; icon: typeof Database; title: string; recommended?: boolean; description: string; note?: string }[] = [
  {
    id: "preloaded",
    icon: Database,
    title: "Review pre-loaded boundary data",
    recommended: true,
    description: "Your implementation partner uploaded boundary data when your account was provisioned. Review it on a map, rename labels if needed, and confirm.",
  },
  {
    id: "shapefile",
    icon: Upload,
    title: "Upload a shapefile",
    description: "Upload an ESRI shapefile (.zip containing .shp, .dbf, .shx). All geographic capabilities will be available — map-based selection, geographic dashboards.",
    note: "Shapefiles are available from national mapping agencies, Geofabrik, or the WHO Geospatial DB.",
  },
  {
    id: "excel",
    icon: Table2,
    title: "Upload an Excel file",
    description: "Upload a list of boundary names, hierarchy levels, and parent-child relationships. No geographic shape data required.",
    note: "Running in Excel mode limits map-based features. You can add a shapefile at any time to unlock them.",
  },
];

export default function StepDataSource({ value, onChange, onContinue, onSkip }: StepDataSourceProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Choose your boundary data source</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select where your boundary data will come from. You can always upload a shapefile later to upgrade to full geographic mode.
        </p>
      </div>

      <div className="space-y-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={cn(
                "w-full text-left rounded-xl border-2 p-4 transition-all",
                selected ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40"
              )}
            >
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">{opt.title}</p>
                    {opt.recommended && (
                      <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 text-[10px]">Recommended</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{opt.description}</p>
                  {opt.note && (
                    <p className="text-xs text-muted-foreground mt-2 flex gap-1.5">
                      <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{opt.note}</span>
                    </p>
                  )}
                  {opt.id === "excel" && selected && (
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-2"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download template CSV
                    </a>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 pt-2">
        {onSkip && (
          <Button variant="ghost" onClick={onSkip}>
            Skip for now
          </Button>
        )}
        <Button onClick={onContinue} className="flex-1 h-11 bg-accent text-accent-foreground hover:bg-accent/90">
          Continue
        </Button>
      </div>
    </div>
  );
}
