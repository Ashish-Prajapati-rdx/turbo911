"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  MapPin,
  Navigation,
  Truck,
  Building,
  Ambulance,
  CheckCircle2,
  User,
  Loader2,
  Hospital as HospitalIcon,
} from "lucide-react";
import {
  type EmergencyBooking,
  INDORE_HUBS,
  type Hospital,
  type IncomingUnit,
} from "@/lib/turbo911-data";
import { Panel, StatusTag } from "./primitives";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "t911_active_booking";

function GoogleMapEmbed({ mapUrl, name }: { mapUrl: string; name: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg">
      <iframe
        title={`${name} - Google Maps`}
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0, minHeight: "180px" }}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="rounded-lg"
      />
    </div>
  );
}

function HospitalCard({
  hospital,
  selected,
  onSelect,
}: {
  hospital: Hospital;
  selected: boolean;
  onSelect: () => void;
}) {
  const icuTone =
    hospital.icuAvailable === 0
      ? "critical"
      : hospital.icuAvailable <= 3
        ? "warn"
        : "safe";

  const [showMap, setShowMap] = useState(false);

  return (
    <div
      className={cn(
        "group relative w-full rounded-xl border-2 transition-all duration-300 overflow-hidden",
        selected
          ? "border-red-500 shadow-lg shadow-red-100 ring-1 ring-red-200"
          : "border-slate-200 hover:border-slate-300 hover:shadow-md",
      )}
    >
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={hospital.imageUrl}
          alt={hospital.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
            <MapPin className="h-3 w-3 text-red-500" />
            {hospital.distanceKm.toFixed(1)} km
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
            <Navigation className="h-3 w-3 text-blue-500" />
            ETA {hospital.etaMin} min
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-base font-bold text-white drop-shadow-md">
            {hospital.name}
          </h3>
          <p className="flex items-center gap-1 text-xs text-white/80">
            <MapPin className="h-3 w-3" />
            {hospital.hub}
          </p>
        </div>
        {selected && (
          <div className="absolute right-3 top-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-sm">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </span>
          </div>
        )}
      </div>
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-1.5">
          <StatusTag
            tone={icuTone}
            label={`ICU: ${hospital.icuAvailable}/${hospital.icuTotal}`}
          />
          <StatusTag
            tone={hospital.oxygenBeds > 0 ? "safe" : "critical"}
            label={`Oxygen: ${hospital.oxygenBeds}`}
          />
          <StatusTag
            tone="neutral"
            label={`General: ${hospital.generalBeds}`}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {hospital.specialists.map((spec) => (
            <StatusTag
              key={spec.role}
              tone={spec.status === "ON DUTY" ? "safe" : "critical"}
              label={`${spec.role.split(" ")[0]}: ${spec.status === "ON DUTY" ? "✅" : "❌"}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMap(!showMap);
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200",
              showMap
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700",
            )}
          >
            <MapPin className="h-3.5 w-3.5" />
            {showMap ? "Hide Map" : "View Location"}
          </button>
          <button
            type="button"
            onClick={onSelect}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200",
              selected
                ? "bg-red-500 text-white hover:bg-red-600"
                : "border border-slate-200 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600",
            )}
          >
            {selected ? "Selected ✓" : "Select Hospital"}
          </button>
        </div>
        {showMap && (
          <div className="h-48 w-full overflow-hidden rounded-lg border border-slate-200 transition-all duration-300">
            <GoogleMapEmbed
              mapUrl={hospital.mapEmbedUrl}
              name={hospital.name}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function AmbulanceCard({
  ambulance,
  selected,
  booked,
  onSelect,
}: {
  ambulance: IncomingUnit;
  selected: boolean;
  booked?: boolean;
  onSelect: () => void;
}) {
  const isAvailable = ambulance.status === "AVAILABLE";
  const statusTone =
    ambulance.triage === "CRITICAL"
      ? "critical"
      : ambulance.triage === "SERIOUS"
        ? "warn"
        : "safe";

  return (
    <button
      type="button"
      onClick={isAvailable ? onSelect : undefined}
      disabled={!isAvailable}
      className={cn(
        "w-full text-left rounded-lg border p-4 transition-all duration-300",
        isAvailable
          ? "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          : "cursor-not-allowed opacity-70",
        booked
          ? "border-emerald-500 bg-emerald-50"
          : !isAvailable
            ? "border-slate-200 bg-slate-100"
            : selected
              ? "border-red-500 bg-red-50"
              : "border-slate-200 bg-white",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            {ambulance.vehicle}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
            <Truck className="h-3 w-3" />
            {ambulance.hub}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm font-semibold text-slate-800">
            ETA {Math.ceil(ambulance.etaSeconds / 60)} min
          </p>
          <p className="font-mono text-[11px] text-slate-400">
            Triage {ambulance.triage}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <StatusTag tone={statusTone} label={`Patient: ${ambulance.triage}`} />
        <StatusTag
          tone={isAvailable ? "safe" : "critical"}
          label={isAvailable ? "Available" : "Not Available"}
        />
        <StatusTag tone="neutral" label={`HR ${ambulance.hr}`} />
        <StatusTag tone="neutral" label={`SpO₂ ${ambulance.spo2}%`} />
        {booked ? <StatusTag tone="safe" label="Booked" /> : null}
      </div>
    </button>
  );
}

const STATUS_STEPS = [
  {
    key: "requested",
    label: "Request Sent",
    icon: (p: any) => (
      <svg
        className={p.className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
        />
      </svg>
    ),
  },
  {
    key: "accepted",
    label: "Ambulance Accepted",
    icon: (p: any) => <Truck className={p.className} />,
  },
  {
    key: "patient_received",
    label: "Patient Onboard",
    icon: (p: any) => <User className={p.className} />,
  },
  {
    key: "completed",
    label: "Arrived at Hospital",
    icon: (p: any) => <HospitalIcon className={p.className} />,
  },
] as const;

type ActiveBooking = {
  bookingId: string;
  ambulanceId: string;
  hospitalId: string;
  patientName: string;
  status: EmergencyBooking["status"];
};

const bookingStatusCopy: Record<EmergencyBooking["status"], string> = {
  requested: "Request sent to ambulance. Waiting for accept.",
  accepted: "Ambulance is booked and on the way.",
  patient_received: "You are in the ambulance. The crew has received you.",
  completed: "You have arrived at the hospital. Hospital handoff is complete.",
};

function PatientStatusCard({
  bookingInfo,
  bookingResult,
  hospitals,
  ambulances,
  onDismiss,
}: {
  bookingInfo: ActiveBooking;
  bookingResult: string;
  hospitals: Hospital[];
  ambulances: IncomingUnit[];
  onDismiss: () => void;
}) {
  const hospital = hospitals.find((h) => h.id === bookingInfo.hospitalId);
  const ambulance = ambulances.find((a) => a.id === bookingInfo.ambulanceId);
  const isCompleted = bookingInfo.status === "completed";
  const currentStepIdx = STATUS_STEPS.findIndex(
    (s) => s.key === bookingInfo.status,
  );

  return (
    <div className="rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-white p-5 shadow-lg shadow-red-100/50">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <Ambulance className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Patient Status</h3>
            <p className="font-mono text-[10px] text-slate-500">
              #{bookingInfo.bookingId.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
            isCompleted
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700",
          )}
        >
          {isCompleted ? "Completed" : "In Progress"}
        </span>
      </div>

      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600">
            <User className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {bookingInfo.patientName}
            </p>
            <p className="text-xs text-slate-500">
              {ambulance?.vehicle ?? "Ambulance"} →{" "}
              {hospital?.name ?? "Hospital"}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 space-y-0">
        {STATUS_STEPS.map((step, idx) => {
          const isActive = idx <= currentStepIdx;
          const isCurrent = idx === currentStepIdx;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full transition-all duration-500",
                    isActive
                      ? "bg-red-500 text-white"
                      : "bg-slate-100 text-slate-400",
                    isCurrent && "ring-2 ring-red-200 ring-offset-2",
                  )}
                >
                  {isActive && idx < currentStepIdx ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        isCurrent && !isCompleted && "animate-pulse",
                      )}
                    />
                  )}
                </div>
                {idx < STATUS_STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mt-1 h-8 w-0.5",
                      idx < currentStepIdx ? "bg-red-300" : "bg-slate-200",
                    )}
                  />
                )}
              </div>
              <div className="pb-6 pt-1">
                <p
                  className={cn(
                    "text-xs font-medium",
                    isActive ? "text-slate-900" : "text-slate-400",
                  )}
                >
                  {step.label}
                </p>
                {isCurrent && !isCompleted && (
                  <div className="mt-1 flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin text-red-500" />
                    <span className="text-[11px] text-red-600">
                      {bookingResult}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isCompleted && (
        <button
          type="button"
          onClick={onDismiss}
          className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700 transition-all hover:bg-emerald-100"
        >
          ✓ Patient Arrived - Dismiss
        </button>
      )}
    </div>
  );
}

export function CitizenPortal() {
  const [query, setQuery] = useState("");
  const [activeHubs, setActiveHubs] = useState<string[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [ambulances, setAmbulances] = useState<IncomingUnit[]>([]);
  const [ambulancesLoading, setAmbulancesLoading] = useState(true);
  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Simple booking state
  const [bookingInfo, setBookingInfoState] = useState<ActiveBooking | null>(
    null,
  );
  const [bookingResult, setBookingResult] = useState<string | null>(null);
  const bookingInfoRef = useRef<ActiveBooking | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as ActiveBooking;
        setBookingInfoState(saved);
        setBookingResult(bookingStatusCopy[saved.status]);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Save to localStorage whenever bookingInfo changes
  const setBookingInfo = useCallback((data: ActiveBooking | null) => {
    setBookingInfoState(data);
    if (data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const toggleHub = (hub: string) =>
    setActiveHubs((prev) =>
      prev.includes(hub) ? prev.filter((h) => h !== hub) : [...prev, hub],
    );

  const filtered = useMemo(
    () =>
      hospitals.filter((h) => {
        const matchesHub =
          activeHubs.length === 0 || activeHubs.includes(h.hub);
        const matchesQuery = h.name.toLowerCase().includes(query.toLowerCase());
        return matchesHub && matchesQuery;
      }),
    [query, activeHubs, hospitals],
  );

  const selectedHospital =
    hospitals.find((h) => h.id === selectedHospitalId) ?? hospitals[0];

  const availableAmbulances = useMemo(
    () => ambulances.filter((a) => a.status === "AVAILABLE"),
    [ambulances],
  );
  const selectedAmbulance =
    availableAmbulances.find((a) => a.id === selectedAmbulanceId) ??
    availableAmbulances[0];

  const nearestAmbulance = useMemo(
    () =>
      availableAmbulances.reduce<IncomingUnit | undefined>(
        (best, current) =>
          !best || current.etaSeconds < best.etaSeconds ? current : best,
        undefined,
      ),
    [availableAmbulances],
  );

  const activeBooking = bookingInfo && bookingInfo.status !== "completed";
  const canBook =
    Boolean(selectedHospital && selectedAmbulance) &&
    !bookingLoading &&
    !activeBooking;

  // Simple fetch ambulances - MUST return promise chain for .finally()
  const fetchAmbulances = useCallback(() => {
    return fetch("/api/ambulances")
      .then((r) => r.json())
      .then((data: IncomingUnit[]) => {
        const next = data || [];
        setAmbulances(next);
        setSelectedAmbulanceId((current) => {
          const stillAvailable = next.some(
            (a) => a.id === current && a.status === "AVAILABLE",
          );
          if (stillAvailable) return current;
          return next.find((a) => a.status === "AVAILABLE")?.id ?? "";
        });
      })
      .catch(() => setAmbulances([]));
  }, []);

  // Load ambulances on mount + poll every 5s
  useEffect(() => {
    setAmbulancesLoading(true);
    fetchAmbulances().finally(() => setAmbulancesLoading(false));
    const id = setInterval(fetchAmbulances, 5000);
    return () => clearInterval(id);
  }, [fetchAmbulances]);

  // Poll booking status every 2 seconds - use ref to avoid stale closures
  useEffect(() => {
    if (!bookingInfo) return;
    const bookingId = bookingInfo.bookingId;
    bookingInfoRef.current = bookingInfo;

    const load = () => {
      fetch(`/api/booking?bookingId=${bookingId}`)
        .then((r) => r.json())
        .then((data: EmergencyBooking) => {
          if (!data?.bookingId) return;

          // Always update result text
          setBookingResult(bookingStatusCopy[data.status]);

          // Use ref to get latest status (avoids stale closure)
          const current = bookingInfoRef.current;
          if (current && data.status !== current.status) {
            setBookingInfoState((prev) => {
              if (!prev || prev.bookingId !== bookingId) return prev;
              const updated = { ...prev, status: data.status };
              localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
              bookingInfoRef.current = updated;
              return updated;
            });
          }

          // If completed, refresh ambulances immediately
          if (data.status === "completed") {
            fetchAmbulances();
          }
        })
        .catch(() => {});
    };

    load();
    const id = setInterval(load, 2000);
    return () => clearInterval(id);
  }, [bookingInfo?.bookingId, fetchAmbulances]);

  // Auto-select first ambulance
  useEffect(() => {
    if (
      selectedAmbulanceId &&
      availableAmbulances.some((a) => a.id === selectedAmbulanceId)
    )
      return;
    setSelectedAmbulanceId(availableAmbulances[0]?.id ?? "");
  }, [availableAmbulances, selectedAmbulanceId]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/hospitals")
      .then((r) => r.json())
      .then((data: Hospital[]) => {
        if (!mounted) return;
        setHospitals(data || []);
        if (!selectedHospitalId && data?.length)
          setSelectedHospitalId(data[0].id);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [selectedHospitalId]);

  async function handleBook() {
    if (!selectedHospital || !selectedAmbulance) return;
    setBookingLoading(true);
    setBookingError(null);

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ambulanceId: selectedAmbulance.id,
          hospitalId: selectedHospital.id,
          patientName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBookingError(data.message || "Booking failed");
      } else {
        setAmbulances((prev) =>
          prev.map((a) =>
            a.id === selectedAmbulance.id ? { ...a, status: "BUSY" } : a,
          ),
        );
        setBookingInfo({
          bookingId: data.bookingId,
          ambulanceId: selectedAmbulance.id,
          hospitalId: selectedHospital.id,
          patientName,
          status: data.status ?? "requested",
        });
        setBookingResult(bookingStatusCopy.requested);
      }
    } catch (err) {
      setBookingError("Unable to submit booking. Try again.");
    } finally {
      setBookingLoading(false);
    }
  }

  const handleDismiss = () => {
    setBookingInfo(null);
    setBookingResult(null);
  };

  const header = bookingInfo ? (
    <span className="flex items-center gap-2 text-xs text-red-600">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
      </span>
      Active Booking
    </span>
  ) : undefined;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[280px_1.25fr_360px]">
      <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="relative block">
          <span className="sr-only">Search hospitals</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search facility..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
          />
        </label>

        <p className="mb-3 mt-5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Indore Hubs
        </p>
        <div className="flex flex-col gap-1.5">
          {INDORE_HUBS.map((hub) => {
            const active = activeHubs.includes(hub);
            return (
              <button
                key={hub}
                type="button"
                onClick={() => toggleHub(hub)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-xs font-medium transition-all duration-200 active:scale-[0.98]",
                  active
                    ? "border-red-200 bg-red-50 text-red-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800",
                )}
              >
                <MapPin className="h-3.5 w-3.5" />
                {hub}
              </button>
            );
          })}
        </div>

        <Panel title="Nearest Ambulance">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            {nearestAmbulance ? (
              <>
                <p className="font-semibold text-slate-900">
                  {nearestAmbulance.vehicle}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Hub: {nearestAmbulance.hub}
                </p>
                <p className="text-sm text-slate-600">
                  ETA: {Math.ceil(nearestAmbulance.etaSeconds / 60)} min
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-red-700">
                  Ambulance Not Available
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  All ambulances are busy right now.
                </p>
              </>
            )}
            <p className="mt-2 text-[11px] text-slate-500">
              Select an ambulance below to book it.
            </p>
          </div>
        </Panel>
      </aside>

      <main className="space-y-4">
        {bookingInfo && (
          <PatientStatusCard
            bookingInfo={bookingInfo}
            bookingResult={bookingResult || ""}
            hospitals={hospitals}
            ambulances={ambulances}
            onDismiss={handleDismiss}
          />
        )}

        <Panel title="Nearby Facilities" action={header}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="mt-1 text-[11px] text-slate-400">
                Choose the hospital you want to send the ambulance to.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 font-mono text-xs text-slate-500">
              <Building className="h-3 w-3" />
              {filtered.length} results
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filtered.map((h) => (
              <HospitalCard
                key={h.id}
                hospital={h}
                selected={h.id === selectedHospitalId}
                onSelect={() => setSelectedHospitalId(h.id)}
              />
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full py-16 text-center text-sm text-slate-400">
                No facilities match your filters.
              </p>
            )}
          </div>
        </Panel>

        <Panel title="Booking Summary">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Selected Hospital
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {selectedHospital?.name}
                </p>
                <p className="text-sm text-slate-500">
                  {selectedHospital?.hub}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Selected Ambulance
                </p>
                {selectedAmbulance ? (
                  <>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {selectedAmbulance.vehicle}
                    </p>
                    <p className="text-sm text-slate-500">
                      ETA {Math.ceil(selectedAmbulance.etaSeconds / 60)} min
                    </p>
                    <div className="mt-3">
                      <StatusTag tone="safe" label="Available" />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-sm font-semibold text-red-700">
                      Ambulance Not Available
                    </p>
                    <p className="text-sm text-slate-500">
                      Busy ambulances cannot be booked.
                    </p>
                  </>
                )}
              </div>
            </div>

            {!bookingInfo && (
              <>
                <label className="block">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Patient Name
                  </span>
                  <input
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter your name"
                    className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-all duration-150 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleBook}
                  disabled={!canBook}
                  className="w-full rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold uppercase tracking-widest text-white shadow-sm transition-all duration-200 hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {bookingLoading
                    ? "Sending Request..."
                    : selectedAmbulance
                      ? "Request Ambulance"
                      : "Ambulance Not Available"}
                </button>
              </>
            )}

            {bookingResult && !bookingInfo && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                <p>{bookingResult}</p>
              </div>
            )}
            {bookingError && (
              <p className="text-sm text-red-700">{bookingError}</p>
            )}
          </div>
        </Panel>
      </main>

      <aside className="space-y-4">
        <Panel title="Available Ambulances">
          <div className="space-y-3">
            {ambulances.map((ambulance) => (
              <AmbulanceCard
                key={ambulance.id}
                ambulance={ambulance}
                selected={ambulance.id === selectedAmbulanceId}
                booked={bookingInfo?.ambulanceId === ambulance.id}
                onSelect={() => setSelectedAmbulanceId(ambulance.id)}
              />
            ))}
            {!ambulancesLoading && ambulances.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-400">
                Ambulance Not Available
              </p>
            )}
            {ambulancesLoading && (
              <p className="py-6 text-center text-sm text-slate-400">
                Loading ambulances...
              </p>
            )}
          </div>
        </Panel>

        <Panel title="Proximity Map">
          <div className="relative h-72 overflow-hidden bg-slate-50">
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgb(226 232 240) 1px, transparent 1px), linear-gradient(to bottom, rgb(226 232 240) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <div className="absolute left-1/2 top-1/2 flex h-3 w-3 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
              <span className="absolute inline-flex h-8 w-8 rounded-full bg-red-500/25 motion-safe:animate-ping" />
              <Navigation className="relative h-4 w-4 text-red-600" />
            </div>
            {filtered.slice(0, 4).map((h, i) => {
              const positions = [
                { top: "18%", left: "28%" },
                { top: "32%", left: "68%" },
                { top: "70%", left: "40%" },
                { top: "58%", left: "78%" },
              ];
              return (
                <div
                  key={h.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={positions[i]}
                >
                  <span className="block h-2.5 w-2.5 rounded-sm border border-emerald-500 bg-emerald-400 shadow-sm" />
                  <span className="mt-1 block whitespace-nowrap font-mono text-[9px] text-slate-500">
                    {h.distanceKm.toFixed(1)}km
                  </span>
                </div>
              );
            })}
          </div>
          <div className="border-t border-slate-200 p-3">
            <p className="text-[11px] text-slate-400">
              Simulated distances from current location.
            </p>
          </div>
        </Panel>
      </aside>
    </div>
  );
}
