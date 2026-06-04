import { useState } from "react";
import Stepper from "./Stepper";
import StepDataSource from "./steps/StepDataSource";
import StepReviewGeographic, { ReviewConfig } from "./steps/StepReviewGeographic";
import StepShapefile from "./steps/StepShapefile";
import StepExcel from "./steps/StepExcel";
import StepConfirm from "./steps/StepConfirm";
import { BoundaryHierarchy, BoundarySource } from "@/data/boundarySeeds";

interface Props {
  onCancel: () => void;
  onComplete: (h: BoundaryHierarchy) => void;
}

const LEVELS_DEFAULT = ["Municipality", "Sub-council", "Ward"];

export default function BoundaryWizard({ onCancel, onComplete }: Props) {
  const [step, setStep] = useState(0); // 0 data source, 1 review, 2 confirm
  const [source, setSource] = useState<BoundarySource>("preloaded");
  const [review, setReview] = useState<ReviewConfig | null>(null);

  return (
    <div className="space-y-8">
      <Stepper steps={["Data source", "Review & configure", "Confirm"]} current={step} />

      {step === 0 && (
        <StepDataSource
          value={source}
          onChange={setSource}
          onSkip={onCancel}
          onContinue={() => setStep(1)}
        />
      )}

      {step === 1 && source === "preloaded" && (
        <StepReviewGeographic
          source="preloaded"
          onBack={() => setStep(0)}
          onConfirm={(cfg) => { setReview(cfg); setStep(2); }}
        />
      )}

      {step === 1 && source === "shapefile" && (
        <StepShapefile
          onBack={() => setStep(0)}
          onConfirm={(cfg) => { setReview(cfg); setStep(2); }}
        />
      )}

      {step === 1 && source === "excel" && (
        <StepExcel
          onBack={() => setStep(0)}
          onConfirm={(cfg) => { setReview(cfg); setStep(2); }}
        />
      )}

      {step === 2 && review && (
        <StepConfirm
          source={source}
          review={review}
          levels={source === "excel" ? ["Region", "District", "Block"] : LEVELS_DEFAULT}
          onBack={() => setStep(1)}
          onSave={(name) => {
            const levels = source === "excel" ? ["Region", "District", "Block"] : LEVELS_DEFAULT;
            const renamed = levels.map((l) => review.labels[l] ?? l);
            onComplete({
              id: `h-${Date.now()}`,
              name,
              source,
              mode: source === "excel" ? "limited" : "geographic",
              isDefault: false,
              levels: renamed,
              operationalLevel: review.labels[review.operationalLevel] ?? review.operationalLevel,
              usedByServiceCount: 1,
              polygons: [],
            });
          }}
        />
      )}
    </div>
  );
}
