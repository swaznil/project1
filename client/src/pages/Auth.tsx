import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Code2,
  Mail,
  LockKeyhole,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { api } from "../api";
import { useAuth } from "../hooks/useAuth";
import { ErrorMessage, SuccessMessage } from "../components/Feedback";
type Mode =
  "login" | "register" | "verify-email" | "forgot-password" | "reset-password";
const copy: Record<
  Mode,
  { eyebrow: string; title: string; description: string; button: string }
> = {
  login: {
    eyebrow: "GOOD TO SEE YOU AGAIN",
    title: "Welcome back, builder.",
    description: "Your next great project starts here.",
    button: "Log in",
  },
  register: {
    eyebrow: "IDEAS BELONG OUT IN THE WORLD",
    title: "Make yourself at home.",
    description: "Join a community of students building something new.",
    button: "Create account",
  },
  "verify-email": {
    eyebrow: "ONE LAST THING",
    title: "Check your inbox.",
    description:
      "Open the link we emailed you, then confirm your email below. Links expire after 30 minutes.",
    button: "Verify email",
  },
  "forgot-password": {
    eyebrow: "LET’S GET YOU BACK IN",
    title: "Forgot your password?",
    description: "Enter your email and we’ll send you a password reset link.",
    button: "Send reset link",
  },
  "reset-password": {
    eyebrow: "A FRESH START",
    title: "Choose a new password.",
    description: "Make it at least 10 characters and something only you know.",
    button: "Reset password",
  },
};
export function AuthPage({ mode }: { mode: Mode }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState(params.get("email") || "");
  const [verified, setVerified] = useState(false);
  const c = copy[mode];
  const token = params.get("token") || "";
  const needsPassword = ["login", "register", "reset-password"].includes(mode);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    try {
      if (mode === "login") {
        await login(email, password);
        const next = params.get("next");
        navigate(
          next &&
            next.startsWith("/") &&
            !next.startsWith("//") &&
            !next.includes("\\")
            ? next
            : "/",
          { replace: true },
        );
      } else if (mode === "register") {
        await api.auth("register", { name: form.get("name"), email, password });
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
      } else if (mode === "verify-email") {
        const result = await api.auth("verify-email", { token });
        setSuccess(result.message);
        setVerified(true);
      } else if (mode === "reset-password") {
        const result = await api.auth(mode, { token, password });
        setSuccess(result.message);
        setVerified(true);
      } else {
        const result = await api.auth(mode, { email });
        setSuccess(result.message);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function resend() {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      setSuccess((await api.auth("resend-verification", { email })).message);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-layout container">
      <aside className="auth-aside">
        <div className="auth-glyph">
          <Code2 size={50} />
        </div>
        <span className="overline">FOR THE THINGS YOU CAN’T WAIT TO BUILD</span>
        <h2>
          A class project.
          <br />A weekend idea.
          <br />
          <span>Your next chapter.</span>
        </h2>
        <p>
          Give your work a place beyond your laptop.
          <br />
          Find inspiration. Share the process. Keep building.
        </p>
        <div className="auth-aside-bottom">
          <span className="tiny-square" />
          MADE BY STUDENTS. BUILT FOR WHAT’S NEXT.
        </div>
      </aside>
      <section className="auth-panel">
        <span className="eyebrow">{c.eyebrow}</span>
        <h1>{c.title}</h1>
        <p className="form-intro">{c.description}</p>
        <ErrorMessage message={error} />
        <SuccessMessage message={success} />
        {verified ? (
          <Link className="button primary full-width" to="/login">
            Continue to login <ArrowRight size={17} />
          </Link>
        ) : (
          <form onSubmit={(event) => void submit(event)} className="form-stack">
            {mode === "register" && (
              <label>
                Full name
                <input
                  name="name"
                  autoComplete="name"
                  placeholder="Your name"
                  required
                  minLength={2}
                  maxLength={80}
                />
              </label>
            )}
            {mode !== "reset-password" &&
              !(mode === "verify-email" && token) && (
                <label>
                  Email address
                  <div className="input-icon">
                    <Mail size={17} />
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="you@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </label>
              )}
            {needsPassword && (
              <label>
                {mode === "reset-password" ? "New password" : "Password"}
                <div className="input-icon">
                  <LockKeyhole size={17} />
                  <input
                    type={show ? "text" : "password"}
                    name="password"
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    placeholder={
                      mode === "login"
                        ? "Your password"
                        : "At least 10 characters"
                    }
                    minLength={mode === "login" ? 1 : 10}
                    maxLength={72}
                    required
                  />
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={show ? "Hide password" : "Show password"}
                    onClick={() => setShow(!show)}
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>
            )}
            {mode === "login" && (
              <Link className="forgot-link" to="/forgot-password">
                Forgot password?
              </Link>
            )}
            {mode === "verify-email" && !token ? (
              <button
                type="button"
                className="button primary full-width"
                onClick={() => void resend()}
                disabled={busy || !email}
              >
                {busy ? "Sending…" : "Resend verification email"}
                <ArrowRight size={17} />
              </button>
            ) : (
              <button
                className="button primary full-width"
                disabled={busy || (mode === "reset-password" && !token)}
              >
                {busy ? "Please wait…" : c.button}
                {mode === "verify-email" ? (
                  <Check size={17} />
                ) : (
                  <ArrowRight size={17} />
                )}
              </button>
            )}
            {mode === "reset-password" && !token && (
              <ErrorMessage message="Open this page from your reset email to set a new password." />
            )}
          </form>
        )}
        <div className="auth-switch">
          {mode === "login" ? (
            <>
              New to ProjectHub? <Link to="/register">Join the community</Link>
              <p>
                <Link to="/verify-email">Need a verification email?</Link>
              </p>
            </>
          ) : mode === "register" ? (
            <>
              Already part of the community? <Link to="/login">Log in</Link>
            </>
          ) : (
            <Link to="/login">Back to login</Link>
          )}
        </div>
        <div className="auth-smallprint">
          Your code has a home. Now your projects do, too.
        </div>
      </section>
    </div>
  );
}
