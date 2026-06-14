"use client";
import { useState } from "react";
import { logoDomain, catColor, catEmoji } from "@/lib/assets";
import { ASSETS } from "@/data/assets";
import type { AssetCategory } from "@/lib/types";

interface LogoTileProps {
  sym: string;
  size?: number;
  radius?: number;
}

/**
 * Issuer/company logo chip (Clearbit) with a graceful fallback to the colored
 * category emoji tile. Mirrors the prototype's `logoTile()` + `logoErr()`.
 */
export function LogoTile({ sym, size = 44, radius = 13 }: LogoTileProps) {
  const [failed, setFailed] = useState(false);
  const asset = ASSETS.find((x) => x.sym === sym);
  const cat: AssetCategory = asset?.cat || "Akciové ETF";
  const cc = catColor(cat);
  const emo = catEmoji(cat);
  const fs = Math.round(size * 0.46);
  const domain = logoDomain(sym);

  if (domain && !failed) {
    return (
      <div
        className="logochip"
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          background: "#fff",
          border: "1px solid rgba(0,0,0,.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          overflow: "hidden",
          boxShadow: "0 3px 9px rgba(0,0,0,.10)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://logo.clearbit.com/${domain}?size=80`}
          alt=""
          style={{ width: "74%", height: "74%", objectFit: "contain" }}
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
        borderRadius: radius,
        background: `linear-gradient(135deg,${cc},${cc}cc)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontSize: fs,
        boxShadow: `0 4px 12px ${cc}55`,
      }}
    >
      {emo}
    </div>
  );
}
