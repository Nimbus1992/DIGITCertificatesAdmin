import { useState } from "react";
import { Upload, FileArchive, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import StepReviewGeographic, { ReviewConfig } from "./StepReviewGeographic";

interface Props {
  onBack: () => void;
  onConfirm: (cfg: ReviewConfig) => void;
}

export default function StepShapefile({ onBack, onConfirm }: Props) {
  const [file, setFile] = useState<string | null>(null);

  if (file) {
    return <StepReviewGeographic source="shapefile" onBack={() => setFile(null)} onConfirm={onConfirm} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Upload shapefile</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload an ESRI shapefile (.zip containing .shp, .dbf, .shx). All geographic capabilities will be enabled.
        </p>
      </div>

      <label className="block border-2 border-dashed border-border rounded-xl py-14 px-6 text-center cursor-pointer hover:border-muted-foreground/40 transition-colors">
        <input
          type="file"
          accept=".zip,.shp,.dbf,.shx"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setFile(f.name);
          }}
        />
        <div className="h-12 w-12 rounded-lg bg-secondary mx-auto flex items-center justify-center mb-3">
          <Upload className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">Drop your .zip shapefile here, or click to browse</p>
        <p className="text-xs text-muted-foreground mt-1">.zip · .shp · .dbf · .shx accepted</p>
      </label>

      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button
          className="flex-1 h-11 bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={() => setFile("sample.zip")}
        >
          Continue with sample data
        </Button>
      </div>
    </div>
  );
}
