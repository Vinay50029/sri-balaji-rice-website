import { useState } from "react";
import axios from "axios";

function ImageUpload({ onUploadComplete }) {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageURL, setImageURL] = useState("");

  const handleImageUpload = async () => {
    if (!image) return;

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

      // Send URL back to parent component
      onUploadComplete(res.data.secure_url);

      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed!");
    }

    setUploading(false);
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <button onClick={handleImageUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Image"}
      </button>

      {imageURL && (
        <div>
          <p>Uploaded Image:</p>
          <img src={imageURL} alt="Uploaded" width="150" />
        </div>
      )}
    </div>
  );
}

export default ImageUpload;