import React, { useState, useCallback, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft, Plus, Bell, Check, Circle, Play,
  Square, X, GripVertical, Save, ChevronDown, ChevronRight, ChevronLeft,
  Info, Trash2, IndianRupee, UserCog,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type StateType = "start" | "in_progress" | "end";
type RoleId = "citizen" | "documentVerifier" | "fieldInspector" | "approver";

interface AttachedNotification {
  id: string;
  name: string;
  channel: "email" | "sms";
  enabled: boolean;
}

interface WorkflowState {
  id: string;
  name: string;
  description: string;
  type: StateType;
  x: number;
  y: number;
  paymentRequired: boolean;
  notifications: AttachedNotification[];
}

interface ChecklistItem {
  id: string;
  text: string;
}

interface WorkflowTransition {
  id: string;
  name: string;
  fromStateId: string;
  toStateId: string;
  roleId: RoleId;
  checklist: ChecklistItem[];
  conditionsEnabled: boolean;
}

type Selection =
  | { kind: "state"; id: string }
  | { kind: "transition"; id: string }
  | null;

const ROLE_OPTIONS: { id: RoleId; name: string }[] = [
  { id: "citizen", name: "Citizen" },
  { id: "documentVerifier", name: "Document Verifier" },
  { id: "fieldInspector", name: "Field Inspector" },
  { id: "approver", name: "Approver" },
];
const roleName = (id: RoleId) => ROLE_OPTIONS.find(r => r.id === id)?.name ?? id;

/* ------------------------------------------------------------------ */
/*  Seed Data                                                          */
/* ------------------------------------------------------------------ */

import {
  TRADE_WORKFLOW_STATES,
  TRADE_WORKFLOW_TRANSITIONS,
  TRADE_NOTIFICATIONS,
} from "@/data/tradeLicenseTemplate";
import {
  RENEWAL_WORKFLOW_STATES,
  RENEWAL_WORKFLOW_TRANSITIONS,
  RENEWAL_NOTIFICATIONS,
  RENEWAL_STATE_LAYOUT,
  isRenewalModule,
} from "@/data/renewalTemplate";
import { useModuleState } from "@/lib/moduleStorage";
import { useServiceConfigOptional } from "@/contexts/ServiceConfigContext";
import ScopeSelector from "@/components/service-config/ScopeSelector";
import {
  Select as CatSelect,
  SelectContent as CatSelectContent,
  SelectItem as CatSelectItem,
  SelectTrigger as CatSelectTrigger,
  SelectValue as CatSelectValue,
} from "@/components/ui/select";

const ISSUANCE_STATE_LAYOUT: Record<string, { x: number; y: number }> = {
  s1:   { x: 60,   y: 100 },
  s_dv: { x: 320,  y: 100 },
  s_ip: { x: 580,  y: 100 },
  s3:   { x: 840,  y: 100 },
  s4:   { x: 1100, y: 100 },
  s5:   { x: 1360, y: 100 },
  s6:   { x: 1620, y: 100 },
  s7:   { x: 580,  y: 320 },
  s8:   { x: 840,  y: 320 },
  s9:   { x: 1620, y: 320 },
};

const buildSeedStates = (moduleName: string): WorkflowState[] => {
  const renewal = isRenewalModule(moduleName);
  const states = renewal ? RENEWAL_WORKFLOW_STATES : TRADE_WORKFLOW_STATES;
  const notifs = renewal ? RENEWAL_NOTIFICATIONS : TRADE_NOTIFICATIONS;
  const layout = renewal ? RENEWAL_STATE_LAYOUT : ISSUANCE_STATE_LAYOUT;
  return states.map((s) => {
    const pos = layout[s.id] ?? { x: 60, y: 100 };
    const stateNotifs: AttachedNotification[] = notifs
      .filter((n) => n.workflowState === s.name)
      .flatMap((n) =>
        n.channels.map((ch) => ({
          id: `${n.id}-${ch}`,
          name: `${n.subject} (${ch.toUpperCase()})`,
          channel: ch,
          enabled: true,
        }))
      );
    return {
      id: s.id,
      name: s.name,
      description: s.description,
      type: s.type,
      x: pos.x,
      y: pos.y,
      paymentRequired: s.name === "Payment Pending",
      notifications: stateNotifs,
    };
  });
};

const buildSeedTransitions = (moduleName: string): WorkflowTransition[] => {
  const src = isRenewalModule(moduleName) ? RENEWAL_WORKFLOW_TRANSITIONS : TRADE_WORKFLOW_TRANSITIONS;
  return src.map((t) => ({
    id: t.id,
    name: t.name,
    fromStateId: t.fromStateId,
    toStateId: t.toStateId,
    roleId: (t.role as RoleId) ?? "approver",
    checklist: t.checklist.map((c) => ({ id: c.id, text: c.text })),
    conditionsEnabled: false,
  }));
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const stateTypeConfig: Record<StateType, { label: string; color: string; borderColor: string; icon: React.ElementType }> = {
  start: { label: "Start", color: "text-green-600", borderColor: "border-l-green-500", icon: Play },
  in_progress: { label: "In Progress", color: "text-blue-600", borderColor: "border-l-blue-500", icon: Circle },
  end: { label: "End", color: "text-muted-foreground", borderColor: "border-l-muted-foreground", icon: Square },
};

const uid = () => Math.random().toString(36).slice(2, 9);

const NODE_W = 220;
const NODE_H = 130;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface Props {
  moduleName: string;
  onBack: () => void;
}

const WorkflowDesigner: React.FC<Props> = ({ moduleName, onBack }) => {
  const { id: serviceId = "service" } = useParams();
  const cfg = useServiceConfigOptional();
  const scope = cfg?.workflowScope ?? "shared";
  const categories = cfg?.categories ?? [];
  const showCategoryPicker = scope === "by_category" && categories.length > 0;
  const [activeCategory, setActiveCategory] = useState<string>(() => categories[0] ?? "");
  useEffect(() => {
    if (showCategoryPicker && !categories.includes(activeCategory)) {
      setActiveCategory(categories[0] ?? "");
    }
  }, [showCategoryPicker, categories, activeCategory]);

  const storageSuffix = showCategoryPicker
    ? `${moduleName}::cat::${activeCategory || "__"}`
    : moduleName;

  const [states, setStates] = useModuleState<WorkflowState[]>(
    "workflow-states-v2", serviceId, storageSuffix, () => buildSeedStates(moduleName),
  );
  const [transitions, setTransitions] = useModuleState<WorkflowTransition[]>(
    "workflow-transitions-v2", serviceId, storageSuffix, () => buildSeedTransitions(moduleName),
  );
  const [view, setView] = useState<"visual" | "table">("visual");
  const [tableTab, setTableTab] = useState<"states" | "actions">("actions");
  const [selection, setSelection] = useState<Selection>(null);
  const [showAddState, setShowAddState] = useState(false);
  const [newStateName, setNewStateName] = useState("");
  const [newStateType, setNewStateType] = useState<StateType>("in_progress");
  const [showAddTransition, setShowAddTransition] = useState(false);
  const [newTransName, setNewTransName] = useState("");
  const [newTransFrom, setNewTransFrom] = useState("");
  const [newTransTo, setNewTransTo] = useState("");
  const [newTransRole, setNewTransRole] = useState<RoleId>("approver");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const inspectorKey = `workflow-inspector-collapsed:${serviceId}`;
  const [inspectorCollapsed, setInspectorCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(inspectorKey) === "1"; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem(inspectorKey, inspectorCollapsed ? "1" : "0"); } catch {}
  }, [inspectorCollapsed, inspectorKey]);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number; moved: boolean } | null>(null);

  /* ---- Drag logic ---- */
  const handleMouseDown = useCallback((e: React.MouseEvent, stateId: string, sx: number, sy: number) => {
    e.stopPropagation();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = { id: stateId, offsetX: e.clientX - rect.left - sx, offsetY: e.clientY - rect.top - sy, moved: false };
    setSelection({ kind: "state", id: stateId });
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const nx = Math.max(0, e.clientX - rect.left - dragRef.current.offsetX);
      const ny = Math.max(0, e.clientY - rect.top - dragRef.current.offsetY);
      dragRef.current.moved = true;
      setStates(prev => prev.map(s => s.id === dragRef.current!.id ? { ...s, x: nx, y: ny } : s));
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [setStates]);

  /* ---- State CRUD ---- */
  const addState = () => {
    if (!newStateName.trim()) return;
    if (newStateType === "start" && states.some(s => s.type === "start")) {
      toast({ title: "Only one Start state allowed", variant: "destructive" });
      return;
    }
    const maxX = Math.max(...states.map(s => s.x), 0);
    setStates(prev => [...prev, {
      id: uid(), name: newStateName.trim(), description: "", type: newStateType,
      x: maxX + 280, y: 180, paymentRequired: false, notifications: [],
    }]);
    setNewStateName("");
    setNewStateType("in_progress");
    setShowAddState(false);
  };

  const updateState = (id: string, updates: Partial<WorkflowState>) => {
    setStates(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteState = (id: string) => {
    const target = states.find(s => s.id === id);
    if (!target) return;
    if (target.type === "start" && states.filter(s => s.type === "start").length === 1) {
      toast({ title: "Cannot delete the only Start state", variant: "destructive" });
      return;
    }
    if (transitions.some(t => t.fromStateId === id || t.toStateId === id)) {
      toast({ title: "Remove or re-point its transitions first", variant: "destructive" });
      return;
    }
    setStates(prev => prev.filter(s => s.id !== id));
    setSelection(null);
  };

  /* ---- Transition CRUD ---- */
  const addTransition = () => {
    if (!newTransName.trim() || !newTransFrom || !newTransTo) return;
    setTransitions(prev => [...prev, {
      id: uid(), name: newTransName.trim(), fromStateId: newTransFrom, toStateId: newTransTo,
      roleId: newTransRole, checklist: [], conditionsEnabled: false,
    }]);
    setNewTransName(""); setNewTransFrom(""); setNewTransTo(""); setNewTransRole("approver");
    setShowAddTransition(false);
  };

  const updateTransition = (id: string, updates: Partial<WorkflowTransition>) => {
    setTransitions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTransition = (id: string) => {
    setTransitions(prev => prev.filter(t => t.id !== id));
    setSelection(null);
  };

  const addChecklistItem = (transId: string) => {
    setTransitions(prev => prev.map(t =>
      t.id === transId ? { ...t, checklist: [...t.checklist, { id: uid(), text: "" }] } : t
    ));
  };

  const updateChecklistItem = (transId: string, itemId: string, text: string) => {
    setTransitions(prev => prev.map(t =>
      t.id === transId ? { ...t, checklist: t.checklist.map(c => c.id === itemId ? { ...c, text } : c) } : t
    ));
  };

  const removeChecklistItem = (transId: string, itemId: string) => {
    setTransitions(prev => prev.map(t =>
      t.id === transId ? { ...t, checklist: t.checklist.filter(c => c.id !== itemId) } : t
    ));
  };

  const toggleNotification = (stateId: string, notifId: string) => {
    setStates(prev => prev.map(s =>
      s.id === stateId ? {
        ...s, notifications: s.notifications.map(n => n.id === notifId ? { ...n, enabled: !n.enabled } : n),
      } : s
    ));
  };

  /* ---- Selected objects ---- */
  const selectedState = selection?.kind === "state" ? states.find(s => s.id === selection.id) : null;
  const selectedTransition = selection?.kind === "transition" ? transitions.find(t => t.id === selection.id) : null;

  /* ---- Arrow computation ---- */
  const computeArrow = (from: WorkflowState, to: WorkflowState) => {
    const x1 = from.x + NODE_W;
    const y1 = from.y + NODE_H / 2;
    const x2 = to.x;
    const y2 = to.y + NODE_H / 2;
    const mx = (x1 + x2) / 2;
    return { x1, y1, x2, y2, mx, my: (y1 + y2) / 2, path: `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}` };
  };

  /* ---- Empty state ---- */
  if (states.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header moduleName={moduleName} onBack={onBack} view={view} setView={setView} />
        <ScopeBar
          cfg={cfg}
          scope={scope}
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Play className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Start by adding your first state</h2>
            <p className="text-sm text-muted-foreground mb-6">Define the steps in your process flow.</p>
            <Button onClick={() => setShowAddState(true)} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="h-4 w-4" /> Add First State
            </Button>
          </div>
        </div>
        <AddStateDialog open={showAddState} onOpenChange={setShowAddState} name={newStateName} setName={setNewStateName} type={newStateType} setType={setNewStateType} onAdd={addState} states={states} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header moduleName={moduleName} onBack={onBack} view={view} setView={setView}
        onSave={() => toast({ title: "Workflow saved" })}
        extra={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowAddState(true)} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add State
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowAddTransition(true)} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add Action
            </Button>
          </div>
        }
      />
      <ScopeBar
        cfg={cfg}
        scope={scope}
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Main area */}
        <div className="flex-1 overflow-auto">
          {view === "visual" ? (
            /* ============ VISUAL CANVAS ============ */
            <div
              ref={canvasRef}
              className="relative min-h-[600px] min-w-[1200px]"
              style={{
                backgroundImage: "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
              onClick={() => setSelection(null)}
            >
              {/* SVG arrows */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--accent))" />
                  </marker>
                </defs>
                {transitions.map(t => {
                  const from = states.find(s => s.id === t.fromStateId);
                  const to = states.find(s => s.id === t.toStateId);
                  if (!from || !to) return null;
                  const a = computeArrow(from, to);
                  const isSelected = selection?.kind === "transition" && selection.id === t.id;
                  return (
                    <g key={t.id}>
                      <path d={a.path} fill="none"
                        stroke={isSelected ? "hsl(var(--accent))" : "hsl(var(--border))"}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                        markerEnd="url(#arrowhead)"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Transition labels */}
              {transitions.map(t => {
                const from = states.find(s => s.id === t.fromStateId);
                const to = states.find(s => s.id === t.toStateId);
                if (!from || !to) return null;
                const a = computeArrow(from, to);
                const isSelected = selection?.kind === "transition" && selection.id === t.id;
                return (
                  <button
                    key={`label-${t.id}`}
                    className={`absolute z-10 text-xs font-medium px-2 py-0.5 rounded-full border cursor-pointer transition-colors flex items-center gap-1.5
                      ${isSelected
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-card text-foreground border-border hover:border-accent"}`}
                    style={{ left: a.mx - 50, top: a.my - 12 }}
                    onClick={(e) => { e.stopPropagation(); setSelection({ kind: "transition", id: t.id }); }}
                  >
                    {t.name}
                    <span className={`text-[9px] px-1.5 rounded-full border ${isSelected ? "border-accent-foreground/30" : "border-border bg-muted/40 text-muted-foreground"}`}>
                      {roleName(t.roleId)}
                    </span>
                  </button>
                );
              })}

              {/* State nodes */}
              {states.map(s => {
                const cfg = stateTypeConfig[s.type];
                const isSelected = selection?.kind === "state" && selection.id === s.id;
                return (
                  <div
                    key={s.id}
                    className={`absolute z-20 rounded-lg border-l-4 bg-card border shadow-sm cursor-grab select-none transition-shadow
                      ${cfg.borderColor}
                      ${isSelected ? "ring-2 ring-accent shadow-md" : "hover:shadow-md"}`}
                    style={{ left: s.x, top: s.y, width: NODE_W }}
                    onMouseDown={(e) => handleMouseDown(e, s.id, s.x, s.y)}
                    onClick={(e) => { e.stopPropagation(); setSelection({ kind: "state", id: s.id }); }}
                  >
                    <div className="p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] uppercase font-semibold tracking-wider ${cfg.color}`}>{cfg.label}</span>
                        <div className="flex gap-1">
                          {s.paymentRequired && <IndianRupee className="h-3 w-3 text-amber-600" />}
                          {s.notifications.some(n => n.enabled) && <Bell className="h-3 w-3 text-muted-foreground" />}
                        </div>
                      </div>
                      <h4 className="font-semibold text-sm text-foreground leading-tight">{s.name}</h4>
                      {s.description && (
                        <p className="text-[11px] text-muted-foreground leading-snug">{s.description}</p>
                      )}
                    </div>
                    {transitions.filter(t => t.fromStateId === s.id).length > 0 && (
                      <div className="border-t px-3 py-1.5 flex gap-1 flex-wrap">
                        {transitions.filter(t => t.fromStateId === s.id).map(t => (
                          <span key={t.id} className="text-[10px] text-accent font-medium">→ {t.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* ============ TABLE VIEW ============ */
            <div className="p-6 space-y-4">
              <div className="flex rounded-md border overflow-hidden w-fit">
                <button onClick={() => setTableTab("states")}
                  className={`text-xs font-medium px-3 py-1.5 transition-colors ${tableTab === "states" ? "bg-accent text-accent-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}>
                  States ({states.length})
                </button>
                <button onClick={() => setTableTab("actions")}
                  className={`text-xs font-medium px-3 py-1.5 transition-colors ${tableTab === "actions" ? "bg-accent text-accent-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}>
                  Actions ({transitions.length})
                </button>
              </div>

              {tableTab === "states" ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Notifications</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {states.map(s => (
                      <TableRow key={s.id}
                        className={`cursor-pointer ${selection?.kind === "state" && selection.id === s.id ? "bg-accent/5" : ""}`}
                        onClick={() => { setSelection({ kind: "state", id: s.id }); setInspectorCollapsed(false); }}
                      >
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs capitalize">{stateTypeConfig[s.type].label}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">{s.description || "—"}</TableCell>
                        <TableCell>{s.paymentRequired ? <IndianRupee className="h-3.5 w-3.5 text-amber-600" /> : <span className="text-muted-foreground text-xs">—</span>}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{s.notifications.filter(n => n.enabled).length}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Checklist</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transitions.map(t => {
                      const from = states.find(s => s.id === t.fromStateId);
                      const to = states.find(s => s.id === t.toStateId);
                      const isExpanded = expandedRows.has(t.id);
                      return (
                        <React.Fragment key={t.id}>
                          <TableRow
                            className={`cursor-pointer ${selection?.kind === "transition" && selection.id === t.id ? "bg-accent/5" : ""}`}
                            onClick={() => { setSelection({ kind: "transition", id: t.id }); setInspectorCollapsed(false); }}
                          >
                            <TableCell>
                              <button onClick={(e) => {
                                e.stopPropagation();
                                setExpandedRows(prev => {
                                  const n = new Set(prev);
                                  n.has(t.id) ? n.delete(t.id) : n.add(t.id);
                                  return n;
                                });
                              }}>
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </button>
                            </TableCell>
                            <TableCell>{from?.name || "—"}</TableCell>
                            <TableCell>{to?.name || "—"}</TableCell>
                            <TableCell><Badge variant="secondary" className="text-xs">{t.name}</Badge></TableCell>
                            <TableCell>
                              <span className="inline-flex items-center gap-1 text-xs text-foreground">
                                <UserCog className="h-3 w-3 text-muted-foreground" />
                                {roleName(t.roleId)}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">{t.checklist.length} items</TableCell>
                          </TableRow>
                          {isExpanded && t.checklist.length > 0 && (
                            <TableRow>
                              <TableCell />
                              <TableCell colSpan={5}>
                                <div className="pl-4 py-2 space-y-1">
                                  {t.checklist.map(c => (
                                    <div key={c.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Check className="h-3 w-3" /> {c.text}
                                    </div>
                                  ))}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </div>

        {/* ============ RIGHT INSPECTOR (collapsible) ============ */}
        <div className={`border-l bg-card overflow-hidden shrink-0 transition-[width] duration-200 flex ${inspectorCollapsed ? "w-10" : "w-[340px]"}`}>
          {/* Collapse rail */}
          <button
            onClick={() => setInspectorCollapsed(v => !v)}
            className="w-10 shrink-0 border-r flex items-start justify-center pt-3 hover:bg-muted/50 transition-colors"
            aria-label={inspectorCollapsed ? "Expand inspector" : "Collapse inspector"}
            title={inspectorCollapsed ? "Expand inspector" : "Collapse inspector"}
          >
            {inspectorCollapsed ? <ChevronLeft className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </button>

          {!inspectorCollapsed && (
            <div className="flex-1 overflow-y-auto">
              {!selection && (
                <div className="p-6 text-center text-sm text-muted-foreground mt-20">
                  <Info className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
                  <p>Select a state or action to view its properties.</p>
                </div>
              )}

              {/* ---- State Inspector ---- */}
              {selectedState && (
                <div className="p-4 space-y-5">
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">State Properties</h3>
                    <p className="text-xs text-muted-foreground">Lifecycle status configuration</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">State Name</Label>
                    <Input value={selectedState.name} onChange={e => updateState(selectedState.id, { name: e.target.value })} className="h-9 text-sm" />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">State Type</Label>
                    <Select value={selectedState.type} onValueChange={(v: StateType) => {
                      if (v === "start" && states.some(s => s.type === "start" && s.id !== selectedState.id)) {
                        toast({ title: "Only one Start state allowed", variant: "destructive" });
                        return;
                      }
                      updateState(selectedState.id, { type: v });
                    }}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="start">Start</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="end">End</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</Label>
                    <Input value={selectedState.description} onChange={e => updateState(selectedState.id, { description: e.target.value })} className="h-9 text-sm" placeholder="Short description" />
                  </div>

                  {/* Payment toggle */}
                  <div className="rounded-md border p-3 flex items-start justify-between gap-3">
                    <div>
                      <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                        <IndianRupee className="h-3.5 w-3.5 text-amber-600" />
                        Payment collected here
                      </Label>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Citizen is prompted to pay when the application reaches this state.
                      </p>
                    </div>
                    <Switch
                      checked={selectedState.paymentRequired}
                      onCheckedChange={v => updateState(selectedState.id, { paymentRequired: v })}
                    />
                  </div>

                  {/* Notifications */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notifications on entry</Label>
                    {selectedState.notifications.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No notifications configured. Add them in the Notifications screen.</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedState.notifications.map(n => (
                          <div key={n.id} className="flex items-center justify-between gap-2">
                            <span className="text-xs text-foreground truncate">{n.name}</span>
                            <Switch checked={n.enabled} onCheckedChange={() => toggleNotification(selectedState.id, n.id)} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-3">
                    <Button variant="outline" size="sm" className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => deleteState(selectedState.id)}>
                      <Trash2 className="h-3.5 w-3.5" /> Delete State
                    </Button>
                  </div>
                </div>
              )}

              {/* ---- Transition Inspector ---- */}
              {selectedTransition && (() => {
                const from = states.find(s => s.id === selectedTransition.fromStateId);
                const to = states.find(s => s.id === selectedTransition.toStateId);
                return (
                  <div className="p-4 space-y-5">
                    <div>
                      <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                        {selectedTransition.name}
                        <Badge variant="secondary" className="text-[10px]">Action</Badge>
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        From <span className="font-medium text-foreground">{from?.name ?? "—"}</span> → <span className="font-medium text-foreground">{to?.name ?? "—"}</span>
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action Name</Label>
                      <Input value={selectedTransition.name} onChange={e => updateTransition(selectedTransition.id, { name: e.target.value })} className="h-9 text-sm" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">From</Label>
                        <Select value={selectedTransition.fromStateId} onValueChange={v => updateTransition(selectedTransition.id, { fromStateId: v })}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {states.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To</Label>
                        <Select value={selectedTransition.toStateId} onValueChange={v => updateTransition(selectedTransition.id, { toStateId: v })}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {states.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Role */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Performed by (Role)</Label>
                      <Select value={selectedTransition.roleId} onValueChange={(v: RoleId) => updateTransition(selectedTransition.id, { roleId: v })}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Checklist */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Checklist</Label>
                        <Button variant="ghost" size="sm" className="h-6 text-[11px] text-accent" onClick={() => addChecklistItem(selectedTransition.id)}>
                          + Add Item
                        </Button>
                      </div>
                      {selectedTransition.checklist.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">No checklist items</p>
                      ) : (
                        <div className="space-y-1.5">
                          {selectedTransition.checklist.map(c => (
                            <div key={c.id} className="flex items-center gap-2">
                              <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <Input value={c.text} onChange={e => updateChecklistItem(selectedTransition.id, c.id, e.target.value)} className="h-8 text-xs flex-1" placeholder="Checklist item" />
                              <button onClick={() => removeChecklistItem(selectedTransition.id, c.id)}>
                                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Conditions toggle */}
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium text-foreground">Add Conditions</Label>
                        <Switch checked={selectedTransition.conditionsEnabled}
                          onCheckedChange={v => updateTransition(selectedTransition.id, { conditionsEnabled: v })} />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        When enabled, this action will only be available if specific metadata criteria are met.
                      </p>
                    </div>

                    <div className="border-t pt-3">
                      <Button variant="outline" size="sm" className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => deleteTransition(selectedTransition.id)}>
                        <Trash2 className="h-3.5 w-3.5" /> Delete Action
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <AddStateDialog open={showAddState} onOpenChange={setShowAddState} name={newStateName} setName={setNewStateName} type={newStateType} setType={setNewStateType} onAdd={addState} states={states} />

      <Dialog open={showAddTransition} onOpenChange={setShowAddTransition}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Action</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Action Name</Label>
              <Input value={newTransName} onChange={e => setNewTransName(e.target.value)} placeholder='e.g. "Approve"' className="h-9 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">From State</Label>
                <Select value={newTransFrom} onValueChange={setNewTransFrom}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{states.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">To State</Label>
                <Select value={newTransTo} onValueChange={setNewTransTo}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{states.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Performed by (Role)</Label>
              <Select value={newTransRole} onValueChange={(v: RoleId) => setNewTransRole(v)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTransition(false)}>Cancel</Button>
            <Button onClick={addTransition} className="bg-accent text-accent-foreground hover:bg-accent/90">Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

const Header: React.FC<{
  moduleName: string;
  onBack: () => void;
  view: "visual" | "table";
  setView: (v: "visual" | "table") => void;
  onSave?: () => void;
  extra?: React.ReactNode;
}> = ({ moduleName, onBack, view, setView, onSave, extra }) => (
  <header className="border-b bg-card shrink-0">
    <div className="px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="font-bold text-foreground text-sm">{moduleName} — Workflow</h1>
          <p className="text-xs text-muted-foreground">Capture every state and action in your process</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {extra}
        <div className="flex rounded-md border overflow-hidden">
          <button onClick={() => setView("visual")}
            className={`text-xs font-medium px-3 py-1.5 transition-colors ${view === "visual" ? "bg-accent text-accent-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}>
            Visual
          </button>
          <button onClick={() => setView("table")}
            className={`text-xs font-medium px-3 py-1.5 transition-colors ${view === "table" ? "bg-accent text-accent-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}>
            Table
          </button>
        </div>
        {onSave && (
          <Button size="sm" variant="outline" onClick={onSave} className="gap-1.5">
            <Save className="h-3.5 w-3.5" /> Save
          </Button>
        )}
      </div>
    </div>
  </header>
);

const ScopeBar: React.FC<{
  cfg: ReturnType<typeof useServiceConfigOptional>;
  scope: "shared" | "by_category" | "by_subcategory";
  categories: string[];
  activeCategory: string;
  setActiveCategory: (c: string) => void;
}> = ({ cfg, scope, categories, activeCategory, setActiveCategory }) => {
  if (!cfg || !cfg.hasCategories) return null;
  return (
    <div className="border-b bg-muted/20 px-4 py-2 flex items-center gap-3 flex-wrap">
      <span className="text-xs font-medium text-muted-foreground">Apply to:</span>
      <ScopeSelector
        size="sm"
        value={scope}
        onChange={(s) => cfg.setWorkflowScope(s)}
        available={{ by_category: cfg.hasCategories, by_subcategory: false }}
      />
      {scope === "by_category" && categories.length > 0 && (
        <>
          <span className="text-xs text-muted-foreground ml-2">Editing:</span>
          <CatSelect value={activeCategory} onValueChange={setActiveCategory}>
            <CatSelectTrigger className="h-8 w-48 text-xs">
              <CatSelectValue placeholder="Pick a category" />
            </CatSelectTrigger>
            <CatSelectContent>
              {categories.map((c) => (
                <CatSelectItem key={c} value={c}>{c}</CatSelectItem>
              ))}
            </CatSelectContent>
          </CatSelect>
          <span className="text-[11px] text-muted-foreground italic ml-1">
            Changes apply only to this category's workflow.
          </span>
        </>
      )}
    </div>
  );
};

const AddStateDialog: React.FC<{
  open: boolean;
  onOpenChange: (v: boolean) => void;
  name: string;
  setName: (v: string) => void;
  type: StateType;
  setType: (v: StateType) => void;
  onAdd: () => void;
  states: WorkflowState[];
}> = ({ open, onOpenChange, name, setName, type, setType, onAdd, states }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader><DialogTitle>Add State</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">State Name</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder='e.g. "Technical Review"' className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">State Type</Label>
          <Select value={type} onValueChange={(v: StateType) => setType(v)}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="start" disabled={states.some(s => s.type === "start")}>Start</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="end">End</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button onClick={onAdd} className="bg-accent text-accent-foreground hover:bg-accent/90">Add State</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default WorkflowDesigner;
