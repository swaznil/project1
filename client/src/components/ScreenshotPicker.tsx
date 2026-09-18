import { useRef, useState } from "react";
import { ImagePlus, X, LoaderCircle } from "lucide-react";
import { api } from "../api";
import type { Screenshot } from "../types";
import { ErrorMessage } from "./Feedback";
export function ScreenshotPicker({
  images,
  onChange,
  onBusy,
}: {
  images: Screenshot[];
  onChange: (images: Screenshot[]) => void;
  onBusy: (busy: boolean) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    if (files.length + images.length > 6) {
      setError("You can add up to 6 screenshots.");
      return;
    }
    const selected = [...files];
    if (
      selected.some(
        (f) =>
          f.size > 5 * 1024 * 1024 ||
          !["image/png", "image/jpeg", "image/webp"].includes(f.type),
      )
    ) {
      setError("Choose PNG, JPG, or WebP files smaller than 5 MB.");
      return;
    }
    setBusy(true);
    onBusy(true);
    setError("");
    const uploaded: Screenshot[] = [];
    try {
      for (const file of selected) uploaded.push(await api.upload(file));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      onChange([...images, ...uploaded]);
      setBusy(false);
      onBusy(false);
      if (input.current) input.current.value = "";
    }
  }
  return (
    <div className="screenshot-picker">
      <input
        ref={input}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp"
        className="visually-hidden"
        onChange={(e) => void upload(e.target.files)}
        aria-label="Upload screenshots"
      />
      <button
        type="button"
        className="upload-zone"
        disabled={busy || images.length >= 6}
        onClick={() => input.current?.click()}
      >
        {busy ? (
          <LoaderCircle className="spin" size={26} />
        ) : (
          <ImagePlus size={26} />
        )}
        <strong>
          {busy
            ? "Uploading your screenshots…"
            : "Upload screenshots"}
        </strong>
        <span>
          PNG, JPG, or WebP · 5 MB each · Up to 6 images
        </span>
      </button>
      <ErrorMessage message={error} />
      <div className="upload-previews">
        {images.map((image, i) => (
          <div key={image.id}>
            <img src={image.url} alt={`Screenshot ${i + 1}`} />
            <span>{i === 0 ? "Cover image" : `Image ${i + 1}`}</span>
            <button
              type="button"
              className="icon-button"
              disabled={busy}
              aria-label={`Remove screenshot ${i + 1}`}
              onClick={() => onChange(images.filter((s) => s.id !== image.id))}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
