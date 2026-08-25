import React, { useState } from "react";
import {
  Building2, RefreshCw, Radio, User, LogOut, ShieldCheck,
  BarChart3, ChevronDown, Menu,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

function timeAgo(iso) {
  if (!iso) return "—";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s} с тому`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} хв тому`;
  const h = Math.floor(m / 60);
  return `${h} год тому`;
}

export default function StatusBar({
  scanStatus, onScanNow, user, onLogout,
  onAdminClick, onProfileClick, onStatsClick,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const online = scanStatus?.is_running;

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-[73px] flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
            <Building2 size={22} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <p className="font-heading font-bold tracking-tight leading-tight truncate">
              hamburgscan
            </p>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${online ? "bg-success animate-pulse-ring" : "bg-muted-foreground"}`} />
              <span className="text-xs text-muted-foreground">
                {online ? "Сканування активне" : "Пауза"}
              </span>
            </div>
          </div>
        </div>

        {/* Center stats — desktop */}
        <div className="hidden md:flex items-center gap-6">
          <div className="text-center">
            <p className="text-lg font-bold font-heading leading-none">{scanStatus?.total_found_today ?? 0}</p>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mt-1">сьогодні</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <p className="text-lg font-bold font-heading leading-none flex items-center gap-1 justify-center">
              <Radio size={15} className="text-success" />
              {scanStatus?.sources_online ?? 0}/{scanStatus?.sources_total ?? 0}
            </p>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mt-1">джерел</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <p className="text-sm font-semibold leading-none">{timeAgo(scanStatus?.last_scan)}</p>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mt-1">остан. скан</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onScanNow}
            data-testid="scan-now-button"
            className="hidden sm:flex h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:brightness-105 active:scale-[0.98] transition-[transform,filter] duration-200 items-center gap-2 shadow-sm"
          >
            <RefreshCw size={16} />
            Сканувати
          </button>
          <ThemeToggle />

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              data-testid="user-menu-button"
              className="h-10 pl-2 pr-2.5 rounded-xl border border-border bg-card hover:bg-secondary transition-colors duration-200 flex items-center gap-2"
            >
              <span className="w-7 h-7 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
                <User size={16} />
              </span>
              <ChevronDown size={15} className="text-muted-foreground hidden sm:block" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-60 z-50 bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-fade-up">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium truncate">{user?.email}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">
                      {user?.role === "admin" ? "Адміністратор" : "Підписник"}
                    </p>
                  </div>
                  <div className="p-1.5">
                    <MenuItem icon={User} label="Профіль і фільтри" onClick={() => { setMenuOpen(false); onProfileClick(); }} testid="menu-profile" />
                    <MenuItem icon={BarChart3} label="Статистика" onClick={() => { setMenuOpen(false); onStatsClick(); }} testid="menu-stats" />
                    {user?.role === "admin" && (
                      <MenuItem icon={ShieldCheck} label="Адмін-панель" onClick={() => { setMenuOpen(false); onAdminClick(); }} testid="menu-admin" />
                    )}
                  </div>
                  <div className="p-1.5 border-t border-border">
                    <MenuItem icon={LogOut} label="Вийти" onClick={() => { setMenuOpen(false); onLogout(); }} danger testid="menu-logout" />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger, testid }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testid}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
        danger ? "text-destructive hover:bg-destructive/10" : "text-foreground hover:bg-secondary"
      }`}
    >
      <Icon size={17} />
      {label}
    </button>
  );
}
