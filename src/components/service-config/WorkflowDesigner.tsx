import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  ArrowLeft, Plus, FileText, Bell, Check, Circle, Play,
  Square, X, GripVertical, Save, Rocket, ChevronDown, ChevronRight,
  Info,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type StateType = "start" | "in_progress" | "end";

interface AttachedForm {
  id: string;
  name: string;
}

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
  forms: AttachedForm[];
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
  checklist: ChecklistItem[];
  conditionsEnabled: boolean;
}

type Selection =
  | { kind: "state"; id: string }
  | { kind: "transition"; id: string }
  | null;

/* ------------------------------------------------------------------ */
/*  Seed Data                                                          */
/* ------------------------------------------------------------------ */

import {
  TRADE_WORKFLOW_STATES,
  TRADE_WORKFLOW_TRANSITIONS,
  TRADE_NOTIFICATIONS,
} from "@/data/tradeLicenseTemplate";

// Auto-layout: lay states out in 2 rows, left-to-right.
const STATE_LAYOUT: Record<string, { x: number; y: number }> = {
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

const seedStates: WorkflowState[] = TRADE_WORKFLOW_STATES.map((s) => {
  const pos = STATE_LAYOUT[s.id] ?? { x: 60, y: 100 };
  // Attach notifications matching this state
  const stateNotifs: AttachedNotification[] = TRADE_NOTIFICATIONS
    .filter((n) => n.workflowState === s.name)
    .flatMap((n) =>
      n.channels.map((ch) => ({
        id: `${n.id}-${ch}`,
        name: `${n.subject} (${ch.toUpperCase()})`,
        channel: ch,
        enabled: true,
      }))
    );
  // Attach Application Form to "Submitted"
  const stateForms: AttachedForm[] = s.id === "s1"
    ? [{ id: "f-app", name: "Trade_License_Application.pdf" }]
    : [];
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    type: s.type,
    x: pos.x,
    y: pos.y,
    forms: stateForms,
    notifications: stateNotifs,
  };
});

