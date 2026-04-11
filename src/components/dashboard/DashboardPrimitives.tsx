import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function formatCalculationPreview(result: unknown): string {
  return formatCalculationPreviewWithOptions(result, {});
}

export function formatCalculationPreviewWithOptions(
  result: unknown,
  options: {
    fallbackText?: string;
    localeTag?: string;
    keyLabels?: Record<string, string>;
  },
): string {
  const {
    fallbackText = "Calculation saved successfully.",
    localeTag = "en-IN",
    keyLabels = {},
  } = options;

  if (!result || typeof result !== "object") {
    return fallbackText;
  }

  const record = result as Record<string, unknown>;
  const preferredKeys = [
    "recommendedCoverage",
    "recommendedSumInsured",
    "taxSavings",
    "annualPremium",
    "hlvResult",
  ];

  for (const key of preferredKeys) {
    const value = record[key];
    if (typeof value === "number") {
      const label = keyLabels[key] ?? key;
      return `${label}: ${value.toLocaleString(localeTag)}`;
    }
  }

  const compact = JSON.stringify(result);
  return compact.length > 110 ? `${compact.slice(0, 110)}...` : compact;
}

export function getScanBadge(
  score?: number | null,
  labels: {
    analyzing: string;
    lowRisk: string;
    moderateRisk: string;
    highRisk: string;
  } = {
    analyzing: "Analyzing",
    lowRisk: "Low Risk",
    moderateRisk: "Moderate Risk",
    highRisk: "High Risk",
  },
): {
  label: string;
  className: string;
} {
  const copy = labels;

  if (score == null) {
    return {
      label: copy.analyzing,
      className: "text-slate-500 bg-slate-500/5 border-slate-500/10",
    };
  }

  if (score >= 70) {
    return {
      label: copy.lowRisk,
      className: "text-success-500 bg-success-50 border-success-500/25",
    };
  }

  if (score >= 40) {
    return {
      label: copy.moderateRisk,
      className: "text-amber-500 bg-amber-500/5 border-amber-500/20",
    };
  }

  return {
    label: copy.highRisk,
    className: "text-rose-500 bg-rose-500/5 border-rose-500/20",
  };
}

export function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="glass-strong rounded-3xl p-6 border border-default hover:shadow-2xl transition-all duration-500 overflow-hidden relative group">
      <div
        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-[0.03] group-hover:opacity-10 transition-opacity -mr-8 -mt-8 rounded-full`}
      />
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform`}
        >
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-bold text-theme-muted uppercase tracking-widest">
            {label}
          </p>
          <p className="text-2xl font-display font-bold text-theme-primary">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ShortcutItem({
  icon,
  label,
  href,
}: {
  icon: ReactNode;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-3.5 rounded-xl hover:bg-accent/5 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="text-theme-muted group-hover:text-accent transition-colors">
          {icon}
        </div>
        <span className="text-sm font-medium text-theme-secondary group-hover:text-theme-primary transition-colors">
          {label}
        </span>
      </div>
      <ArrowRight className="w-4 h-4 text-theme-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
    </Link>
  );
}

export function EmptyState({
  icon,
  title,
  desc,
  btnText,
  btnHref,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  btnText: string;
  btnHref: string;
}) {
  return (
    <div className="glass-strong rounded-3xl p-10 text-center border border-dashed border-default">
      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-theme-primary">{title}</h3>
      <p className="text-theme-muted text-sm mt-1 max-w-xs mx-auto">{desc}</p>
      <Link
        href={btnHref}
        className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-accent text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all"
      >
        {btnText} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
