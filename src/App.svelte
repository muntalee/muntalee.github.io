<script lang="ts">
  let portraitAvailable = $state(true);
  let searchQuery = $state("");
  let searchInput: HTMLInputElement;
  let searchHasScrolled = $state(false);

  function updateSearchScroll() {
    searchHasScrolled = searchInput.scrollLeft > 0;
  }

  function technologyTone(technology: string) {
    if (["C", "C++"].includes(technology)) return "amber";
    if (["TypeScript", "JavaScript"].includes(technology)) return "blue";
    if (["SDL2", "OpenGL", "raylib"].includes(technology)) return "violet";
    return "green";
  }

  const projects = [
    {
      name: "ontario-design-system",
      title: "Ontario Design System",
      owner: "ongov",
      description: "Reusable web components and packages for Ontario government services.",
      stack: ["Stencil", "TypeScript", "Web Components"],
      image: "/projects/ontario-design-system.png",
      alt: "Ontario Design System components page",
    },
    {
      name: "raylib-tetris",
      title: "Raylib Tetris",
      owner: "muntalee",
      description: "A Tetris-style game with hold pieces, ghost pieces, hard drops, and scoring.",
      stack: ["C++", "raylib", "CMake"],
      image: "/projects/raylib-tetris.gif",
      alt: "Gameplay from Raylib Tetris",
    },
    {
      name: "cps511-assignment",
      title: "CPS511 — Duck FPS",
      owner: "muntalee",
      description: "A first-person duck shooter with animated targets and collision detection.",
      stack: ["C++", "OpenGL", "GLEW", "CMake"],
      image: "/projects/cps511-assignment.gif",
      alt: "Gameplay from the CPS511 Duck FPS assignment",
    },
    {
      name: "elementary-cellular-automata",
      title: "Elementary Cellular Automata",
      owner: "muntalee",
      description: "An interactive cellular automata sandbox built with SDL2 and OpenGL.",
      stack: ["C", "SDL2", "OpenGL", "microui"],
      image: "/projects/cellular-automata.gif",
      alt: "Cellular automata visualization",
    },
    {
      name: "raycasting-raylib",
      title: "Raycasting",
      owner: "muntalee",
      description: "A Wolfenstein-inspired raycasting engine built with raylib.",
      stack: ["C", "raylib"],
      image: "/projects/raycasting-raylib.gif",
      alt: "Raycasting engine preview",
    },
    {
      name: "mr-potato-head",
      title: "Mr. Potato Head Maker",
      owner: "muntalee",
      description: "A browser toy for building and exporting your own Potato Head.",
      stack: ["JavaScript", "jQuery", "Bootstrap", "html2canvas"],
      image: "/projects/mr-potato-head.gif",
      alt: "Mr. Potato Head Maker in use",
    },
  ];

  let filteredProjects = $derived(
    projects.filter((project) => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;

      const haystack = [
        project.name,
        project.title,
        project.owner,
        project.description,
        ...project.stack,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    }),
  );
</script>

<div class="site-shell">
  <header class="site-header">
    <a class="wordmark" href="#top" aria-label="Munta, home">&lt;0^0&gt;</a>
    <nav id="site-nav" class="site-nav" aria-label="Main navigation">
      <a class="social-icon" href="https://github.com/muntalee" target="_blank" rel="noreferrer" aria-label="GitHub">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.53v-2.08c-3.1.67-3.76-1.32-3.76-1.32-.5-1.29-1.24-1.63-1.24-1.63-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 .1.76 2.46 3.02 1.87.1-.72.39-1.21.7-1.49-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.11-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.29-2.61 5.24-5.1 5.52.4.34.75 1.02.75 2.06V22c0 .29.2.63.77.52A11.1 11.1 0 0 0 12 .9Z"/>
        </svg>
      </a>
      <a class="social-icon" href="https://www.linkedin.com/in/muntasirul-islam" target="_blank" rel="noreferrer" aria-label="LinkedIn">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.45H4.97V9h2.96v9.45ZM6.45 7.71a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12 10.74h-2.96v-4.6c0-1.1-.02-2.52-1.54-2.52-1.55 0-1.79 1.2-1.79 2.44v4.68H9.2V9h2.84v1.29h.04c.4-.74 1.36-1.53 2.8-1.53 2.99 0 3.55 1.97 3.55 4.53v5.16Z"/>
        </svg>
      </a>
    </nav>
  </header>

  <main id="top">
    <section class="intro" aria-labelledby="intro-title">
      <div class="intro-content">
        <div class="intro-copy">
          <p class="eyebrow">cs student · developer</p>
          <h1 id="intro-title">Munta Islam<span>.</span></h1>
          <p class="intro-description">
            5th year student at TMU building games, tools, and web projects.
          </p>
          <div class="intro-meta">
            <span>Toronto, Canada</span>
          </div>
        </div>
        {#if portraitAvailable}
          <img
            class="portrait"
            src="/assets/profile.jpg"
            alt="Portrait of Munta Islam"
            onerror={() => (portraitAvailable = false)}
          />
        {:else}
          <div class="portrait portrait-placeholder" aria-label="Portrait photo placeholder">
            <span>Your photo</span>
            <small>Add it at public/assets/profile.jpg</small>
          </div>
        {/if}
      </div>
    </section>

    <section class="work" id="work" aria-labelledby="work-title">
      <div class="section-heading">
        <div>
          <h2 id="work-title">Projects</h2>
        </div>
      </div>

      <div class="project-tools">
        <label class="project-search" aria-label="Search projects">
          <span>Search</span>
          <input
            type="search"
            bind:value={searchQuery}
            bind:this={searchInput}
            placeholder="Filter projects..."
            aria-label="Filter projects by name, language, or description"
            class:search-scrolled={searchHasScrolled}
            oninput={updateSearchScroll}
            onscroll={updateSearchScroll}
          />
          {#if searchQuery}
            <button
              class="project-search-clear"
              type="button"
              aria-label="Clear project search"
              onclick={() => (searchQuery = "")}
            >×</button>
          {/if}
        </label>
      </div>

      {#if filteredProjects.length > 0}
        <div class="project-grid">
          {#each filteredProjects as project (project.name)}
            <a
              class="project-card"
              href="https://github.com/{project.owner}/{project.name}"
              target="_blank"
              rel="noreferrer"
            >
              <div class="project-preview">
                <img src={project.image} alt={project.alt} loading="lazy" />
              </div>
              <div class="project-info">
                <div class="project-title-line">
                  <h3>{project.title}</h3>
                  <span class="project-arrow" aria-hidden="true">↗</span>
                </div>
                <p>{project.description}</p>
                <div class="project-tags" aria-label="Technology stack">
                  {#each project.stack as technology (technology)}
                    <span class="tag tag-{technologyTone(technology)}">{technology}</span>
                  {/each}
                </div>
              </div>
            </a>
          {/each}
        </div>
      {:else}
        <div class="project-empty" aria-live="polite">
          No projects match “{searchQuery}”.
        </div>
      {/if}
    </section>

  </main>

  <footer class="site-footer">
    <span>© 2026 Munta Islam.</span>
    <a class="email-link" href="mailto:islammuntasirul@gmail.com">islammuntasirul@gmail.com</a>
  </footer>
</div>
