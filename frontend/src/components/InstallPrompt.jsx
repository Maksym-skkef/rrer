import React, { useEffect, useState } from "react";
import { Download, X, Building2 } from "lucide-react";

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("hs_install_dismissed");
    if (!dismissed) {
      const t = setTimeout(() => setVisible(true), 3500);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem("hs_install_dismissed", "1"); } catch (_) {}
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md animate-fade-up">
      <div className="bg-card border border-border rounded-2xl shadow-xl p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
          <Building2 size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">Встановити застосунок</p>
          <p className="text-xs text-muted-foreground truncate">
            Отримуйте push-сповіщення про нові квартири
          </p>
        </div>
        <button
          onClick={dismiss}
          className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-105 transition-[filter] duration-200 flex items-center gap-1.5"
        >
          <Download size={15} />
        </button>
        <button onClick={dismiss} aria-label="Закрити" className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
