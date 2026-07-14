"use client";

import { useState } from "react";
import { Activity, Users, KeyRound, Truck, Building2 } from "lucide-react";
import { CitizenPortal } from "./citizen-portal";
import { StaffLogin } from "./staff-login";
import { AmbulanceDashboard } from "./ambulance-dashboard";
import { HospitalDashboard } from "./hospital-dashboard";
import { cn } from "@/lib/utils";

type View = "citizen" | "login" | "ambulance" | "hospital";

const NAV: { id: View; label: string; route: string; icon: typeof Users }[] = [
  {
    id: "citizen",
    label: "Citizen Portal",
    route: "/patient/explore",
    icon: Users,
  },
  { id: "login", label: "Staff Login", route: "/login", icon: KeyRound },
  {
    id: "ambulance",
    label: "Ambulance",
    route: "/ambulance/dashboard",
    icon: Truck,
  },
  {
    id: "hospital",
    label: "Hospital Command",
    route: "/hospital/dashboard",
    icon: Building2,
  },
];

export function AppShell() {
  const [view, setView] = useState<View>("citizen");
  const active = NAV.find((n) => n.id === view)!;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
            </span>
            <span className="flex items-center gap-1.5">
              <Activity className="h-5 w-5 text-red-600" aria-hidden="true" />
              <span className="text-lg font-bold tracking-tight text-slate-900">
                TURBO911
              </span>
            </span>
            <span className="ml-2 hidden font-mono text-[11px] text-slate-400 sm:inline">
              EMERGENCY MEDICAL OPERATIONS
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 font-mono text-[11px] text-emerald-600 md:inline-flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              TELEMETRY ONLINE
            </span>
            <span className="font-mono text-xs text-slate-400">
              {active.route}
            </span>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-slate-200 bg-slate-50 px-2 py-1.5">
          {NAV.map((n) => {
            const Icon = n.icon;
            const isActive = view === n.id;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => setView(n.id)}
                className={cn(
                  "flex min-w-fit flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-all duration-200 active:scale-[0.97]",
                  isActive
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-transparent text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm",
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {n.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="p-3 sm:p-4">
        <div key={view} className="t911-view">
          {view === "citizen" ? <CitizenPortal /> : null}
          {view === "login" ? <StaffLogin /> : null}
          {view === "ambulance" ? <AmbulanceDashboard /> : null}
          {view === "hospital" ? <HospitalDashboard /> : null}
        </div>
      </main>
    </div>
  );
}
