"use client";
import { useEffect, useState } from "react";
import { useFolioStore } from "@/store/useFolioStore";

export function Toast() {
  const toast = useFolioStore((s) => s.toast);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: "calc(78px + env(safe-area-inset-bottom))",
        transform: `translateX(-50%) translateY(${visible ? "0" : "20px"})`,
        background: "var(--panel)",
        color: "var(--panelink)",
        padding: "12px 18px",
        borderRadius: 14,
        fontSize: 13.5,
        fontWeight: 600,
        boxShadow: "0 10px 30px rgba(0,0,0,.3)",
        zIndex: 80,
        opacity: visible ? 1 : 0,
        transition: "opacity .25s, transform .25s",
        maxWidth: "86%",
        display: "flex",
        alignItems: "center",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      {toast.emoji && <span style={{ fontSize: 16 }}>{toast.emoji}</span>}
      <span>{toast.msg}</span>
    </div>
  );
}
