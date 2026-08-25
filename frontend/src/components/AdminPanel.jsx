import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Input } from "./ui/input";
import { Toaster } from "./ui/sonner";
import { toast } from "sonner";
import {
  ArrowLeft, ShieldCheck, Search, UserPlus, Users, CheckCircle2,
  XCircle, Crown, Trash2, Calendar,
} from "lucide-react";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/api/admin/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (_) {
      toast.error("Не вдалося завантажити користувачів");
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter((u) => u.email.toLowerCase().includes(query.toLowerCase()));
  const activeCount = users.filter((u) => u.access_active).length;

  const toggleAccess = async (u) => {
    try {
      await api.put(`/api/admin/users/${u.id}/access`, { days: u.access_active ? 0 : 30 });
      toast.success("Статус доступу оновлено");
      load();
    } catch (_) {
      toast.error("Помилка оновлення доступу");
    }
  };
  const removeUser = async (id) => {
    try {
      await api.delete(`/api/admin/users/${id}`);
      toast.success("Користувача видалено");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Помилка видалення");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" richColors />
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-[68px] flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-10 h-10 rounded-xl border border-border bg-card hover:bg-secondary transition-colors flex items-center justify-center"
            data-testid="back-button"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-primary" />
            <h1 className="font-heading text-xl font-bold tracking-tight">Адмін-панель</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard icon={Users} label="Усього користувачів" value={users.length} />
          <StatCard icon={CheckCircle2} label="Активні підписки" value={activeCount} />
          <StatCard icon={Crown} label="Адміністратори" value={users.filter((u) => u.role === "admin").length} />
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Пошук за email…"
                className="h-11 rounded-xl bg-background pl-10"
                data-testid="admin-search"
              />
            </div>
            <button
              onClick={() => toast.info("Демо: додавання користувачів доступне у повній версії")}
              className="h-11 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:brightness-105 transition-[filter] flex items-center justify-center gap-2"
            >
              <UserPlus size={17} /> Додати
            </button>
          </div>

          <div className="divide-y divide-border">
            {filtered.map((u) => (
              <div key={u.id} className="p-4 sm:px-5 flex items-center gap-4" data-testid="user-row">
                <div className="w-10 h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shrink-0 font-semibold">
                  {u.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate flex items-center gap-1.5">
                    {u.email}
                    {u.role === "admin" && <Crown size={14} className="text-primary" />}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Calendar size={12} /> {u.access_expires_at ? `до ${new Date(u.access_expires_at).toLocaleDateString("uk-UA")}` : "безстроково"}
                  </p>
                </div>
                <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                  u.access_active ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                }`}>
                  {u.access_active ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  {u.access_active ? "Активний" : "Закритий"}
                </span>
                <button
                  onClick={() => toggleAccess(u)}
                  data-testid="toggle-access"
                  className="h-9 px-3 rounded-lg border border-border bg-background text-sm font-medium hover:bg-secondary transition-colors"
                >
                  {u.access_active ? "Закрити" : "Відкрити"}
                </button>
                <button
                  onClick={() => removeUser(u.id)}
                  aria-label="Видалити"
                  className="w-9 h-9 rounded-lg border border-border bg-background text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="p-8 text-center text-muted-foreground">Користувачів не знайдено</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="w-10 h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center">
        <Icon size={20} />
      </div>
      <p className="font-heading text-2xl font-bold mt-3">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
