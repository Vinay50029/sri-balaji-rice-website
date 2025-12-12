import { useState } from "react";
import axios from "axios";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

function AddRice() {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageURL, setImageURL] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");

  // Upload to Cloudinary
  const uploadImage = async () => {
    if (!image) {
      alert("Please select an image");
      return;
    }
    setUploading(true);

    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "unsigned_preset");

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/duegljml6/image/upload",
        formData
      );
      setImageURL(res.data.secure_url);
      alert("Image uploaded successfully!");
    } catch (err) {
      alert("Upload failed!");
      console.error(err);
    }
    setUploading(false);
  };

  // Save to Firestore
  const saveRiceItem = async () => {
    if (!name || !price || !weight || !imageURL) {
      alert("Please fill all fields and upload image.");
      return;
    }

    try {
      await addDoc(collection(db, "riceItems"), {
        name,
        price: Number(price),
        weight,
        imageURL
      });

      alert("Rice item added successfully!");

      // Clear fields
      setName("");
      setPrice("");
      setWeight("");
      setImageURL("");
      setImage(null);
    } catch (err) {
      console.error("Full error details:", err);
      const errorMessage = err.message || "Unknown error occurred";
      alert(`Error saving to database: ${errorMessage}`);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Add New Rice Item</h2>

      <input
        type="text"
        placeholder="Rice Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      /><br /><br />

      <input
        type="number"
        placeholder="Price (per bag)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      /><br /><br />

      <input
        type="text"
        placeholder="Weight (e.g., 25kg)"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
      /><br /><br />

      <input
        type="file"
        onChange={(e) => setImage(e.target.files[0])}
      /><br /><br />

      <button onClick={uploadImage} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Image"}
      </button>

      {imageURL && (
        <div>
          <p>Image Preview:</p>
          <img src={imageURL} alt="preview" width="150" />
        </div>
      )}

      <br />
      <button onClick={saveRiceItem}>Save Rice Item</button>
    </div>
  );
}

export default AddRice;