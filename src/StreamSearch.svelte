<script lang="ts">
  import { onMount, tick } from "svelte";
  import { getCatalog, type Title } from "./catalog";
  import { posterUrl } from "./poster";

  let { initialQuery }: { initialQuery: string } = $props();
  let searchInput = $state("");
  let liveResults = $state<Title[]>([]);
  let liveOpen = $state(false);
  let liveLoading = $state(false);
  let liveError = $state(false);
  let activeSuggestion = $state(-1);
  let mobileSearchOpen = $state(false);
  let searchForm: HTMLFormElement;
  let searchField: HTMLInputElement;
  let mobileSearchTrigger: HTMLButtonElement;
  let searchTimer: ReturnType<typeof setTimeout>;
  let searchController: AbortController | undefined;
  let liveRequest = 0;

  function updateLiveSearch(query: string) {
    clearTimeout(searchTimer);
    searchController?.abort();
    const request = ++liveRequest;
    const term = query.trim();
    liveResults = [];
    activeSuggestion = -1;
    liveError = false;
    liveOpen = term.length >= 2;
    liveLoading = liveOpen;
    if (!liveOpen) return;
    searchTimer = setTimeout(async () => {
      const controller = new AbortController();
      searchController = controller;
      const responses = await Promise.allSettled([getCatalog("movie", term, controller.signal), getCatalog("series", term, controller.signal)]);
      if (request !== liveRequest) return;
      const unique = new Map<string, Title>();
      const lists = responses.map((response) => response.status === "fulfilled" ? response.value : []);
      for (let index = 0; index < 6; index++) for (const list of lists) {
        const item = list[index];
        if (item && !unique.has(item.id)) unique.set(item.id, item);
      }
      liveResults = [...unique.values()].slice(0, 6);
      liveError = responses.every((response) => response.status === "rejected");
      liveLoading = false;
    }, 300);
  }

  function handleSearchKey(event: KeyboardEvent) {
    if (event.key === "Escape") {
      if (mobileSearchOpen) closeMobileSearch();
      else { liveOpen = false; activeSuggestion = -1; }
      return;
    }
    if (!liveOpen || !liveResults.length) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      activeSuggestion = event.key === "ArrowDown"
        ? (activeSuggestion + 1) % liveResults.length
        : (activeSuggestion <= 0 ? liveResults.length - 1 : activeSuggestion - 1);
      void tick().then(() => document.getElementById(`stream-suggestion-${activeSuggestion}`)?.scrollIntoView({ block: "nearest" }));
    } else if (event.key === "Enter" && activeSuggestion >= 0) {
      event.preventDefault();
      const item = liveResults[activeSuggestion];
      window.location.assign(`/streaming/?watch=${item.type}&id=${encodeURIComponent(item.id)}`);
    }
  }

  async function openMobileSearch() {
    mobileSearchOpen = true;
    await tick();
    searchField.focus();
  }

  function closeMobileSearch() {
    mobileSearchOpen = false;
    liveOpen = false;
    activeSuggestion = -1;
    clearTimeout(searchTimer);
    searchController?.abort();
    liveRequest++;
    mobileSearchTrigger?.focus();
  }

  onMount(() => {
    searchInput = initialQuery;
    const desktop = window.matchMedia("(min-width: 681px)");
    const onBreakpointChange = () => { if (desktop.matches && mobileSearchOpen) closeMobileSearch(); };
    desktop.addEventListener("change", onBreakpointChange);
    return () => { clearTimeout(searchTimer); searchController?.abort(); desktop.removeEventListener("change", onBreakpointChange); };
  });
</script>

<button class="stream-mobile-search-trigger" type="button" aria-label="Open search" aria-expanded={mobileSearchOpen} bind:this={mobileSearchTrigger} onclick={openMobileSearch}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></svg></button>
{#if mobileSearchOpen}<button class="stream-search-backdrop" type="button" aria-label="Close search" tabindex="-1" onclick={closeMobileSearch}></button>{/if}
<form class="stream-nav-search" class:mobile-open={mobileSearchOpen} action="/streaming/" method="get" role="search" bind:this={searchForm} onfocusout={(event) => { if (!searchForm.contains(event.relatedTarget as Node | null)) liveOpen = false; }}>
  <button type="submit" aria-label="Search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></svg></button>
  <input type="search" name="q" bind:value={searchInput} bind:this={searchField} placeholder="Search titles..." aria-label="Search movies and series" autocomplete="off" required role="combobox" aria-autocomplete="list" aria-expanded={liveOpen && liveResults.length > 0} aria-controls={liveOpen && liveResults.length > 0 ? "stream-suggestions-list" : undefined} aria-activedescendant={liveOpen && activeSuggestion >= 0 ? `stream-suggestion-${activeSuggestion}` : undefined} onkeydown={handleSearchKey} oninput={(event) => updateLiveSearch(event.currentTarget.value)} onfocus={() => { if (searchInput.trim().length >= 2) updateLiveSearch(searchInput); }} />
  {#if mobileSearchOpen}<button class="stream-mobile-search-close" type="button" aria-label="Close search" onclick={closeMobileSearch}>×</button>{/if}
  {#if liveOpen}
    <div class="stream-suggestions" aria-label="Search suggestions">
      {#if liveLoading}<p class="stream-suggestions-status" role="status">Searching...</p>
      {:else if liveError}<p class="stream-suggestions-status" role="status">Suggestions unavailable. Press Enter to search.</p>
      {:else if liveResults.length === 0}<p class="stream-suggestions-status" role="status">No suggestions found.</p>
      {:else}
        <p class="stream-suggestions-heading">SUGGESTED TITLES</p>
        <div id="stream-suggestions-list" role="listbox" aria-label="Suggested titles">
          {#each liveResults as item, index (item.id)}
            <a id="stream-suggestion-{index}" class="stream-suggestion" class:active={activeSuggestion === index} role="option" aria-selected={activeSuggestion === index} tabindex="-1" href="/streaming/?watch={item.type}&amp;id={encodeURIComponent(item.id)}">
              <span class="stream-suggestion-poster">{#if item.poster && posterUrl(item.poster)}<img src={posterUrl(item.poster)} alt="" onerror={(event) => { (event.currentTarget as HTMLImageElement).style.display = "none"; }} />{/if}</span>
              <span class="stream-suggestion-info"><strong>{item.name}</strong><small>{#if item.releaseInfo || item.year}{item.releaseInfo || item.year} · {/if}{item.type === "movie" ? "Movie" : "Series"}</small></span>
            </a>
          {/each}
        </div>
        <button class="stream-suggestions-all" type="submit">See all results <span>↗</span></button>
      {/if}
    </div>
  {/if}
</form>
