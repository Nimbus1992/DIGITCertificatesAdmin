import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { PersonaProvider } from "@/contexts/PersonaContext";
import Onboarding from "./pages/Onboarding";
import TemplatesDashboard from "./pages/TemplatesDashboard";
import TemplatesCatalog from "./pages/TemplatesCatalog";
import ServiceConfig from "./pages/ServiceConfig";
import ServicePreview from "./components/preview/ServicePreview";
import GoLive from "./pages/GoLive";
import ServiceManage from "./pages/ServiceManage";
import OrganizationProfile from "./pages/setup/OrganizationProfile";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/AppLayout";
import PlaceholderPage from "./pages/placeholder/PlaceholderPage";
import BrandingTheme from "./pages/BrandingTheme";
import TemplateSetup from "./pages/TemplateSetup";
import TemplateActivate from "./pages/TemplateActivate";
import TemplateDetailsPage from "./pages/TemplateDetailsPage";
import TemplatePreview from "./pages/TemplatePreview";
import ResponsiveQA from "./pages/ResponsiveQA";
import UsersAccess from "./pages/UsersAccess";
import AuditLogs from "./pages/AuditLogs";
import ApplicationAreas from "./pages/ApplicationAreas";
import BoundaryConfiguration from "./pages/BoundaryConfiguration";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PersonaProvider>
      <OnboardingProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/onboarding" replace />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* App shell with sidebar */}
            <Route element={<AppLayout />}>
              <Route path="/templates" element={<TemplatesDashboard />} />
              <Route path="/catalog" element={<TemplatesCatalog />} />
              {/* Legacy aliases */}
              <Route path="/dashboard" element={<Navigate to="/templates" replace />} />
              <Route path="/services" element={<Navigate to="/templates" replace />} />

              <Route path="/templates/:templateId" element={<TemplateDetailsPage />} />
              <Route path="/templates/:templateId/preview" element={<TemplatePreview />} />
              <Route path="/templates/:templateId/activate" element={<TemplateActivate />} />
              <Route path="/templates/:templateId/setup" element={<TemplateSetup />} />
              <Route path="/service/:id/configure" element={<ServiceConfig />} />
              <Route path="/service/:id/preview" element={<ServicePreview />} />
              <Route path="/service/:id/manage" element={<ServiceManage />} />
              <Route path="/go-live" element={<GoLive />} />

              {/* Setup */}
              <Route path="/setup/organization" element={<OrganizationProfile />} />
              <Route path="/setup/users" element={<UsersAccess />} />
              <Route path="/setup/deployment" element={<ApplicationAreas />} />
              <Route path="/boundary" element={<BoundaryConfiguration />} />
              <Route path="/service/:id/boundary" element={<BoundaryConfiguration />} />
              <Route path="/setup/auth" element={<PlaceholderPage title="Authentication" description="Set up how your team signs in — Email, Single Sign-On, or One-Time Password." />} />
              <Route path="/setup/license" element={<PlaceholderPage title="License & Billing" description="Manage your license key, subscription plan, and usage." />} />

              {/* Configuration */}
              <Route path="/config/branding" element={<BrandingTheme />} />
              <Route path="/config/languages" element={<PlaceholderPage title="Languages" description="Add language support and manage translations for your applications." />} />
              <Route path="/config/integrations" element={<PlaceholderPage title="Integrations" description="Connect payment gateways, document verification, and external APIs." />} />

              {/* Utilities */}
              <Route path="/audit-log" element={<AuditLogs />} />
              <Route path="/responsive-qa" element={<ResponsiveQA />} />
              <Route path="/help" element={<PlaceholderPage title="Help & Support" description="Access documentation, FAQs, and contact support." />} />
              <Route path="/settings" element={<PlaceholderPage title="Settings" description="General platform settings, data export, and account management." />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </OnboardingProvider>
      </PersonaProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
