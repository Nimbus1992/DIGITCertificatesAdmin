import React, { useState, useEffect, useRef } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  FileText,
  Shield,
  BarChart3,
  Settings,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  ChevronRight,
  Quote,
  Globe,
  Zap,
  Lock,
  Building2,
  Flame,
  Factory,
  TreePine,
  Star,
  Workflow,
  Users,
  UserCog,
  Briefcase,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";

import heroImg from "@/assets/hero-gov.jpg";
import usecaseImg from "@/assets/usecase-building.jpg";
import dashboardImg from "@/assets/platform-dashboard.jpg";
import caseStudyImg from "@/assets/case-study.jpg";

/* ── Data ── */
const USE_CASES = [
  {
    id: "building",
    label: "Building Permits",
    icon: Building2,
    title: "Building Permits",
    tags: ["Plan Review", "Submissions", "Clearance Certificates"],
    description:
      "All permits construction-related approvals with automated plan reviews, multi-department coordination, and real-time tracking for citizen convenience.",
    features: [
      "Online plan submission & review",
      "Automated compliance checks",
      "Inspector scheduling & mobile inspections",
      "Digital certificate generation",
    ],
    image: usecaseImg,
  },
  {
    id: "trade",
    label: "Business Licenses",
    icon: FileText,
    title: "Business License Management",
    tags: ["License Issuance", "Renewal", "Enforcement"],
    description:
      "Streamline business license issuance, renewal, and enforcement. Configure fee structures, approval workflows, and automated notifications.",
    features: [
      "Multi-category license types",
      "Automated renewal reminders",
      "Fee calculation engine",
      "Enforcement tracking",
    ],
    image: dashboardImg,
  },
  {
    id: "fire",
    label: "Fire Safety",
    icon: Flame,
    title: "Fire Safety Certificates",
    tags: ["NOC Issuance", "Inspections", "Compliance"],
    description:
      "Manage fire safety inspections, NOC issuance, and compliance tracking with configurable checklists and automated workflows.",
    features: [
      "Inspection checklists",
      "NOC issuance workflow",
      "Compliance tracking",
      "Renewal management",
    ],
    image: usecaseImg,
  },
  {
    id: "industrial",
    label: "Industrial Permits",
    icon: Factory,
    title: "Industrial & Environmental Permits",
    tags: ["Multi-stage Approvals", "Impact Assessment"],
    description:
      "Handle complex industrial permitting with multi-stage approvals, environmental impact assessments, and regulatory compliance tracking.",
    features: [
      "Multi-stage approval chains",
      "Environmental assessments",
      "Regulatory compliance",
      "Document management",
    ],
    image: dashboardImg,
  },
  {
    id: "environmental",
    label: "Environmental",
    icon: TreePine,
    title: "Environmental Clearances",
    tags: ["Impact Assessment", "Public Consultation"],
    description:
      "Process environmental clearance applications with impact assessments, public consultations, and monitoring conditions.",
    features: [
      "Impact assessment workflows",
      "Public consultation tracking",
      "Condition monitoring",
      "Periodic reporting",
    ],
    image: usecaseImg,
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Simple and Fast Setup",
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    icon: Settings,
    title: "Digital Application Submission & Processing",
    color: "text-primary",
    bg: "bg-blue-50",
  },
  {
    icon: Shield,
    title: "Automation of Repetitive Tasks",
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    icon: BarChart3,
    title: "End-to-End Lifecycle Management",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: Workflow,
    title: "Decision Support System",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
];

const PLATFORM_FEATURES = [
  { num: "01", title: "Core Platform", desc: "Built on a robust, government-grade platform with enterprise security and scalability.", active: false },
  { num: "02", title: "Easy to Setup", desc: "No-code configuration wizard gets your first application live in under 30 minutes.", active: false },
  { num: "03", title: "Built for Scale and Inclusion", desc: "DIGIT is a platform designed for billions of transactions, built with open-source principles to be configurable, extendable and evolvable, to cater to all forms of governance at scale.", active: true },
  { num: "04", title: "Configurable", desc: "Every workflow, form, fee, and notification can be tailored to your regulations.", active: false },
];

const PERSONAS = [
  {
    icon: Users,
    label: "Citizens",
    headline: "Apply and track, anytime, anywhere",
    desc: "Submit applications, upload documents, pay fees and follow real-time status from any device.",
  },
  {
    icon: Briefcase,
    label: "Field Employees",
    headline: "A digital partner to reduce coordination",
    desc: "Plan inspections, capture proof of work on the go and sync seamlessly with the back office.",
  },
  {
    icon: UserCog,
    label: "Office Employees",
    headline: "One place to access and review all requests",
    desc: "Triage applications, run checklists and collaborate across departments without losing context.",
  },
  {
    icon: ShieldCheck,
    label: "Administrators",
    headline: "A digital headquarters to monitor and improve",
    desc: "Track SLAs, spot bottlenecks and tune workflows, fees and notifications without writing code.",
  },
  {
    icon: BadgeCheck,
    label: "End Users",
    headline: "Easily verify and validate digital certificates",
    desc: "Banks, agencies and partners can authenticate every issued certificate in a single click.",
  },
];

const PersonaIllustration: React.FC<{ index: number }> = ({ index }) => {
  const common = "w-56 h-56 sm:w-72 sm:h-72";
  switch (index) {
    case 0:
      // Citizens — phone with checkmark + people
      return (
        <svg viewBox="0 0 200 200" className={common} fill="none">
          <rect x="65" y="30" width="70" height="120" rx="12" className="fill-card stroke-primary" strokeWidth="2.5" />
          <rect x="73" y="42" width="54" height="80" rx="4" className="fill-primary/10" />
          <circle cx="100" cy="82" r="18" className="fill-primary" />
          <path d="M92 82 l6 6 l12 -12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground" fill="none" />
          <circle cx="100" cy="138" r="3" className="fill-muted-foreground/40" />
          <circle cx="40" cy="155" r="14" className="fill-accent/30" />
          <path d="M26 180 q14 -16 28 0" className="stroke-accent" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="160" cy="155" r="14" className="fill-primary/20" />
          <path d="M146 180 q14 -16 28 0" className="stroke-primary" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 1:
      // Field Employees — clipboard + map pin
      return (
        <svg viewBox="0 0 200 200" className={common} fill="none">
          <rect x="40" y="30" width="90" height="120" rx="8" className="fill-card stroke-primary" strokeWidth="2.5" />
          <rect x="70" y="22" width="30" height="16" rx="3" className="fill-primary" />
          <line x1="55" y1="60" x2="115" y2="60" className="stroke-muted-foreground/40" strokeWidth="3" strokeLinecap="round" />
          <line x1="55" y1="78" x2="105" y2="78" className="stroke-muted-foreground/30" strokeWidth="3" strokeLinecap="round" />
          <line x1="55" y1="96" x2="115" y2="96" className="stroke-muted-foreground/30" strokeWidth="3" strokeLinecap="round" />
          <line x1="55" y1="114" x2="90" y2="114" className="stroke-muted-foreground/30" strokeWidth="3" strokeLinecap="round" />
          <path d="M150 70 c0 -14 11 -25 25 -25 s25 11 25 25 c0 18 -25 50 -25 50 s-25 -32 -25 -50 z" className="fill-accent stroke-accent" strokeWidth="2" transform="translate(-15 30)" />
          <circle cx="160" cy="100" r="8" className="fill-card" />
        </svg>
      );
    case 2:
      // Office Employees — desktop with stacked cards
      return (
        <svg viewBox="0 0 200 200" className={common} fill="none">
          <rect x="25" y="40" width="150" height="100" rx="8" className="fill-card stroke-primary" strokeWidth="2.5" />
          <rect x="35" y="55" width="60" height="40" rx="4" className="fill-primary/15" />
          <rect x="105" y="55" width="60" height="18" rx="3" className="fill-accent/30" />
          <rect x="105" y="80" width="60" height="15" rx="3" className="fill-muted-foreground/20" />
          <rect x="35" y="105" width="130" height="10" rx="3" className="fill-muted-foreground/20" />
          <rect x="35" y="120" width="90" height="10" rx="3" className="fill-muted-foreground/15" />
          <rect x="80" y="140" width="40" height="6" rx="3" className="fill-muted-foreground/30" />
          <rect x="60" y="155" width="80" height="8" rx="2" className="fill-card stroke-muted-foreground/30" strokeWidth="1.5" />
        </svg>
      );
    case 3:
      // Administrators — dashboard chart + gear
      return (
        <svg viewBox="0 0 200 200" className={common} fill="none">
          <rect x="20" y="35" width="160" height="110" rx="8" className="fill-card stroke-primary" strokeWidth="2.5" />
          <line x1="35" y1="125" x2="165" y2="125" className="stroke-muted-foreground/30" strokeWidth="2" />
          <rect x="45" y="95" width="14" height="30" rx="2" className="fill-primary/40" />
          <rect x="68" y="80" width="14" height="45" rx="2" className="fill-primary/60" />
          <rect x="91" y="65" width="14" height="60" rx="2" className="fill-primary" />
          <rect x="114" y="85" width="14" height="40" rx="2" className="fill-accent/60" />
          <rect x="137" y="70" width="14" height="55" rx="2" className="fill-accent" />
          <g transform="translate(150 150)">
            <circle cx="0" cy="0" r="18" className="fill-card stroke-primary" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="6" className="fill-primary" />
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <rect key={a} x="-2" y="-22" width="4" height="6" className="fill-primary" transform={`rotate(${a})`} />
            ))}
          </g>
        </svg>
      );
    default:
      // End Users — certificate with seal/QR
      return (
        <svg viewBox="0 0 200 200" className={common} fill="none">
          <rect x="30" y="35" width="140" height="110" rx="6" className="fill-card stroke-primary" strokeWidth="2.5" />
          <line x1="45" y1="60" x2="135" y2="60" className="stroke-primary/60" strokeWidth="3" strokeLinecap="round" />
          <line x1="45" y1="75" x2="115" y2="75" className="stroke-muted-foreground/30" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="45" y1="88" x2="125" y2="88" className="stroke-muted-foreground/30" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="45" y1="101" x2="100" y2="101" className="stroke-muted-foreground/30" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="45" y="115" width="40" height="22" rx="2" className="fill-primary/10 stroke-primary" strokeWidth="1.5" />
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2, 3].map((c) => (
              <rect key={`${r}-${c}`} x={48 + c * 8} y={118 + r * 5} width="4" height="4" className={(r + c) % 2 === 0 ? "fill-primary" : "fill-transparent"} />
            ))
          )}
          <circle cx="145" cy="125" r="18" className="fill-accent/20 stroke-accent" strokeWidth="2" />
          <path d="M137 125 l6 6 l12 -12" className="stroke-accent" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M132 140 l4 18 l9 -6 l9 6 l4 -18" className="fill-accent/30 stroke-accent" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
  }
};

