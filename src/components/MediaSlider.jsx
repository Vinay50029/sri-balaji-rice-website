import { useState } from "react";

// ============================================
// MEDIA SLIDER COMPONENT - CUSTOMIZE COLORS & STYLES HERE
// ============================================
function MediaSlider({
  media = [],
  height = 240, // TO CHANGE DEFAULT HEIGHT: Change this value (in pixels)
  aspectRatio = null, // TO CHANGE ASPECT RATIO: Pass "1 / 1" (square), "4 / 3" (wider), "16 / 9" (wide), etc.
  rounded = true, // TO CHANGE CORNER RADIUS: Set to false for sharp corners, or change borderRadius value below
  onClick,
  showDots = true, // TO SHOW/HIDE NAVIGATION DOTS: Set to false to hide
  objectFit = "cover", // TO CHANGE IMAGE FIT: "cover" (fills, may crop), "contain" (shows full, may have gaps)
}) {
  const [index, setIndex] = useState(0);

  // EMPTY STATE - When no media is available
  if (!media.length) {
    return (
      <div
        className="bg-light d-flex align-items-center justify-content-center text-muted"
        style={{
          ...(aspectRatio ? { aspectRatio, width: "100%" } : { height }),
          borderRadius: rounded ? 12 : 0, // TO CHANGE CORNER RADIUS: Change 12 to your preferred value (e.g., 8, 16, 20)
          cursor: onClick ? "pointer" : "default",
          backgroundColor: "#f8f9fa", // TO CHANGE EMPTY STATE BACKGROUND COLOR: Change this hex color
        }}
        onClick={onClick}
      >
        {/* TO CHANGE EMPTY STATE TEXT: Change "No media" below */}
        No media
      </div>
    );
  }

  const current = media[index];
  const goPrev = (e) => {
    e.stopPropagation();
    setIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };
  const goNext = (e) => {
    e.stopPropagation();
    setIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className="position-relative"
      style={{
        borderRadius: rounded ? 12 : 0,
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        ...(aspectRatio ? { aspectRatio, width: "100%" } : { height }),
      }}
      onClick={onClick}
    >
      {/* VIDEO OR IMAGE DISPLAY */}
      {current.type === "video" ? (
        <video
          src={current.url}
          controls
          style={{
            width: "100%",
            height: "100%",
            objectFit,
            backgroundColor: "#000", // TO CHANGE VIDEO BACKGROUND COLOR: Change this hex color
          }}
        />
      ) : (
        <img
          src={current.url}
          alt={current.name || "Media"}
          style={{
            width: "100%",
            height: "100%",
            objectFit,
            backgroundColor: "#f8f9fa", // TO CHANGE IMAGE BACKGROUND COLOR: Change this hex color (shows if image doesn't fill)
          }}
        />
      )}

      {/* NAVIGATION ARROWS - Only show if more than 1 media item */}
      {media.length > 1 && (
        <>
          {/* PREVIOUS BUTTON */}
          {/* TO CHANGE ARROW BUTTON COLOR: Change "btn-light" to "btn-dark", "btn-primary", etc. */}
          {/* TO CHANGE ARROW BUTTON OPACITY: Change opacity: 0.85 to 0.5 (more transparent) or 1 (fully opaque) */}
          {/* TO CHANGE ARROW SYMBOL: Change "‹" to "←" or any other symbol */}
          <button
            type="button"
            className="btn btn-light position-absolute top-50 start-0 translate-middle-y"
            style={{ opacity: 0.40 }}
            onClick={goPrev}
          >
            ‹
          </button>
          {/* NEXT BUTTON */}
          <button
            type="button"
            className="btn btn-light position-absolute top-50 end-0 translate-middle-y"
            style={{ opacity: 0.40 }}
            onClick={goNext}
          >
            ›
          </button>
        </>
      )}

      {/* NAVIGATION DOTS - Only show if more than 1 media item and showDots is true */}
      {showDots && media.length > 1 && (
        <div
          className="position-absolute bottom-0 start-50 translate-middle-x mb-2 d-flex gap-1"
        >
          {media.map((_, dotIndex) => (
            <span
              key={`dot-${dotIndex}`}
              style={{
                width: 8, // TO CHANGE DOT SIZE: Change this value (e.g., 6 for smaller, 10 for larger)
                height: 8, // TO CHANGE DOT SIZE: Change this value (must match width for circle)
                borderRadius: "50%",
                // TO CHANGE ACTIVE DOT COLOR: Change "#0d6efd" (blue) to any hex color (e.g., "#28a745" for green)
                // TO CHANGE INACTIVE DOT COLOR: Change "rgba(0, 0, 0, 0.7)" to any color/opacity
                backgroundColor: dotIndex === index ? "rgba(0, 0, 0, 0.7)" : "rgba(255,255,255,0.7)",
                display: "inline-block",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MediaSlider;


