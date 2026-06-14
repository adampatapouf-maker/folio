"use client";
import { useEffect } from "react";
import { useFolioStore } from "@/store/useFolioStore";
import { TopBar } from "./TopBar";
import { TabBar } from "./TabBar";
import { MoreSheet } from "./MoreSheet";
import { AddAssetSheet } from "./AddAssetSheet";
import { Toast } from "./Toast";
import { TutorialOverlay } from "./TutorialOverlay";
import { ScreenRouter } from "./ScreenRouter";
import { OnboardingScreen } from "@/screens/OnboardingScreen";

export function AppShell() {
  const hydrated = useFolioStore((s) => s.hydrated);
  const theme = useFolioStore((s) => s.theme);
  const view = useFolioStore((s) => s.view);
  const onboarded = useFolioStore((s) => s.onboarded);

  // Apply theme to <html> and the meta theme-color (mirrors applyTheme()).
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0A0B0F" : "#EAEEF5");
  }, [theme]);

  // Register the PWA service worker.
  useEffect(() => {
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  // Reset scroll on view changes.
  useEffect(() => {
    const c = document.getElementById("content");
    if (c) c.scrollTop = 0;
  }, [view]);

  // Avoid hydration mismatch: render nothing until persisted state is loaded.
  if (!hydrated) {
    return <div className="app" aria-hidden />;
  }

  const showOnboarding = !onboarded && view !== "builder";

  return (
    <div className="app">
      <div className="main">
        <TopBar />
        <div className="content" id="content">
          {showOnboarding ? <OnboardingScreen /> : <ScreenRouter />}
        </div>
      </div>
      <TabBar />
      <MoreSheet />
      <AddAssetSheet />
      <TutorialOverlay />
      <Toast />
    </div>
  );
}
