import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "./firebase";
import PublicGallery from "./components/PublicGallery";
import PostModal from "./components/PostModal";

function OtherProducts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    setLoading(true);
    // getting the other products list from firebase
    // ordering by date so new ones show first
    const q = query(
      collection(db, "otherProducts"),
      orderBy("createdAt", "desc")
    );

    // real-time listener for updates
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setPosts(data);
      setLoading(false);
    }, (err) => {
      console.error("Error loading otherProducts:", err);
      setError("Failed to load other products.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <section className="py-5">
        <div className="container text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading products...</span>
          </div>
          <p className="mt-3 text-muted">Loading products...</p>
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

  return (
    <>
      <PublicGallery
        posts={posts}
        onSelectPost={setSelectedProduct}
        //label="Other Products"
        title="Kitchen Essentials"
        subtitle="Premium pulses, millets, flours, and other daily staples."
        emptyMessage="No kitchen essentials available right now."
      />

      {selectedProduct && (
        <PostModal
          post={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}

export default OtherProducts;


