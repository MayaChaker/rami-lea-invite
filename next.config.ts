import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  // The WhatsApp preview image reads its fonts and photo from disk. On Vercel
  // it runs as a function, so these files must be packed with it.
  outputFileTracingIncludes: {
    "/i/[slug]/[token]/opengraph-image": ["./src/assets/og/**", "./public/invitations/*/og-*.jpg"],
    "/opengraph-image": ["./src/assets/og/**", "./public/invitations/*/og-*.jpg"],
    "/icon": ["./src/assets/og/**"],
    "/apple-icon": ["./src/assets/og/**"],
  },
  partialPrefetching: true,
  // Photos and decorations in public/: by default a phone asks the server
  // again for every one at every visit. Guests often reopen their invitation
  // (to check the time or the address), so the phone keeps them for a day,
  // then checks for a new version in the background. A replaced photo
  // reaches every guest within a day.
  async headers() {
    const cache = [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=2592000" }];

    // Security headers on every page. Not a full Content-Security-Policy:
    // with Next.js that needs a nonce per request, so the static invitation
    // pages would be rendered on every visit and be slower for guests.
    const security = [
      // No other site may show these pages inside a frame (clickjacking:
      // tricking the couple into clicking on their dashboard).
      { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
      { key: "X-Frame-Options", value: "DENY" }, // the same, for older browsers
      // The browser trusts the file type we send, never guesses it.
      { key: "X-Content-Type-Options", value: "nosniff" },
      // A link to Google Maps does not carry the guest's private link.
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      // The invitation never needs the camera, microphone or location.
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
    ];

    return [
      { source: "/:path*", headers: security },
      { source: "/invitations/:path*", headers: cache },
      { source: "/decor/:path*", headers: cache },
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
