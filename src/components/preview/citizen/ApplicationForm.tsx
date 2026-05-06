import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  usePreview,
  type PreviewDocument,
  type FormFieldConfig,
  type FormSectionConfig,
  ID_VALIDATION,
} from "../PreviewContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { ArrowRight, ArrowLeft, Check, FileUp, X, FolderOpen, Repeat, FileText, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

// ─── Helpers ─────────────────────────────────────
const todayISO = () => new Date().toISOString().slice(0, 10);

const isFieldVisible = (field: FormFieldConfig, formData: Record<string, string>) => {
  if (!field.showIf) return true;
  return formData[field.showIf.field] === field.showIf.equals;
};

const getDropdownOptions = (field: FormFieldConfig, formData: Record<string, string>): string[] => {
  if (field.dependsOn && field.dependsValueMap) {
    const parentVal = formData[field.dependsOn];
    return parentVal ? (field.dependsValueMap[parentVal] || []) : [];
  }
  return field.options || [];
};

const validateSection = (
  section: FormSectionConfig,
  formData: Record<string, string>,
  docs: PreviewDocument[],
): Record<string, string> => {
  const errors: Record<string, string> = {};
  for (const field of section.fields) {
    if (!isFieldVisible(field, formData)) continue;

    // Documents: handled by docs list
    if (field.type === "file") {
      if (field.required && docs.filter(d => d.type === field.label).length === 0) {
        errors[field.id] = `${field.label} is required`;
      }
      continue;
    }

    // Checkbox
    if (field.type === "checkbox") {
      if (field.required && formData[field.id] !== "true") {
        errors[field.id] = "You must confirm to proceed";
      }
      continue;
    }

    const raw = (formData[field.id] || "").trim();

    if (field.required && !raw) {
      errors[field.id] = `${field.label} is required`;
      continue;
    }
    if (!raw) continue; // optional & empty -> skip

    const v = field.validation;
    if (v) {
      if (v.minLength && raw.length < v.minLength) {
        errors[field.id] = `Must be at least ${v.minLength} characters`;
        continue;
      }
      if (v.maxLength && raw.length > v.maxLength) {
        errors[field.id] = `Must be at most ${v.maxLength} characters`;
        continue;
      }
      if (v.pattern) {
        const re = new RegExp(v.pattern);
        if (!re.test(raw)) {
          errors[field.id] = v.patternMessage || "Invalid format";
          continue;
        }
      }
      if (field.type === "number" || field.type === "tel") {
        const n = Number(raw);
        if (!Number.isNaN(n)) {
          if (v.min !== undefined && n < v.min) { errors[field.id] = `Minimum ${v.min}`; continue; }
          if (v.max !== undefined && n > v.max) { errors[field.id] = `Maximum ${v.max}`; continue; }
        }
      }
      if (field.type === "date" && v.pastDateOnly) {
        if (raw >= todayISO()) {
          errors[field.id] = "Must be a date in the past";
          continue;
        }
      }
    }

    // Conditional ID Number validation
    if (field.id === "idNumber") {
      const idType = formData["idType"];
      const rule = idType ? ID_VALIDATION[idType] : undefined;
      if (rule && !rule.pattern.test(raw)) {
        errors[field.id] = rule.message;
      }
    }
  }
  return errors;
};

