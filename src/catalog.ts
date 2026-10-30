export type MediaType = "movie" | "series";
export type Video = { season?: number; episode?: number; name?: string; released?: string };
export type Title = {
  id: string;
  type: MediaType;
  name: string;
  poster?: string;
  description?: string;
  year?: string;
  releaseInfo?: string;
  runtime?: string;
  imdbRating?: string;
  genres?: string[];
  genre?: string[];
  cast?: string[];
  director?: string[];
  videos?: Video[];
};

const catalogUrl = "https://v3-cinemeta.strem.io";
export const catalogPageSize = 50;

async function getJson(url: string, signal?: AbortSignal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.json();
}

function validTitles(data: unknown, type: MediaType): Title[] {
  if (!Array.isArray(data)) throw new Error("Unexpected catalog response");
  return data.filter((item): item is Title => item && typeof item.name === "string" && /^tt\d+$/.test(item.id) && item.type === type);
}

export async function getCatalog(type: MediaType, term = "", signal?: AbortSignal) {
  const suffix = term ? `/search=${encodeURIComponent(term)}` : "";
  const data = await getJson(`${catalogUrl}/catalog/${type}/top${suffix}.json`, signal);
  return validTitles(data.metas, type);
}

export async function getCatalogPage(type: MediaType, offset: number) {
  const data = await getJson(`${catalogUrl}/catalog/${type}/top${offset ? `/skip=${offset}` : ""}.json`);
  if (!Array.isArray(data.metas)) throw new Error("Unexpected catalog response");
  return { items: validTitles(data.metas, type), count: data.metas.length };
}

export async function getTitle(type: MediaType, id: string): Promise<Title> {
  const data = await getJson(`${catalogUrl}/meta/${type}/${id}.json`);
  if (!data.meta || typeof data.meta.name !== "string") throw new Error("Title details unavailable");
  return data.meta;
}

export function imdbSuggestions(query: string): Promise<Title[]> {
  const term = query.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!term) return Promise.resolve([]);
  return new Promise((resolve, reject) => {
    const callback = `imdb$${term}`;
    const global = window as unknown as Record<string, unknown>;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => { cleanup(); reject(new Error("IMDb search timed out")); }, 8000);
    function cleanup() { window.clearTimeout(timeout); script.remove(); delete global[callback]; }
    global[callback] = (payload: { d?: unknown }) => {
      cleanup();
      if (!Array.isArray(payload?.d)) { reject(new Error("Unexpected IMDb response")); return; }
      resolve(payload.d.flatMap((item): Title[] => {
        if (!item || typeof item !== "object") return [];
        const result = item as Record<string, unknown>;
        if (typeof result.id !== "string" || !/^tt\d+$/.test(result.id) || typeof result.l !== "string") return [];
        if (!["movie", "tvMovie", "tvSeries", "tvMiniSeries"].includes(String(result.qid))) return [];
        const image = Array.isArray(result.i) && typeof result.i[0] === "string" ? result.i[0] : undefined;
        return [{ id: result.id, name: result.l, type: result.qid === "tvSeries" || result.qid === "tvMiniSeries" ? "series" : "movie", poster: image, year: result.y ? String(result.y) : undefined }];
      }));
    };
    script.onerror = () => { cleanup(); reject(new Error("IMDb search unavailable")); };
    script.src = `https://v2.sg.media-imdb.com/suggests/${term[0]}/${term}.json`;
    document.head.appendChild(script);
  });
}
