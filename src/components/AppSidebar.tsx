import {
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  MapPin,
  Lock,
  Palette,
  Languages,
  Plug,
  ClipboardList,
  HelpCircle,
  Settings,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import cityOfCapeTownLogo from "@/assets/city-of-cape-town-logo.png";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { can, Permission } from "@/lib/rbac";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  permission?: Permission;
};

const mainItems: NavItem[] = [
  { title: "Home", url: "/home", icon: LayoutDashboard },
  { title: "Templates", url: "/services", icon: FileText, permission: "services.activate" },
];

const setupItems: NavItem[] = [
  { title: "Organization Profile", url: "/setup/organization", icon: Building2, permission: "org.manage" },
  { title: "Users & Access", url: "/setup/users", icon: Users, permission: "users.manage" },
  { title: "Application Areas", url: "/setup/deployment", icon: MapPin, permission: "setup.manage" },
  { title: "Authentication", url: "/setup/auth", icon: Lock, permission: "setup.manage" },
];

const configItems: NavItem[] = [
  { title: "Branding & Theme", url: "/config/branding", icon: Palette, permission: "branding.manage" },
  { title: "Languages", url: "/config/languages", icon: Languages, permission: "setup.manage" },
  { title: "Integrations", url: "/config/integrations", icon: Plug, permission: "setup.manage" },
];

const utilItems: NavItem[] = [
  { title: "Audit Log", url: "/audit-log", icon: ClipboardList, permission: "audit.view" },
  { title: "Help & Support", url: "/help", icon: HelpCircle },
  { title: "Settings", url: "/settings", icon: Settings },
];

function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  const { state: sidebarState } = useSidebar();
  const collapsed = sidebarState === "collapsed";
  const location = useLocation();

  if (items.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                <NavLink
                  to={item.url}
                  end
                  className="hover:bg-sidebar-accent/40 text-sidebar-foreground/80"
                  activeClassName="bg-sidebar-accent/60 text-sidebar-foreground font-medium border-l-2 border-sidebar-primary"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const { state: sidebarState } = useSidebar();
  const { state } = useOnboarding();
  const collapsed = sidebarState === "collapsed";

  const filter = (items: NavItem[]) =>
    items.filter((i) => !i.permission || can(state, i.permission));

  const role = state.currentUserRole ?? "super_admin";
  const roleLabel = role === "service_owner" ? "Service Owner" : "Admin Console";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img
            src={cityOfCapeTownLogo}
            alt="City of Cape Town"
            className="h-7 w-7 object-contain shrink-0 rounded-sm bg-white/10"
          />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                City of Cape Town
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{roleLabel}</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup label="Main" items={filter(mainItems)} />
        <NavGroup label="Setup" items={filter(setupItems)} />
        <NavGroup label="Configuration" items={filter(configItems)} />
        <NavGroup label="Utilities" items={filter(utilItems)} />
      </SidebarContent>
    </Sidebar>
  );
}
