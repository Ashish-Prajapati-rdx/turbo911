import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function Panel({
  title,
  children,
  className,
  action,
}: {
  title?: string
  children: ReactNode
  className?: string
  action?: ReactNode
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md",
        className,
      )}
    >
      {title ? (
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">{title}</h2>
          {action}
        </header>
      ) : null}
      {children}
    </section>
  )
}

export function StatusTag({
  label,
  tone,
  pulse,
}: {
  label: string
  tone: "critical" | "safe" | "neutral" | "warn"
  pulse?: boolean
}) {
  const tones = {
    critical: "border-red-200 bg-red-50 text-red-700",
    safe: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warn: "border-amber-200 bg-amber-50 text-amber-700",
    neutral: "border-slate-200 bg-slate-100 text-slate-600",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide transition-colors",
        tones[tone],
      )}
    >
      {pulse ? (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 motion-safe:animate-ping" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
        </span>
      ) : null}
      {label}
    </span>
  )
}

export function Metric({
  label,
  value,
  unit,
}: {
  label: string
  value: ReactNode
  unit?: string
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 transition-colors hover:bg-white">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 font-mono text-2xl font-semibold text-slate-900">
        {value}
        {unit ? <span className="ml-1 text-sm text-slate-400">{unit}</span> : null}
      </p>
    </div>
  )
}
