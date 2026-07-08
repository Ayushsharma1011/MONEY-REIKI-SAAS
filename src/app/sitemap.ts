import type { MetadataRoute } from "next";
import { ROUTES } from "@/constants/app";
import { env } from "@/config/env";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${env.NEXT_PUBLIC_APP_URL}${ROUTES.home}`,
      lastModified: new Date()
    }
  ];
}
