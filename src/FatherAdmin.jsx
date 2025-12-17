import { useEffect, useState } from "react";
import axios from "axios";
import { auth, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import OrdersTab from "./components/OrdersTab";

import {
  FATHER_UID,
  ADMIN_COLLECTIONS,
  INITIAL_RICE_CATEGORIES
} from "./utils/constants";
// ... (imports)

// TODO: Replace this with your father's real Firebase Auth UID
// After creating the account in Firebase Authentication, copy the UID and paste below.
// const FATHER_UID = "lvWMnEjk3bcFMOWuaa7DWdhkLWb2";

const COLLECTIONS = ADMIN_COLLECTIONS;

// const INITIAL_RICE_CATEGORIES = [
//   { value: "raw", label: "Sona Masuri raw Rice" },
//   { value: "new", label: "JSR Rice" },
//   { value: "old", label: "HMT Rice" },
//   { value: "steam", label: "Single Polish Rice" },
//   { value: "broken", label: "Lachkari Kolam Rice" },
//   { value: "brown", label: "Brown Rice" },
//   { value: "Premium", label: "Premium Rice" },
// ];

// ============================================
// FORM INPUT STYLES - CUSTOMIZE COLORS & SIZES HERE
// ============================================
const inputStyle = {
  width: "100%",
  padding: "10px 12px", // TO CHANGE INPUT PADDING: Change these values
  borderRadius: 10, // TO CHANGE INPUT CORNER RADIUS: Change this value (e.g., 8, 12, 16)
  border: "1px solid #d0d5dd", // TO CHANGE INPUT BORDER COLOR: Change this hex color
  fontSize: 14, // TO CHANGE INPUT TEXT SIZE: Change this value (e.g., 12, 16, 18)
  outline: "none",
};

const textareaStyle = {
  ...inputStyle,
  minHeight: 120, // TO CHANGE TEXTAREA HEIGHT: Change this value (in pixels)
  resize: "vertical",
};

// FORM CARD STYLE (currently not used, but kept for reference)
const formCardStyle = {
  background: "#fff", // TO CHANGE FORM BACKGROUND: Change this hex color
  borderRadius: 16, // TO CHANGE FORM CORNER RADIUS: Change this value
  border: "1px solid #e4e7ec", // TO CHANGE FORM BORDER COLOR: Change this hex color
  padding: 20, // TO CHANGE FORM PADDING: Change this value
  boxShadow: "0 10px 35px rgba(15, 23, 42, 0.08)", // TO CHANGE FORM SHADOW: Modify this value
  maxWidth: 800, // TO CHANGE FORM MAX WIDTH: Change this value (in pixels)
};

// CATEGORY CHIP/BADGE STYLE - Used to display category tags
const chipStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: 12, // TO CHANGE CHIP TEXT SIZE: Change this value
  borderRadius: 999, // TO CHANGE CHIP CORNER RADIUS: Change this value (999 = fully rounded)
  padding: "4px 12px", // TO CHANGE CHIP PADDING: Change these values
  background: "#e7f1ff", // TO CHANGE CHIP BACKGROUND COLOR: Change this hex color (light blue)
  color: "#0d6efd", // TO CHANGE CHIP TEXT COLOR: Change this hex color (blue)
  fontWeight: 600, // TO CHANGE CHIP TEXT WEIGHT: Change to 400 (normal) or 700 (bold)
};

