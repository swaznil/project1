import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Sparkles,
  X,
  Plus,
  Check,
} from "lucide-react";
import { api } from "../api";
import {
  categories,
  type ProjectInput,
  type Screenshot,
  type User,
} from "../types";
import { useAuth } from "../hooks/useAuth";
import { ErrorMessage, Loading } from "../components/Feedback";
import { TeamPicker } from "../components/TeamPicker";
import { ScreenshotPicker } from "../components/ScreenshotPicker";
const blank: ProjectInput = {
  title: "",
  description: "",
  category: "Web Development",
  semester: 1,
  githubUrl: "",
  demoUrl: "",
  technologies: [],
  memberIds: [],
  screenshotIds: [],
};
export function ProjectEditor() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<ProjectInput>(blank);
  const [images, setImages] = useState<Screenshot[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(!!id);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [aiError, setAiError] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [technology, setTechnology] = useState("");
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    void api
      .project(id, controller.signal)
      .then((p) => {
        if (p.ownerId !== user?.id) {
          setLoadError("Only the project owner can edit this project.");
          return;
        }
        setData({
          title: p.title,
          description: p.description,
          category: p.category,
          semester: p.semester,
          githubUrl: p.githubUrl || "",
          demoUrl: p.demoUrl || "",
          technologies: p.technologies.map((t) => t.name),
          memberIds: p.members.map((m) => m.userId),
          screenshotIds: p.screenshots.map((s) => s.id),
        });
        setImages(p.screenshots);
        setMembers(p.members.map((m) => m.user));
      })
      .catch((e: Error) => {
        if (!controller.signal.aborted) setLoadError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, user?.id]);
  function field<K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) {
    setData((previous) => ({ ...previous, [key]: value }));
  }
  function addTechnology() {
    const name = technology.trim().toLowerCase();
    if (
      name &&
      data.technologies.length < 15 &&
      !data.technologies.includes(name)
    )
      field("technologies", [...data.technologies, name]);
    setTechnology("");
  }
  async function generate() {
    setGenerating(true);
    setAiError("");
    try {
      setSuggestion(
        (
          await api.generate(
            {
              title: data.title,
              description: data.description,
              category: data.category,
              technologies: data.technologies,
            },
            id,
          )
        ).description,
      );
    } catch (e) {
      setAiError((e as Error).message);
    } finally {
      setGenerating(false);
    }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const p = await api.saveProject(
        {
          ...data,
          screenshotIds: images.map((s) => s.id),
          memberIds: members.map((m) => m.id),
        },
        id,
      );
      navigate(`/projects/${p.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <Loading label="Loading your project…" />;
  if (loadError)
    return (
      <div className="container page">
        <ErrorMessage message={loadError} />
        <Link to="/">Back to discover</Link>
      </div>
    );
  return (
    <div className="container page editor-page">
      <Link className="back-link" to={id ? `/projects/${id}` : "/"}>
        <ArrowLeft size={16} />
        {id ? "Back to project" : "Back to discover"}
      </Link>
      <div className="page-heading">
        <span className="eyebrow">YOUR WORK DESERVES TO BE SEEN</span>
        <h1>{id ? "Make it even better." : "What have you been building?"}</h1>
        <p>
          {id
            ? "Refine the details. Show how far your project has come."
            : "From first experiments to final-year projects. There’s a place for it here."}
        </p>
      </div>
      <form className="editor-layout" onSubmit={(event) => void submit(event)}>
        <div className="editor-fields">
          <section className="form-section">
            <div className="section-title">
              <span>01</span>
              <div>
                <h2>The essentials</h2>
                <p>Help people understand your project at a glance.</p>
              </div>
            </div>
            <label>
              Project title
              <input
                value={data.title}
                onChange={(e) => field("title", e.target.value)}
                placeholder="Give your project a name"
                minLength={3}
                maxLength={100}
                required
              />
            </label>
            <div className="form-row">
              <label>
                Category
                <select
                  value={data.category}
                  onChange={(e) => field("category", e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                Semester
                <select
                  value={data.semester}
                  onChange={(e) => field("semester", Number(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i + 1}>
                      Semester {i + 1}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="description-label">
              <label htmlFor="description">Project description</label>
              <button
                type="button"
                className="ai-button"
                disabled={
                  generating ||
                  data.title.trim().length < 3 ||
                  data.description.trim().length < 10
                }
                onClick={() => void generate()}
              >
                <Sparkles size={15} />
                {generating ? "Writing…" : "Generate with AI"}
              </button>
            </div>
            <textarea
              id="description"
              value={data.description}
              onChange={(e) => field("description", e.target.value)}
              placeholder="What does it do? What problem does it solve? Tell the story behind your build…"
              minLength={20}
              maxLength={10000}
              rows={7}
              required
            />
            <p className="field-hint">
              Start with a rough idea (at least 10 characters) to use AI. Your
              final description needs at least 20 characters.
            </p>
            <ErrorMessage message={aiError} />
            {suggestion && (
              <div className="ai-suggestion">
                <strong>
                  <Sparkles size={15} />A little writing inspiration
                </strong>
                <p>{suggestion}</p>
                <div className="button-row">
                  <button
                    type="button"
                    className="button primary"
                    onClick={() => {
                      field("description", suggestion);
                      setSuggestion("");
                    }}
                  >
                    <Check size={15} />
                    Use this draft
                  </button>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setSuggestion("")}
                  >
                    Keep mine
                  </button>
                </div>
                <small>You can edit this after accepting it.</small>
              </div>
            )}
          </section>
          <section className="form-section">
            <div className="section-title">
              <span>02</span>
              <div>
                <h2>Show, don’t just tell</h2>
                <p>A few screenshots help bring your idea to life.</p>
              </div>
            </div>
            <ScreenshotPicker
              images={images}
              onChange={setImages}
              onBusy={setUploading}
            />
          </section>
          <section className="form-section">
            <div className="section-title">
              <span>03</span>
              <div>
                <h2>Under the hood</h2>
                <p>The tools, code, and people that made it happen.</p>
              </div>
            </div>
            <label>
              Technologies
              <div className="technology-input">
                <input
                  value={technology}
                  onChange={(e) => setTechnology(e.target.value)}
                  placeholder="e.g. React, Python, PostgreSQL"
                  maxLength={30}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addTechnology();
                    }
                  }}
                />
                <button
                  type="button"
                  className="button secondary"
                  disabled={
                    !technology.trim() || data.technologies.length >= 15
                  }
                  onClick={addTechnology}
                >
                  <Plus size={15} />
                  Add
                </button>
              </div>
            </label>
            <div className="tags editable-tags">
              {data.technologies.map((t) => (
                <span key={t}>
                  {t}
                  <button
                    type="button"
                    aria-label={`Remove ${t}`}
                    onClick={() =>
                      field(
                        "technologies",
                        data.technologies.filter((v) => v !== t),
                      )
                    }
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
            <label>
              GitHub repository <span className="optional">optional</span>
              <input
                type="url"
                value={data.githubUrl}
                onChange={(e) => field("githubUrl", e.target.value)}
                placeholder="https://github.com/you/your-project"
                maxLength={2048}
              />
            </label>
            <label>
              Live demo <span className="optional">optional</span>
              <input
                type="url"
                value={data.demoUrl}
                onChange={(e) => field("demoUrl", e.target.value)}
                placeholder="https://your-project.com"
                maxLength={2048}
              />
            </label>
            <TeamPicker
              members={members}
              onChange={setMembers}
              ownerId={user!.id}
            />
          </section>
          <ErrorMessage message={error} />
          <div className="editor-submit">
            <Link
              className="button secondary"
              to={id ? `/projects/${id}` : "/"}
            >
              Cancel
            </Link>
            <button
              className="button primary"
              disabled={busy || uploading || generating}
            >
              {busy
                ? "Saving your project…"
                : id
                  ? "Save changes"
                  : "Publish project"}
              <ArrowUpRight size={17} />
            </button>
          </div>
        </div>
        <aside className="editor-aside">
          <span className="section-kicker">A GOOD SHOWCASE TELLS A STORY</span>
          <h3>Make it yours.</h3>
          <p>
            You don’t need a perfect project. Just something you’re proud to
            have built.
          </p>
          <ul>
            <li>Explain the problem you’re solving.</li>
            <li>Show the parts that make it special.</li>
            <li>Give your teammates some credit.</li>
            <li>Link your code so others can learn.</li>
          </ul>
          <div className="aside-divider" />
          <small>
            Your project will be public when you publish. You can edit it
            anytime.
          </small>
        </aside>
      </form>
    </div>
  );
}
