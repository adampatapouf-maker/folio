"use client";
import { useFolioStore } from "@/store/useFolioStore";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { ViewId } from "@/lib/types";

const TABS: [ViewId | "__more", string, IconName][] = [
  ["dashboard", "Domů", "home"],
  ["report", "Report", "report"],
  ["ai", "Folio AI", "chat"],
  ["portfolio", "Portfolio", "wallet"],
  ["__more", "Více", "hash"],
];

export function TabBar() {
  const view = useFolioStore((s) => s.view);
  const moreOpen = useFolioStore((s) => s.moreOpen);
  const go = useFolioStore((s) => s.go);
  const toggleMore = useFolioStore((s) => s.toggleMore);

  return (
    <nav className="tabbar" id="tabbar">
      {TABS.map(([id, label, icon]) => {
        const active = id === "__more" ? moreOpen : view === id;
        return (
          <button
            key={id}
            className={`tab${active ? " active" : ""}`}
            onClick={() => (id === "__more" ? toggleMore() : go(id as ViewId))}
          >
            <Icon name={icon} size={21} color={active ? "var(--limedeep)" : "var(--ink3)"} stroke={active ? 2.3 : 1.9} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
