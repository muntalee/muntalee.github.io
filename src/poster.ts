const blankPoster = "https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png";

export function posterUrl(source: string): string {
  try {
    const url = new URL(source);
    if (url.protocol !== "https:") return "";
    const proxy = new URL("https://wsrv.nl/");
    proxy.searchParams.set("url", url.href);
    proxy.searchParams.set("default", blankPoster);
    return proxy.href;
  } catch {
    return "";
  }
}
