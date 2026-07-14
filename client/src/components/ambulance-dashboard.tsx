"use client";

import { useState, useEffect, useMemo } from "react";
import { Minus, Plus, Truck, Hospital as HospitalIcon } from "lucide-react";
import {
  type EmergencyBooking,
  type Triage,
  type Hospital,
  type IncomingUnit,
} from "@/lib/turbo911-data";
import { Panel, StatusTag } from "./primitives";
import { cn } from "@/lib/utils";

type Vital = {
  key: string;
  label: string;
  unit: string;
  value: number;
  step: number;
};

const TRIAGE: { id: Triage; label: string; desc: string }[] = [
  {
    id: "CRITICAL",
    label: "CRITICAL",
    desc: "Life-threatening — immediate intervention",
  },
  { id: "SERIOUS", label: "SERIOUS", desc: "Urgent care required" },
  { id: "STABLE", label: "STABLE", desc: "Monitored transport" },
];

const bookingStatusCopy: Record<EmergencyBooking["status"], string> = {
  requested: "Request received",
  accepted: "Ambulance is coming",
  patient_received: "Patient is in ambulance",
  completed: "Patient arrived at hospital",
};

const bookingStatusTone: Record<
  EmergencyBooking["status"],
  "critical" | "safe" | "neutral" | "warn"
> = {
  requested: "warn",
  accepted: "safe",
  patient_received: "critical",
  completed: "neutral",
};

