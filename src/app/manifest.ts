import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Folio — AI investiční co-pilot",
    short_name: "Folio",
    description: "Klidný investiční společník: report o tvém portfoliu, plán příkupu a Folio AI.",
    lang: "cs",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0A0B0F",
    theme_color: "#0A0B0F",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
