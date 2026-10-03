<script lang="ts">
  import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";
  import { faComments } from "@fortawesome/free-solid-svg-icons";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";

  let portraitAvailable = $state(true);
  let searchQuery = $state("");
  let searchInput: HTMLInputElement;
  let searchHasScrolled = $state(false);
  let contactDialog: HTMLDialogElement;
  let copyStatus = $state("");
  let copiedLabel = $state("");
  const emailAddress = "islammuntasirul@gmail.com";
  const studentEmailAddress = "md.m.islam@torontomu.ca";
  const discordHandle = "muntalee";

  function updateSearchScroll() {
    searchHasScrolled = searchInput.scrollLeft > 0;
  }

  function openContactDialog() {
    copyStatus = "";
    copiedLabel = "";
    contactDialog.showModal();
  }

  async function copyContact(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      copiedLabel = label;
      copyStatus = "";
    } catch {
      copiedLabel = "";
      copyStatus = `Couldn't copy ${label.toLowerCase()}. Please select and copy it manually.`;
    }
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
        <FontAwesomeIcon icon={faGithub} />
      </a>
      <a class="social-icon" href="https://www.linkedin.com/in/muntasirul-islam" target="_blank" rel="noreferrer" aria-label="LinkedIn">
        <FontAwesomeIcon icon={faLinkedin} />
      </a>
      <button class="social-icon contact-trigger" type="button" aria-label="Open contact card" onclick={openContactDialog}>
        <FontAwesomeIcon icon={faComments} />
      </button>
    </nav>
  </header>

  <dialog class="contact-dialog" bind:this={contactDialog} aria-labelledby="contact-title">
    <div class="contact-dialog-header">
      <div>
        <p class="contact-kicker">CONTACT</p>
        <h2 id="contact-title">Let’s connect.</h2>
      </div>
      <button class="contact-dialog-close" type="button" aria-label="Close contact options" onclick={() => contactDialog.close()}>
        ×
      </button>
    </div>
    <p class="contact-intro">Choose an email, or find me on Discord.</p>
    <div class="contact-list">
      <div class="contact-row">
        <div class="contact-detail">
          <span class="contact-label">PERSONAL</span>
          <a class="contact-value" href="mailto:{emailAddress}">{emailAddress}</a>
        </div>
        <button
          class="contact-copy"
          class:copied={copiedLabel === "Personal email"}
          type="button"
          aria-label={copiedLabel === "Personal email" ? "Personal email copied" : "Copy personal email"}
          onclick={() => copyContact(emailAddress, "Personal email")}
        >
          {copiedLabel === "Personal email" ? "Copied" : "Copy"}
        </button>
      </div>
      <div class="contact-row">
        <div class="contact-detail">
          <span class="contact-label">UNIVERSITY</span>
          <a class="contact-value" href="mailto:{studentEmailAddress}">{studentEmailAddress}</a>
        </div>
        <button
          class="contact-copy"
          class:copied={copiedLabel === "University email"}
          type="button"
          aria-label={copiedLabel === "University email" ? "University email copied" : "Copy university email"}
          onclick={() => copyContact(studentEmailAddress, "University email")}
        >
          {copiedLabel === "University email" ? "Copied" : "Copy"}
        </button>
      </div>
      <div class="contact-row">
        <div class="contact-detail">
          <span class="contact-label">DISCORD</span>
          <span class="contact-value">{discordHandle}</span>
        </div>
        <button
          class="contact-copy"
          class:copied={copiedLabel === "Discord username"}
          type="button"
          aria-label={copiedLabel === "Discord username" ? "Discord username copied" : "Copy Discord username"}
          onclick={() => copyContact(discordHandle, "Discord username")}
        >
          {copiedLabel === "Discord username" ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
    {#if copyStatus}
      <p class="contact-status" aria-live="polite">{copyStatus}</p>
    {/if}
  </dialog>

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
    <a class="email-link" href="mailto:{emailAddress}">{emailAddress}</a>
  </footer>
</div>