function FatherAdmin() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [category, setCategory] = useState("");
  const [icon, setIcon] = useState("🎁");
  const [color, setColor] = useState("success");
  const [editingPostId, setEditingPostId] = useState(null);
  const [collectionKey, setCollectionKey] = useState("fatherPosts");
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState("");

  // Dynamic Categories State
  const [categories, setCategories] = useState([]);
  const [newCategoryLabel, setNewCategoryLabel] = useState("");
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const q = query(collection(db, "riceCategories"), orderBy("createdAt", "asc"));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Seed initial categories if empty
        console.log("Seeding initial categories...");
        const batch = writeBatch(db);
        INITIAL_RICE_CATEGORIES.forEach((cat) => {
          const docRef = doc(collection(db, "riceCategories"));
          batch.set(docRef, {
            ...cat,
            createdAt: serverTimestamp()
          });
        });
        await batch.commit();
        // Fetch again after seeding
        const newQ = query(collection(db, "riceCategories"), orderBy("createdAt", "asc"));
        const newSnapshot = await getDocs(newQ);
        const newCats = newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(newCats);
        if (newCats.length > 0) setCategory(newCats[0].value);
      } else {
        const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Deduplicate categories based on value
        const uniqueCats = [];
        const seenValues = new Set();
        cats.forEach(cat => {
          if (!seenValues.has(cat.value)) {
            seenValues.add(cat.value);
            uniqueCats.push(cat);
          }
        });

        setCategories(uniqueCats);
        if (uniqueCats.length > 0 && !category) setCategory(uniqueCats[0].value);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryLabel.trim()) return;

    try {
      const value = newCategoryLabel.toLowerCase().trim().replace(/\s+/g, "_");
      // Check if already exists
      if (categories.some(c => c.value === value)) {
        alert("Category already exists!");
        return;
      }

      await addDoc(collection(db, "riceCategories"), {
        label: newCategoryLabel.trim(),
        value: value,
        createdAt: serverTimestamp()
      });

      setNewCategoryLabel("");
      fetchCategories();
      alert("Category added successfully!");
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category.");
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm("Are you sure you want to delete this category? Products in this category will remain but may appear uncategorized.")) return;

    try {
      await deleteDoc(doc(db, "riceCategories", catId));
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category.");
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) {
      setPosts([]);
      setLoadingPosts(false);
      return;
    }
    fetchPosts(collectionKey);
  }, [user, collectionKey]);

  const fetchPosts = async (targetCollection = collectionKey) => {
    setLoadingPosts(true);
    setPostsError("");
    try {
      const q = query(
        collection(db, targetCollection),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setPosts(data);
    } catch (error) {
      console.error("Error loading posts:", error);
      setPostsError("Failed to load posts.");
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error("Login error:", err);
      setAuthError("Login failed. Please check email/password.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleFileSelection = (event) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const uploadSelectedFiles = async () => {
    if (!selectedFiles.length) {
      alert("Please choose at least one image or video.");
      return;
    }

    setUploading(true);

    try {
      const uploadedItems = [];

      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "unsigned_preset"); // same preset you already use

        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/duegljml6/auto/upload",
          formData
        );

        uploadedItems.push({
          url: res.data.secure_url,
          type: file.type.startsWith("video") ? "video" : "image",
          name: file.name,
        });
      }

      setMediaItems((prev) => [...prev, ...uploadedItems]);
      setSelectedFiles([]);
      alert("Upload completed!");
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeMediaItem = (indexToRemove) => {
    setMediaItems((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const savePost = async () => {
    const isOffers = collectionKey === "offers";

    if (isOffers) {
      if (!title || !description || !icon || !color) {
        alert("Please fill all fields for the offer.");
        return;
      }
    } else {
      if (
        !title ||
        !description ||
        !price ||
        !weight ||
        mediaItems.length === 0 ||
        (isRiceCollection && !category)
      ) {
        alert(
          "Please fill all fields, choose a category (for rice) and upload at least one media file."
        );
        return;
      }
    }

    const payload = {
      title,
      description,
    };

    if (isOffers) {
      payload.icon = icon;
      payload.color = color;
    } else {
      payload.price = Number(price);
      payload.weight = weight;
      payload.media = mediaItems;
      if (isRiceCollection) {
        payload.category = category;
      }
    }

    try {
      if (editingPostId) {
        await updateDoc(doc(db, collectionKey, editingPostId), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
        alert("Post updated successfully!");
      } else {
        await addDoc(collection(db, collectionKey), {
          ...payload,
          createdAt: serverTimestamp(),
          createdBy: user ? user.uid : null,
        });
        alert("Post added successfully!");
      }

      setTitle("");
      setDescription("");
      setPrice("");
      setWeight("");
      setCategory(categories.length > 0 ? categories[0].value : "");
      setIcon("🎁");
      setColor("success");
      setSelectedFiles([]);
      setMediaItems([]);
      setEditingPostId(null);
      fetchPosts();
    } catch (err) {
      console.error("Error saving post:", err);
      alert("Error saving post. Check console for details.");
    }
  };

  const deletePost = async (postId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, collectionKey, postId));
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      alert("Post deleted.");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post.");
    }
  };

  const startEditingPost = (post) => {
    setEditingPostId(post.id);
    setTitle(post.title || "");
    setDescription(post.description || "");
    setPrice(
      post.price !== undefined && post.price !== null ? String(post.price) : ""
    );
    setWeight(post.weight || "");
    setMediaItems(
      Array.isArray(post.media) && post.media.length > 0
        ? post.media
        : post.mediaURL
          ? [
            {
              url: post.mediaURL,
              type: post.mediaURL.match(/\.(mp4|mov|m4v|webm|avi|mkv)$/i)
                ? "video"
                : "image",
            },
          ]
          : []
    );
    setSelectedFiles([]);
    setCategory(post.category || (categories.length > 0 ? categories[0].value : ""));
    setIcon(post.icon || "🎁");
    setColor(post.color || "success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEditing = () => {
    setEditingPostId(null);
    setTitle("");
    setDescription("");
    setPrice("");
    setWeight("");
    setSelectedFiles([]);
    setMediaItems([]);
    setCategory(categories.length > 0 ? categories[0].value : "");
    setIcon("🎁");
    setColor("success");
  };

  const handleCollectionChange = (key) => {
    if (key === collectionKey) return;
    setCollectionKey(key);
    cancelEditing();
  };

  const currentCollection = COLLECTIONS[collectionKey];
  const isRiceCollection = collectionKey === "fatherPosts";
  const isOffers = collectionKey === "offers";

  const isFather = user && user.uid === FATHER_UID;

  // Not logged in
  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Father Login</h2>
        <form onSubmit={handleLogin}>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <br />
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <br />
          <button type="submit">Login</button>
        </form>
        {authError && <p style={{ color: "red" }}>{authError}</p>}
      </div>
    );
  }

  // Logged in but not father
  if (!isFather) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Not Authorized</h2>
        <p>This area is only for your father.</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  // Father view
  return (
    <div style={{ padding: "12px 16px" }} className="container-fluid px-2 px-md-4">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Admin Area</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div style={{ margin: "16px 0" }}>
        <p style={{ marginBottom: 8, fontWeight: "bold" }}>Choose section:</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          {Object.values(COLLECTIONS).map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => handleCollectionChange(option.key)}
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                border:
                  option.key === collectionKey
                    ? "2px solid #0d6efd"
                    : "1px solid #ccc",
                background:
                  option.key === collectionKey ? "#0d6efd" : "transparent",
                color: option.key === collectionKey ? "#fff" : "#333",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
        {isRiceCollection && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
              Quick Navigate to Category:
            </label>
            <select
              style={{
                ...inputStyle,
                maxWidth: "300px",
                cursor: "pointer",
              }}
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  const element = document.getElementById(`admin-category-${e.target.value}`);
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                  e.target.value = "";
                }
              }}
            >
              <option value="">Select Rice Category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            <div style={{ marginTop: 12 }}>
              <button
                onClick={() => setShowCategoryManager(!showCategoryManager)}
                style={{
                  padding: "6px 12px",
                  background: showCategoryManager ? "#175c97ff" : "#000000ff",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                {showCategoryManager ? "Hide Manager" : "Manage Categories (+)"}
              </button>
            </div>

            {showCategoryManager && (
              <div style={{
                marginTop: 12,
                padding: 16,
                background: "#f8f9fa",
                borderRadius: 12,
                border: "1px solid #e9ecef"
              }}>
                <h5 style={{ fontSize: 16, marginBottom: 12 }}>Manage Categories</h5>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <input
                    type="text"
                    placeholder="New Category Name"
                    value={newCategoryLabel}
                    onChange={(e) => setNewCategoryLabel(e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    onClick={handleAddCategory}
                    style={{
                      padding: "0 16px",
                      background: "#0d6efd",
                      color: "white",
                      border: "none",
                      borderRadius: 10,
                      fontWeight: 600
                    }}
                  >
                    Add
                  </button>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {categories.map(cat => (
                    <div key={cat.id} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "white",
                      padding: "4px 10px",
                      borderRadius: 999,
                      border: "1px solid #dee2e6",
                      fontSize: 13
                    }}>
                      <span>{cat.label}</span>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#dc3545",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          fontSize: 16,
                          lineHeight: 1
                        }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <p style={{ marginTop: 8, color: "#555" }}>{currentCollection.description}</p>
      </div>

      {collectionKey === 'orders' ? (
        <OrdersTab />
      ) : (
        <>
          <h3 style={{ marginBottom: 16 }}>
            {editingPostId ? `Edit ${currentCollection.label}` : `Create ${currentCollection.label}`}
          </h3>

          <div style={{ maxWidth: "100%", padding: "16px" }} className="mx-auto">
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
                  Product Title
                </label>
                <input
                  type="text"
                  style={inputStyle}
                  placeholder="Enter product name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {isRiceCollection && (
                <div>
                  <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
                    Rice Category
                  </label>
                  <select
                    style={inputStyle}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isOffers && (
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
                      Icon (Emoji)
                    </label>
                    <input
                      type="text"
                      style={inputStyle}
                      placeholder="e.g., 🛵, 🎁, 🪙"
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
                      Card Color
                    </label>
                    <select
                      style={inputStyle}
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                    >
                      <option value="success">Green (Success)</option>
                      <option value="primary">Blue (Primary)</option>
                      <option value="warning">Yellow (Warning)</option>
                      <option value="danger">Red (Danger)</option>
                      <option value="info">Cyan (Info)</option>
                    </select>
                  </div>

                  {/* LIVE PREVIEW SECTION */}
                  <div className="col-12">
                    <label style={{ fontWeight: 600, display: "block", marginBottom: 12 }}>
                      Live Preview
                    </label>
                    <div style={{ maxWidth: "300px", margin: "0 auto" }}>
                      <div className={`card h-100 shadow-sm border-0 bg-${color} bg-opacity-10`}>
                        <div className="card-body text-center p-4">
                          <div className="mb-3" style={{ fontSize: "3rem" }}>
                            {icon || "🎁"}
                          </div>
                          <h4 className="h5 fw-bold mb-3">{title || "Offer Title"}</h4>
                          <p className="text-muted mb-0">{description || "Offer description will appear here..."}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!isOffers && (
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      style={inputStyle}
                      placeholder="e.g., 1250"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
                      Weight
                    </label>
                    <input
                      type="text"
                      style={inputStyle}
                      placeholder="e.g., 25kg, 500g"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
                  Description / Notes
                </label>
                <textarea
                  style={textareaStyle}
                  placeholder="Share key details, special notes, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {!isOffers && (
                <div>
                  <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
                    Add Photos / Videos
                  </label>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {/* Option 1: Camera (Forces Camera) */}
                    <div style={{ padding: 10, border: "1px dashed #ccc", borderRadius: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>
                        📸 Option 1: Take Photo (Camera)
                      </span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        capture="environment"
                        multiple
                        onChange={handleFileSelection}
                      />
                    </div>

                    {/* Option 2: Gallery (Allows File Selection) */}
                    <div style={{ padding: 10, border: "1px dashed #ccc", borderRadius: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>
                        🖼️ Option 2: Select from Gallery
                      </span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFileSelection}
                      />
                    </div>
                  </div>

                  <small style={{ display: "block", marginTop: 6, color: "#667085" }}>
                    Tip: Use "Take Photo" to open camera directly. Use "Select from Gallery" to pick existing photos.
                  </small>
                  {selectedFiles.length > 0 && (
                    <p style={{ marginTop: 8, fontSize: 13, color: "#475467" }}>
                      Selected: {selectedFiles.map((file) => file.name).join(", ")}
                    </p>
                  )}
                </div>
              )}

              {!isOffers && (
                <button
                  onClick={uploadSelectedFiles}
                  disabled={uploading}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    border: "none",
                    backgroundColor: uploading ? "#94a3b8" : "#0d6efd",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: uploading ? "not-allowed" : "pointer",
                  }}
                >
                  {uploading ? "Uploading..." : "Upload Selected Files"}
                </button>
              )}

              {!isOffers && mediaItems.length > 0 && (
                <div>
                  <p style={{ fontWeight: 600, marginBottom: 12 }}>Uploaded media</p>
                  <div className="row g-2">
                    {mediaItems.map((item, index) => (
                      <div
                        key={`${item.url}-${index}`}
                        className="col-6 col-sm-4 col-md-3"
                        style={{
                          //border: "1px solid #d0d5dd",
                          borderRadius: 12,
                          padding: 8,
                          //background: "#f8fafc",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 8,
                            fontSize: 12,
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>
                            {item.name || `Media ${index + 1}`}
                          </span>
                          <button onClick={() => removeMediaItem(index)}>Remove</button>
                        </div>
                        {item.type === "video" ? (
                          <video
                            src={item.url}
                            controls
                            style={{ width: "100%", borderRadius: 8 }}
                          />
                        ) : (
                          <img
                            src={item.url}
                            alt={item.name || "Uploaded media"}
                            style={{
                              width: "100%",
                              borderRadius: 8,
                              objectFit: "cover",
                              maxHeight: 180,
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
              <button
                onClick={savePost}
                style={{
                  padding: "10px 18px",
                  borderRadius: 999,
                  border: "none",
                  backgroundColor: "#0d6efd",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {editingPostId ? "Update Post" : "Save Post"}
              </button>
              {editingPostId && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 999,
                    border: "1px solid #d0d5dd",
                    backgroundColor: "#fff",
                    color: "#475467",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          <hr style={{ margin: "32px 0" }} />

          <h3>{currentCollection.label} List</h3>
          {loadingPosts && <p>Loading posts...</p>}
          {postsError && <p style={{ color: "red" }}>{postsError}</p>}
          {!loadingPosts && posts.length === 0 && (
            <p>No posts yet. Add your first post above.</p>
          )}

          {isRiceCollection ? (
            <>
              {categories.map((category) => {
                // Filter posts for this category
                const categoryPosts = posts.filter(
                  (post) => post.category === category.value
                );
                if (categoryPosts.length === 0) return null;
                return (
                  <div key={category.value} id={`admin-category-${category.value}`} style={{ marginTop: 24 }}>
                    <h4 style={{ marginBottom: 12, color: "#0d6efd" }}>{category.label}</h4>
                    <div className="row g-3">
                      {categoryPosts.map((post) => (
                        <div
                          key={post.id}
                          className="col-12 col-sm-6 col-md-4 col-lg-3"
                          style={{
                            border: "1px solid #e4e7ec",
                            borderRadius: 14,
                            padding: "12px",
                            boxShadow: "0 10px 20px rgba(15, 23, 42, 0.08)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 8,
                              gap: 12,
                            }}
                          >
                            <h4 style={{ margin: 0 }}>{post.title}</h4>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button onClick={() => startEditingPost(post)}>Edit</button>
                              <button onClick={() => deletePost(post.id)}>Delete</button>
                            </div>
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <span style={chipStyle}>
                              {categories.find((cat) => cat.value === post.category)?.label ||
                                "Uncategorized"}
                            </span>
                          </div>
                          <p style={{ marginTop: 4 }}>{post.description}</p>
                          <p style={{ margin: "4px 0" }}>
                            <strong>Price:</strong>{" "}
                            {post.price !== undefined && post.price !== null
                              ? `₹${Number(post.price).toLocaleString("en-IN")}`
                              : "N/A"}
                          </p>
                          <p style={{ margin: "4px 0" }}>
                            <strong>Weight:</strong> {post.weight || "N/A"}
                          </p>
                          {Array.isArray(post.media) && post.media.length > 0 && (
                            <div className="row g-2" style={{ marginTop: 12 }}>
                              {post.media.map((item, idx) => (
                                <div
                                  key={`${item.url}-${idx}`}
                                  className="col-4 col-sm-3 col-md-2"
                                  style={{
                                    border: "1px solid #ccc",
                                    borderRadius: 6,
                                    padding: 6,
                                  }}
                                >
                                  {item.type === "video" ? (
                                    <video
                                      src={item.url}
                                      controls
                                      style={{ width: "100%", maxHeight: 180 }}
                                    />
                                  ) : (
                                    <img
                                      src={item.url}
                                      alt={`${post.title} ${idx + 1}`}
                                      style={{
                                        width: "100%",
                                        maxHeight: 180,
                                        objectFit: "cover",
                                      }}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Offers List */}
              {isOffers && (
                <div className="row g-3">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="col-12 col-sm-6 col-md-4 col-lg-3"
                      style={{
                        border: "1px solid #e4e7ec",
                        borderRadius: 14,
                        padding: "12px",
                        boxShadow: "0 10px 20px rgba(15, 23, 42, 0.08)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 8,
                          gap: 12,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: "1.5rem" }}>{post.icon}</span>
                          <h4 style={{ margin: 0, fontSize: "1.1rem" }}>{post.title}</h4>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => startEditingPost(post)}>Edit</button>
                          <button onClick={() => deletePost(post.id)}>Delete</button>
                        </div>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <span className={`badge bg-${post.color || "success"}`}>
                          {post.color || "success"}
                        </span>
                      </div>
                      <p style={{ marginTop: 4 }}>{post.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* This section should not appear now since all posts default to Premium, but kept for safety */}
              {!isOffers && posts.filter((post) => !post.category || !categories.some((cat) => cat.value === post.category)).length > 0 && (
                <div id="admin-category-others" style={{ marginTop: 24 }}>
                  <h4 style={{ marginBottom: 12, color: "#0d6efd" }}>Other Items</h4>
                  <div className="row g-3">
                    {posts
                      .filter((post) => !post.category || !categories.some((cat) => cat.value === post.category))
                      .map((post) => (
                        <div
                          key={post.id}
                          className="col-12 col-sm-6 col-md-4 col-lg-3"
                          style={{
                            border: "1px solid #e4e7ec",
                            borderRadius: 14,
                            padding: "12px",
                            boxShadow: "0 10px 20px rgba(15, 23, 42, 0.08)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 8,
                              gap: 12,
                            }}
                          >
                            <h4 style={{ margin: 0 }}>{post.title}</h4>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button onClick={() => startEditingPost(post)}>Edit</button>
                              <button onClick={() => deletePost(post.id)}>Delete</button>
                            </div>
                          </div>
                          <p style={{ marginTop: 4 }}>{post.description}</p>
                          <p style={{ margin: "4px 0" }}>
                            <strong>Price:</strong>{" "}
                            {post.price !== undefined && post.price !== null
                              ? `₹${Number(post.price).toLocaleString("en-IN")}`
                              : "N/A"}
                          </p>
                          <p style={{ margin: "4px 0" }}>
                            <strong>Weight:</strong> {post.weight || "N/A"}
                          </p>
                          {Array.isArray(post.media) && post.media.length > 0 && (
                            <div className="row g-2" style={{ marginTop: 12 }}>
                              {post.media.map((item, idx) => (
                                <div
                                  key={`${item.url}-${idx}`}
                                  className="col-4 col-sm-3 col-md-2"
                                  style={{
                                    border: "1px solid #ccc",
                                    borderRadius: 6,
                                    padding: 6,
                                  }}
                                >
                                  {item.type === "video" ? (
                                    <video
                                      src={item.url}
                                      controls
                                      style={{ width: "100%", maxHeight: 180 }}
                                    />
                                  ) : (
                                    <img
                                      src={item.url}
                                      alt={`${post.title} ${idx + 1}`}
                                      style={{
                                        width: "100%",
                                        maxHeight: 180,
                                        objectFit: "cover",
                                      }}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="row g-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="col-12 col-sm-6 col-md-4 col-lg-3"
                  style={{
                    border: "1px solid #e4e7ec",
                    borderRadius: 14,
                    padding: "12px",
                    boxShadow: "0 10px 20px rgba(15, 23, 42, 0.08)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                      gap: 12,
                    }}
                  >
                    <h4 style={{ margin: 0 }}>{post.title}</h4>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => startEditingPost(post)}>Edit</button>
                      <button onClick={() => deletePost(post.id)}>Delete</button>
                    </div>
                  </div>
                  <p style={{ marginTop: 4 }}>{post.description}</p>
                  <p style={{ margin: "4px 0" }}>
                    <strong>Price:</strong>{" "}
                    {post.price !== undefined && post.price !== null
                      ? `₹${Number(post.price).toLocaleString("en-IN")}`
                      : "N/A"}
                  </p>
                  <p style={{ margin: "4px 0" }}>
                    <strong>Weight:</strong> {post.weight || "N/A"}
                  </p>
                  {Array.isArray(post.media) && post.media.length > 0 && (
                    <div className="row g-2" style={{ marginTop: 12 }}>
                      {post.media.map((item, idx) => (
                        <div
                          key={`${item.url}-${idx}`}
                          className="col-4 col-sm-3 col-md-2"
                          style={{
                            border: "1px solid #ccc",
                            borderRadius: 6,
                            padding: 6,
                          }}
                        >
                          {item.type === "video" ? (
                            <video
                              src={item.url}
                              controls
                              style={{ width: "100%", maxHeight: 180 }}
                            />
                          ) : (
                            <img
                              src={item.url}
                              alt={`${post.title} ${idx + 1}`}
                              style={{
                                width: "100%",
                                maxHeight: 180,
                                objectFit: "cover",
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FatherAdmin;
