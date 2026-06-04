import React from "react";
import { useParams } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { can, hasServiceAccess, Permission } from "@/lib/rbac";

interface Props {
  permission: Permission;
  /** If set, also checks service-level access using the route :id param (or this prop). */
  serviceId?: string;
  children: React.ReactNode;
}

const NoAccess: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center p-6">
    <Card className="max-w-md w-full">
      <CardContent className="p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-warning/15 mx-auto flex items-center justify-center">
          <ShieldAlert className="h-6 w-6 text-warning" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">You don't have access</h2>
        <p className="text-sm text-muted-foreground">
          Your role doesn't include permission to view this page. Contact your administrator if you think this is a mistake.
        </p>
      </CardContent>
    </Card>
  </div>
);

const Require: React.FC<Props> = ({ permission, serviceId, children }) => {
  const { state } = useOnboarding();
  const params = useParams();
  const sid = serviceId ?? params.id;

  if (!can(state, permission)) return <NoAccess />;
  if (sid && !hasServiceAccess(state, sid)) return <NoAccess />;
  return <>{children}</>;
};

export default Require;
