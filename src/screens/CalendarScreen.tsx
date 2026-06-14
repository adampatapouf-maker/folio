"use client";
import { useState } from "react";
import { useFolioStore } from "@/store/useFolioStore";
import { CALENDAR, BANK_LOGO, CAL_META, CAL_IMG } from "@/data/calendar";
import { Icon } from "@/components/ui/Icon";
import { LogoTile } from "@/components/ui/LogoTile";
import type { CalendarEvent, CalendarType } from "@/lib/types";

const FILTERS: [string, string, string][] = [
  ["all", "Vše", "📅"],
  ["earnings", "Výsledky", "📊"],
  ["exdiv", "Ex-dividenda", "✂️"],
  ["divpay", "Výplaty", "💸"],
  ["rate", "Sazby", "🏦"],
];

/** Central-bank logo (Clearbit) with a 🏦 fallback. Mirrors `bankLogo()`. */
function BankLogo({ bank, size = 44 }: { bank: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const domain = BANK_LOGO[bank];
  const fs = Math.round(size * 0.42);

  if (domain && !failed) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 13,
          background: "#fff",
          border: "1px solid rgba(0,0,0,.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          overflow: "hidden",
          boxShadow: "0 3px 9px rgba(0,0,0,.1)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://logo.clearbit.com/${domain}?size=80`}
          alt=""
          style={{ width: "72%", height: "72%", objectFit: "contain" }}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 13,
        background: "linear-gradient(135deg,#7B61FF,#7B61FFcc)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: fs,
        flexShrink: 0,
      }}
    >
      🏦
    </div>
  );
}

function rateColor(fc?: string, prev?: string): string {
  return parseFloat(fc ?? "") < parseFloat(prev ?? "") ? "var(--limedeep)" : "var(--coral)";
}

function calImg(type: CalendarType, i: number): string {
  const arr = CAL_IMG[type];
  return arr[i % arr.length];
}

function EventCard({ e, ei }: { e: CalendarEvent; ei: number }) {
  const openAsset = useFolioStore((s) => s.openAsset);
  const m = CAL_META[e.type];

  const left =
    e.type === "rate" ? (
      <BankLogo bank={e.bank ?? ""} size={46} />
    ) : e.sym ? (
      <LogoTile sym={e.sym} size={46} radius={13} />
    ) : (
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 13,
          background: m.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        {m.emoji}
      </div>
    );

  const impact = (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          style={{ width: 5, height: 5, borderRadius: "50%", background: i <= e.impact ? m.color : "var(--line)" }}
        />
      ))}
    </span>
  );

  let detail: React.ReactNode = null;
  if (e.type === "earnings") {
    detail = (
      <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 11.5 }}>
        <span style={{ color: "var(--ink2)" }}>
          Oček. EPS <b style={{ color: "var(--ink)" }}>{e.eps}</b>
        </span>
        <span style={{ color: "var(--ink2)" }}>
          Tržby <b style={{ color: "var(--ink)" }}>{e.rev}</b>
        </span>
      </div>
    );
  } else if (e.type === "exdiv" || e.type === "divpay") {
    detail = (
      <div style={{ marginTop: 6, fontSize: 11.5, color: "var(--ink2)" }}>
        Dividenda <b style={{ color: "var(--limedeep)" }}>{e.amt}</b> / akcie
      </div>
    );
  } else if (e.type === "rate") {
    detail = (
      <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 11.5 }}>
        <span style={{ color: "var(--ink2)" }}>
          Současná <b style={{ color: "var(--ink)" }}>{e.prev}</b>
        </span>
        <span style={{ color: "var(--ink2)" }}>
          Očekává se <b style={{ color: rateColor(e.fc, e.prev) }}>{e.fc}</b>
        </span>
      </div>
    );
  }

  const photo = (
    <div style={{ position: "relative", height: 74, overflow: "hidden", background: m.color }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://images.unsplash.com/${calImg(e.type, ei)}?w=520&q=70&auto=format&fit=crop`}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: 0.92 }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to right,${m.color}cc 0%,${m.color}44 55%,transparent 100%)`,
        }}
      />
      <div style={{ position: "absolute", left: 12, top: 10, display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{ fontSize: 20, filter: "drop-shadow(0 1px 2px rgba(0,0,0,.3))" }}>{m.emoji}</span>
        <span className="chip" style={{ background: "rgba(255,255,255,.92)", color: m.color, fontSize: 9.5, padding: "2px 8px", fontWeight: 800 }}>
          {m.label}
        </span>
      </div>
      <span
        style={{
          position: "absolute",
          right: 12,
          bottom: 9,
          fontSize: 10.5,
          color: "#fff",
          fontWeight: 800,
          display: "inline-flex",
          alignItems: "center",
          gap: 3,
          background: "rgba(0,0,0,.28)",
          padding: "3px 8px",
          borderRadius: 7,
        }}
      >
        <Icon name="clock" size={11} color="#fff" stroke={2.2} /> {e.time}
      </span>
    </div>
  );

  const body = (
    <>
      {photo}
      <div style={{ display: "flex", gap: 13, padding: "13px 14px", alignItems: "flex-start" }}>
        {left}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            {impact}
            {e.sym && <span style={{ fontSize: 11, fontWeight: 800, color: m.color }}>${e.sym}</span>}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>{e.title}</div>
          <div style={{ fontSize: 11.5, color: "var(--ink2)" }}>{e.sub}</div>
          {detail}
        </div>
      </div>
    </>
  );

  const cardStyle: React.CSSProperties = {
    width: "100%",
    textAlign: "left",
    display: "block",
    padding: 0,
    borderRadius: 16,
    overflow: "hidden",
    background: "var(--surface)",
    border: "1px solid var(--line)",
    marginBottom: 10,
  };

  if (e.sym) {
    const sym = e.sym;
    return (
      <button onClick={() => openAsset(sym)} className="pressable lift" style={cardStyle}>
        {body}
      </button>
    );
  }
  return <div style={cardStyle}>{body}</div>;
}

