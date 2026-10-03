import { useEffect, useState } from "react";

type Project = {
  name: string;
  description: string;
  topics: string[];
};

type GitHubRepository = {
  name: string;
  language: string | null;
  stargazers_count: number;
};

const projects: Project[] = [
  {
    name: "pytetris",
    description: "A Python take on a familiar classic, built to explore game logic and interaction.",
    topics: ["Python", "Game"],
  },
  {
    name: "goodnotes-email-automation",
    description: "A small automation project connecting email workflows with a personal notes setup.",
    topics: ["Automation", "Python"],
  },
  {
    name: "PokemonJavaGUI",
    description: "A Pokémon-inspired Java GUI project focused on interactive desktop software.",
    topics: ["Java", "GUI"],
  },
  {
    name: "muntalee.github.io",
    description: "This portfolio: a lightweight, responsive site built with React and TypeScript.",
    topics: ["React", "TypeScript"],
  },
];

function isRepository(value: unknown): value is GitHubRepository {
  if (typeof value !== "object" || value === null) return false;
  const repo = value as Record<string, unknown>;
  return (
    typeof repo.name === "string" &&
    (typeof repo.language === "string" || repo.language === null) &&
    typeof repo.stargazers_count === "number"
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [repositories, setRepositories] = useState<Map<string, GitHubRepository>>(
    () => new Map(),
  );
  const [apiUnavailable, setApiUnavailable] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRepositories() {
      try {
        const response = await fetch(
          "https://api.github.com/users/muntalee/repos?sort=updated&per_page=100",
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error(`GitHub returned ${response.status}`);
        }

        const result: unknown = await response.json();
        if (!Array.isArray(result)) {
          throw new Error("GitHub returned an unexpected repository list");
        }

        const repoMap = new Map<string, GitHubRepository>();
        for (const item of result) {
          if (isRepository(item)) repoMap.set(item.name.toLowerCase(), item);
        }
        setRepositories(repoMap);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setApiUnavailable(true);
      }
    }

    void loadRepositories();
    return () => controller.abort();
  }, []);

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Muntasirul Islam, home">
          mi<span>.</span>
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
        <nav id="site-nav" className={menuOpen ? "site-nav is-open" : "site-nav"}>
          <a href="#projects" onClick={() => setMenuOpen(false)}>Projects</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="/cv/" onClick={() => setMenuOpen(false)}>CV <span aria-hidden="true">↗</span></a>
        </nav>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="intro-title">
          <div className="hero-copy">
            <p className="eyebrow"><span className="status-dot" /> Available for interesting projects</p>
            <h1 id="intro-title">Building things<br />for the <span>curious.</span></h1>
            <p className="hero-description">
              I&apos;m Muntasirul — a computer science student and developer who likes turning
              ideas into useful, considered software.
            </p>
            <a className="text-link" href="#projects">
              Explore selected work <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-frame">
              <img src="/assets/munta_wave.png" alt="" />
              <span className="art-index">FIG. 01 — IN PROGRESS</span>
            </div>
            <span className="art-orbit">CS&nbsp; / &nbsp;BUILD&nbsp; / &nbsp;REPEAT</span>
          </div>
          <div className="hero-footer">
            <span>TORONTO, CANADA</span>
            <span>SCROLL TO EXPLORE <span aria-hidden="true">↓</span></span>
          </div>
        </section>

        <section className="projects section-wrap" id="projects" aria-labelledby="projects-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">01 / Selected work</p>
              <h2 id="projects-title">Things I&apos;ve built<span>.</span></h2>
            </div>
            <a className="text-link github-link" href="https://github.com/muntalee" target="_blank" rel="noreferrer">
              More on GitHub <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="project-list">
            {projects.map((project, index) => {
              const repo = repositories.get(project.name.toLowerCase());
              return (
                <a
                  className="project-card"
                  href={`https://github.com/muntalee/${project.name}`}
                  target="_blank"
                  rel="noreferrer"
                  key={project.name}
                >
                  <span className="project-number">0{index + 1}</span>
                  <div className="project-main">
                    <h3>{project.name}</h3>
                    <p>{repo?.language ? `${repo.language} — ` : ""}{project.description}</p>
                    <div className="project-tags">
                      {project.topics.map((topic) => <span key={topic}>{topic}</span>)}
                    </div>
                  </div>
                  <span className="project-meta">
                    {repo ? <span>★ {repo.stargazers_count}</span> : <span>GitHub</span>}
                    <span className="project-arrow" aria-hidden="true">↗</span>
                  </span>
                </a>
              );
            })}
          </div>
          {apiUnavailable && (
            <p className="api-note" role="status">
              Live GitHub details are unavailable right now; project links are still available.
            </p>
          )}
        </section>

        <section className="about section-wrap" id="about" aria-labelledby="about-title">
          <div className="about-label">
            <p className="eyebrow">02 / A little about me</p>
            <img src="/assets/profile.jpg" alt="Muntasirul Islam" />
          </div>
          <div className="about-copy">
            <h2 id="about-title">Learning by making.</h2>
            <p>
              I&apos;m studying computer science at Toronto Metropolitan University. I enjoy
              working across the stack, learning how systems fit together, and making personal
              projects that are useful beyond the code itself.
            </p>
            <p>
              This is where I keep the work I&apos;m proud of and the ideas I&apos;m exploring next.
            </p>
            <div className="social-links">
              <a href="https://github.com/muntalee" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
              <a href="https://www.linkedin.com/in/muntasirul-islam" target="_blank" rel="noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>
              <a href="/cv/">View my CV <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="wordmark" href="#top">mi<span>.</span></a>
        <p>Designed &amp; built by Muntasirul Islam</p>
        <a href="#top">Back to top ↑</a>
      </footer>
    </div>
  );
}

export default App;
