import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  Sparkles,
  Code2,
  Smartphone,
  Cpu,
  ShieldCheck,
  ChartNoAxesCombined,
  Gamepad2,
  Shapes,
  ArrowUpRight,
  X,
  Clock3,
  TrendingUp,
} from "lucide-react";
import { api } from "../api";
import { categories } from "../types";
import { useLoad } from "../hooks/useLoad";
import { useAuth } from "../hooks/useAuth";
import { ProjectCard } from "../components/ProjectCard";
import { Empty, ErrorMessage } from "../components/Feedback";
import { Pagination } from "../components/Pagination";
const icons = [
  Sparkles,
  Code2,
  Smartphone,
  Cpu,
  ShieldCheck,
  ChartNoAxesCombined,
  Gamepad2,
  Shapes,
];
export function Discover() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("search") || "");
  const { user } = useAuth();
  const query = params.toString();
  const { data, error, loading, reload } = useLoad(
    (signal) => api.projects(new URLSearchParams(query), signal),
    [query, user?.id],
  );
  const options = useLoad((signal) => api.options(signal), []);
  useEffect(() => setSearch(params.get("search") || ""), [query]);
  function change(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  }
  const category = params.get("category") || "";
  const sort = params.get("sort") || "recent";
  const filtered = ["search", "category", "technology", "semester"].some(
    (key) => params.has(key),
  );
  return (
    <div className="discover-layout container">
      <aside className="discover-sidebar">
        <span className="overline">THE STUDENT SHOWCASE</span>
        <h2>Find your inspiration.</h2>
        <div className="sidebar-divider" />
        <span className="sidebar-label">EXPLORE</span>
        <button
          className={`category-button ${!category ? "active" : ""}`}
          onClick={() => change("category", "")}
        >
          <LayoutGrid size={17} />
          All projects{!category && <span className="active-dot" />}
        </button>
        {categories.map((name, i) => {
          const Icon = icons[i];
          return (
            <button
              key={name}
              onClick={() => change("category", name)}
              className={`category-button ${category === name ? "active" : ""}`}
            >
              <Icon size={17} />
              {name === "AI / Machine Learning"
                ? "AI & Machine Learning"
                : name}
              {category === name && <span className="active-dot" />}
            </button>
          );
        })}
        <div className="sidebar-note">
          <span className="note-icon">
            <Code2 size={20} />
          </span>
          <h3>
            From your laptop.
            <br />
            To the world.
          </h3>
          <p>Your side project could be someone else’s inspiration.</p>
          <Link to="/projects/new">
            Put it out there <ArrowUpRight size={16} />
          </Link>
        </div>
        <span className="sidebar-bottom">
          SMALL PROJECTS. BIG POSSIBILITIES.
        </span>
      </aside>
      <section className="discover-main">
        <div className="discover-intro">
          <div>
            <span className="eyebrow">
              <span />A SPACE FOR STUDENT BUILDERS
            </span>
            <h1>
              Discover what students
              <br />
              are <span>building.</span>
            </h1>
            <p>
              Fresh ideas, late-night builds, and a whole lot of curiosity.
              <br className="desktop-break" /> Explore projects from the next
              generation of developers.
            </p>
          </div>
          <div className="intro-mark" aria-hidden="true">
            <Code2 size={48} strokeWidth={1.4} />
            <span>idea → reality</span>
          </div>
        </div>
        <form
          className="search-box"
          onSubmit={(event) => {
            event.preventDefault();
            change("search", search.trim());
          }}
        >
          <Search size={20} />
          <input
            aria-label="Search projects"
            placeholder="Search projects, technologies, or ideas…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="icon-button"
              aria-label="Clear search"
              onClick={() => {
                setSearch("");
                change("search", "");
              }}
            >
              <X size={16} />
            </button>
          )}
          <button type="submit" className="search-submit">
            Search <span>↵</span>
          </button>
        </form>
        <div className="mobile-categories">
          <select
            aria-label="Category"
            value={category}
            onChange={(e) => change("category", e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="discovery-toolbar">
          <div className="sort-tabs">
            <button
              className={sort === "recent" ? "selected" : ""}
              onClick={() => change("sort", "recent")}
            >
              <Clock3 size={16} />
              Recently added
            </button>
            <button
              className={sort === "popular" ? "selected" : ""}
              onClick={() => change("sort", "popular")}
            >
              <TrendingUp size={16} />
              Popular
            </button>
          </div>
          <div className="filter-controls">
            <SlidersHorizontal size={15} />
            <select
              aria-label="Technology filter"
              value={params.get("technology") || ""}
              onChange={(e) => change("technology", e.target.value)}
            >
              <option value="">Technology</option>
              {options.data?.technologies.map((t) => (
                <option key={t.name}>{t.name}</option>
              ))}
            </select>
            <select
              aria-label="Semester filter"
              value={params.get("semester") || ""}
              onChange={(e) => change("semester", e.target.value)}
            >
              <option value="">Semester</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i + 1}>
                  Semester {i + 1}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="results-heading">
          <h2>
            {category ||
              (sort === "popular"
                ? "Community favorites"
                : "Fresh from the community")}
            {data && <span>{data.total}</span>}
          </h2>
          {filtered ? (
            <button
              className="text-button"
              onClick={() => {
                setSearch("");
                setParams({});
              }}
            >
              Clear filters <X size={13} />
            </button>
          ) : (
            <span className="results-caption">
              Built with curiosity. Shared with you.
            </span>
          )}
        </div>
        {error ? (
          <>
            <ErrorMessage message={error} />
            <button className="button secondary" onClick={reload}>
              Try again
            </button>
          </>
        ) : loading ? (
          <div
            className="project-grid"
            aria-label="Loading projects"
            aria-busy="true"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div className="skeleton-card" key={n}>
                <div />
                <span />
                <span />
                <span />
              </div>
            ))}
          </div>
        ) : data?.items.length ? (
          <>
            <div className="project-grid">
              {data.items.map((p) => (
                <ProjectCard
                  key={`${p.id}-${user?.id || "guest"}`}
                  project={p}
                />
              ))}
            </div>
            <Pagination
              page={data.page}
              pages={data.pages}
              onChange={(p) => {
                change("page", String(p));
                window.scrollTo({ top: 250, behavior: "smooth" });
              }}
            />
          </>
        ) : (
          <Empty
            title={
              filtered
                ? "No projects match this search."
                : "Every community starts with one project."
            }
            description={
              filtered
                ? "Try another keyword or clear a filter to find something new."
                : "Built something for class, for fun, or just to see if you could? This is its home."
            }
            create={!filtered}
          />
        )}
        <div className="discovery-footnote">
          <span className="tiny-square" />
          Not just assignments. A collection of what’s possible.
        </div>
      </section>
    </div>
  );
}
