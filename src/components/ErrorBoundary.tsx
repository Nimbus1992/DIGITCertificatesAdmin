import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("App render failed", error);
  }

  private resetWorkspace = () => {
    localStorage.removeItem("lnp-onboarding-state");
    window.location.href = "/onboarding";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center px-6 py-10">
        <Card className="w-full max-w-md border-border shadow-sm">
          <CardContent className="p-7 text-center space-y-4">
            <div className="mx-auto h-11 w-11 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl font-semibold text-foreground">Workspace couldn't load</h1>
              <p className="text-sm text-muted-foreground">
                Your saved setup state may be out of date. Reset the local setup session to continue.
              </p>
            </div>
            <Button onClick={this.resetWorkspace} className="w-full gap-2">
              <RotateCcw className="h-4 w-4" /> Reset and reopen onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default ErrorBoundary;