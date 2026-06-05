import {
  LayoutTemplate,
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

type NavItem = { title: string; url: string; icon: any };

const workspaceItems: NavItem[] = [
  { title: "Services", url: "/templates", icon: LayoutTemplate },
];

const setupItems: NavItem[] = [
  { title: "Organization", url: "/setup/organization", icon: Building2 },
  { title: "Platform Users", url: "/setup/users", icon: Users },
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
  { title: "Help", url: "/help", icon: HelpCircle },
  { title: "Settings", url: "/settings", icon: Settings },
];

function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  const { state: sidebarState } = useSidebar();
  const collapsed = sidebarState === "collapsed";
  const location = useLocation();

  if (items.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.08em] text-sidebar-foreground/50 font-medium">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={location.pathname.startsWith(item.url)}>
                <NavLink
                  to={item.url}
                  end={item.url === "/templates"}
                  className={cn("hover:bg-sidebar-accent/40 text-sidebar-foreground/80")}
                  activeClassName="bg-sidebar-accent/60 text-sidebar-foreground font-medium"
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
  const collapsed = sidebarState === "collapsed";
  const { persona } = usePersona();

  const role = persona.role;
  const isServiceOwner = role === "service_owner";
  const isAdmin = role === "administrator";

  // Service owners get a stripped-down workspace
  const workspace = isServiceOwner
    ? [{ title: "My Services", url: "/templates", icon: LayoutTemplate }]
    : workspaceItems;

  // Administrators can't manage the Organization profile
  const setup = isServiceOwner
    ? []
    : isAdmin
    ? setupItems.filter((i) => i.url !== "/setup/organization")
    : setupItems;

  const config = isServiceOwner ? [] : configItems;

  const utils = isServiceOwner
    ? utilItems.filter((i) => i.url !== "/audit-log") // SO sees per-service audit later
    : utilItems;

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
              <p className="text-[11px] text-sidebar-foreground/60 truncate">
                {role === "service_owner"
                  ? "Service Owner"
                  : role === "administrator"
                  ? "Administrator"
                  : role === "super_admin"
                  ? "Super Admin"
                  : "Admin Console"}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup label="Workspace" items={workspace} />
        <NavGroup label="Platform" items={setup} />
        <NavGroup label="Configuration" items={config} />
        <NavGroup label="Utilities" items={utils} />
      </SidebarContent>
    </Sidebar>
  );
}
