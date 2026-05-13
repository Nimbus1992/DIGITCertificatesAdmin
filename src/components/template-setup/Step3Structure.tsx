import React from "react";
import { ArrowRight, Upload, FileSpreadsheet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  hasCategories: boolean | null;
  setHasCategories: (v: boolean) => void;
  categoriesFile: File | null;
  setCategoriesFile: (f: File | null) => void;

  hasSubcategories: boolean | null;
  setHasSubcategories: (v: boolean) => void;
  subcategoriesFile: File | null;
  setSubcategoriesFile: (f: File | null) => void;

  onContinue: () => void;
}

const YesNo: React.FC<{
  value: boolean | null;
  onChange: (v: boolean) => void;
}> = ({ value, onChange }) => (
  <div className="inline-flex rounded-md border border-input p-0.5 bg-background">
    {[
      { v: true, label: "Yes" },
      { v: false, label: "No" },
    ].map((o) => (
      <button
        key={o.label}
        type="button"
        onClick={() => onChange(o.v)}
        className={cn(
          "px-4 py-1.5 text-sm rounded-sm transition-colors",
          value === o.v
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const Dropzone: React.FC<{
  file: File | null;
  onChange: (f: File | null) => void;
  id: string;
}> = ({ file, onChange, id }) => (
  <div className="mt-4 animate-accordion-down overflow-hidden">
    {file ? (
      <div className="flex items-center gap-3 p-3 rounded-md border border-accent/30 bg-accent/5">
        <FileSpreadsheet className="h-5 w-5 text-accent shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-foreground truncate">{file.name}</div>
          <div className="text-xs text-muted-foreground">
            {(file.size / 1024).toFixed(1)} KB
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onChange(null)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    ) : (
      <label
        htmlFor={id}
        className="flex flex-col items-center justify-center gap-2 p-6 rounded-md border-2 border-dashed border-input hover:border-accent/50 hover:bg-muted/30 cursor-pointer transition-colors"
      >
        <Upload className="h-5 w-5 text-muted-foreground" />
        <div className="text-sm text-foreground">
          <span className="font-medium text-accent">Click to upload</span> or drag a file
        </div>
        <div className="text-xs text-muted-foreground">CSV or Excel (.csv, .xlsx)</div>
        <input
          id={id}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
    )}
    {!file && (
      <p className="text-xs text-muted-foreground mt-2">
        Skip for now and add it later from the configurator.
      </p>
    )}
  </div>
);

const Step3Structure: React.FC<Props> = ({
  hasCategories,
  setHasCategories,
  categoriesFile,
  setCategoriesFile,
  hasSubcategories,
  setHasSubcategories,
  subcategoriesFile,
  setSubcategoriesFile,
  onContinue,
}) => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Let's structure your licenses
        </h1>
        <p className="text-base text-muted-foreground mt-2">
          A few quick questions help us pre-configure your service correctly.
        </p>
      </div>

      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="text-base font-medium text-foreground">
                Do you have license categories?
              </div>
              <div className="text-sm text-muted-foreground mt-0.5">
                For example: Retail, Manufacturing, Hospitality.
              </div>
            </div>
            <YesNo value={hasCategories} onChange={setHasCategories} />
          </div>
          {hasCategories === true && (
            <Dropzone id="cat-upload" file={categoriesFile} onChange={setCategoriesFile} />
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="text-base font-medium text-foreground">
                Do you have license subcategories?
              </div>
              <div className="text-sm text-muted-foreground mt-0.5">
                For example: Restaurant under Hospitality, Bakery under Retail.
              </div>
            </div>
            <YesNo value={hasSubcategories} onChange={setHasSubcategories} />
          </div>
          {hasSubcategories === true && (
            <Dropzone id="sub-upload" file={subcategoriesFile} onChange={setSubcategoriesFile} />
          )}
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onContinue}
          size="lg"
          className="gap-1.5"
          disabled={hasCategories === null || hasSubcategories === null}
        >
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Step3Structure;