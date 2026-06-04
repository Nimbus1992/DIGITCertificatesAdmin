import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import Onboarding from "./pages/Onboarding";

import ServiceConfig from "./pages/ServiceConfig";
import ServicePreview from "./components/preview/ServicePreview";
import GoLive from "./pages/GoLive";
import ServiceManage from "./pages/ServiceManage";
import OrganizationProfile from "./pages/setup/OrganizationProfile";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/AppLayout";
import PlaceholderPage from "./pages/placeholder/PlaceholderPage";
import BrandingTheme from "./pages/BrandingTheme";
import Services from "./pages/Services";
import TemplateSetup from "./pages/TemplateSetup";
import ResponsiveQA from "./pages/ResponsiveQA";
import UsersAccess from "./pages/UsersAccess";
import AuditLogs from "./pages/AuditLogs";
import ApplicationAreas from "./pages/ApplicationAreas";
import BoundaryConfiguration from "./pages/BoundaryConfiguration";
import Home from "./pages/Home";
import InviteAdmins from "./pages/setup/InviteAdmins";
import ActivateServices from "./pages/setup/ActivateServices";
import AssignOwners from "./pages/setup/AssignOwners";
import Require from "./components/Require";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <OnboardingProvider>
        <Toaster />
        <Sonner />
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
            <Route path="/" element={<Navigate to="/onboarding" replace />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* App shell with sidebar */}
            <Route element={<AppLayout />}>
              <Route path="/home" element={<Home />} />
              {/* Back-compat redirects */}
              <Route path="/dashboard" element={<Navigate to="/home" replace />} />
              <Route path="/owner" element={<Navigate to="/home" replace />} />

              <Route path="/services" element={<Services />} />
              <Route path="/templates/:templateId/setup" element={<Require permission="services.activate"><TemplateSetup /></Require>} />
              <Route path="/service/:id/configure" element={<Require permission="services.configure"><ServiceConfig /></Require>} />
              <Route path="/service/:id/preview" element={<Require permission="services.configure"><ServicePreview /></Require>} />
              <Route path="/service/:id/manage" element={<Require permission="services.configure"><ServiceManage /></Require>} />
              <Route path="/go-live" element={<Require permission="services.goLive"><GoLive /></Require>} />

              {/* Super Admin setup steps */}
              <Route path="/setup/invite-admins" element={<Require permission="users.manage"><InviteAdmins /></Require>} />
              <Route path="/setup/activate-services" element={<Require permission="services.activate"><ActivateServices /></Require>} />
              <Route path="/setup/assign-owners" element={<Require permission="services.assignOwners"><AssignOwners /></Require>} />

              {/* Setup */}
              <Route path="/setup/organization" element={<Require permission="org.manage"><OrganizationProfile /></Require>} />
              <Route path="/setup/users" element={<Require permission="users.manage"><UsersAccess /></Require>} />
              <Route path="/setup/deployment" element={<Require permission="setup.manage"><ApplicationAreas /></Require>} />
              <Route path="/boundary" element={<Require permission="setup.manage"><BoundaryConfiguration /></Require>} />
              <Route path="/service/:id/boundary" element={<Require permission="services.configure"><BoundaryConfiguration /></Require>} />
              <Route path="/setup/auth" element={<Require permission="setup.manage"><PlaceholderPage title="Authentication" description="Set up how your team signs in — Email, Single Sign-On, or One-Time Password." /></Require>} />
              <Route path="/setup/license" element={<Require permission="setup.manage"><PlaceholderPage title="License & Billing" description="Manage your license key, subscription plan, and usage." /></Require>} />

              {/* Configuration */}
              <Route path="/config/branding" element={<Require permission="branding.manage"><BrandingTheme /></Require>} />
              <Route path="/config/languages" element={<Require permission="setup.manage"><PlaceholderPage title="Languages" description="Add language support and manage translations for your applications." /></Require>} />
              <Route path="/config/integrations" element={<Require permission="setup.manage"><PlaceholderPage title="Integrations" description="Connect payment gateways, document verification, and external APIs." /></Require>} />

              {/* Utilities */}
              <Route path="/audit-log" element={<Require permission="audit.view"><AuditLogs /></Require>} />
              <Route path="/responsive-qa" element={<ResponsiveQA />} />
              <Route path="/help" element={<PlaceholderPage title="Help & Support" description="Access documentation, FAQs, and contact support." />} />
              <Route path="/settings" element={<PlaceholderPage title="Settings" description="General platform settings, data export, and account management." />} />
            </Route>

            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </OnboardingProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
