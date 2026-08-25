import React from "react";

// Simple, dependency-free bar chart using CSS. Blue-toned.
export default function StatsChart({ data, unit = "", accent = "primary", horizontal = false }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  if (horizontal) {
    return (
      <div className="space-y-3">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-24 text-sm text-muted-foreground truncate shrink-0">{d.label}</span>
            <div className="flex-1 h-7 rounded-lg bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-lg bg-${accent} flex items-center justify-end px-2 transition-[width] duration-700`}
                style={{ width: `${(d.value / max) * 100}%` }}
              >
                <span className="text-xs font-semibold text-primary-foreground">{d.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-end justify-between gap-2 h-52">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
          <span className="text-xs font-semibold text-foreground">{d.value}</span>
          <div
            className="w-full rounded-t-lg bg-primary/80 hover:bg-primary transition-[height,background-color] duration-500"
            style={{ height: `${(d.value / max) * 100}%`, minHeight: "6px" }}
          />
          <span className="text-xs text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
