/** Fixed, drifting colour field behind all content. Pure CSS transforms (cheap);
 *  motion is disabled under prefers-reduced-motion via globals.css. */
export default function Aurora() {
  return (
    <div className="aurora" aria-hidden="true">
      <div className="blob blob-1 animate-drift" />
      <div className="blob blob-2 animate-driftAlt" />
      <div className="blob blob-3 animate-drift" style={{ animationDelay: "-6s" }} />
      <div className="blob blob-4 animate-driftAlt" style={{ animationDelay: "-9s" }} />
    </div>
  );
}
