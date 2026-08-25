import React from "react";
import { LockKeyhole, Crown, LogOut, Send } from "lucide-react";

export default function AccessExpired({ user, onLogout }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center animate-fade-up">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-6">
          <LockKeyhole size={30} strokeWidth={2} />
        </div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Доступ закрито</h1>
        <p className="text-muted-foreground mt-3">
          Термін вашої підписки закінчився. Щоб продовжити отримувати нові оголошення про
          оренду квартир у Гамбурзі, поновіть доступ.
        </p>

        <div className="bg-card border border-border rounded-2xl p-5 mt-6 text-left">
          <p className="text-sm text-muted-foreground">Акаунт</p>
          <p className="font-medium mt-0.5 break-all">{user?.email}</p>
        </div>

        <a
          href="https://t.me/albina_pay"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium hover:brightness-105 active:scale-[0.99] transition-[transform,filter] duration-200 flex items-center justify-center gap-2.5 shadow-sm"
        >
          <Crown size={18} />
          Поновити підписку
          <Send size={17} />
        </a>

        <button
          type="button"
          onClick={onLogout}
          className="mt-3 w-full h-11 rounded-xl border border-border bg-card text-foreground font-medium hover:bg-secondary transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <LogOut size={17} />
          Вийти
        </button>
      </div>
    </div>
  );
}