// ─── Component ──────────────────────────────────
const ApplicationForm: React.FC = () => {
  const {
    formSections, serviceName, submitApplication, submitRenewal,
    setScreen, screen, applications, userDocuments,
  } = usePreview();

  const isRenewal = screen.type === "renew";
  const parentApp = isRenewal && screen.parentLicenseId
    ? applications.find((a) => a.id === screen.parentLicenseId)
    : undefined;

  const draftKey = `tl-draft-${parentApp?.id ?? "new"}`;

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>(
    parentApp ? { ...parentApp.formData } : {}
  );
  const [docs, setDocs] = useState<PreviewDocument[]>(
    parentApp ? [...parentApp.documents] : []
  );
  const [pickerField, setPickerField] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [draftRestored, setDraftRestored] = useState(false);
  const initRef = useRef(false);

  // ── Auto-save: restore draft on mount (new applications only) ──
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    if (isRenewal) return;
    try {
      const raw = sessionStorage.getItem(draftKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        if (parsed.formData) setFormData(parsed.formData);
        if (Array.isArray(parsed.docs)) setDocs(parsed.docs);
        if (typeof parsed.currentStep === "number") setCurrentStep(parsed.currentStep);
        setDraftRestored(true);
      }
    } catch { /* ignore */ }
  }, [draftKey, isRenewal]);

  // ── Auto-save: persist on changes (debounced) ──
  useEffect(() => {
    if (!initRef.current) return;
    const handle = setTimeout(() => {
      try {
        sessionStorage.setItem(draftKey, JSON.stringify({ currentStep, formData, docs }));
      } catch { /* ignore */ }
    }, 400);
    return () => clearTimeout(handle);
  }, [currentStep, formData, docs, draftKey]);

  const isReview = currentStep === formSections.length;
  const section = formSections[currentStep];

  const updateField = (fieldId: string, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [fieldId]: value };
      // Reset dependent dropdowns when parent changes
      formSections.forEach(sec => sec.fields.forEach(f => {
        if (f.dependsOn === fieldId) next[f.id] = "";
        if (f.showIf?.field === fieldId && f.showIf.equals !== value) next[f.id] = "";
      }));
      return next;
    });
  };

  const errors = useMemo(
    () => (isReview ? {} : validateSection(section, formData, docs)),
    [section, formData, docs, isReview],
  );
  const sectionValid = Object.keys(errors).length === 0;

  const addMockDoc = (label: string) => {
    setDocs((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: `${label.toLowerCase().replace(/\s+/g, "-")}.pdf`,
        type: label,
        uploadedAt: Date.now(),
        status: "Pending",
      },
    ]);
  };

  const addReusedDoc = (userDocId: string, label: string) => {
    const userDoc = userDocuments.find((d) => d.id === userDocId);
    if (!userDoc) return;
    setDocs((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: userDoc.name,
        type: label,
        uploadedAt: Date.now(),
        status: "Pending",
        reused: true,
      },
    ]);
  };

  const removeDoc = (idx: number) => setDocs((prev) => prev.filter((_, i) => i !== idx));

  const discardDraft = () => {
    sessionStorage.removeItem(draftKey);
    setFormData({});
    setDocs([]);
    setCurrentStep(0);
    setTouched({});
    setDraftRestored(false);
  };

  const handleNext = () => {
    if (isReview) {
      const appId = isRenewal && parentApp
        ? submitRenewal(parentApp.id, formData, docs)
        : submitApplication(formData, docs);
      try { sessionStorage.removeItem(draftKey); } catch { /* ignore */ }
      setScreen({ type: "success", applicationId: appId });
      return;
    }
    if (!sectionValid) {
      // Mark all section fields as touched so errors show inline
      const allTouched: Record<string, boolean> = { ...touched };
      section.fields.forEach((f) => { allTouched[f.id] = true; });
      setTouched(allTouched);
      toast.error("Please complete required fields", { description: "Some fields need attention before continuing." });
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const showError = (fieldId: string) => touched[fieldId] && errors[fieldId];

  return (
    <div className="flex-1 overflow-y-auto flex flex-col bg-background">
      {/* Header */}
      <div className="bg-[#0b4f6c] text-white px-4 py-3 flex items-center gap-2 text-sm font-medium">
        <span className="grid grid-cols-2 gap-0.5">
          <span className="w-1.5 h-1.5 rounded-sm bg-white/80" />
          <span className="w-1.5 h-1.5 rounded-sm bg-white/80" />
          <span className="w-1.5 h-1.5 rounded-sm bg-white/80" />
          <span className="w-1.5 h-1.5 rounded-sm bg-white/80" />
        </span>
        DIGIT <span className="text-white/60 ml-1">| dev</span>
      </div>

      <div className="px-4 py-2 text-xs">
        <button onClick={() => setScreen({ type: "home" })} className="text-accent hover:underline">Home</button>
        <span className="mx-1 text-muted-foreground">/</span>
        <span className="text-muted-foreground">{isRenewal ? "Renew" : "Apply"}</span>
      </div>

      {/* Steps indicator */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-center gap-1.5">
          {[...formSections, { id: "review", name: "Review" }].map((s, i) => (
            <div key={s.id} className="flex flex-col items-center gap-1 flex-1 min-w-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                i < currentStep ? "bg-accent text-accent-foreground" :
                i === currentStep ? "bg-accent text-accent-foreground ring-2 ring-accent/30" :
                "bg-muted text-muted-foreground"
              }`}>
                {i < currentStep ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span className="text-[8px] text-muted-foreground text-center leading-tight truncate w-full">{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Draft restored banner */}
      {draftRestored && !isRenewal && (
        <div className="mx-4 mb-2 flex items-center justify-between gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-md px-2.5 py-1.5 text-[10px] animate-in fade-in slide-in-from-top-1">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Draft restored — continue where you left off.
          </span>
          <button onClick={discardDraft} className="underline font-medium hover:text-amber-900">Discard</button>
        </div>
      )}

      {/* Form content */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        <h2 className="text-base font-bold text-foreground mb-1">
          {isRenewal ? `Renew ${serviceName}` : serviceName}
        </h2>
        {isRenewal && (
          <p className="text-[10px] text-muted-foreground mb-2">
            Details have been pre-filled from your existing license. Review &amp; edit as needed.
          </p>
        )}

        {!isReview ? (
          <>
            <h3 className="font-semibold text-foreground text-sm mb-1">{section.name}</h3>
            {section.description && (
              <p className="text-[10px] text-muted-foreground mb-3">{section.description}</p>
            )}
            <div className="space-y-3.5">
              {section.fields.map((field) => {
                if (!isFieldVisible(field, formData)) return null;
                const err = showError(field.id);

                const labelEl = field.type !== "checkbox" && (
                  <Label className="text-sm">
                    {field.label}
                    {field.required && <span className="text-destructive ml-0.5">*</span>}
                  </Label>
                );

                return (
                  <div
                    key={field.id}
                    className={`space-y-1.5 ${field.showIf ? "animate-in fade-in slide-in-from-top-1" : ""}`}
                  >
                    {labelEl}

                    {/* Dropdown */}
                    {field.type === "dropdown" ? (() => {
                      const opts = getDropdownOptions(field, formData);
                      const disabled = field.dependsOn && opts.length === 0;
                      return (
                        <Select
                          value={formData[field.id] || ""}
                          onValueChange={(v) => { updateField(field.id, v); setTouched(t => ({ ...t, [field.id]: true })); }}
                          disabled={disabled}
                        >
                          <SelectTrigger className="bg-white" onBlur={() => setTouched(t => ({ ...t, [field.id]: true }))}>
                            <SelectValue placeholder={disabled ? field.placeholder : (field.placeholder || "Select...")} />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            {opts.map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                    })()
                    /* Radio chips (Yes/No style) */
                    : field.type === "radio" ? (
                      <div className="flex gap-2">
                        {(field.options || []).map((opt) => {
                          const selected = formData[field.id] === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => { updateField(field.id, opt); setTouched(t => ({ ...t, [field.id]: true })); }}
                              className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium border transition ${
                                selected
                                  ? "bg-accent text-accent-foreground border-accent"
                                  : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )
                    /* Date */
                    : field.type === "date" ? (
                      <Input
                        type="date"
                        max={field.validation?.pastDateOnly ? todayISO() : undefined}
                        value={formData[field.id] || ""}
                        onChange={(e) => updateField(field.id, e.target.value)}
                        onBlur={() => setTouched(t => ({ ...t, [field.id]: true }))}
                        className="bg-white"
                      />
                    )
                    /* Checkbox (declaration) */
                    : field.type === "checkbox" ? (
                      <label className="flex items-start gap-2 rounded-md border border-border bg-card p-3 cursor-pointer">
                        <Checkbox
                          checked={formData[field.id] === "true"}
                          onCheckedChange={(c) => { updateField(field.id, c ? "true" : ""); setTouched(t => ({ ...t, [field.id]: true })); }}
                          className="mt-0.5"
                        />
                        <span className="text-xs text-foreground leading-snug">
                          {field.label}
                          {field.required && <span className="text-destructive ml-0.5">*</span>}
                        </span>
                      </label>
                    )
                    /* File */
                    : field.type === "file" ? (
                      <div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => { addMockDoc(field.label); setTouched(t => ({ ...t, [field.id]: true })); }}
                            className="border-2 border-dashed rounded-lg p-2.5 text-center text-[11px] text-accent bg-accent/5 hover:bg-accent/10 flex items-center justify-center gap-1.5"
                          >
                            <FileUp className="h-3.5 w-3.5" /> Upload New
                          </button>
                          <button
                            type="button"
                            onClick={() => { setPickerField(field.label); setTouched(t => ({ ...t, [field.id]: true })); }}
                            className="border-2 border-dashed rounded-lg p-2.5 text-center text-[11px] text-indigo-600 bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center gap-1.5 border-indigo-200"
                          >
                            <FolderOpen className="h-3.5 w-3.5" /> My Documents
                          </button>
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-1">PDF / JPG / PNG · max 5 MB</p>
                        <div className="mt-2 space-y-1">
                          {docs.filter((d) => d.type === field.label).map((d) => {
                            const idx = docs.findIndex((x) => x.id === d.id);
                            return (
                              <div key={d.id} className="flex items-center justify-between text-[11px] bg-muted/50 rounded px-2 py-1">
                                <span className="truncate flex items-center gap-1.5">
                                  <span className="truncate">{d.name}</span>
                                  {d.reused && (
                                    <span className="inline-flex items-center gap-0.5 text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-semibold shrink-0">
                                      <Repeat className="h-2.5 w-2.5" /> Reused
                                    </span>
                                  )}
                                </span>
                                <button onClick={() => removeDoc(idx)} className="text-destructive shrink-0 ml-1">
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )
                    /* Text / number / tel / email */
                    : (
                      <Input
                        type={field.type === "number" || field.type === "tel" ? "tel" : (field.type === "email" ? "email" : "text")}
                        placeholder={field.placeholder || ""}
                        value={formData[field.id] || ""}
                        onChange={(e) => updateField(field.id, e.target.value)}
                        onBlur={() => setTouched(t => ({ ...t, [field.id]: true }))}
                        className="bg-white"
                      />
                    )}

                    {field.helpText && !err && (
                      <p className="text-[10px] text-muted-foreground">{field.helpText}</p>
                    )}
                    {err && (
                      <p className="text-[10px] text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors[field.id]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <h3 className="font-semibold text-foreground text-sm mb-3">Review &amp; Submit</h3>
            <div className="space-y-3">
              {formSections.map((sec) => {
                const isDocs = sec.fields.some((f) => f.type === "file");
                const isDeclaration = sec.fields.every((f) => f.type === "checkbox");
                const visibleFields = sec.fields.filter(
                  (f) => isFieldVisible(f, formData) && f.type !== "file" && f.type !== "checkbox" && formData[f.id]
                );

                return (
                  <div key={sec.id} className="border rounded-lg p-3 bg-card">
                    <p className="text-[11px] font-semibold text-accent mb-2">{sec.name}</p>

                    {isDocs ? (
                      docs.length === 0 ? (
                        <p className="text-[11px] text-muted-foreground">No documents uploaded.</p>
                      ) : (
                        <ul className="text-[11px] space-y-0.5">
                          {docs.map((d) => (
                            <li key={d.id} className="text-muted-foreground flex items-center gap-1.5">
                              • {d.type} — {d.name}
                              {d.reused && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-semibold">
                                  <Repeat className="h-2.5 w-2.5" /> Reused
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )
                    ) : isDeclaration ? (
                      <p className="text-[11px] flex items-center gap-1.5">
                        {formData["declaration"] === "true" ? (
                          <><Check className="h-3.5 w-3.5 text-emerald-600" /> <span className="text-foreground font-medium">Confirmed</span></>
                        ) : (
                          <><AlertCircle className="h-3.5 w-3.5 text-destructive" /> <span className="text-destructive">Not confirmed</span></>
                        )}
                      </p>
                    ) : visibleFields.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground">No details provided.</p>
                    ) : (
                      <dl className="grid grid-cols-2 gap-y-1 text-[11px]">
                        {visibleFields.map((f) => (
                          <React.Fragment key={f.id}>
                            <dt className="text-muted-foreground">{f.label}</dt>
                            <dd className="text-foreground font-medium">{formData[f.id]}</dd>
                          </React.Fragment>
                        ))}
                      </dl>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t flex gap-2 bg-card">
        {currentStep > 0 && (
          <Button variant="outline" size="sm" onClick={() => setCurrentStep((p) => p - 1)} className="gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Button>
        )}
        <Button
          size="sm"
          onClick={handleNext}
          disabled={!isReview && !sectionValid && Object.keys(touched).some(k => section.fields.some(f => f.id === k))}
          className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 gap-1 disabled:opacity-60"
        >
          {isReview ? "Submit" : "Next"} <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* My Documents Picker */}
      <Dialog open={pickerField !== null} onOpenChange={(o) => !o && setPickerField(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-indigo-500" /> Pick from My Documents
            </DialogTitle>
            <DialogDescription>
              Select a document to attach as <span className="font-semibold">{pickerField}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] overflow-y-auto space-y-2">
            {userDocuments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                You haven't uploaded any documents yet. Visit "My Documents" from the home screen to add some.
              </p>
            ) : (
              userDocuments.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    if (pickerField) addReusedDoc(d.id, pickerField);
                    setPickerField(null);
                  }}
                  className="w-full text-left flex items-center gap-3 rounded-lg border border-border/60 p-3 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors"
                >
                  <div className="h-9 w-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">{d.name}</p>
                    <p className="text-[10px] text-muted-foreground">{d.type} • {new Date(d.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </button>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPickerField(null)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicationForm;
