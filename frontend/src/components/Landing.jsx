import React from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { HERO_IMAGE, CITY_IMAGE, BUILDING_IMAGE } from "@/mock/data";
import {
  Building2, ArrowRight, BellRing, Search, Zap, ShieldCheck,
  MapPin, CheckCircle2, Send, Home, DoorOpen, Users, Star,
} from "lucide-react";

const SITES = [
  { name: "Immomio", desc: "Централізовані заявки на квартири в Гамбурзі" },
  { name: "ImmoScout24", desc: "Найбільший портал нерухомості в Німеччині" },
  { name: "WG-Gesucht", desc: "Оренда кімнати Гамбург (WG) для студентів" },
  { name: "SAGA", desc: "Соціальне житло Гамбург (WBS)" },
  { name: "Immonet", desc: "Immo Hamburg — квартири та будинки" },
  { name: "eBay Kleinanzeigen", desc: "Приватні оголошення Unterkunft Hamburg" },
];

const STEPS = [
  { icon: Search, title: "Ми скануємо джерела", text: "Сервіс цілодобово перевіряє Immomio та інші сайти для пошуку квартири в Німеччині." },
  { icon: BellRing, title: "Ви отримуєте сповіщення", text: "Push та email-сповіщення про нові оголошення Wohnung mieten Hamburg — за секунди." },
  { icon: Zap, title: "Ви подаєте заявку першими", text: "Швидкість вирішує все. Зняти житло Гамбург простіше, коли ви бачите оголошення раніше за інших." },
];

const FAQ = [
  { q: "Як знайти квартиру в Гамбурзі?", a: "Найкраще працює комбінація: реєстрація на Immomio, ImmoScout24 і WG-Gesucht плюс автоматичний моніторинг нових оголошень. hamburgscan надсилає сповіщення про кожну нову квартиру, щоб ви подавали заявку першими." },
  { q: "Що таке WBS і соціальне житло Гамбург?", a: "WBS (Wohnberechtigungsschein) — це довідка про право на соціальне житло Гамбург. З нею ви можете орендувати субсидовані квартири, зокрема від компанії SAGA." },
  { q: "Скільки коштує оренда житла в Німеччині для українців?", a: "Kaltmiete (холодна оренда) у Гамбурзі зазвичай починається від 480 € за кімнату (WG) і від 700–900 € за 1–2-кімнатну квартиру. До ціни додаються комунальні (Nebenkosten)." },
  { q: "Що означає довгострокова оренда Гамбург?", a: "Це стандартний безстроковий договір (unbefristeter Mietvertrag). Саме такі квартири ми моніторимо, щоб ви знайшли стабільне житло в Німеччині Гамбург." },
];