export function CalendarScreen() {
  const filt = useFolioStore((s) => s.calFilter);
  const setCalFilter = useFolioStore((s) => s.setCalFilter);

  const list = filt === "all" ? CALENDAR : CALENDAR.filter((e) => e.type === filt);

  // group by date (preserving order)
  const groups: { date: string; d: string; evs: CalendarEvent[] }[] = [];
  list.forEach((e) => {
    const g = groups.find((x) => x.date === e.date);
    if (g) g.evs.push(e);
    else groups.push({ date: e.date, d: e.d, evs: [e] });
  });

  return (
    <div className="fade" style={{ maxWidth: 760, margin: "0 auto" }}>
      <div className="sub">Ekonomické události</div>
      <div className="h1" style={{ marginBottom: 4 }}>
        Kalendář
      </div>
      <div style={{ fontSize: 14, color: "var(--ink2)", marginBottom: 18 }}>
        Výsledky firem, ex-dividendy, výplaty a rozhodnutí centrálních bank (FED, ECB, BoE).
      </div>

      {/* upcoming rate banner (3 central banks) */}
      <div className="hscroll" style={{ display: "flex", gap: 10, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {(["FED", "ECB", "BoE"] as const).map((b) => {
          const ev = CALENDAR.find((e) => e.type === "rate" && e.bank === b);
          if (!ev) return null;
          return (
            <div key={b} className="card lift" style={{ flex: "0 0 200px", padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
              <BankLogo bank={b} size={42} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800 }}>{b}</div>
                <div style={{ fontSize: 11, color: "var(--ink2)" }}>
                  {ev.date} · {ev.prev} → <b style={{ color: rateColor(ev.fc, ev.prev) }}>{ev.fc}</b>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* filter pills */}
      <div className="hscroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 18 }}>
        {FILTERS.map(([key, label, emoji]) => {
          const on = filt === key;
          return (
            <button
              key={key}
              onClick={() => setCalFilter(key)}
              className="pressable"
              style={{
                padding: "8px 14px",
                borderRadius: 20,
                fontSize: 12.5,
                fontWeight: 700,
                whiteSpace: "nowrap",
                background: on ? "var(--lime)" : "var(--surface)",
                color: on ? "var(--inkfix)" : "var(--ink)",
                border: `1px solid ${on ? "var(--lime)" : "var(--line)"}`,
              }}
            >
              {emoji} {label}
            </button>
          );
        })}
      </div>

      {/* grouped event list */}
      {groups.map((g) => (
        <div key={g.date} style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10, position: "sticky", top: 0 }}>
            <div style={{ width: 46, textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 10, color: "var(--ink3)", fontWeight: 800, textTransform: "uppercase" }}>{g.d}</div>
              <div className="fd" style={{ fontSize: 20, fontWeight: 600, lineHeight: 1 }}>
                {g.date.replace(".", "")}
              </div>
            </div>
            <div style={{ height: 1, flex: 1, background: "var(--line)" }} />
          </div>
          {g.evs.map((e, ei) => (
            <EventCard key={`${e.date}-${e.type}-${e.title}`} e={e} ei={ei} />
          ))}
        </div>
      ))}

      <div className="disc" style={{ textAlign: "center", marginTop: 6 }}>
        Termíny i odhady jsou pro toto demo simulované. Ověř si data u oficiálních zdrojů.
      </div>
    </div>
  );
}
