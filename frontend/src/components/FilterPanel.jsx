import React from "react";
import { SlidersHorizontal, Clock, Sparkles, RotateCcw, Euro, DoorOpen } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function FilterPanel({ filters, setFilters, view, setView }) {
  const update = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const reset = () =>
    setFilters({ minPrice: "", maxPrice: "", minRooms: "", maxRooms: "" });

  return (
    <div className="p-5 space-y-6">
      {/* View toggle */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-3">
          Ансамбль
        </p>
        <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-xl">
          <button
            type="button"
            onClick={() => setView("new")}
            data-testid="view-new"
            className={`h-10 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
              view === "new" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles size={15} />
            Нові
          </button>
          <button
            type="button"
            onClick={() => setView("history")}
            data-testid="view-history"
            className={`h-10 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
              view === "history" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock size={15} />
            Історія
          </button>
        </div>
      </div>

      {/* Price */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Euro size={15} className="text-primary" />
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Ціна (Kaltmiete)
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Від, €</Label>
            <Input
              type="number"
              value={filters.minPrice}
              onChange={(e) => update("minPrice", e.target.value)}
              placeholder="0"
              className="h-11 rounded-xl bg-background"
              data-testid="filter-min-price"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">До, €</Label>
            <Input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => update("maxPrice", e.target.value)}
              placeholder="2000"
              className="h-11 rounded-xl bg-background"
              data-testid="filter-max-price"
            />
          </div>
        </div>
      </div>

      {/* Rooms */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <DoorOpen size={15} className="text-primary" />
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Кімнати (Zimmer)
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Від</Label>
            <Input
              type="number"
              value={filters.minRooms}
              onChange={(e) => update("minRooms", e.target.value)}
              placeholder="1"
              className="h-11 rounded-xl bg-background"
              data-testid="filter-min-rooms"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">До</Label>
            <Input
              type="number"
              value={filters.maxRooms}
              onChange={(e) => update("maxRooms", e.target.value)}
              placeholder="4"
              className="h-11 rounded-xl bg-background"
              data-testid="filter-max-rooms"
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={reset}
        data-testid="filter-reset"
        className="w-full h-11 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <RotateCcw size={15} />
        Скинути фільтри
      </button>

      <div className="rounded-2xl bg-accent/60 border border-primary/15 p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <SlidersHorizontal size={15} className="text-primary" />
          <p className="text-sm font-semibold text-accent-foreground">Порада</p>
        </div>
        <p className="text-xs text-accent-foreground/80 leading-relaxed">
          Для email-сповіщень про Wohnung mieten Hamburg налаштуйте власні фільтри у розділі
          «Профіль». Тут фільтри діють лише для перегляду.
        </p>
      </div>
    </div>
  );
}
