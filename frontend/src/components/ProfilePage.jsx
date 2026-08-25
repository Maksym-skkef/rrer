import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Toaster } from "./ui/sonner";
import { toast } from "sonner";
import {
  ArrowLeft, User, BellRing, Euro, DoorOpen, Mail, Crown,
  Save, MapPin, Calendar,
} from "lucide-react";

const DISTRICTS = ["Altona", "Eimsbüttel", "St. Pauli", "Winterhude", "Barmbek", "Wandsbek", "Harburg", "HafenCity"];

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notify, setNotify] = useState({ email: true, push: true, wbs: false });
  const [filters, setFilters] = useState(() => {
    try {
      const raw = localStorage.getItem("profile_filters");
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return { minPrice: "", maxPrice: "1500", minRooms: "1", maxRooms: "3", districts: ["Altona", "Eimsbüttel"] };
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/profile");
        const p = res.data || {};
        setNotify((n) => ({ ...n, email: !!p.notifications_enabled }));
        setFilters((f) => ({
          ...f,
          minPrice: p.min_price ?? "",
          maxPrice: p.max_price ?? f.maxPrice,
          minRooms: p.min_rooms ?? f.minRooms,
          maxRooms: p.max_rooms ?? f.maxRooms,
        }));
      } catch (_) {}
    };
    load();
  }, []);

  const toggleDistrict = (d) =>
    setFilters((f) => ({
      ...f,
      districts: f.districts.includes(d) ? f.districts.filter((x) => x !== d) : [...f.districts, d],
    }));

  const save = async () => {
    try { localStorage.setItem("profile_filters", JSON.stringify(filters)); } catch (_) {}
    try {
      await api.put("/api/profile", {
        notifications_enabled: notify.email,
        min_price: filters.minPrice === "" ? null : parseFloat(filters.minPrice),
        max_price: filters.maxPrice === "" ? null : parseFloat(filters.maxPrice),
        min_rooms: filters.minRooms === "" ? null : parseFloat(filters.minRooms),
        max_rooms: filters.maxRooms === "" ? null : parseFloat(filters.maxRooms),
      });
      toast.success("Налаштування збережено — сповіщення оновлено");
    } catch (_) {
      toast.error("Не вдалося зберегти. Спробуйте ще раз.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" richColors />
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-[68px] flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-10 h-10 rounded-xl border border-border bg-card hover:bg-secondary transition-colors flex items-center justify-center"
            data-testid="back-button"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-heading text-xl font-bold tracking-tight">Профіль і фільтри</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Account card */}
        <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center">
            <User size={26} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading font-semibold truncate">{user?.email}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Crown size={14} className="text-primary" /> {user?.role === "admin" ? "Адміністратор" : "Активна підписка"}</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> до 31.12.2026</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <section className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <BellRing size={18} className="text-primary" />
            <h2 className="font-heading font-semibold">Сповіщення про нові квартири</h2>
          </div>
          <div className="space-y-1">
            <ToggleRow icon={Mail} label="Email-сповіщення" desc="Wohnung mieten Hamburg на пошту" checked={notify.email} onChange={(v) => setNotify((n) => ({ ...n, email: v }))} testid="toggle-email" />
            <ToggleRow icon={BellRing} label="Push-сповіщення" desc="Миттєві сповіщення у браузері" checked={notify.push} onChange={(v) => setNotify((n) => ({ ...n, push: v }))} testid="toggle-push" />
            <ToggleRow icon={MapPin} label="Лише WBS / соціальне житло" desc="Соціальне житло Гамбург (WBS)" checked={notify.wbs} onChange={(v) => setNotify((n) => ({ ...n, wbs: v }))} testid="toggle-wbs" />
          </div>
        </section>

        {/* Filters */}
        <section className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-heading font-semibold mb-5">Критерії пошуку для сповіщень</h2>

          <div className="grid sm:grid-cols-2 gap-5">
            <FieldPair icon={Euro} title="Ціна, € (Kaltmiete)" a={{ label: "Від", value: filters.minPrice, key: "minPrice", ph: "0" }} b={{ label: "До", value: filters.maxPrice, key: "maxPrice", ph: "1500" }} setFilters={setFilters} />
            <FieldPair icon={DoorOpen} title="Кімнати (Zimmer)" a={{ label: "Від", value: filters.minRooms, key: "minRooms", ph: "1" }} b={{ label: "До", value: filters.maxRooms, key: "maxRooms", ph: "3" }} setFilters={setFilters} />
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={15} className="text-primary" />
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Райони Гамбурга</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {DISTRICTS.map((d) => {
                const active = filters.districts.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDistrict(d)}
                    data-testid={`district-${d}`}
                    className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                      active
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background text-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={save}
            data-testid="save-profile"
            className="mt-7 h-12 px-6 rounded-xl bg-primary text-primary-foreground font-medium hover:brightness-105 active:scale-[0.98] transition-[transform,filter] duration-200 flex items-center gap-2 shadow-sm"
          >
            <Save size={18} /> Зберегти налаштування
          </button>
        </section>
      </main>
    </div>
  );
}

function ToggleRow({ icon: Icon, label, desc, checked, onChange, testid }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-primary">
          <Icon size={17} />
        </span>
        <div>
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} data-testid={testid} />
    </div>
  );
}

function FieldPair({ icon: Icon, title, a, b, setFilters }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={15} className="text-primary" />
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">{title}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[a, b].map((f) => (
          <div key={f.key}>
            <Label className="text-xs text-muted-foreground mb-1.5 block">{f.label}</Label>
            <Input
              type="number"
              value={f.value}
              placeholder={f.ph}
              onChange={(e) => setFilters((prev) => ({ ...prev, [f.key]: e.target.value }))}
              className="h-11 rounded-xl bg-background"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
