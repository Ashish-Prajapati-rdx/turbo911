"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, Radio, Bed } from "lucide-react";
import {
  INCOMING_UNITS,
  type Hospital,
  type IncomingUnit,
  type Triage,
} from "@/lib/turbo911-data";
import { Panel, StatusTag } from "./primitives";
import { cn } from "@/lib/utils";

type BedType = {
  key: string;
  label: string;
  available: number;
  capacity?: number;
};

function BedControl({
  bed,
  onChange,
}: {
  bed: BedType;
  onChange: (delta: number) => void;
}) {
  const tone =
    bed.available === 0 ? "critical" : bed.available <= 2 ? "warn" : "safe";
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-white">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          {bed.label}
        </p>
        <StatusTag tone={tone} label={bed.available === 0 ? "FULL" : "OPEN"} />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onChange(-1)}
          aria-label={`Decrease ${bed.label}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-all duration-150 hover:border-slate-400 hover:text-slate-900 active:scale-90"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <p className="t911-pop font-mono text-2xl font-bold tabular-nums text-slate-900">
          {bed.available}
          {bed.capacity != null ? (
            <span className="text-sm text-slate-400">/{bed.capacity}</span>
          ) : null}
        </p>
        <button
          type="button"
          onClick={() => onChange(1)}
          aria-label={`Increase ${bed.label}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-all duration-150 hover:border-slate-400 hover:text-slate-900 active:scale-90"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function fmtEta(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const triageTone: Record<Triage, "critical" | "warn" | "safe"> = {
  CRITICAL: "critical",
  SERIOUS: "warn",
  STABLE: "safe",
};

function RadarCard({ unit }: { unit: IncomingUnit }) {
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-lg border bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md",
        unit.triage === "CRITICAL"
          ? "t911-sweep border-red-300"
          : "border-slate-200",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm font-semibold text-slate-900">
            {unit.vehicle}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            Inbound from {unit.hub}
          </p>
        </div>
        <StatusTag
          tone={triageTone[unit.triage]}
          label={unit.triage}
          pulse={unit.triage === "CRITICAL"}
        />
      </div>

      <div className="mt-3 flex items-baseline justify-between border-y border-slate-200 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          ETA
        </span>
        <span className="font-mono text-xl font-bold tabular-nums text-slate-900">
          {fmtEta(unit.etaSeconds)} Min
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-md bg-slate-50 p-2 text-center">
          <p className="font-mono text-[9px] uppercase text-slate-400">HR</p>
          <p className="t911-tick font-mono text-base font-bold tabular-nums text-red-600">
            {unit.hr}
          </p>
        </div>
        <div className="rounded-md bg-slate-50 p-2 text-center">
          <p className="font-mono text-[9px] uppercase text-slate-400">SpO2</p>
          <p className="t911-tick font-mono text-base font-bold tabular-nums text-emerald-600">
            {unit.spo2}%
          </p>
        </div>
        <div className="rounded-md bg-slate-50 p-2 text-center">
          <p className="font-mono text-[9px] uppercase text-slate-400">BP</p>
          <p className="font-mono text-base font-bold tabular-nums text-slate-800">
            {unit.systolic}/{unit.diastolic}
          </p>
        </div>
      </div>
    </article>
  );
}

