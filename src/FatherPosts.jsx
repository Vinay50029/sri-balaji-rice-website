import { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import PublicGallery from "./components/PublicGallery";
import PostModal from "./components/PostModal";
import OffersSection from "./components/OffersSection";

// ============================================
// RICE CATEGORY SECTIONS - CUSTOMIZE TEXT HERE
// ============================================
// TO CHANGE CATEGORY TITLES: Change "title" value below (e.g., "Raw Rice" → "Premium Raw Rice")
// TO CHANGE CATEGORY SUBTITLES: Change "subtitle" value below (the description text)
// TO ADD/REMOVE CATEGORIES: Add or remove objects from this array
// NOTE: The "key" must match the category values used in FatherAdmin.jsx
const KNOWN_SUBTITLES = {
  raw: "Classic raw rice varieties straight from the mill.",
  new: "Freshly milled new-season rice.",
  old: "Aged rice for premium aroma and texture.",
  steam: "Steamed rice varieties with a fluffy finish.",
  broken: "Broken rice options for everyday cooking.",
  brown: "Healthy brown rice packed with nutrients.",
  Premium: "Premium quality rice varieties for special occasions.",
};

function FatherPosts({ onCategorySelect, categories = [] }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      setError("");
      try {
        const q = query(
          collection(db, "fatherPosts"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(data);
      } catch (err) {
        console.error("Error loading fatherPosts:", err);
        setError("Failed to load posts.");
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
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

  // Deduplicate categories based on value
  const uniqueCategories = [];
  const seenValues = new Set();
  categories.forEach(cat => {
    if (!seenValues.has(cat.value)) {
      seenValues.add(cat.value);
      uniqueCategories.push(cat);
    }
  });

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
      {/* OFFERS SECTION - First section before rice categories */}
      <OffersSection />

      {/* DIVIDER LINE AFTER OFFERS */}
      <div style={{
        borderTop: "1px solid rgb(0, 0, 0)",
        margin: "40px 0",
        width: "100%"
      }} />

      {/* RICE CATEGORY SECTIONS */}
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
          {/* Light divider line after each section (except the last one) */}
          {index < sectionsToRender.length - 1 && (
            <div style={{
              borderTop: "1px solid rgb(0, 0, 0)",
              margin: "40px 0",
              width: "100%"
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


