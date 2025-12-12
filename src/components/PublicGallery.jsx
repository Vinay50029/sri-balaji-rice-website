import MediaSlider from "./MediaSlider";
import { useCart } from "../context/CartContext";

const inferTypeFromUrl = (url = "") => {
  if (url.match(/\.(mp4|mov|m4v|webm|avi|mkv)$/i)) {
    return "video";
  }
  return "image";
};

const buildMediaList = (post) => {
  let mediaList = [];

  if (Array.isArray(post.media) && post.media.length > 0) {
    mediaList = post.media;
  } else if (post.mediaURL) {
    mediaList = [{ url: post.mediaURL, type: inferTypeFromUrl(post.mediaURL) }];
  }

  // Sort: images first, then videos
  return mediaList.sort((a, b) => {
    const aType = a.type || inferTypeFromUrl(a.url || "");
    const bType = b.type || inferTypeFromUrl(b.url || "");
    if (aType === "image" && bType === "video") return -1;
    if (aType === "video" && bType === "image") return 1;
    return 0;
  });
};
const formatPrice = (price) => {
  if (price === null || price === undefined || Number.isNaN(Number(price))) {
    return "Price unavailable";
  }
  return `₹${Number(price).toLocaleString("en-IN")}`;
};

// ============================================
// PUBLIC GALLERY COMPONENT - CUSTOMIZE COLORS & TEXT HERE
// ============================================
function PublicGallery({
  posts,
  onSelectPost,
  lable = "Our Updates", // TO CHANGE LABEL TEXT: Change default value here
  title = "Posts", // TO CHANGE TITLE TEXT: Change default value here
  subtitle = "photos, videos, and notes directly from our store.", // TO CHANGE SUBTITLE TEXT: Change default value here
  emptyMessage = "No posts have been added yet. Check back soon!", // TO CHANGE EMPTY MESSAGE: Change default value here
}) {
  const { addToCart } = useCart();
  return (
    // TO CHANGE SECTION SPACING: Change "py-5" to "py-3" (less) or "py-6" (more)
    <section className="py-5">
      <div className="container">
        {/* SECTION HEADER */}
        <div className="text-center mb-4">
          {/* TO SHOW/HIDE LABEL: Uncomment the line below and change text */}
          {/* <p className="text-uppercase text-muted small mb-1">{label}</p> */}
          {/* TO CHANGE TITLE COLOR: Change className to "text-primary", "text-dark", etc. */}
          {/* TO CHANGE TITLE SIZE: Change "fw-semibold" to "fw-bold" or add style={{ fontSize: "24px" }} */}
          <h2 className="fw-semibold">{title}</h2>
          {/* TO CHANGE SUBTITLE COLOR: Change "text-muted" to "text-secondary", "text-info", etc. */}
          <p className="text-muted mb-0">{subtitle}</p>
        </div>

        {/* EMPTY STATE MESSAGE */}
        {/* TO CHANGE EMPTY MESSAGE COLOR: Change "alert-info" to "alert-warning", "alert-secondary", etc. */}
        {posts.length === 0 ? (
          <div className="alert alert-info text-center" role="alert">
            {emptyMessage}
          </div>
        ) : (
          // PRODUCT CARDS GRID
          // TO CHANGE CARDS PER ROW: 
          // Mobile: "col-6" = 2 cards, "col-12" = 1 card, "col-4" = 3 cards
          // Tablet: "col-sm-6" = 2 cards, "col-sm-4" = 3 cards
          // Desktop: "col-lg-3" = 4 cards, "col-lg-4" = 3 cards, "col-lg-6" = 2 cards
          <div className="row gy-4 text-dark">
            {posts.map((post) => {
              const mediaList = buildMediaList(post);
              const descriptionPreview = post.description
                ? post.description.length > 120
                  ? `${post.description.slice(0, 117)}...`
                  : post.description
                : "No description provided.";

              return (
                // TO CHANGE CARDS PER ROW: col-md-4 = 3 cards per row on medium+ screens, col-12 = 1 card on mobile, col-sm-6 = 2 cards on small screens
                <div className="col-6 col-sm-6 col-lg-3" key={post.id}>
                  {/* PRODUCT CARD */}
                  {/* TO CHANGE CARD SHADOW: Change "shadow-sm" to "shadow" (more) or "shadow-lg" (most) or remove for no shadow */}
                  {/* TO CHANGE CARD BORDER: Change "border-0" to "border" or add style={{ border: "2px solid #yourcolor" }} */}
                  <div className="card h-100 shadow-sm border-0">
                    {/* PRODUCT IMAGE/VIDEO SLIDER */}
                    {/* TO CHANGE IMAGE SHAPE: Change aspectRatio="1 / 1" to "4 / 3" (wider) or "3 / 4" (taller) */}
                    {/* TO CHANGE IMAGE FIT: Change objectFit="contain" to "cover" (crops to fill) */}
                    <MediaSlider
                      media={mediaList}
                      aspectRatio="1 / 1"
                      objectFit="contain"
                      onClick={() => onSelectPost?.(post)}
                    />

                    {/* CARD CONTENT */}
                    <div className="card-body d-flex flex-column">
                      {/* PRODUCT TITLE */}
                      {/* TO CHANGE TITLE COLOR: Add className="text-primary" or "text-dark" */}
                      {/* TO CHANGE FALLBACK TEXT: Change "Unnamed product" */}
                      <h5 className="card-title text-dark">{post.title || "Unnamed product"}</h5>

                      {/* TO SHOW DESCRIPTION: Uncomment the lines below */}
                      {/* <p className="text-muted small flex-grow-1 mb-2">
                        {descriptionPreview}
                      </p> */}

                      {/* PRODUCT PRICE */}
                      {/* TO CHANGE PRICE COLOR: Change "text-primary" to "text-success", "text-danger", etc. */}
                      {/* TO CHANGE PRICE FONT WEIGHT: Change "fw-semibold" to "fw-bold" or "fw-normal" */}
                      <p className="fw-semibold text-primary mb-1">
                        {formatPrice(post.price)}
                      </p>
                      {/* PRODUCT WEIGHT */}
                      {/* TO CHANGE WEIGHT TEXT COLOR: Change "text-muted" to "text-secondary", etc. */}
                      {/* TO CHANGE FALLBACK TEXT: Change "Not specified" */}
                      <p className="text-muted mb-3">
                        Weight: {post.weight || "Not specified"}
                      </p>

                      {/* VIEW DETAILS BUTTON */}
                      {/* TO CHANGE BUTTON SIZE: Change "btn-sm" to "btn-lg" or remove for default */}
                      {/* <button
                        type="button"
                        className="btn btn-outline-dark btn-sm mt-auto"
                        onClick={() => onSelectPost?.(post)}
                      >
                        View Details
                      </button> */}
                      <button
                        type="button"
                        className="btn btn-dark btn-sm mt-auto d-flex align-items-center justify-content-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(post);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cart-plus-fill" viewBox="0 0 16 16">
                          <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM9 5.5V7h1.5a.5.5 0 0 1 0 1H9v1.5a.5.5 0 0 1-1 0V8H6.5a.5.5 0 0 1 0-1H8V5.5a.5.5 0 0 1 1 0z" />
                        </svg>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section >
  );
}

export default PublicGallery;


