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


function PublicGallery({
  posts,
  onSelectPost,
  lable = "Our Updates",
  title = "Posts",
  subtitle = "photos, videos, and notes directly from our store.",
  emptyMessage = "No posts have been added yet. Check back soon!",
}) {
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
  return (
    <section className="py-5">
      <div className="container">
        <div className="text-center mb-4">
          <h2 className="fw-semibold">{title}</h2>
          <p className="text-muted mb-0">{subtitle}</p>
        </div>

        {posts.length === 0 ? (
          <div className="alert alert-info text-center" role="alert">
            {emptyMessage}
          </div>
        ) : (
          <div className="row gy-4 text-dark">
            {posts.map((post) => {
              const mediaList = buildMediaList(post);
              const descriptionPreview = post.description
                ? post.description.length > 120
                  ? `${post.description.slice(0, 117)}...`
                  : post.description
                : "No description provided.";

              return (
                <div className="col-6 col-sm-6 col-lg-3" key={post.id}>

                  <div className="card h-100 shadow-sm border-0">
                    <MediaSlider
                      media={mediaList}
                      aspectRatio="1 / 1"
                      objectFit="contain"
                      onClick={() => onSelectPost?.(post)}
                    />

                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title text-dark">{post.title || "Unnamed product"}</h5>

                      <p className="fw-semibold text-primary mb-1">
                        {formatPrice(post.price)}
                      </p>

                      <p className="text-muted mb-3">
                        Weight: {post.weight || "Not specified"}
                      </p>
                      {(() => {
                        const cartItem = cartItems.find((item) => item.id === post.id);
                        if (cartItem) {
                          return (
                            <div className="d-flex align-items-center justify-content-between mt-auto bg-light rounded border border-dark">
                              <button
                                type="button"
                                className="btn btn-sm btn-link text-dark text-decoration-none px-3 fw-bold"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (cartItem.quantity > 1) {
                                    updateQuantity(post.id, -1);
                                  } else {
                                    removeFromCart(post.id);
                                  }
                                }}
                              >
                                −
                              </button>
                              <span className="fw-bold">{cartItem.quantity}</span>
                              <button
                                type="button"
                                className="btn btn-sm btn-link text-dark text-decoration-none px-3 fw-bold"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateQuantity(post.id, 1);
                                }}
                              >
                                +
                              </button>
                            </div>
                          );
                        } else {
                          return (
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
                          );
                        }
                      })()}
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


