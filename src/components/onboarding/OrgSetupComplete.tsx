import React from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const OrgSetupComplete: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full mx-auto text-center space-y-6 animate-slide-up">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-8 w-8 text-accent" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">You're all set</h1>
          <p className="text-muted-foreground">Now let's set up your first service.</p>
        </div>
        <Button
          size="lg"
          onClick={onComplete}
          className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
        >
          Go to Dashboard <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default OrgSetupComplete;
