import {
  AlertCircle,
  LoaderCircle,
  ArrowRight,
  FolderOpen,
} from "lucide-react";
import { Link } from "react-router-dom";
export function ErrorMessage({ message }: { message: string }) {
  return message ? (
    <div role="alert" className="feedback error">
      <AlertCircle size={18} />
      <span>{message}</span>
    </div>
  ) : null;
}
export function SuccessMessage({ message }: { message: string }) {
  return message ? (
    <div role="status" className="feedback success">
      {message}
    </div>
  ) : null;
}
export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="loading" role="status">
      <LoaderCircle className="spin" size={22} />
      {label}
    </div>
  );
}
export function Empty({
  title = "Room for your next idea.",
  description = "No projects here yet. Share something you’ve built and get the conversation started.",
  create = true,
}: {
  title?: string;
  description?: string;
  create?: boolean;
}) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <FolderOpen size={28} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {create && (
        <Link className="button primary" to="/projects/new">
          Share a project <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}
