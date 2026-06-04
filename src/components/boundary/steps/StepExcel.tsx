import { useState } from "react";
import { Upload, AlertTriangle, Download, Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ReviewConfig } from "./StepReviewGeographic";

interface Props {
  onBack: () => void;
  onConfirm: (cfg: ReviewConfig) => void;
}

const DEFAULT_LEVELS = ["Region", "District", "Block"];

export default function StepExcel({ onBack, onConfirm }: Props) {
  const [uploaded, setUploaded] = useState(false);
  const [labels, setLabels] = useState<Record<string, string>>(
    Object.fromEntries(DEFAULT_LEVELS.map((l) => [l, l]))
  );
  const [operationalLevel, setOperationalLevel] = useState(DEFAULT_LEVELS[DEFAULT_LEVELS.length - 1]);
  const [acks, setAcks] = useState({ maps: false, dashboards: false, manual: false });

  const allAcked = acks.maps && acks.dashboards && acks.manual;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Upload boundary list (Excel)</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a spreadsheet listing boundary names, hierarchy levels, and parent-child relationships. No geographic shape data required.
        </p>
      </div>

      <div className="rounded-lg border-2 border-amber-400/40 bg-amber-50 dark:bg-amber-950/20 p-4">
        <div className="flex gap-2.5">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              Limited Boundary Mode — geographic analysis will not be available
            </p>
            <p className="text-xs text-amber-900/80 dark:text-amber-200/80 mt-1">
              Maps will not be available. Citizens will select boundaries from dropdowns. Location-to-boundary matching requires manual assignment.
              You can upgrade to geographic mode at any time by uploading a shapefile.
            </p>
            <a href="#" onClick={(e) => e.preventDefault()} className="inline-flex items-center gap-1.5 text-xs text-amber-900 dark:text-amber-200 font-medium underline mt-2">
              <Download className="h-3.5 w-3.5" /> Download template CSV
            </a>
          </div>
        </div>
      </div>

      {!uploaded ? (
        <>
          <label className="block border-2 border-dashed border-border rounded-xl py-14 px-6 text-center cursor-pointer hover:border-muted-foreground/40 transition-colors">
            <input type="file" accept=".csv,.xlsx" className="hidden" onChange={() => setUploaded(true)} />
            <div className="h-12 w-12 rounded-lg bg-secondary mx-auto flex items-center justify-center mb-3">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Drop your .xlsx or .csv file here, or click to browse</p>
            <p className="text-xs text-muted-foreground mt-1">Required columns: boundary_name, hierarchy_level, parent_boundary_name</p>
          </label>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onBack}>Back</Button>
            <Button className="flex-1 h-11 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setUploaded(true)}>
              Continue with sample data
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="rounded-lg border border-border p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Detected hierarchy</p>
            {DEFAULT_LEVELS.map((lvl, idx) => (
              <div key={lvl} className="flex items-center gap-3 text-sm" style={{ marginLeft: idx * 16 }}>
                <span className="text-muted-foreground">└</span>
                <Input
                  value={labels[lvl] ?? lvl}
                  onChange={(e) => setLabels({ ...labels, [lvl]: e.target.value })}
                  className="h-8 text-sm font-medium border-0 shadow-none px-0 focus-visible:ring-0 max-w-xs"
                />
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                <Badge variant="outline" className="text-xs ml-auto">{[1, 6, 24][idx]} entries</Badge>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select operational level</p>
            {DEFAULT_LEVELS.map((lvl) => {
              const renamed = labels[lvl] ?? lvl;
              const selected = operationalLevel === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setOperationalLevel(lvl)}
                  className={cn(
                    "w-full text-left rounded-lg border-2 p-3 transition-all",
                    selected ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground/40"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{renamed}</p>
                    {selected && <Check className="h-4 w-4 text-accent" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="space-y-2 rounded-lg border border-border p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Acknowledge limitations</p>
            {[
              { key: "maps", label: "I understand maps will not be available." },
              { key: "dashboards", label: "I understand dashboards will be tabular." },
              { key: "manual", label: "I understand staff may need manual boundary assignment." },
            ].map((a) => (
              <label key={a.key} className="flex items-center gap-2.5 text-sm cursor-pointer py-1">
                <Checkbox
                  checked={acks[a.key as keyof typeof acks]}
                  onCheckedChange={(v) => setAcks({ ...acks, [a.key]: Boolean(v) })}
                />
                <span className="text-foreground">{a.label}</span>
              </label>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setUploaded(false)}>Back</Button>
            <Button
              disabled={!allAcked}
              className="flex-1 h-11 bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => onConfirm({ labels, operationalLevel })}
            >
              Review and confirm
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