export function HospitalDashboard() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [units, setUnits] = useState<IncomingUnit[]>(INCOMING_UNITS);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/hospitals")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setHospitals(data || []);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Live streaming simulation: tick down ETAs and jitter vitals
  useEffect(() => {
    const id = setInterval(() => {
      setUnits((prev) =>
        prev.map((u) => {
          const jitter = (base: number, amt: number) =>
            base + Math.round((Math.random() - 0.5) * amt);
          return {
            ...u,
            etaSeconds: Math.max(0, u.etaSeconds - 1),
            hr: Math.max(40, jitter(u.hr, 3)),
            spo2: Math.min(100, Math.max(70, jitter(u.spo2, 2))),
            systolic: Math.max(60, jitter(u.systolic, 3)),
            diastolic: Math.max(40, jitter(u.diastolic, 2)),
          };
        }),
      );
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const updateHospitalField = (
    id: string,
    field: "icuAvailable" | "icuTotal" | "oxygenBeds" | "generalBeds",
    value: number,
  ) => {
    setHospitals((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: value } : h)),
    );
  };

  const toggleSpecialistStatus = (id: string, role: string) => {
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        return {
          ...h,
          specialists: h.specialists.map((spec) =>
            spec.role === role
              ? {
                  ...spec,
                  status: spec.status === "ON DUTY" ? "OFF DUTY" : "ON DUTY",
                }
              : spec,
          ),
        };
      }),
    );
  };

  async function saveHospital(id: string) {
    const hospital = hospitals.find((h) => h.id === id);
    if (!hospital) return;
    setSaving(id);
    try {
      const updates = {
        icuAvailable: hospital.icuAvailable,
        icuTotal: hospital.icuTotal,
        oxygenBeds: hospital.oxygenBeds,
        generalBeds: hospital.generalBeds,
        specialists: hospital.specialists,
      };
      const res = await fetch("/api/hospitals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, updates }),
      });
      if (res.ok) {
        const data = await res.json();
        setHospitals((prev) => prev.map((h) => (h.id === id ? data : h)));
      } else {
        // ignore
      }
    } catch (err) {
      // ignore
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <div>
        <Panel title="Hospital Inventory">
          <div className="space-y-4 p-4">
            {hospitals.map((h) => (
              <div
                key={h.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {h.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">{h.hub}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => saveHospital(h.id)}
                      disabled={saving === h.id}
                      className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white"
                    >
                      {saving === h.id ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <BedControl
                    bed={{
                      key: "icu",
                      label: "ICU Beds",
                      available: h.icuAvailable,
                      capacity: h.icuTotal,
                    }}
                    onChange={(delta) =>
                      updateHospitalField(
                        h.id,
                        "icuAvailable",
                        Math.max(
                          0,
                          Math.min(h.icuTotal, h.icuAvailable + delta),
                        ),
                      )
                    }
                  />
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      ICU Capacity
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateHospitalField(
                            h.id,
                            "icuTotal",
                            Math.max(1, h.icuTotal - 1),
                          )
                        }
                        className="rounded-md border px-2"
                      >
                        -
                      </button>
                      <p className="font-mono text-lg font-bold">
                        {h.icuTotal}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          updateHospitalField(h.id, "icuTotal", h.icuTotal + 1)
                        }
                        className="rounded-md border px-2"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <BedControl
                    bed={{
                      key: "oxygen",
                      label: "Oxygen Beds",
                      available: h.oxygenBeds,
                    }}
                    onChange={(delta) =>
                      updateHospitalField(
                        h.id,
                        "oxygenBeds",
                        Math.max(0, h.oxygenBeds + delta),
                      )
                    }
                  />
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <BedControl
                    bed={{
                      key: "general",
                      label: "General Beds",
                      available: h.generalBeds,
                    }}
                    onChange={(delta) =>
                      updateHospitalField(
                        h.id,
                        "generalBeds",
                        Math.max(0, h.generalBeds + delta),
                      )
                    }
                  />
                </div>

                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Specialists
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {h.specialists.map((spec) => (
                      <button
                        type="button"
                        key={spec.role}
                        onClick={() => toggleSpecialistStatus(h.id, spec.role)}
                        className="text-left"
                      >
                        <StatusTag
                          tone={spec.status === "ON DUTY" ? "safe" : "critical"}
                          label={`${spec.role}: ${spec.status}`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] text-slate-400">
                    Tap specialist to toggle duty status before saving.
                  </p>
                </div>
              </div>
            ))}
            {hospitals.length === 0 ? (
              <p className="text-sm text-slate-400">No hospitals available.</p>
            ) : null}
          </div>
        </Panel>
      </div>

      <div>
        <Panel
          title="Incoming Emergency Radar"
          action={
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-red-600">
              <Radio
                className="h-3.5 w-3.5 motion-safe:animate-pulse"
                aria-hidden="true"
              />
              {units.length} LIVE
            </span>
          }
        >
          <div className="t911-stagger grid grid-cols-1 gap-3 p-4 lg:grid-cols-2">
            {units.map((u) => (
              <RadarCard key={u.id} unit={u} />
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
