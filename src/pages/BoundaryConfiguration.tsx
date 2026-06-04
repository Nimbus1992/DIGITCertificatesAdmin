import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import BoundaryEntry from "@/components/boundary/BoundaryEntry";
import BoundaryWizard from "@/components/boundary/BoundaryWizard";
import { SEED_HIERARCHIES, BoundaryHierarchy } from "@/data/boundarySeeds";

type Phase = "entry" | "wizard" | "saved";

export default function BoundaryConfiguration() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [params] = useSearchParams();
  const from = params.get("from"); // "go-live" | "areas" | null

  const [hierarchies, setHierarchies] = useState<BoundaryHierarchy[]>(SEED_HIERARCHIES);
  const [selectedId, setSelectedId] = useState<string | null>(hierarchies[0]?.id ?? null);
  const [phase, setPhase] = useState<Phase>("entry");
  const [savedHierarchy, setSavedHierarchy] = useState<BoundaryHierarchy | null>(null);

  const selected = useMemo(() => hierarchies.find((h) => h.id === selectedId) ?? null, [hierarchies, selectedId]);

  const goBack = () => {
    if (from === "go-live") navigate("/go-live");
    else if (id) navigate(`/service/${id}/configure`);
    else navigate("/setup/deployment");
  };

  const handleSelectedContinue = () => {
    if (selected) {
      setSavedHierarchy(selected);
      setPhase("saved");
    }
  };

  return (
    <div className="bg-background min-h-screen px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={goBack} className="gap-1 -ml-2 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back {from === "go-live" ? "to go-live checklist" : ""}
        </Button>

        {phase !== "saved" && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Boundary configuration</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure geographic or administrative boundaries for this service.
            </p>
          </div>
        )}

        {phase === "entry" && (
          <BoundaryEntry
            hierarchies={hierarchies}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onCreateNew={() => setPhase("wizard")}
            onContinue={handleSelectedContinue}
          />
        )}

        {phase === "wizard" && (
          <BoundaryWizard
            onCancel={() => setPhase("entry")}
            onComplete={(h) => {
              setHierarchies((prev) => [...prev, h]);
              setSelectedId(h.id);
              setSavedHierarchy(h);
              setPhase("saved");
            }}
          />
        )}

        {phase === "saved" && savedHierarchy && (
          <div className="text-center space-y-6 py-10">
            <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Boundary configuration saved</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                <strong>{savedHierarchy.name}</strong> · {savedHierarchy.mode === "geographic" ? "Geographic Mode" : "Limited Mode"} · Operational level: {savedHierarchy.operationalLevel}
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => setPhase("entry")}>Configure another</Button>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={goBack}>
                {from === "go-live" ? "Back to go-live checklist" : "Done"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
