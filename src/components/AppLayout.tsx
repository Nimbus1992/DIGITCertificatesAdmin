import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import BrandingScope from "@/components/BrandingScope";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePersona } from "@/contexts/PersonaContext";
import { LogOut, UserRound } from "lucide-react";

const AppLayout: React.FC = () => {
  const { persona, signOut } = usePersona();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate("/onboarding", { replace: true });
  };

  return (
    <BrandingScope applyToRoot>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-12 flex items-center justify-between border-b bg-card px-2">
              <SidebarTrigger className="ml-1" />
              {persona.role && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 h-8">
                      <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <UserRound className="h-3.5 w-3.5" />
                      </span>
                      <span className="hidden sm:flex flex-col items-start leading-tight">
                        <span className="text-xs font-medium">
                          {persona.role === "super_admin" ? "Super Admin" : "Service Owner"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{persona.email}</span>
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="text-xs">
                      <div className="font-medium">
                        {persona.role === "super_admin" ? "Super Admin" : "Service Owner"}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-normal">{persona.email}</div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" /> Sign out / switch persona
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
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
