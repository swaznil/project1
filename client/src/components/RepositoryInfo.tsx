import { GitFork, Github, Star, ArrowUpRight } from "lucide-react";
import { api } from "../api";
import { useLoad } from "../hooks/useLoad";
import { ErrorMessage, Loading } from "./Feedback";
export function RepositoryInfo({ url }: { url: string }) {
  const { data, error, loading, reload } = useLoad(
    (signal) => api.github(url, signal),
    [url],
  );
  return (
    <div className="repository">
      <div className="section-kicker">
        <Github size={18} />
        FROM THE REPOSITORY
      </div>
      {loading ? (
        <Loading label="Loading GitHub information…" />
      ) : error ? (
        <>
          <ErrorMessage message={error} />
          <button type="button" className="text-button" onClick={reload}>
            Try again
          </button>
        </>
      ) : (
        data && (
          <>
            <a
              href={data.url}
              target="_blank"
              rel="noreferrer"
              className="repo-name"
            >
              {data.name}
              <ArrowUpRight size={18} />
            </a>
            {data.description && <p>{data.description}</p>}
            <div className="repo-stats">
              <span>
                <Star size={15} />
                {data.stars} stars
              </span>
              <span>
                <GitFork size={15} />
                {data.forks} forks
              </span>
              {data.language && (
                <span>
                  <i className="language-dot" />
                  {data.language}
                </span>
              )}
            </div>
            <small>
              Updated {new Date(data.updatedAt).toLocaleDateString()}
            </small>
          </>
        )
      )}
    </div>
  );
}
