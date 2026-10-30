<script lang="ts">
  import { posterUrl } from "./poster";
  import type { Title } from "./catalog";
  let { item }: { item: Title } = $props();
</script>

<a class="stream-card" href="/streaming/?watch={item.type}&amp;id={encodeURIComponent(item.id)}">
  <div class="stream-poster">
    {#if item.poster && posterUrl(item.poster)}<img src={posterUrl(item.poster)} alt="" loading="lazy" onerror={(event) => { (event.currentTarget as HTMLImageElement).style.display = "none"; }} />{/if}
    <span class="stream-card-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4.5 17 12 7 19.5Z" fill="currentColor" /></svg></span>
  </div>
  <div class="stream-card-info"><h3>{item.name}</h3><p>{#if item.releaseInfo || item.year}{item.releaseInfo || item.year} <span>·</span> {/if}{item.type === "movie" ? "Movie" : "Series"}</p></div>
</a>