const seedTransitions: WorkflowTransition[] = TRADE_WORKFLOW_TRANSITIONS.map((t) => ({
  id: t.id,
  name: t.name,
  fromStateId: t.fromStateId,
  toStateId: t.toStateId,
  checklist: t.checklist.map((c) => ({ id: c.id, text: c.text })),
  conditionsEnabled: false,
}));

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
  const [states, setStates] = useState<WorkflowState[]>(seedStates);
  const [transitions, setTransitions] = useState<WorkflowTransition[]>(seedTransitions);
  const [view, setView] = useState<"visual" | "table">("visual");
  const [selection, setSelection] = useState<Selection>(null);
  const [showAddState, setShowAddState] = useState(false);
  const [newStateName, setNewStateName] = useState("");
  const [newStateType, setNewStateType] = useState<StateType>("in_progress");
  const [showAddTransition, setShowAddTransition] = useState(false);
  const [newTransName, setNewTransName] = useState("");
  const [newTransFrom, setNewTransFrom] = useState("");
  const [newTransTo, setNewTransTo] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFormName, setNewFormName] = useState("");

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  /* ---- Drag logic ---- */
  const handleMouseDown = useCallback((e: React.MouseEvent, stateId: string, sx: number, sy: number) => {
    e.stopPropagation();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = { id: stateId, offsetX: e.clientX - rect.left - sx, offsetY: e.clientY - rect.top - sy };
    setSelection({ kind: "state", id: stateId });
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const nx = Math.max(0, e.clientX - rect.left - dragRef.current.offsetX);
      const ny = Math.max(0, e.clientY - rect.top - dragRef.current.offsetY);
      setStates(prev => prev.map(s => s.id === dragRef.current!.id ? { ...s, x: nx, y: ny } : s));
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

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
      x: maxX + 280, y: 180, forms: [], notifications: [],
    }]);
    setNewStateName("");
    setNewStateType("in_progress");
    setShowAddState(false);
  };

  const updateState = (id: string, updates: Partial<WorkflowState>) => {
    setStates(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  /* ---- Transition CRUD ---- */
  const addTransition = () => {
    if (!newTransName.trim() || !newTransFrom || !newTransTo) return;
    setTransitions(prev => [...prev, {
      id: uid(), name: newTransName.trim(), fromStateId: newTransFrom, toStateId: newTransTo,
      checklist: [], conditionsEnabled: false,
    }]);
    setNewTransName(""); setNewTransFrom(""); setNewTransTo("");
    setShowAddTransition(false);
  };

  const updateTransition = (id: string, updates: Partial<WorkflowTransition>) => {
    setTransitions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
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

  /* ---- Form helpers ---- */
  const addFormToState = (stateId: string) => {
    if (!newFormName.trim()) return;
    setStates(prev => prev.map(s =>
      s.id === stateId ? { ...s, forms: [...s.forms, { id: uid(), name: newFormName.trim() }] } : s
    ));
    setNewFormName("");
    setShowAddForm(false);
  };

  const removeFormFromState = (stateId: string, formId: string) => {
    setStates(prev => prev.map(s =>
      s.id === stateId ? { ...s, forms: s.forms.filter(f => f.id !== formId) } : s
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
              <Plus className="h-3.5 w-3.5" /> Add Transition
            </Button>
          </div>
        }
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

              {/* Transition labels (HTML for click) */}
              {transitions.map(t => {
                const from = states.find(s => s.id === t.fromStateId);
                const to = states.find(s => s.id === t.toStateId);
                if (!from || !to) return null;
                const a = computeArrow(from, to);
                const isSelected = selection?.kind === "transition" && selection.id === t.id;
                return (
                  <button
                    key={`label-${t.id}`}
                    className={`absolute z-10 text-xs font-medium px-2 py-0.5 rounded-full border cursor-pointer transition-colors
                      ${isSelected
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-card text-foreground border-border hover:border-accent"}`}
                    style={{ left: a.mx - 30, top: a.my - 12 }}
                    onClick={(e) => { e.stopPropagation(); setSelection({ kind: "transition", id: t.id }); }}
                  >
                    {t.name}
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
                          {s.forms.length > 0 && <FileText className="h-3 w-3 text-muted-foreground" />}
                          {s.notifications.some(n => n.enabled) && <Bell className="h-3 w-3 text-muted-foreground" />}
                        </div>
                      </div>
                      <h4 className="font-semibold text-sm text-foreground leading-tight">{s.name}</h4>
                      {s.description && (
                        <p className="text-[11px] text-muted-foreground leading-snug">{s.description}</p>
                      )}
                    </div>
                    {/* Action labels at bottom */}
                    {transitions.filter(t => t.fromStateId === s.id).length > 0 && (
                      <div className="border-t px-3 py-1.5 flex gap-1 flex-wrap">
                        {transitions.filter(t => t.fromStateId === s.id).map(t => (
                          <span key={t.id} className="text-[10px] text-accent font-medium">ACTION: {t.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* ============ TABLE VIEW ============ */
            <div className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>From State</TableHead>
                    <TableHead>To State</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Checklist Items</TableHead>
                    <TableHead>Forms</TableHead>
                    <TableHead>Notifications</TableHead>
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
                          onClick={() => setSelection({ kind: "transition", id: t.id })}
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
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${from?.type === "start" ? "bg-green-500" : from?.type === "end" ? "bg-muted-foreground" : "bg-blue-500"}`} />
                              {from?.name || "—"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${to?.type === "start" ? "bg-green-500" : to?.type === "end" ? "bg-muted-foreground" : "bg-blue-500"}`} />
                              {to?.name || "—"}
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="secondary" className="text-xs">{t.name}</Badge></TableCell>
                          <TableCell className="text-muted-foreground text-xs">{t.checklist.length} items</TableCell>
                          <TableCell className="text-muted-foreground text-xs">{from?.forms.length || 0}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">{from?.notifications.filter(n => n.enabled).length || 0}</TableCell>
                        </TableRow>
                        {isExpanded && t.checklist.length > 0 && (
                          <TableRow>
                            <TableCell />
                            <TableCell colSpan={6}>
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
            </div>
          )}
        </div>

        {/* ============ RIGHT PANEL ============ */}
        <div className="w-[320px] border-l bg-card overflow-y-auto shrink-0">
          {!selection && (
            <div className="p-6 text-center text-sm text-muted-foreground mt-20">
              <Info className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
              <p>Select a state or transition to view its properties.</p>
            </div>
          )}

          {/* ---- State Inspector ---- */}
          {selectedState && (
            <div className="p-4 space-y-5">
              <div>
                <h3 className="font-semibold text-foreground text-sm">Workflow Inspector</h3>
                <p className="text-xs text-muted-foreground">Configure State Properties</p>
              </div>

              {/* Tabs */}
              <div className="flex border-b">
                {["Inspector", "Logic", "Variables"].map((tab, i) => (
                  <button key={tab}
                    className={`text-xs font-medium px-3 py-2 border-b-2 transition-colors
                      ${i === 0 ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {/* State Name */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">State Name</Label>
                  <Input value={selectedState.name} onChange={e => updateState(selectedState.id, { name: e.target.value })} className="h-9 text-sm" />
                </div>

                {/* State Type */}
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

                {/* Description */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</Label>
                  <Input value={selectedState.description} onChange={e => updateState(selectedState.id, { description: e.target.value })} className="h-9 text-sm" placeholder="Short description" />
                </div>

                {/* Forms */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Forms</Label>
                    <Button variant="ghost" size="sm" className="h-6 text-[11px] text-accent" onClick={() => setShowAddForm(true)}>
                      + Add Form
                    </Button>
                  </div>
                  {selectedState.forms.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No forms attached</p>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedState.forms.map(f => (
                        <div key={f.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-accent" />
                            <span className="text-xs font-medium text-foreground">{f.name}</span>
                          </div>
                          <button onClick={() => removeFormFromState(selectedState.id, f.id)}>
                            <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notifications */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notifications</Label>
                  {selectedState.notifications.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No notifications configured</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedState.notifications.map(n => (
                        <div key={n.id} className="flex items-center justify-between">
                          <span className="text-xs text-foreground">{n.name}</span>
                          <Switch checked={n.enabled} onCheckedChange={() => toggleNotification(selectedState.id, n.id)} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
                    <Badge variant="secondary" className="text-[10px]">Transition</Badge>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Configure logic and requirements for movement from <span className="font-medium text-foreground">{from?.name}</span> to <span className="font-medium text-foreground">{to?.name}</span>.
                  </p>
                </div>

                {/* Tabs */}
                <div className="flex border-b">
                  {["Inspector", "Logic", "Variables"].map((tab, i) => (
                    <button key={tab}
                      className={`text-xs font-medium px-3 py-2 border-b-2 transition-colors
                        ${i === 0 ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                    >
                      {tab.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Transition name */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Transition Name</Label>
                  <Input value={selectedTransition.name} onChange={e => updateTransition(selectedTransition.id, { name: e.target.value })} className="h-9 text-sm" />
                </div>

                {/* Checklist */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Checklist Builder</Label>
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
                    When enabled, this transition will only be available if specific metadata criteria are met.
                  </p>
                </div>

                {/* Add transition */}
                <Button variant="outline" className="w-full gap-2" onClick={() => setShowAddTransition(true)}>
                  <Plus className="h-4 w-4" /> Add Transition
                </Button>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Dialogs */}
      <AddStateDialog open={showAddState} onOpenChange={setShowAddState} name={newStateName} setName={setNewStateName} type={newStateType} setType={setNewStateType} onAdd={addState} states={states} />

      <Dialog open={showAddTransition} onOpenChange={setShowAddTransition}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Transition</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Transition Name</Label>
              <Input value={newTransName} onChange={e => setNewTransName(e.target.value)} placeholder='e.g. "Approve"' className="h-9 text-sm" />
            </div>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTransition(false)}>Cancel</Button>
            <Button onClick={addTransition} className="bg-accent text-accent-foreground hover:bg-accent/90">Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add form dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Attach Form</DialogTitle></DialogHeader>
          <div className="space-y-1.5">
            <Label className="text-xs">Form Name</Label>
            <Input value={newFormName} onChange={e => setNewFormName(e.target.value)} placeholder="e.g. Inspection_Form.pdf" className="h-9 text-sm" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button onClick={() => selectedState && addFormToState(selectedState.id)} className="bg-accent text-accent-foreground hover:bg-accent/90">Attach</Button>
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
          <p className="text-xs text-muted-foreground">Define process flow</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {extra}
        {/* View toggle */}
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
