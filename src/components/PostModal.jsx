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
    mediaList = [
      {
        url: post.mediaURL,
        type: inferTypeFromUrl(post.mediaURL),
      },
    ];
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


function PostModal({ post, onClose }) {
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();

  if (!post) return null;

  const mediaList = buildMediaList(post);

  return (
    <div className="custom-modal-backdrop" onClick={onClose}>
      <div
        className="custom-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-end">

          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={onClose}
          />
        </div>

        <h4 className="mt-2 mb-3">{post.title || "Product"}</h4>

        <div className="post-modal-media-wrapper">
          <MediaSlider
            media={mediaList}
            aspectRatio="1 / 1"
            rounded={false}
            showDots
            objectFit="contain"
          />
        </div>
        <br />


        <p className="text-muted fw-semibold"> Weight: {post.weight || "Not specified"} </p>


        <p className="fw-semibold text-primary mb-1">Price: {formatPrice(post.price)}</p>

        <div className="mt-3">
          <h6>Description :</h6>
          <p className="text-muted bold-text">{post.description || "No description"}</p>
          <p className="text-muted">For more info contact 9951037494</p>

          {(() => {
            const cartItem = cartItems.find((item) => item.id === post.id);
            if (cartItem) {
              return (
                <div className="d-flex align-items-center justify-content-between mt-2 bg-light rounded border border-dark py-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-dark text-decoration-none px-4 fw-bold"
                    style={{ fontSize: "1.2rem" }}
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
                  <span className="fw-bold fs-5">{cartItem.quantity}</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-dark text-decoration-none px-4 fw-bold"
                    style={{ fontSize: "1.2rem" }}
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
                  className="btn btn-dark w-100 mt-2 d-flex align-items-center justify-content-center gap-2 py-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(post);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-cart-plus-fill" viewBox="0 0 16 16">
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
}

export default PostModal;


