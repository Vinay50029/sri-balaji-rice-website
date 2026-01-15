import { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import PublicGallery from "./components/PublicGallery";
import PostModal from "./components/PostModal";
import OffersSection from "./components/OffersSection";
import BrandHero from "./components/BrandHero";

// getting subtitles for each rice category from constants
// these keys must match what we use in admin panel
import { RICE_CATEGORY_SUBTITLES } from "./utils/constants";

const KNOWN_SUBTITLES = RICE_CATEGORY_SUBTITLES;

function FatherPosts({ onCategorySelect, categories = [] }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    setLoading(true);
    // query to get all posts sorted by newest first
    const q = query(
      collection(db, "fatherPosts"),
      orderBy("createdAt", "desc")
    );

    // listening to real-time updates from firebase
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(data);
      setLoading(false);
    }, (err) => {
      console.error("Error loading fatherPosts:", err);
      setError("Failed to load posts.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <section className="py-5">
        <div className="container text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading posts...</span>
          </div>
          <p className="mt-3 text-muted">Loading posts...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-5">
        <div className="container">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </section>
    );
  }

  // checking for duplicate categories to avoid showing same section twice
  const uniqueCategories = [];
  const seenValues = new Set();
  categories.forEach(cat => {
    if (!seenValues.has(cat.value)) {
      seenValues.add(cat.value);
      uniqueCategories.push(cat);
    }
  });

  // preparing the data for each section
  // filtering posts that belong to each category
  const sectionsToRender = uniqueCategories.map((cat) => ({
    key: cat.value,
    title: cat.label,
    subtitle: KNOWN_SUBTITLES[cat.value] || `Explore our ${cat.label} collection`,
    posts: posts.filter(
      (post) => post.category === cat.value
    ),
  }));

  return (
    <>
      {/* huge banner at the top */}
      <BrandHero />

      {/* special offers section */}
      <OffersSection />

      {/* simple divider line to separate offers from products */}
      <div id="shop-start" style={{
        height: "4px",
        background: "linear-gradient(90deg, transparent, var(--color-primary), transparent)",
        margin: "20px 0",
        opacity: 0.8
      }} />

      {/* showing rice products category wise */}
      {sectionsToRender.map((section, index) => (
        <div key={section.key} id={`category-${section.key}`}>
          <PublicGallery
            posts={section.posts}
            onSelectPost={setSelectedPost}
            //label="Rice Category"
            title={section.title}
            subtitle={section.subtitle}
            emptyMessage={`No ${section.title} items yet.`}
          />
          {/* adding a light line between sections except after the last one */}
          {index < sectionsToRender.length - 1 && (
            <div style={{
              height: "4px",
              background: "linear-gradient(90deg, transparent, var(--color-primary), transparent)",
              margin: "20px 0",
              opacity: 0.8
            }} />
          )}
        </div>
      ))}
      {selectedPost && (
        <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </>
  );
}

export default FatherPosts;


