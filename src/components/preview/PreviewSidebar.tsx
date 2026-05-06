import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePreview, type PreviewRole } from "./PreviewContext";
import { User, Bell, FileSearch, MapPin, ShieldCheck, RotateCcw, MessageSquare } from "lucide-react";
import NotificationsPanel from "./NotificationsPanel";
import MessagesDrawer from "./MessagesDrawer";

interface RoleDef {
  id: PreviewRole;
  label: string;
  icon: React.ElementType;
  permissions: string[];
}

const ROLES: RoleDef[] = [
  { id: "citizen", label: "Citizen", icon: User, permissions: ["Apply", "Pay", "Track", "My Documents"] },
  { id: "documentVerifier", label: "Document Verifier", icon: FileSearch, permissions: ["Verify Docs", "Send Back", "Move to Inspection"] },
  { id: "fieldInspector", label: "Field Inspector", icon: MapPin, permissions: ["Site Visit", "Complete Inspection", "Send Back"] },
  { id: "approver", label: "Approver", icon: ShieldCheck, permissions: ["Approve", "Reject", "Issue License"] },
];

const PreviewSidebar: React.FC = () => {
  const {
    role, setRole,
    unreadCount, markNotificationsRead,
    unreadMessagesCount, markMessagesRead,
    messagesDrawerOpen, setMessagesDrawerOpen,
    resetDemo,
  } = usePreview();
  const [notifOpen, setNotifOpen] = useState(false);

  const openNotifications = () => {
    setNotifOpen(true);
    markNotificationsRead();
  };

  const openMessages = () => {
    setMessagesDrawerOpen(true);
    markMessagesRead();
  };

  return (
    <div className="w-[280px] border-l bg-card flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Roles</h3>
        <div className="flex items-center gap-1">
          {role === "citizen" && (
            <button
              onClick={openMessages}
              className="relative p-1.5 rounded-md hover:bg-muted transition-colors"
              aria-label="Messages"
              title="SMS & Email"
            >
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadMessagesCount}
                </span>
              )}
            </button>
          )}
          <button
            onClick={openNotifications}
            className="relative p-1.5 rounded-md hover:bg-muted transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {ROLES.map((r) => {
          const Icon = r.icon;
          const isActive = role === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                isActive ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className="h-4 w-4 text-accent shrink-0" />
                <span className="font-semibold text-foreground text-sm">{r.label}</span>
                {isActive && <Badge className="ml-auto text-[9px] bg-accent text-accent-foreground">Active</Badge>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {r.permissions.map((a) => (
                  <Badge key={a} variant="outline" className="text-[10px] px-2 py-0.5 bg-accent/5 text-accent border-accent/20">
                    {a}
                  </Badge>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t space-y-2">
        <Button onClick={resetDemo} variant="outline" className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
          <RotateCcw className="h-4 w-4" /> Reset Demo
        </Button>
      </div>

      <NotificationsPanel open={notifOpen} onOpenChange={setNotifOpen} />
      <MessagesDrawer
        open={messagesDrawerOpen}
        onOpenChange={(o) => {
          setMessagesDrawerOpen(o);
          if (o) markMessagesRead();
        }}
      />
    </div>
  );
};

export default PreviewSidebar;
