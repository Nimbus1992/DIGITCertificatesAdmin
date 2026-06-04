import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import BrandingScope from "@/components/BrandingScope";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const AppLayout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <BrandingScope applyToRoot>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-12 flex items-center border-b bg-card px-2 gap-2">
              <SidebarTrigger className="ml-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-1 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </header>
            <main className="flex-1 overflow-auto">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </BrandingScope>
  );
};

export default AppLayout;
