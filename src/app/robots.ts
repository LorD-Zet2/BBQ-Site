import type { MetadataRoute } from "next";
import { shop } from "@/config/shop";

export default function robots(): MetadataRoute.Robots {
  const publicLaunch = shop.orderingOpen;
  return {
    rules: publicLaunch ? { userAgent: "*", allow: "/" } : { userAgent: "*", disallow: "/" },
  };
}
