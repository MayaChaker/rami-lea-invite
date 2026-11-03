import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  // Demo: the site's home sends people straight to the sample invitation,
  // so the link GitHub and Vercel show opens the envelope, not a blank page.
  // Temporary (not permanent) so it can become a real landing page later.
  async redirects() {
    return [
      {
        source: "/",
        destination: "/i/rami-lea/haddad-7x2k",
        permanent: false,
      },
    ];
  },
  turbopack: {
    rules: {
      // Run Tailwind only on the global stylesheet. A "*.css" rule with
      // `as: "*.css"` also catches *.module.css and turns CSS Modules off.
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
