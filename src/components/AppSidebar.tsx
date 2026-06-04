import {
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  MapPin,
  Lock,
  Palette,
  Languages,
  Bell,
  Plug,
  ClipboardList,
  HelpCircle,
  Settings,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import cityOfCapeTownLogo from "@/assets/city-of-cape-town-logo.png";
import { useOnboarding } from "@/contexts/OnboardingContext";

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


const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Templates", url: "/services", icon: FileText },
];

const setupItems = [
  { title: "Organization Profile", url: "/setup/organization", icon: Building2 },
  { title: "Users & Access", url: "/setup/users", icon: Users },
  { title: "Application Areas", url: "/setup/deployment", icon: MapPin },
  { title: "Authentication", url: "/setup/auth", icon: Lock },
];

const configItems = [
  { title: "Branding & Theme", url: "/config/branding", icon: Palette },
  { title: "Languages", url: "/config/languages", icon: Languages },
  
  { title: "Integrations", url: "/config/integrations", icon: Plug },
];

const utilItems = [
  { title: "Audit Log", url: "/audit-log", icon: ClipboardList },
  { title: "Help & Support", url: "/help", icon: HelpCircle },
  { title: "Settings", url: "/settings", icon: Settings },
];

function NavGroup({ label, items }: { label: string; items: typeof mainItems }) {
  const { state: sidebarState } = useSidebar();
  const collapsed = sidebarState === "collapsed";
  const location = useLocation();

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
  const isOwner = state.currentUserRole === "service_owner";

  const ownerMainItems = [
    { title: "My Services", url: "/owner", icon: FileText },
  ];
  const ownerUtilItems = [
    { title: "Help & Support", url: "/help", icon: HelpCircle },
  ];

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
                {isOwner ? "Service Owner" : "Admin Console"}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {isOwner ? (
          <>
            <NavGroup label="Main" items={ownerMainItems} />
            <NavGroup label="Utilities" items={ownerUtilItems} />
          </>
        ) : (
          <>
            <NavGroup label="Main" items={mainItems} />
            <NavGroup label="Setup" items={setupItems} />
            <NavGroup label="Configuration" items={configItems} />
            <NavGroup label="Utilities" items={utilItems} />
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