const TESTIMONIALS = [
  {
    quote:
      "The DIGIT platform is robust and comprehensible, enabling the team to configure specific solutions to governmental requirements. It connects us to 28 states over 6,500 cities and 250 million citizens.",
    name: "Viraj Tyagi",
    role: "Engagement Lead",
    org: "PwC",
    logo: "PwC",
  },
  {
    quote:
      "When we got DIGIT and its modular framework ready, it was entirely recraftable, scalable, open-source at its simplest form. Built with principles that were meant for governance at scale.",
    name: "Sanjay Jain",
    role: "Data Centre, Industry Architect",
    org: "Cisco",
    logo: "Deloitte",
  },
  {
    quote:
      "When we started to learn about eGov's mission, we were excited because of the scale, because of the depth of problems that they're trying to solve, the impact it has in the citizen community.",
    name: "Jatin Sethi",
    role: "VP, Programs",
    org: "Infosys Public Applications",
    logo: "Infosys",
  },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { resetOnboarding, updateState } = useOnboarding();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeUseCase, setActiveUseCase] = useState("building");
  const [activePersona, setActivePersona] = useState(0);
  const personasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const el = personasRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const progress = Math.min(Math.max(-rect.top / total, 0), 0.9999);
      setActivePersona(Math.floor(progress * PERSONAS.length));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const goToOnboarding = () => {
    resetOnboarding();
    updateState({ currentStep: 1 });
    navigate("/onboarding");
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const currentUseCase = USE_CASES.find((u) => u.id === activeUseCase)!;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">LnP</span>
            </div>
            <span className="text-lg font-semibold text-foreground">Licenses & Permits</span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            {[
              { label: "Solutions", id: "features" },
              { label: "Use Cases", id: "usecases" },
              { label: "Impact", id: "impact" },
              { label: "Partners", id: "partners" },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" onClick={goToOnboarding}>Login</Button>
            <Button onClick={goToOnboarding}>
              Sign Up <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-border bg-background px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              <button onClick={() => scrollTo("features")} className="text-sm text-left text-muted-foreground">Solutions</button>
              <button onClick={() => scrollTo("usecases")} className="text-sm text-left text-muted-foreground">Use Cases</button>
              <button onClick={() => scrollTo("impact")} className="text-sm text-left text-muted-foreground">Impact</button>
              <button onClick={() => scrollTo("partners")} className="text-sm text-left text-muted-foreground">Partners</button>
              <hr className="border-border" />
              <Button variant="ghost" className="justify-start" onClick={goToOnboarding}>Login</Button>
              <Button className="justify-start" onClick={goToOnboarding}>Sign Up</Button>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="bg-background py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                DIGIT Licenses and Permits
              </p>
              <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
                Streamline{" "}
                <br className="hidden sm:block" />
                License & Permits <span className="font-normal italic">for</span>{" "}
                <br className="hidden sm:block" />
                Better Governance
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                For Issuance of all kinds of License, Permits and Certificates
              </p>

              {/* Outcome pills */}
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {["Improve Efficiency", "Increase Revenue", "Enhance Trust in Certificates"].map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="rounded-full border-primary text-primary hover:bg-primary/5"
                  onClick={() => scrollTo("features")}
                >
                  Explore Platform
                </Button>
                <Button
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={goToOnboarding}
                >
                  Get Started <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Hero image grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 overflow-hidden rounded-xl">
                <img src={heroImg} alt="Government digital applications" className="h-48 w-full object-cover sm:h-56" loading="eager" />
              </div>
              <div className="overflow-hidden rounded-xl">
                <img src={dashboardImg} alt="Platform dashboard" className="h-32 w-full object-cover sm:h-40" loading="eager" />
              </div>
              <div className="overflow-hidden rounded-xl">
                <img src={usecaseImg} alt="Building permits" className="h-32 w-full object-cover sm:h-40" loading="eager" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="features" className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Left text */}
            <div>
              <h2 className="text-sm font-semibold text-primary">Finally,</h2>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                All in one place
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                Get up and running with multiple License, Permit and Certificate use cases from one platform - without writing a line of code.
              </p>
            </div>

            {/* Right cards grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md"
                >
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${f.bg}`}>
                    <f.icon className={`h-5 w-5 ${f.color}`} />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground leading-tight">
                    {f.title}
                  </h3>
                  <button className="mt-2 text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
                    Know More <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Use Cases Tabs ── */}
      <section id="usecases" className="bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-semibold text-primary">One Product</h2>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Many Possibilities
            </h2>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {USE_CASES.map((uc) => (
              <button
                key={uc.id}
                onClick={() => setActiveUseCase(uc.id)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                  activeUseCase === uc.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {uc.label}
              </button>
            ))}
          </div>

          <div className="mt-10 grid items-start gap-8 lg:grid-cols-2">
            <div>
              <h3 className="text-xl font-bold text-foreground">
                {currentUseCase.title}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {currentUseCase.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                {currentUseCase.description}
              </p>
              <button className="mt-4 text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
                Know More <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="overflow-hidden rounded-xl bg-muted">
              <img
                src={currentUseCase.image}
                alt={currentUseCase.title}
                className="h-64 w-full object-cover sm:h-72"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Trusted Partners logos ── */}
      <section className="border-t border-border py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground mb-6">
            Trusted by 100+ Partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-14">
            {["Walmart", "Cisco", "Google", "Deloitte", "Okta"].map((name) => (
              <span key={name} className="text-base font-bold text-muted-foreground/40 tracking-wide">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Personas (scroll-pinned) ── */}
      <section
        ref={personasRef}
        className="relative bg-muted/30 lg:h-[500vh]"
      >
        <div className="lg:sticky lg:top-0 lg:h-screen flex items-center py-16 lg:py-0">
          <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 lg:mb-14">
              <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">Built for every role</h2>
              <h3 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
                A <span className="text-primary">better experience</span> for Everyone
              </h3>
            </div>

            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              {/* Headings list — only active reveals description */}
              <div className="space-y-2">
                {PERSONAS.map((p, i) => {
                  const isActive = i === activePersona;
                  return (
                    <div
                      key={p.label}
                      className={`rounded-xl px-4 py-3 transition-all ${
                        isActive ? "bg-card border border-primary/20 shadow-sm" : "border border-transparent"
                      }`}
                    >
                      <p
                        className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                          isActive ? "text-primary" : "text-muted-foreground/50"
                        }`}
                      >
                        {p.label}
                      </p>
                      <h4
                        className={`mt-0.5 font-semibold transition-colors ${
                          isActive ? "text-foreground text-lg" : "text-muted-foreground"
                        }`}
                      >
                        {p.headline}
                      </h4>
                      <div
                        className={`grid transition-all duration-500 ${
                          isActive ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <p className="overflow-hidden text-sm leading-relaxed text-muted-foreground">
                          {p.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Persona illustration */}
              <div className="relative min-h-[360px] lg:min-h-[460px] rounded-2xl bg-gradient-to-br from-primary/5 via-background to-accent/5 border border-border overflow-hidden">
                {PERSONAS.map((p, i) => (
                  <div
                    key={p.label}
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
                      i === activePersona ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <PersonaIllustration index={i} />
                  </div>
                ))}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  {PERSONAS.map((_, j) => (
                    <span
                      key={j}
                      className={`h-1 rounded-full transition-all ${
                        j === activePersona ? "w-8 bg-primary" : "w-4 bg-muted-foreground/20"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Collaborate Section ── */}
      <section className="relative overflow-hidden">
        {/* Top decorative area with illustration */}
        <div className="relative bg-gradient-to-b from-muted to-background py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-sm font-semibold text-primary">Collaborate</h2>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              <span className="font-normal italic">without</span> constraints
            </h2>
          </div>
        </div>
        {/* 3 cards */}
        <div className="mx-auto -mt-2 max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Zap,
                title: "Rapid Deployment",
                desc: "Roll out in days, not years. Our platform-first approach eliminates time-intensive custom software development cycles.",
              },
              {
                icon: Globe,
                title: "Seamless Integration",
                desc: "Connect reliably, grow faster. Build interoperability with any third party APIs, payments, identity, and existing government systems.",
              },
              {
                icon: Lock,
                title: "Regulatory Compliance",
                desc: "Built in compliance frameworks to government data, security standards, auditing requirements, role-based access for robust compliance.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" className="rounded-full" onClick={() => scrollTo("features")}>
              Explore Platform
            </Button>
            <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={goToOnboarding}>
              Start your journey <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Case Study ── */}
      <section id="impact" className="py-16 sm:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            {/* Image */}
            <div className="overflow-hidden rounded-xl bg-muted">
              <img
                src={caseStudyImg}
                alt="SUJOG digital transformation"
                className="h-64 w-full object-cover sm:h-80"
                loading="lazy"
              />
            </div>
            {/* Text */}
            <div>
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                From queues to clicks:{" "}
                <span className="text-primary">SUJOG's digital transformation of Odisha</span>
              </h2>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                From manual & tedious-to-digital excellence — SUJOG transformed how Odisha's citizens access city-level applications, while enhancing governance, transparency and inclusive digital governance.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-4">
                {[
                  { stat: "1468%", label: "ROI" },
                  { stat: "24 Million", label: "Certified Delivered" },
                  { stat: "73,457", label: "Applications Completed" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-xl font-bold text-foreground sm:text-2xl">{s.stat}</div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
              <Button className="mt-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={goToOnboarding}>
                Read More Here
              </Button>
            </div>
          </div>

          {/* Partner logos row */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
            {["SUJOG", "Deloitte", "Infosys", "orbitbaby"].map((name) => (
              <span key={name} className="text-sm font-semibold text-muted-foreground/50">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="partners" className="py-16 sm:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Loved by the <span className="text-primary">Our Partners</span>
            </h2>
            <button className="mt-3 rounded-full border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors">
              See all testimonials
            </button>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-xl border border-border bg-card p-6 flex flex-col">
                {/* Logo placeholder */}
                <div className="mb-4">
                  <span className="text-lg font-bold text-foreground/70">{t.logo}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                  "{t.quote}"
                </p>
                <div className="mt-4 flex items-center gap-3 pt-4 border-t border-border">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                    <span className="text-xs font-bold text-foreground">
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.role}, {t.org}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="mx-4 sm:mx-6 lg:mx-auto max-w-7xl rounded-2xl bg-primary py-12 sm:py-16 mb-16">
        <div className="px-6 text-center sm:px-12">
          <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl">
            Explore LnP Today
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/70">
            Join governments worldwide in delivering faster, transparent, and citizen-friendly licensing services.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              variant="outline"
              className="rounded-full border-primary-foreground/30 hover:bg-primary-foreground/10 text-primary"
              onClick={() => scrollTo("features")}
            >
              Contact us <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button
              className="rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              onClick={goToOnboarding}
            >
              Explore DIGIT Products <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-primary py-12 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
              <span className="text-xs font-bold text-primary-foreground">LnP</span>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Social */}
            <div className="flex items-end gap-4">
              {["Twitter", "GitHub", "LinkedIn"].map((s) => (
                <span key={s} className="text-xs text-primary-foreground/50 hover:text-primary-foreground cursor-pointer transition-colors">{s}</span>
              ))}
            </div>

            <div>
              <h4 className="text-xs font-semibold text-primary-foreground/70 uppercase tracking-wider">Product</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li><button onClick={() => scrollTo("features")} className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Features</button></li>
                <li><button onClick={() => scrollTo("usecases")} className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Use Cases</button></li>
                <li><button onClick={goToOnboarding} className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Pricing</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-primary-foreground/70 uppercase tracking-wider">Learn</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li><button className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Blog</button></li>
                <li><button className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Documentation</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-primary-foreground/70 uppercase tracking-wider">Organization</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li><button className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Terms and conditions</button></li>
                <li><button className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Privacy Policy</button></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-primary-foreground/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Input placeholder="email@email.com" className="h-9 w-48 rounded-full border-primary-foreground/20 bg-primary-foreground/5 text-sm text-primary-foreground placeholder:text-primary-foreground/30 focus-visible:ring-primary-foreground/20" />
              <Button size="sm" className="rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-xs">
                Sign Up
              </Button>
            </div>
            <p className="text-xs text-primary-foreground/40">
              © {new Date().getFullYear()} LnP — Licenses & Permits Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
