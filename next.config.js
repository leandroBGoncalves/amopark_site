/** @type {import('next').NextConfig} */
function supabaseImagePatterns() {
  const url = process.env.SUPABASE_URL;
  if (!url) return [];
  try {
    const { hostname } = new URL(url);
    return [
      {
        protocol: "https",
        hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig = {
  images: {
    remotePatterns: supabaseImagePatterns(),
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY,
  },
};

module.exports = nextConfig;
