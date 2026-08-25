import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api, BACKEND_URL } from "@/lib/api";
import StatusBar from "./StatusBar";
import FilterPanel from "./FilterPanel";
import ApartmentList from "./ApartmentList";
import InstallPrompt from "./InstallPrompt";
import AccessExpired from "./AccessExpired";
import { Toaster } from "./ui/sonner";
import { toast } from "sonner";
import { SlidersHorizontal, X } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [apartments, setApartments] = useState([]);
  const [scanStatus, setScanStatus] = useState(null);
  const [view, setView] = useState("new");
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [filters, setFilters] = useState(() => {
    try {
      const raw = localStorage.getItem("dashboard_filters");
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return { minPrice: "", maxPrice: "", minRooms: "", maxRooms: "" };
  });

  useEffect(() => {
    try { localStorage.setItem("dashboard_filters", JSON.stringify(filters)); } catch (_) {}
  }, [filters]);

  const fetchApartments = useCallback(async () => {
    try {
      const params = { status: view === "history" ? "history" : "new" };
      if (filters.minPrice !== "") params.min_price = parseFloat(filters.minPrice);
      if (filters.maxPrice !== "") params.max_price = parseFloat(filters.maxPrice);
      if (filters.minRooms !== "") params.min_rooms = parseFloat(filters.minRooms);
      if (filters.maxRooms !== "") params.max_rooms = parseFloat(filters.maxRooms);
      const res = await api.get("/api/apartments", { params });
      setApartments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err?.response?.status !== 403) console.error("apartments error", err);
      setApartments([]);
    } finally {
      setLoading(false);
    }
  }, [view, filters]);

  const fetchScanStatus = useCallback(async () => {
    try {
      const res = await api.get("/api/scan-status");
      setScanStatus(res.data);
    } catch (_) {}
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchApartments();
    fetchScanStatus();
    const interval = setInterval(() => {
      fetchApartments();
      fetchScanStatus();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchApartments, fetchScanStatus]);

  // Live updates via WebSocket
  useEffect(() => {
    if (!BACKEND_URL) return;
    const wsUrl = BACKEND_URL.replace(/^http/, "ws") + "/api/ws/apartments";
    let ws, reconnectTimer;
    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);
        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === "new_apartment") {
              const apt = msg.apartment || {};
              toast.success(`Нова квартира: ${(apt.title || "").slice(0, 70)}`);
              fetchApartments();
            } else if (msg.type === "scan_finished") {
              fetchScanStatus();
              if (msg.new_count > 0) fetchApartments();
            }
          } catch (_) {}
        };
        ws.onclose = () => { reconnectTimer = setTimeout(connect, 5000); };
        ws.onerror = () => { try { ws.close(); } catch (_) {} };
      } catch (_) {
        reconnectTimer = setTimeout(connect, 5000);
      }
    };
    connect();
    return () => {
      clearTimeout(reconnectTimer);
      if (ws) { ws.onclose = null; try { ws.close(); } catch (_) {} }
    };
  }, [fetchApartments, fetchScanStatus]);

  const handleScanNow = async () => {
    try {
      await api.post("/api/scan-now");
      toast.success("Сканування запущено — шукаємо нові квартири…");
      setTimeout(() => { fetchApartments(); fetchScanStatus(); }, 6000);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Не вдалося запустити сканування");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (user && user.role !== "admin" && user.access_active === false) {
    return <AccessExpired user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" richColors />
      <InstallPrompt />

      <StatusBar
        scanStatus={scanStatus}
        onScanNow={handleScanNow}
        user={user}
        onLogout={handleLogout}
        onAdminClick={() => navigate("/admin")}
        onProfileClick={() => navigate("/profile")}
        onStatsClick={() => navigate("/stats")}
      />

      <div>
        <div className="lg:hidden sticky top-[73px] z-30 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground font-medium">
            {apartments.length} Wohnungen
          </span>
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            data-testid="mobile-filter-open"
            className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted transition-colors duration-200 flex items-center gap-2"
          >
            <SlidersHorizontal size={15} />
            Фільтри
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 max-w-[1600px] mx-auto">
          <div className="hidden lg:block lg:col-span-3 border-r border-border/60">
            <FilterPanel filters={filters} setFilters={setFilters} view={view} setView={setView} />
          </div>
          <div className="lg:col-span-9">
            <ApartmentList apartments={apartments} loading={loading} view={view} />
          </div>
        </div>

        {mobileFilterOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex" data-testid="mobile-filter-drawer">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
            <div className="relative ml-auto w-[88%] max-w-sm bg-background overflow-y-auto h-full shadow-2xl">
              <div className="sticky top-0 bg-background/90 backdrop-blur-xl border-b border-border/60 px-5 py-4 flex items-center justify-between">
                <span className="font-heading font-semibold">Фільтри</span>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-2 rounded-xl hover:bg-secondary transition-colors duration-200"
                  aria-label="Закрити"
                >
                  <X size={20} />
                </button>
              </div>
              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                view={view}
                setView={(v) => { setView(v); setMobileFilterOpen(false); }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
