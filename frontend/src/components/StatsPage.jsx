import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import StatsChart from "./StatsChart";
import { ArrowLeft, TrendingUp, Home, CalendarDays, MapPin, Building2 } from "lucide-react";

const DOW = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export default function StatsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/stats/daily", { params: { days: 30 } });
        setData(res.data);
      } catch (_) {} finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const points = data?.points || [];
  const today = points.length ? points[points.length - 1].total : 0;
  const week = points.slice(-7).reduce((s, p) => s + p.total, 0);
  const month = points.reduce((s, p) => s + p.total, 0);

  const byDay = points.slice(-7).map((p) => {
    const d = new Date(p.date + "T00:00:00");
    return { label: DOW[d.getDay()], value: p.total };
  });

  const landlordTotals = {};
  points.forEach((p) => {
    Object.entries(p.byLandlord || {}).forEach(([k, v]) => {
      landlordTotals[k] = (landlordTotals[k] || 0) + v;
    });
  });
  const byLandlord = Object.entries(landlordTotals)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const kpis = [
    { icon: Home, label: "Сьогодні", value: today, hint: "нових квартир" },
    { icon: CalendarDays, label: "За тиждень", value: week, hint: "оголошень" },
    { icon: TrendingUp, label: "За місяць", value: month, hint: "всього" },
    { icon: Building2, label: "Джерел", value: byLandlord.length, hint: "орендодавців" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-[68px] flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-10 h-10 rounded-xl border border-border bg-card hover:bg-secondary transition-colors flex items-center justify-center"
            data-testid="back-button"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-heading text-xl font-bold tracking-tight">Статистика оренди Гамбург</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center">
                <k.icon size={20} />
              </div>
              <p className="font-heading text-3xl font-bold mt-4">{loading ? "…" : k.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{k.label} · {k.hint}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <CalendarDays size={18} className="text-primary" />
            <h2 className="font-heading font-semibold">Знайдено за останні 7 днів</h2>
          </div>
          {byDay.length ? <StatsChart data={byDay} /> : <p className="text-muted-foreground text-sm">Дані з'являться після перших сканувань.</p>}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <MapPin size={18} className="text-primary" />
            <h2 className="font-heading font-semibold">За джерелами (орендодавцями)</h2>
          </div>
          {byLandlord.length ? (
            <StatsChart data={byLandlord} horizontal />
          ) : (
            <p className="text-muted-foreground text-sm">Ще немає даних. Запустіть сканування на дашборді.</p>
          )}
        </div>
      </main>
    </div>
  );
}
