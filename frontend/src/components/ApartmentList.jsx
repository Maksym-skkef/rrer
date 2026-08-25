import React from "react";
import {
  MapPin, Euro, Maximize2, DoorOpen, ExternalLink, Sparkles,
  Clock, BadgeCheck, SearchX, Flame,
} from "lucide-react";
import { APARTMENT_IMAGES } from "@/mock/data";

function timeAgo(iso) {
  if (!iso) return "—";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s} с тому`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} хв тому`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} год тому`;
  return `${Math.floor(h / 24)} дн тому`;
}

function fallbackImage(id) {
  let sum = 0;
  const str = String(id || "");
  for (let i = 0; i < str.length; i++) sum += str.charCodeAt(i);
  return APARTMENT_IMAGES[sum % APARTMENT_IMAGES.length];
}

function isWbs(apt) {
  const t = `${apt.title || ""}`.toLowerCase();
  return /wbs|§\s?5|gefördert|dringlichkeit|wohnberechtig/.test(t);
}

function isNew(apt) {
  if (!apt.found_at) return false;
  return Date.now() - new Date(apt.found_at).getTime() < 24 * 60 * 60 * 1000;
}

function ApartmentCard({ apt }) {
  const img = apt.image_url || fallbackImage(apt.id);
  const source = apt.landlord || "Immo Hamburg";
  return (
    <article
      data-testid="apartment-card"
      className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/40 transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
        <img
          src={img}
          alt={`Оренда квартири в Гамбурзі — ${apt.title || "Wohnung"}`}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = fallbackImage(apt.id); }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {isNew(apt) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-sm">
              <Flame size={12} /> Нове
            </span>
          )}
          {isWbs(apt) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-card/90 backdrop-blur text-accent-foreground text-xs font-semibold border border-primary/20">
              WBS
            </span>
          )}
        </div>
        <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-card/90 backdrop-blur text-xs font-medium border border-border">
          {source}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading font-semibold leading-snug line-clamp-2">{apt.title || "Wohnung in Hamburg"}</h3>
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-2">
          <MapPin size={14} className="shrink-0 text-primary" />
          <span className="truncate">{[apt.district, apt.address].filter(Boolean).join(" · ") || "Hamburg"}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <Metric icon={Euro} label="Miete" value={apt.price ? `€${Math.round(apt.price)}` : "—"} strong />
          <Metric icon={DoorOpen} label="Zimmer" value={apt.rooms ?? "—"} />
          <Metric icon={Maximize2} label="m²" value={apt.area ? Math.round(apt.area) : "—"} />
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock size={13} /> {timeAgo(apt.found_at)}
          </span>
          <a
            href={apt.url}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="apartment-link"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:brightness-105 active:scale-[0.98] transition-[transform,filter] duration-200"
          >
            Деталі <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </article>
  );
}

function Metric({ icon: Icon, label, value, strong }) {
  return (
    <div className="rounded-xl bg-secondary/60 px-2.5 py-2 text-center">
      <div className="flex items-center justify-center gap-1 text-muted-foreground">
        <Icon size={13} />
        <span className="text-[10px] uppercase tracking-wide">{label}</span>
      </div>
      <p className={`mt-0.5 ${strong ? "font-bold text-primary font-heading" : "font-semibold"}`}>{value}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-secondary" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-secondary rounded w-3/4" />
        <div className="h-3 bg-secondary rounded w-1/2" />
        <div className="h-10 bg-secondary rounded" />
      </div>
    </div>
  );
}

export default function ApartmentList({ apartments, loading, view }) {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          {view === "history" ? (
            <Clock size={20} className="text-primary" />
          ) : (
            <Sparkles size={20} className="text-primary" />
          )}
          <h2 className="font-heading text-xl font-bold tracking-tight">
            {view === "history" ? "Історія оголошень" : "Нові квартири в Гамбурзі"}
          </h2>
        </div>
        {!loading && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium">
            <BadgeCheck size={15} />
            {apartments.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : apartments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <SearchX size={30} className="text-muted-foreground" />
          </div>
          <h3 className="font-heading text-lg font-semibold">Нічого не знайдено</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            Спробуйте змінити фільтри ціни чи кількості кімнат. Нові оголошення з'являються тут автоматично.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {apartments.map((apt) => <ApartmentCard key={apt.id} apt={apt} />)}
        </div>
      )}
    </div>
  );
}
