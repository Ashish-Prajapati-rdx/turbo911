"use client";

import { useState } from "react";
import { Ambulance, Stethoscope, Building2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "ambulance" | "doctor" | "command";

const ROLES: { id: Role; label: string; icon: typeof Ambulance }[] = [
  { id: "ambulance", label: "Ambulance Hub", icon: Ambulance },
  { id: "doctor", label: "ER Doctor", icon: Stethoscope },
  { id: "command", label: "Hospital Command", icon: Building2 },
];

function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
      />
    </label>
  );
}

export function StaffLogin() {
  const [role, setRole] = useState<Role>("ambulance");
  const [email, setEmail] = useState("");
  const [vehicleReg, setVehicleReg] = useState("");
  const [passcode, setPasscode] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<{
    type: "idle" | "ok" | "error";
    message?: string;
  }>({ type: "idle" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ type: "idle" });

    const payload: any = { role };
    if (role === "ambulance") {
      payload.email = email;
      payload.vehicleReg = vehicleReg;
      payload.passcode = passcode;
    } else {
      payload.email = email;
      payload.password = password;
    }

    try {
      const res = await fetch(`/api/staff/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: "ok", message: data.message || "Authenticated" });
      } else {
        setStatus({
          type: "error",
          message: data.message || "Invalid credentials",
        });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Network error" });
    }
  }

  return (
    <div className="flex justify-center p-6">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
        <header className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-5 py-4">
          <ShieldCheck className="h-4 w-4 text-red-600" aria-hidden="true" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-700">
            Secure Staff Access
          </h2>
        </header>

        <div className="p-5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Select Role
          </p>
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const active = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-center text-[11px] font-medium transition-all duration-200 active:scale-[0.97]",
                    active
                      ? "border-red-200 bg-red-50 text-red-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {r.label}
                </button>
              );
            })}
          </div>

          <form
            key={role}
            className="t911-view mt-5 flex flex-col gap-4"
            onSubmit={handleSubmit}
          >
            {role === "ambulance" ? (
              <>
                <Field
                  label="Ambulance Email"
                  type="email"
                  placeholder="unit@turbo911.in"
                  value={email}
                  onChange={setEmail}
                />
                <Field
                  label="Vehicle Registration Number"
                  placeholder="MP-09-AB-1234"
                  value={vehicleReg}
                  onChange={setVehicleReg}
                />
                <Field
                  label="Secret Passcode"
                  type="password"
                  placeholder="••••••••"
                  value={passcode}
                  onChange={setPasscode}
                />
              </>
            ) : (
              <>
                <Field
                  label="Official Email"
                  type="email"
                  placeholder="staff@turbo911.in"
                  value={email}
                  onChange={setEmail}
                />
                <Field
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={setPassword}
                />
              </>
            )}

            <button
              type="submit"
              className="mt-1 w-full rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold uppercase tracking-widest text-white shadow-sm transition-all duration-200 hover:bg-red-700 active:scale-[0.98]"
            >
              Authenticate
            </button>

            {status.type === "ok" && (
              <p className="mt-3 text-sm text-green-700">
                {status.message ?? "Authenticated"}
              </p>
            )}
            {status.type === "error" && (
              <p className="mt-3 text-sm text-red-700">
                {status.message ?? "Authentication failed"}
              </p>
            )}
          </form>

          <p className="mt-4 text-center text-[11px] text-slate-400">
            Authorized personnel only. All access is logged and monitored.
          </p>
        </div>
      </div>
    </div>
  );
}
