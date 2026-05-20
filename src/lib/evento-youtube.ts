/** Converte URL de YouTube (vários formatos) em URL de embed. */
export function youtubeUrlToEmbed(url: string): string | null {
  const u = url.trim();
  if (!u) return null;
  try {
    const parsed = new URL(u);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = parsed.pathname.replace(/^\//, "").split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname.startsWith("/embed/")) {
        return u.split("?")[0];
      }
      const v = parsed.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      const shorts = parsed.pathname.match(/^\/shorts\/([^/?]+)/);
      if (shorts?.[1]) return `https://www.youtube.com/embed/${shorts[1]}`;
    }
  } catch {
    return null;
  }
  return null;
}

export function isProbablyYoutubeUrl(url: string): boolean {
  const u = url.toLowerCase();
  return u.includes("youtube.com") || u.includes("youtu.be");
}
