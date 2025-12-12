import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "./firebase";
import PublicGallery from "./components/PublicGallery";
import PostModal from "./components/PostModal";

function OtherProducts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const q = query(
          collection(db, "otherProducts"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setPosts(data);
      } catch (err) {
        console.error("Error loading otherProducts:", err);
        setError("Failed to load other products.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
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
        title="Millets & Other Products"
        subtitle="Explore additional items we supply apart from regular rice bags."
        emptyMessage="No additional products available right now."
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


