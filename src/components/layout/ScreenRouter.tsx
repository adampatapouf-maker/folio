"use client";
import { useFolioStore } from "@/store/useFolioStore";

import { DashboardScreen } from "@/screens/DashboardScreen";
import { DataScreen } from "@/screens/DataScreen";
import { AssetDetailScreen } from "@/screens/AssetDetailScreen";
import { AiScreen } from "@/screens/AiScreen";
import { PortfolioScreen } from "@/screens/PortfolioScreen";
import { ReportScreen } from "@/screens/ReportScreen";
import { CalcScreen } from "@/screens/CalcScreen";
import { AcademyScreen } from "@/screens/AcademyScreen";
import { QuizPlayScreen, QuizResultScreen } from "@/screens/QuizScreen";
import { NewsScreen, NewsArticleScreen } from "@/screens/NewsScreen";
import { BuilderScreen } from "@/screens/BuilderScreen";
import { CalendarScreen } from "@/screens/CalendarScreen";
import { DiscussScreen } from "@/screens/DiscussScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { TaxScreen } from "@/screens/TaxScreen";

export function ScreenRouter() {
  const view = useFolioStore((s) => s.view);
  const assetView = useFolioStore((s) => s.assetView);

  // The data view doubles as the asset-detail host.
  if (view === "data" && assetView) return <AssetDetailScreen sym={assetView} />;

  switch (view) {
    case "dashboard":
      return <DashboardScreen />;
    case "data":
      return <DataScreen />;
    case "ai":
      return <AiScreen />;
    case "portfolio":
      return <PortfolioScreen />;
    case "report":
      return <ReportScreen />;
    case "calc":
      return <CalcScreen />;
    case "academy":
      return <AcademyScreen />;
    case "quizPlay":
      return <QuizPlayScreen />;
    case "quizResult":
      return <QuizResultScreen />;
    case "weakSpots":
      return <AcademyScreen />;
    case "news":
      return <NewsScreen />;
    case "newsArticle":
      return <NewsArticleScreen />;
    case "builder":
      return <BuilderScreen />;
    case "calendar":
      return <CalendarScreen />;
    case "discuss":
      return <DiscussScreen />;
    case "profile":
      return <ProfileScreen />;
    case "tax":
      return <TaxScreen />;
    default:
      return <DashboardScreen />;
  }
}
