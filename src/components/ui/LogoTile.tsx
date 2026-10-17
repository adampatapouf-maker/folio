import { ASSETS } from "@/data/assets";
import { catColor } from "@/lib/assets";
import type { AssetCategory } from "@/lib/types";

interface TileProps {
  label: string;
  color: string;
  size: number;
  radius: number;
  title?: string;
}

/** Monogram tile: ticker letters on the category color. */
function Monogram({ label, color, size, radius, title }: TileProps) {
  const fs = Math.round(size * (label.length <= 2 ? 0.4 : label.length === 3 ? 0.32 : 0.26));
  return (
    <div
      role="img"
      aria-label={title ?? label}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: `linear-gradient(140deg, ${color}, ${color}d0)`,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontSize: fs,
        fontWeight: 800,
        letterSpacing: "-.02em",
        boxShadow: `0 3px 10px ${color}40, inset 0 1px 0 rgba(255,255,255,.25)`,
      }}
    >
      {label}
    </div>
  );
}

/**
 * Asset logo. Self-contained monogram — no third-party logo CDN (the Clearbit
 * logo API the prototype used has been retired), so tiles render instantly,
 * offline and without leaking which assets a user looks at.
 */
export function LogoTile({ sym, size = 44, radius = 13 }: { sym: string; size?: number; radius?: number }) {
  const asset = ASSETS.find((x) => x.sym === sym);
  const cat: AssetCategory = asset?.cat ?? "Akciové ETF";
  return <Monogram label={sym.slice(0, 4)} color={catColor(cat)} size={size} radius={radius} title={asset?.name} />;
}

/** Central-bank tile for rate-decision events. */
export function BankTile({ bank, size = 40, radius = 12 }: { bank: string; size?: number; radius?: number }) {
  return <Monogram label={bank} color="#7B61FF" size={size} radius={radius} title={bank} />;
}
