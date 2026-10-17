"use client";
import { useFolioStore } from "@/store/useFolioStore";

/**
 * Render trusted HTML (AI replies, educational copy) and delegate clicks on
 * `$TICKER` chips to open the asset detail.
 */
export function RichText({ html, className, style }: { html: string; className?: string; style?: React.CSSProperties }) {
  const openAsset = useFolioStore((s) => s.openAsset);
  return (
    <span
      className={className}
      style={style}
      onClick={(e) => {
        const el = (e.target as HTMLElement).closest("[data-sym]") as HTMLElement | null;
        if (el?.dataset.sym) {
          e.stopPropagation();
          openAsset(el.dataset.sym);
        }
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
