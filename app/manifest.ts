import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Balance Hogar",
    short_name: "Balance",
    description: "Balance compartido para gastos del hogar",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF8F5",
    theme_color: "#9D6E5A",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}