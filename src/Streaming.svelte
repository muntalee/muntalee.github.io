<script lang="ts">
  import { onMount } from "svelte";
  import StreamCard from "./StreamCard.svelte";
  import StreamSearch from "./StreamSearch.svelte";
  import { posterUrl } from "./poster";
  import { catalogPageSize, getCatalog, getCatalogPage, getTitle, imdbSuggestions, type MediaType, type Title } from "./catalog";
  const params = new URLSearchParams(window.location.search);
  const searchTerm = params.get("q")?.trim() || "";
  const browse = params.get("browse");
  const watchType = params.get("watch");
  const watchId = params.get("id") || "";
  const isWatch = (watchType === "movie" || watchType === "series") && /^(tt\d+|\d+)$/.test(watchId);
  const view = isWatch ? "watch" : searchTerm ? "search" : browse === "movie" || browse === "series" ? "browse" : "home";
  let movies = $state<Title[]>([]);
  let shows = $state<Title[]>([]);
  let results = $state<Title[]>([]);
  let title = $state<Title | null>(null);
  let loading = $state(true);
  let error = $state("");
  let partialError = $state(false);
  let resultsLimit = $state(24);
  let catalogOffset = 0;
  let hasMore = $state(true);
  let moreLoading = $state(false);
  let moreError = $state("");
  let season = $state(1);
  let episode = $state(1);
  let activeSeason = $state(1);
  let activeEpisode = $state(1);
  let posterAvailable = $state(true);

  const seasons = $derived([...new Set((title?.videos || []).map((video) => video.season).filter((number): number is number => typeof number === "number" && number > 0))].sort((a, b) => a - b));
  const episodes = $derived((title?.videos || []).filter((video) => video.season === season && typeof video.episode === "number" && video.episode > 0).sort((a, b) => (a.episode || 0) - (b.episode || 0)));
  const selectedEpisode = $derived((title?.videos || []).find((video) => video.season === activeSeason && video.episode === activeEpisode));
  const playerUrl = $derived.by(() => {
    if (!isWatch) return "";
    return `https://vidsrc.mov/embed/${watchType === "series" ? "tv" : "movie"}/${watchId}${watchType === "series" ? `/${activeSeason}/${activeEpisode}` : ""}`;
  });

  async function loadMore() {
    if (view !== "browse" || moreLoading || !hasMore) return;
    moreLoading = true;
    moreError = "";
    try {
      const page = await getCatalogPage(browse as MediaType, catalogOffset);
      const seen = new Set(results.map((item) => item.id));
      const fresh = page.items.filter((item) => !seen.has(item.id) && !!seen.add(item.id));
      results = [...results, ...fresh];
      catalogOffset += catalogPageSize;
      if (!page.count || !fresh.length) hasMore = false;
    } catch {
      moreError = "Couldn’t load more titles.";
    } finally { moreLoading = false; }
  }

  function observeMore(node: HTMLElement) {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting) && !moreError) void loadMore();
    }, { rootMargin: "400px" });
    observer.observe(node);
    return { destroy: () => observer.disconnect() };
  }

  async function loadPage() {
    loading = true;
    error = "";
    try {
      if (view === "watch") {
        try {
          title = await getTitle(watchType as MediaType, watchId);
        } catch {
          // A TMDB ID can still be played even when IMDb-linked metadata is unavailable.
          title = { id: watchId, type: watchType as MediaType, name: watchId };
          partialError = true;
        }
      } else if (view === "search") {
        const responses = await Promise.allSettled([imdbSuggestions(searchTerm), getCatalog("movie", searchTerm), getCatalog("series", searchTerm)]);
        const unique = new Map<string, Title>();
        for (const response of responses) if (response.status === "fulfilled") for (const item of response.value) if (!unique.has(item.id)) unique.set(item.id, item);
        if (responses.every((response) => response.status === "rejected")) throw new Error("Search is temporarily unavailable.");
        partialError = responses.some((response) => response.status === "rejected");
        results = [...unique.values()];
      } else if (view === "browse") {
        const page = await getCatalogPage(browse as MediaType, 0);
        results = [...new Map(page.items.map((item) => [item.id, item])).values()];
        catalogOffset = catalogPageSize;
        hasMore = page.count > 0;
      } else {
        const responses = await Promise.allSettled([getCatalog("movie"), getCatalog("series")]);
        if (responses.every((response) => response.status === "rejected")) throw new Error("Suggestions are temporarily unavailable.");
        movies = responses[0].status === "fulfilled" ? responses[0].value : [];
        shows = responses[1].status === "fulfilled" ? responses[1].value : [];
        partialError = responses.some((response) => response.status === "rejected");
      }
    } catch (problem) {
      error = problem instanceof Error ? problem.message : "Something went wrong.";
    } finally { loading = false; }
  }

  function selectSeason(event: Event) {
    const nextSeason = Number((event.currentTarget as HTMLInputElement | HTMLSelectElement).value);
    if (!Number.isInteger(nextSeason) || nextSeason < 1) return;
    const firstEpisode = (title?.videos || []).filter((video) => video.season === nextSeason && typeof video.episode === "number" && video.episode > 0).sort((a, b) => (a.episode || 0) - (b.episode || 0))[0];
    season = activeSeason = nextSeason;
    episode = activeEpisode = firstEpisode?.episode || 1;
  }

  function selectEpisode(event: Event) {
    const nextEpisode = Number((event.currentTarget as HTMLInputElement | HTMLSelectElement).value);
    if (!Number.isInteger(nextEpisode) || nextEpisode < 1) return;
    episode = activeEpisode = nextEpisode;
  }

  onMount(() => { void loadPage(); });
