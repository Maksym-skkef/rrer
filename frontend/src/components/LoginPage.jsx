import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import ThemeToggle from "./ThemeToggle";
import { Lock, Mail, Building2, ArrowRight, Send, Crown, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Navigate only after the auth context has committed the user.
  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) setError(result.error || "Помилка входу");
  };

  const fillDemo = () => {
    setEmail("admin@hamburg-scanner.com");
    setPassword("admin123");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-32 -left-24 w-[380px] h-[380px] rounded-full bg-chart-2/15 blur-[120px]" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
            <Building2 size={20} strokeWidth={2.2} />
          </div>
          <span className="font-heading font-bold tracking-tight">hamburgscan</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="hidden sm:flex h-10 px-3 rounded-xl border border-border bg-card text-sm font-medium hover:bg-secondary transition-colors items-center gap-1.5"
          >
            <ArrowLeft size={16} /> На головну
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-heading text-4xl font-bold tracking-tight">Вхід до кабінету</h1>
            <p className="text-muted-foreground mt-2">
              hamburgscan · Моніторинг оренди житла в Гамбурзі
            </p>
          </div>

          <div className="bg-card border border-border/60 rounded-2xl shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-5" data-testid="login-form">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-2 block">
                  E-Mail
                </Label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@hamburg-scanner.com"
                    required
                    className="h-12 rounded-xl bg-background pl-11 focus-visible:ring-2 focus-visible:ring-primary"
                    data-testid="login-email-input"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-2 block">
                  Пароль
                </Label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-12 rounded-xl bg-background pl-11 focus-visible:ring-2 focus-visible:ring-primary"
                    data-testid="login-password-input"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3" data-testid="login-error">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium hover:brightness-105 active:scale-[0.99] transition-[transform,filter] duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                data-testid="login-submit-button"
              >
                {loading ? "Входимо…" : "Увійти"}
                {!loading && <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform duration-200" />}
              </button>
            </form>

            <button
              type="button"
              onClick={fillDemo}
              className="mt-3 w-full text-xs text-muted-foreground hover:text-primary transition-colors"
              data-testid="demo-fill"
            >
              Демо-доступ: admin@hamburg-scanner.com / admin123
            </button>
          </div>

          <div className="mt-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">або</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <a
              href="https://t.me/albina_pay"
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full h-12 rounded-xl bg-card border border-primary/40 text-foreground font-medium hover:bg-primary/5 hover:border-primary active:scale-[0.99] transition-[transform,background-color,border-color] duration-200 flex items-center justify-center gap-2.5 shadow-sm"
              data-testid="buy-subscription-button"
            >
              <Crown size={18} className="text-primary" />
              Придбати підписку
              <Send size={17} className="text-primary group-hover:translate-x-0.5 transition-transform duration-200" />
            </a>
            <p className="text-center text-xs text-muted-foreground mt-2">
              Доступ через Telegram @albina_pay
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
