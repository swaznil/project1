import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { api } from "../api";
import type { User } from "../types";
import { Avatar } from "./Avatar";
import { ErrorMessage } from "./Feedback";
export function TeamPicker({
  members,
  onChange,
  ownerId,
}: {
  members: User[];
  onChange: (users: User[]) => void;
  ownerId: string;
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    if (search.trim().length < 2) {
      setResults([]);
      setBusy(false);
      return;
    }
    setBusy(true);
    setError("");
    const timer = setTimeout(() => {
      void api
        .users(search.trim(), controller.signal)
        .then(setResults)
        .catch((e: Error) => {
          if (!controller.signal.aborted) setError(e.message);
        })
        .finally(() => {
          if (!controller.signal.aborted) setBusy(false);
        });
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search]);
  return (
    <div className="team-picker">
      <label>
        Team members <span className="optional">optional</span>
        <div className="input-icon">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find a registered student by name…"
            maxLength={80}
          />
        </div>
      </label>
      <p className="field-hint">
        You’re listed as the owner. Add up to 12 collaborators.
      </p>
      <ErrorMessage message={error} />
      {busy && <small>Finding students…</small>}
      {search.length >= 2 && !busy && !error && (
        <div className="team-results">
          {results
            .filter(
              (u) => u.id !== ownerId && !members.some((m) => m.id === u.id),
            )
            .map((u) => (
              <button
                type="button"
                key={u.id}
                disabled={members.length >= 12}
                onClick={() => {
                  onChange([...members, u]);
                  setSearch("");
                }}
              >
                <Avatar user={u} />
                {u.name}
                <small>@{u.username}</small>
              </button>
            ))}
          {results.length === 0 && <p>No matching students yet.</p>}
        </div>
      )}
      <div className="selected-members">
        {members.map((u) => (
          <span key={u.id}>
            <Avatar user={u} />
            {u.name}
            <button
              type="button"
              className="icon-button"
              aria-label={`Remove ${u.name}`}
              onClick={() => onChange(members.filter((m) => m.id !== u.id))}
            >
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
