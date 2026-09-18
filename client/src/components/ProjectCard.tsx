import { ArrowUpRight, Code2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import type { Project } from "../types";
import { Avatar } from "./Avatar";
import { LikeButton } from "./LikeButton";
export function ProjectCard({ project }: { project: Project }) {
  const [broken, setBroken] = useState(false);
  const cover = project.screenshots[0];
  return (
    <article className="project-card">
      <Link
        className={`project-cover tone-${project.semester % 4}`}
        to={`/projects/${project.id}`}
        aria-label={`View ${project.title}`}
      >
        {cover && !broken ? (
          <img
            src={cover.url}
            alt={`${project.title} screenshot`}
            loading="lazy"
            onError={() => setBroken(true)}
          />
        ) : (
          <div className="project-monogram">
            <Code2 size={24} />
            <span>{project.title}</span>
          </div>
        )}
        <span className="cover-open">
          <ArrowUpRight size={18} />
        </span>
      </Link>
      <div className="project-card-body">
        <div className="card-eyebrow">
          {project.category}
          <span>semester {project.semester}</span>
        </div>
        <Link to={`/projects/${project.id}`} className="project-title">
          {project.title}
        </Link>
        <p>{project.description}</p>
        <div className="tags">
          {project.technologies.slice(0, 3).map((t) => (
            <span key={t.id}>{t.name}</span>
          ))}
          {project.technologies.length > 3 && (
            <span>+{project.technologies.length - 3}</span>
          )}
        </div>
      </div>
      <div className="card-footer">
        <Link to={`/profile/${project.owner.username}`} className="author">
          <Avatar user={project.owner} />
          <span>{project.owner.name}</span>
          {project.members.length > 0 && (
            <small>+{project.members.length}</small>
          )}
        </Link>
        <LikeButton
          key={`${project.liked}-${project.likeCount}`}
          id={project.id}
          liked={project.liked}
          count={project.likeCount}
        />
      </div>
    </article>
  );
}