function VitalBlock({
  vital,
  onChange,
}: {
  vital: Vital;
  onChange: (delta: number) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-white">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        {vital.label}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onChange(-vital.step)}
          aria-label={`Decrease ${vital.label}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-all duration-150 hover:border-slate-400 hover:text-slate-900 active:scale-90"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <p
          key={vital.value}
          className="t911-pop font-mono text-3xl font-bold tabular-nums text-slate-900"
        >
          {vital.value}
        </p>
        <button
          type="button"
          onClick={() => onChange(vital.step)}
          aria-label={`Increase ${vital.label}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-all duration-150 hover:border-slate-400 hover:text-slate-900 active:scale-90"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <p className="mt-1 text-center font-mono text-[10px] uppercase text-slate-400">
        {vital.unit}
      </p>
    </div>
  );
}

export function AmbulanceDashboard() {
  const [ambulances, setAmbulances] = useState<IncomingUnit[]>([]);
  const [bookings, setBookings] = useState<EmergencyBooking[]>([]);
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState("");
  const [savingAmbulanceId, setSavingAmbulanceId] = useState<string | null>(
    null,
  );
  const [bookingActionId, setBookingActionId] = useState<string | null>(null);
  const [triage, setTriage] = useState<Triage>("CRITICAL");
  const [target, setTarget] = useState("");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [vitals, setVitals] = useState<Vital[]>([
    { key: "hr", label: "Heart Rate", unit: "BPM", value: 138, step: 1 },
    {
      key: "bp",
      label: "Blood Pressure",
      unit: "mmHg (SYS)",
      value: 92,
      step: 2,
    },
    {
      key: "spo2",
      label: "Oxygen Saturation",
      unit: "SpO2 %",
      value: 88,
      step: 1,
    },
    { key: "rr", label: "Respiratory Rate", unit: "rpm", value: 26, step: 1 },
  ]);

  const updateVital = (key: string, delta: number) =>
    setVitals((prev) =>
      prev.map((v) =>
        v.key === key ? { ...v, value: Math.max(0, v.value + delta) } : v,
      ),
    );

  const fetchAmbulances = () =>
    fetch("/api/ambulances")
      .then((r) => r.json())
      .then((data: IncomingUnit[]) => {
        setAmbulances(data || []);
        if (!selectedAmbulanceId && data && data.length) {
          setSelectedAmbulanceId(data[0].id);
        }
      })
      .catch(() => {});

  const fetchBookings = () =>
    fetch("/api/booking")
      .then((r) => r.json())
      .then((data: EmergencyBooking[]) => setBookings(data || []))
      .catch(() => {});

  useEffect(() => {
    let mounted = true;
    fetch("/api/hospitals")
      .then((r) => r.json())
      .then((data: Hospital[]) => {
        if (!mounted) return;
        setHospitals(data || []);
        if (!target && data && data.length) setTarget(data[0].id);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [target]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/ambulances")
      .then((r) => r.json())
      .then((data: IncomingUnit[]) => {
        if (!mounted) return;
        setAmbulances(data || []);
        if (!selectedAmbulanceId && data && data.length) {
          setSelectedAmbulanceId(data[0].id);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [selectedAmbulanceId]);

  useEffect(() => {
    let mounted = true;
    const load = () => {
      fetch("/api/booking")
        .then((r) => r.json())
        .then((data: EmergencyBooking[]) => {
          if (!mounted) return;
          setBookings(data || []);
        })
        .catch(() => {});
    };

    load();
    const id = setInterval(load, 3000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const selectedAmbulance =
    ambulances.find((a) => a.id === selectedAmbulanceId) ?? ambulances[0];

  const selectedBooking = useMemo(
    () =>
      bookings.find(
        (booking) => booking.ambulanceId === selectedAmbulance?.id,
      ),
    [bookings, selectedAmbulance?.id],
  );

  const selectedBookingHospital =
    hospitals.find((h) => h.id === selectedBooking?.hospitalId) ??
    hospitals.find((h) => h.id === target);

  const toggleAmbulanceStatus = (id: string) => {
    setAmbulances((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: a.status === "AVAILABLE" ? "BUSY" : "AVAILABLE",
            }
          : a,
      ),
    );
  };

  async function saveAmbulanceStatus(id: string) {
    const ambulance = ambulances.find((a) => a.id === id);
    if (!ambulance) return;
    setSavingAmbulanceId(id);
    try {
      const res = await fetch("/api/ambulances", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, updates: { status: ambulance.status } }),
      });
      if (res.ok) {
        const data = await res.json();
        setAmbulances((prev) => prev.map((a) => (a.id === id ? data : a)));
      }
    } catch {
      // ignore
    } finally {
      setSavingAmbulanceId(null);
    }
  }

  async function updateBooking(
    bookingId: string,
    action: string,
    hospitalId?: string,
  ) {
    setBookingActionId(`${bookingId}:${action}`);
    try {
      const res = await fetch("/api/booking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          action,
          hospitalId: hospitalId ?? target,
        }),
      });
      if (res.ok) {
        await Promise.all([fetchBookings(), fetchAmbulances()]);
      }
    } catch {
      // ignore
    } finally {
      setBookingActionId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Status strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-slate-500" aria-hidden="true" />
          <span className="font-mono text-sm text-slate-700">
            {selectedAmbulance
              ? selectedAmbulance.vehicle
              : "Loading ambulance..."}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              selectedAmbulance && toggleAmbulanceStatus(selectedAmbulance.id)
            }
            disabled={!selectedAmbulance}
            className={cn(
              "rounded-md px-5 py-2 text-xs font-semibold uppercase tracking-widest transition-all duration-200 active:scale-[0.97]",
              selectedAmbulance?.status === "AVAILABLE"
                ? "bg-emerald-600 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-500 hover:text-slate-800",
            )}
          >
            Available
          </button>
          <button
            type="button"
            onClick={() =>
              selectedAmbulance && toggleAmbulanceStatus(selectedAmbulance.id)
            }
            disabled={!selectedAmbulance}
            className={cn(
              "flex items-center gap-2 rounded-md px-5 py-2 text-xs font-semibold uppercase tracking-widest transition-all duration-200 active:scale-[0.97]",
              selectedAmbulance?.status === "BUSY"
                ? "bg-red-600 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-500 hover:text-slate-800",
            )}
          >
            {selectedAmbulance?.status === "BUSY" ? "Busy" : "Busy"}
          </button>
        </div>
      </div>

      <Panel title="Ambulance Requests">
        <div className="grid grid-cols-1 gap-3 p-4 lg:grid-cols-2">
          {bookings.map((booking) => {
            const ambulance = ambulances.find(
              (a) => a.id === booking.ambulanceId,
            );
            const hospital = hospitals.find((h) => h.id === booking.hospitalId);
            return (
              <article
                key={booking.bookingId}
                className={cn(
                  "rounded-lg border p-4 transition-all",
                  selectedAmbulanceId === booking.ambulanceId
                    ? "border-red-300 bg-red-50"
                    : "border-slate-200 bg-slate-50",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {booking.patientName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {ambulance?.vehicle ?? booking.ambulanceId}
                    </p>
                    <p className="text-xs text-slate-500">
                      To {hospital?.name ?? booking.hospitalId}
                    </p>
                  </div>
                  <StatusTag
                    tone={bookingStatusTone[booking.status]}
                    label={bookingStatusCopy[booking.status]}
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAmbulanceId(booking.ambulanceId);
                      updateBooking(booking.bookingId, "accept");
                    }}
                    disabled={
                      booking.status !== "requested" ||
                      bookingActionId === `${booking.bookingId}:accept`
                    }
                    className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {bookingActionId === `${booking.bookingId}:accept`
                      ? "Accepting..."
                      : "Accept Request"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAmbulanceId(booking.ambulanceId);
                      updateBooking(booking.bookingId, "receive_patient");
                    }}
                    disabled={
                      booking.status !== "accepted" ||
                      bookingActionId ===
                        `${booking.bookingId}:receive_patient`
                    }
                    className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-700 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {bookingActionId ===
                    `${booking.bookingId}:receive_patient`
                      ? "Updating..."
                      : "Patient Received"}
                  </button>
                </div>
              </article>
            );
          })}
          {bookings.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm text-slate-400">
              No active ambulance requests.
            </p>
          ) : null}
        </div>
      </Panel>

      {/* Triage selectors */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Patient Triage Assessment
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {TRIAGE.map((t) => {
            const active = triage === t.id;
            const isCritical = t.id === "CRITICAL";
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTriage(t.id)}
                className={cn(
                  "relative flex flex-col items-start gap-2 overflow-hidden rounded-lg border p-4 text-left transition-all duration-200 active:scale-[0.98]",
                  active &&
                    isCritical &&
                    "t911-sweep border-red-300 bg-red-50 shadow-sm",
                  active &&
                    t.id === "SERIOUS" &&
                    "border-amber-300 bg-amber-50 shadow-sm",
                  active &&
                    t.id === "STABLE" &&
                    "border-emerald-300 bg-emerald-50 shadow-sm",
                  !active &&
                    "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm",
                )}
              >
                <div className="flex items-center gap-2">
                  {isCritical && active ? (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 motion-safe:animate-ping" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      "font-mono text-lg font-bold uppercase tracking-wider",
                      active && isCritical && "text-red-600",
                      active && t.id === "SERIOUS" && "text-amber-600",
                      active && t.id === "STABLE" && "text-emerald-600",
                      !active && "text-slate-500",
                    )}
                  >
                    {t.label}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-[11px]",
                    active ? "text-slate-600" : "text-slate-400",
                  )}
                >
                  {t.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Telemetry board */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Live Telemetry Monitor
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {vitals.map((v) => (
            <VitalBlock
              key={v.key}
              vital={v}
              onChange={(delta) => updateVital(v.key, delta)}
            />
          ))}
        </div>
      </div>

      <div>
        <Panel title="Ambulance Fleet">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {ambulances.map((a) => (
              <div
                key={a.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {a.vehicle}
                    </h3>
                    <p className="text-xs text-slate-500">{a.hub}</p>
                  </div>
                  <StatusTag
                    tone={a.status === "AVAILABLE" ? "safe" : "critical"}
                    label={a.status}
                  />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleAmbulanceStatus(a.id)}
                    className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-700 transition-all duration-200 hover:bg-slate-100"
                  >
                    Toggle Status
                  </button>
                  <button
                    type="button"
                    onClick={() => saveAmbulanceStatus(a.id)}
                    disabled={savingAmbulanceId === a.id}
                    className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white transition-all duration-200 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingAmbulanceId === a.id ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            ))}
            {ambulances.length === 0 ? (
              <p className="col-span-full py-10 text-center text-sm text-slate-400">
                No ambulances available.
              </p>
            ) : null}
          </div>
        </Panel>
      </div>

      <div>
        <Panel title="Receiving Hospital Handshake">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
            <label className="block flex-1">
              <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                <HospitalIcon className="h-3 w-3" aria-hidden="true" />
                Target Facility
              </span>
              <select
                value={selectedBooking?.hospitalId ?? target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900 transition-colors focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
              >
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} — {h.hub} ({h.icuAvailable} ICU)
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() =>
                selectedBooking &&
                updateBooking(
                  selectedBooking.bookingId,
                  "complete_handshake",
                  selectedBooking.hospitalId,
                )
              }
              disabled={
                !selectedBooking ||
                selectedBooking.status !== "patient_received" ||
                bookingActionId ===
                  `${selectedBooking.bookingId}:complete_handshake`
              }
              className="rounded-md bg-red-600 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-white shadow-sm transition-all duration-200 hover:bg-red-700 active:scale-[0.98]"
            >
              {selectedBookingHospital
                ? `Handshake ${selectedBookingHospital.name}`
                : "Transmit Handshake"}
            </button>
          </div>
          <div className="border-t border-slate-200 px-4 py-3">
            <p className="text-xs text-slate-500">
              {selectedBooking
                ? `Current request: ${bookingStatusCopy[selectedBooking.status]}`
                : "Select an active request before hospital handshake."}
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
