
import { useState } from "react";


// a nice slider component to show images or videos
// we use this in the product cards to swipe through media
function MediaSlider({
  media = [],
  height = 240,
  aspectRatio = null,
  rounded = true,
  onClick,
  showDots = true,
  objectFit = "cover",
}) {
  const [index, setIndex] = useState(0);


  // if there's no media, we just show a gray box saying "No media"
  if (!media.length) {
    return (
      <div
        className="bg-light d-flex align-items-center justify-content-center text-muted"
        style={{
          ...(aspectRatio ? { aspectRatio, width: "100%" } : { height }),
          borderRadius: rounded ? 12 : 0,
          cursor: onClick ? "pointer" : "default",
          backgroundColor: "#f8f9fa",
        }}
        onClick={onClick}
      >
        No media
      </div>
    );
  }

  // getting the current item to show
  const current = media[index];

  // handling the previous button click
  // used e.stopPropagation() so it doesn't trigger the card click event
  const goPrev = (e) => {
    e.stopPropagation();
    setIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  // handling the next button click
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

      {/* checking if it's a video or image and rendering accordingly */}
      {current.type === "video" ? (
        <video
          src={current.url}
          controls
          style={{
            width: "100%",
            height: "100%",
            objectFit,
            backgroundColor: "#000",
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
            backgroundColor: "#f8f9fa",
          }}
        />
      )}

      {/* showing navigation arrows only if there's more than 1 item */}
      {media.length > 1 && (
        <>

          <button
            type="button"
            className="btn btn-light position-absolute top-50 start-0 translate-middle-y"
            style={{ opacity: 0.40 }}
            onClick={goPrev}
          >
            ‹
          </button>

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

      {/* showing the little dots at the bottom to indicate position */}
      {showDots && media.length > 1 && (
        <div
          className="position-absolute bottom-0 start-50 translate-middle-x mb-2 d-flex gap-1"
        >
          {media.map((_, dotIndex) => (
            <span
              key={`dot-${dotIndex}`}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",


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