</script>

<svelte:head><title>{view === "watch" && title ? `${title.name} — ` : view === "search" ? `Search: ${searchTerm} — ` : ""}Streaming — Munta</title></svelte:head>

<div class="stream-app">
  <header class="stream-header">
    <div class="stream-header-inner">
      <a class="stream-brand" href="/streaming/" aria-label="Streaming home"><span class="stream-logo">&lt;0^0&gt;</span></a>
      <nav class="stream-nav" aria-label="Streaming navigation">
        <a class="stream-nav-home" class:active={view === "home"} aria-current={view === "home" ? "page" : undefined} href="/streaming/">Home</a>
        <a class:active={view === "browse" && browse === "movie"} aria-current={view === "browse" && browse === "movie" ? "page" : undefined} href="/streaming/?browse=movie">Movies</a>
        <a class:active={view === "browse" && browse === "series"} aria-current={view === "browse" && browse === "series" ? "page" : undefined} href="/streaming/?browse=series">Series</a>
      </nav>
      <StreamSearch initialQuery={searchTerm} />
    </div>
  </header>

  <main class="stream-main">
    {#if view === "watch"}
      <div class="watch-page">
        <a class="stream-back" href="/streaming/">← Browse titles</a>
        <div class="watch-player"><iframe src={playerUrl} title="{title?.name || 'Title'} video player" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>
        {#if loading}<p class="stream-status" role="status">Loading title details...</p>
        {:else if title}
          <div class="watch-details">
            <div class="watch-description">
              <p class="stream-kicker">{watchType === "movie" ? "MOVIE" : "SERIES"} <span> / </span> NOW PLAYING</p>
              <h1>{title.name}</h1>
              <div class="watch-meta">
                {#if title.imdbRating}<span class="watch-rating"><span class="watch-rating-star" aria-hidden="true">★</span> {title.imdbRating} <small>IMDb</small></span>{/if}
                {#if title.releaseInfo || title.year}<span>{title.releaseInfo || title.year}</span>{/if}
                {#if title.runtime}<span>{title.runtime}</span>{/if}
                {#if watchType === "series"}<span>Season {activeSeason} · Episode {activeEpisode}</span>{/if}
              </div>
              {#if title.description}<p class="watch-synopsis">{title.description}</p>{:else if partialError}<p class="watch-synopsis">Title details are unavailable. You can still use the player above.</p>{/if}
              {#if title.genres?.length || title.genre?.length}<div class="watch-genres">{#each title.genres || title.genre || [] as genre}<span>{genre}</span>{/each}</div>{/if}
              <div class="watch-credits">
                {#if title.cast?.length}<div><span>STARRING</span><p>{title.cast.join(", ")}</p></div>{/if}
                {#if title.director?.length}<div><span>DIRECTED BY</span><p>{title.director.join(", ")}</p></div>{/if}
                {#if watchId.startsWith("tt")}<a href="https://www.imdb.com/title/{watchId}/" target="_blank" rel="noreferrer">View on IMDb ↗</a>{/if}
              </div>
            </div>
            <div class="watch-poster">
              {#if title.poster && posterAvailable && posterUrl(title.poster)}<img src={posterUrl(title.poster)} alt="Poster for {title.name}" onerror={() => { posterAvailable = false; }} />{/if}
            </div>
          </div>
          {#if watchType === "series"}
            <section class="watch-controls" aria-labelledby="episodes-heading">
              <div class="watch-control-heading"><div><p class="stream-kicker">KEEP WATCHING</p><h2 id="episodes-heading">Episodes</h2></div>{#if selectedEpisode?.name}<span>Currently playing: {selectedEpisode.name}</span>{/if}</div>
              <div class="watch-control-row">
                <label>SEASON {#if seasons.length}<select bind:value={season} onchange={selectSeason}>{#each seasons as number}<option value={number}>Season {number}</option>{/each}</select>{:else}<input type="number" min="1" step="1" bind:value={season} onchange={selectSeason} required />{/if}</label>
                <label>EPISODE {#if episodes.length}<select bind:value={episode} onchange={selectEpisode}>{#each episodes as item}<option value={item.episode}>E{item.episode}{item.name ? ` · ${item.name}` : ""}</option>{/each}</select>{:else}<input type="number" min="1" step="1" bind:value={episode} onchange={selectEpisode} required />{/if}</label>
              </div>
            </section>
          {/if}
        {/if}
      </div>
    {:else if view === "home"}
      {#if loading}<p class="stream-status" role="status">Finding something good...</p>
      {:else if error}<div class="stream-message" role="status"><p>{error}</p><button onclick={loadPage}>Try again ↻</button></div>
      {:else}
        {#if partialError}<p class="stream-status">Some suggestions couldn’t be loaded.</p>{/if}
        {#if movies.length}<section class="stream-shelf" id="popular-movies"><div class="stream-heading"><div><p class="stream-kicker">THE BIG SCREEN</p><h2>Popular movies</h2></div><a href="/streaming/?browse=movie">View all <span>↗</span></a></div><div class="stream-grid">{#each movies.slice(0, 12) as item (item.id)}<StreamCard {item} />{/each}</div></section>{/if}
        {#if shows.length}<section class="stream-shelf"><div class="stream-heading"><div><p class="stream-kicker">ONE MORE EPISODE</p><h2>Popular series</h2></div><a href="/streaming/?browse=series">View all <span>↗</span></a></div><div class="stream-grid">{#each shows.slice(0, 12) as item (item.id)}<StreamCard {item} />{/each}</div></section>{/if}
      {/if}
    {:else}
      <section class="stream-listing">
        <p class="stream-kicker">{view === "search" ? "SEARCH" : "EXPLORE"} / {view === "search" ? "RESULTS" : browse === "movie" ? "MOVIES" : "SERIES"}</p>
        <div class="stream-listing-heading"><div><h1>{view === "search" ? `Results for “${searchTerm}”` : browse === "movie" ? "Popular movies" : "Popular series"}</h1><p>{view === "search" ? "Movies and series matching your search." : "Something for your next watch."}</p></div>{#if !loading && !error}<span>{results.length} {view === "browse" ? "LOADED" : "TITLES"}</span>{/if}</div>
        {#if loading}<p class="stream-status" role="status">Loading titles...</p>
        {:else if error}<div class="stream-message" role="status"><p>{error}</p><button onclick={loadPage}>Try again ↻</button></div>
        {:else if results.length === 0}<div class="stream-message" role="status"><p>No titles found. Try another search.</p></div>
        {:else}
          {#if partialError}<p class="stream-status">Some search sources are unavailable; showing available results.</p>{/if}
          <div class="stream-grid">{#each view === "browse" ? results : results.slice(0, resultsLimit) as item (item.id)}<StreamCard {item} />{/each}</div>
          {#if view === "browse" && hasMore}
            <div class="stream-more" use:observeMore>
              {#if moreLoading}<p class="stream-status" role="status">Loading more titles...</p>
              {:else if moreError}<div role="status"><p class="stream-status">{moreError}</p><button class="stream-button stream-button-secondary" onclick={loadMore}>Try again ↻</button></div>
              {:else}<button class="stream-button stream-button-secondary" onclick={loadMore}>Load more ↓</button>{/if}
            </div>
          {:else if view === "search" && results.length > resultsLimit}<div class="stream-more"><button class="stream-button stream-button-secondary" onclick={() => resultsLimit += 24}>Show more ↓</button></div>{/if}
        {/if}
      </section>
    {/if}
  </main>
</div>
