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
  Lock as LockIcon,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import cityOfCapeTownLogo from "@/assets/city-of-cape-town-logo.png";
import { usePersona } from "@/contexts/PersonaContext";

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
import { cn } from "@/lib/utils";

type NavItem = { title: string; url: string; icon: any; viewOnly?: boolean };

const mainItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Templates", url: "/services", icon: FileText },
];

const setupItems: NavItem[] = [
  { title: "Organization Profile", url: "/setup/organization", icon: Building2 },
  { title: "Users & Access", url: "/setup/users", icon: Users },
  { title: "Application Areas", url: "/setup/deployment", icon: MapPin },
  { title: "Authentication", url: "/setup/auth", icon: Lock },
];

const configItems: NavItem[] = [
  { title: "Branding & Theme", url: "/config/branding", icon: Palette },
  { title: "Languages", url: "/config/languages", icon: Languages },
  { title: "Integrations", url: "/config/integrations", icon: Plug },
];

const utilItems: NavItem[] = [
  { title: "Audit Log", url: "/audit-log", icon: ClipboardList },
  { title: "Help & Support", url: "/help", icon: HelpCircle },
  { title: "Settings", url: "/settings", icon: Settings },
];

// Items that are view-only for Service Owners
const SO_VIEW_ONLY = new Set([
  "/dashboard",
  "/setup/organization",
  "/setup/deployment",
  "/setup/auth",
  "/config/branding",
]);

function scopeForRole(items: NavItem[], role: string | null): NavItem[] {
  if (role !== "service_owner") return items;
  return items.map((i) => (SO_VIEW_ONLY.has(i.url) ? { ...i, viewOnly: true } : i));
}

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
                  className={cn(
                    "hover:bg-sidebar-accent/40 text-sidebar-foreground/80",
                    item.viewOnly && "opacity-70",
                  )}
                  activeClassName="bg-sidebar-accent/60 text-sidebar-foreground font-medium border-l-2 border-sidebar-primary"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {!collapsed && (
                    <span className="flex items-center gap-1.5">
                      {item.title}
                      {item.viewOnly && <LockIcon className="h-3 w-3 opacity-60" />}
                    </span>
                  )}
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
  const collapsed = sidebarState === "collapsed";
  const { persona } = usePersona();

  const role = persona.role;

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
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {role === "service_owner" ? "Service Owner" : role === "super_admin" ? "Super Admin" : "Admin Console"}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup label="Main" items={scopeForRole(mainItems, role)} />
        <NavGroup label="Setup" items={scopeForRole(setupItems, role)} />
        <NavGroup label="Configuration" items={scopeForRole(configItems, role)} />
        <NavGroup label="Utilities" items={scopeForRole(utilItems, role)} />
      </SidebarContent>
    </Sidebar>
  );
}