function Nav() {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
            <Building2 size={20} strokeWidth={2.2} />
          </div>
          <span className="font-heading font-bold tracking-tight">hamburgscan</span>
        </div>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
          <a href="#how" className="hover:text-foreground transition-colors">Як це працює</a>
          <a href="#sites" className="hover:text-foreground transition-colors">Сайти пошуку</a>
          <a href="#faq" className="hover:text-foreground transition-colors">Питання</a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/login"
            className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:brightness-105 active:scale-[0.98] transition-[transform,filter] duration-200 flex items-center gap-1.5 shadow-sm"
          >
            Увійти <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-0 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[130px]" />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-14 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
              <MapPin size={15} /> Гамбург · Німеччина
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
              Пошук та оренда житла в Гамбурзі
            </h1>
            <p className="text-lg text-muted-foreground mt-5 leading-relaxed">
              Шукаєте житло в Німеччині? hamburgscan миттєво знаходить нові оголошення про
              оренду квартир та кімнат у Гамбурзі. Корисні поради, ресурси та допомога з
              орендою для українців — <span className="text-foreground font-medium">Wohnung mieten Hamburg</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link
                to="/login"
                className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-medium hover:brightness-105 active:scale-[0.98] transition-[transform,filter] duration-200 flex items-center justify-center gap-2 shadow-sm"
              >
                Почати пошук квартири <ArrowRight size={18} />
              </Link>
              <a
                href="https://t.me/albina_pay"
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 px-6 rounded-xl border border-border bg-card font-medium hover:bg-secondary transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Send size={17} className="text-primary" /> Telegram-підтримка
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-success" /> Оренда кімнати Гамбург (WG)</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-success" /> Соціальне житло (WBS)</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-success" /> Довгострокова оренда</span>
            </div>
          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="rounded-3xl overflow-hidden border border-border shadow-2xl">
              <img
                src={HERO_IMAGE}
                alt="Оренда житла в Гамбурзі, Німеччина — Elbphilharmonie"
                className="w-full h-[420px] object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -left-3 bg-card border border-border rounded-2xl shadow-xl p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                <BellRing size={22} />
              </div>
              <div>
                <p className="font-bold font-heading leading-none">37 нових</p>
                <p className="text-xs text-muted-foreground mt-1">квартир сьогодні</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-y border-border bg-secondary/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Home, value: "892", label: "квартир на місяць" },
            { icon: DoorOpen, value: "6", label: "джерел оголошень" },
            { icon: Zap, value: "< 60 с", label: "швидкість сповіщень" },
            { icon: Users, value: "1 200+", label: "українців знайшли житло" },
          ].map((s, i) => (
            <div key={i}>
              <s.icon size={22} className="text-primary mx-auto" />
              <p className="font-heading text-2xl font-bold mt-2">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl font-bold tracking-tight">Як знайти квартиру в Німеччині швидко</h2>
          <p className="text-muted-foreground mt-3">
            Ринок оренди Гамбурга дуже конкурентний. Наш сервіс автоматизує пошук квартири
            Гамбург Німеччина, щоб ви не пропустили жодного оголошення.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {STEPS.map((s, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-accent text-accent-foreground flex items-center justify-center">
                <s.icon size={24} />
              </div>
              <div className="flex items-center gap-2 mt-5">
                <span className="text-sm font-bold text-primary">0{i + 1}</span>
                <h3 className="font-heading font-semibold">{s.title}</h3>
              </div>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SITES */}
      <section id="sites" className="bg-secondary/40 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="rounded-3xl overflow-hidden border border-border shadow-xl">
                <img src={CITY_IMAGE} alt="Speicherstadt Гамбург — оренда житла в Німеччині" className="w-full h-[360px] object-cover" />
              </div>
            </div>
            <div>
              <h2 className="font-heading text-3xl font-bold tracking-tight">
                Основні сайти для пошуку квартири в Німеччині
              </h2>
              <p className="text-muted-foreground mt-3">
                Ми моніторимо провідні платформи, щоб знайти вам зняти житло Гамбург та
                довгострокову оренду Гамбург у режимі реального часу.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mt-6">
                {SITES.map((s, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-colors">
                    <p className="font-semibold flex items-center gap-1.5">
                      <ShieldCheck size={16} className="text-primary" /> {s.name}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-center">
          Часті питання про оренду житла Гамбург
        </h2>
        <div className="mt-10 space-y-4">
          {FAQ.map((f, i) => (
            <details key={i} className="group bg-card border border-border rounded-2xl p-5 open:shadow-md transition-shadow">
              <summary className="cursor-pointer font-heading font-semibold flex items-center justify-between list-none">
                {f.q}
                <ArrowRight size={18} className="text-primary group-open:rotate-90 transition-transform duration-200" />
              </summary>
              <p className="text-muted-foreground mt-3 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent p-10 sm:p-14 text-center">
          <img src={BUILDING_IMAGE} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-10" />
          <div className="relative">
            <Star size={28} className="text-primary mx-auto" />
            <h2 className="font-heading text-3xl font-bold tracking-tight mt-4">
              Оренда житла в Німеччині для українців
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Приєднуйтесь до сервісу hamburgscan і першими дізнавайтесь про нові квартири.
              Unterkunft Hamburg, Zimmer mieten Hamburg, WG Hamburg — усе в одному місці.
            </p>
            <Link
              to="/login"
              className="inline-flex mt-7 h-12 px-7 rounded-xl bg-primary text-primary-foreground font-medium hover:brightness-105 active:scale-[0.98] transition-[transform,filter] duration-200 items-center gap-2 shadow-sm"
            >
              Знайти житло зараз <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                <Building2 size={18} />
              </div>
              <span className="font-heading font-bold">hamburgscan</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Пошук та оренда житла в Гамбурзі · Wohnung mieten Hamburg · WG Hamburg · Immo Hamburg
            </p>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-6">
            © {new Date().getFullYear()} hamburgscan. Сервіс моніторингу оренди житла в Німеччині (Гамбург).
          </p>
        </div>
      </footer>
    </div>
  );
}
