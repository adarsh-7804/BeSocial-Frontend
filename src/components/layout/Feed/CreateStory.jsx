import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createStory, fetchStories } from "../../../features/storySlice";
import { selectUser } from "../../../features/userSlice";
import { toast } from "react-toastify";
import "./style/stories.css";

const TEXT_BG_OPTIONS = [
  { bg: "#8C5A3C", color: "#FFFFFF" },
  // { bg: "#1a1a2e", color: "#e0e0ff" },
  // { bg: "#16213e", color: "#00d2ff" },
  // { bg: "#0f3460", color: "#e94560" },
  // { bg: "#533483", color: "#f5f5f5" },
  // { bg: "#e94560", color: "#ffffff" },
  // { bg: "#2d6a4f", color: "#d8f3dc" },
  // { bg: "#ff6b35", color: "#ffffff" },
  // { bg: "#f72585", color: "#ffffff" },
  // { bg: "#4361ee", color: "#ffffff" },
];

const CreateStory = ({ onClose }) => {
  const dispatch = useDispatch();
  const { creating } = useSelector((s) => s.stories);
  const currentUser = useSelector(selectUser);
  const fileInputRef = useRef(null);

  const [storyType, setStoryType] = useState("image"); 
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [textContent, setTextContent] = useState("");
  const [textStyle, setTextStyle] = useState(TEXT_BG_OPTIONS[0]);
  const [privacy, setPrivacy] = useState("public");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (selected.size > 50 * 1024 * 1024) {
      toast.error("File too large. Max 50MB for stories.");
      return;
    }
    const isVideo = selected.type.startsWith("video/");
    setStoryType(isVideo ? "video" : "image");
    setFile(selected);

    if (!isVideo) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(selected);
    } else {
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async () => {
    if (storyType === "text" && !textContent.trim()) {
      toast.error("Please enter some text for your story.");
      return;
    }
    if ((storyType === "image" || storyType === "video") && !file) {
      toast.error("Please select a media file.");
      return;
    }

    const fd = new FormData();
    fd.append("type", storyType);
    fd.append("privacy", privacy);
    if (file) fd.append("media", file);
    if (storyType === "text") {
      fd.append("textContent", textContent);
      fd.append("textStyle", JSON.stringify(textStyle));
    }

    const result = await dispatch(createStory(fd));
    if (createStory.fulfilled.match(result)) {
      toast.success("Story created!");
      dispatch(fetchStories());
      onClose?.();
    } else {
      toast.error(result.payload || "Failed to create story");
    }
  };

  const resetMedia = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="create-story-container">
      {/* Header */}
      <div className="create-story-header">
        <h3>Create Story</h3>
        <button className="create-story-close" onClick={onClose}>✕</button>
      </div>

      {/* Type Selector */}
      <div className="create-story-types">
        {[
          { key: "image", icon: "🖼️", label: "Photo" },
          { key: "video", icon: "🎬", label: "Video" },
          { key: "text", icon: "✏️", label: "Text" },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            className={`story-type-btn ${storyType === key ? "active" : ""}`}
            onClick={() => {
              setStoryType(key);
              if (key === "text") resetMedia();
            }}
          >
            <span className="story-type-icon">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="create-story-content">
        {storyType === "text" ? (
          <div className="text-story-editor">
            <div
              className="text-story-preview"
              style={{
                backgroundColor: textStyle.bg,
                color: textStyle.color,
              }}
            >
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Type your story..."
                maxLength={500}
                className="text-story-input"
                style={{ color: textStyle.color }}
              />
            </div>
          </div>
        ) : (
          <div className="media-story-editor">
            {preview ? (
              <div className="media-preview-container">
                {storyType === "video" ? (
                  <video src={preview} controls className="media-preview" />
                ) : (
                  <img src={preview} alt="preview" className="media-preview" />
                )}
                <button className="media-remove-btn" onClick={resetMedia}>✕ Remove</button>
              </div>
            ) : (
              <div
                className="media-upload-area"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="media-upload-icon">{storyType === "video" ? "🎬" : "🖼️"}</div>
                <p>Click to upload {storyType}</p>
                <span className="media-upload-hint">Max 50MB</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={storyType === "video" ? "video/mp4,video/webm,video/quicktime" : "image/*"}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>
        )}
      </div>

      {/* Privacy Selector */}
      <div className="create-story-privacy">
        <span className="privacy-label">Audience:</span>
        {["public", "friends", "private"].map((p) => (
          <button
            key={p}
            className={`privacy-btn ${privacy === p ? "active" : ""}`}
            onClick={() => setPrivacy(p)}
          >
            {p === "public" ? "🌍" : p === "friends" ? "👥" : "🔒"} {p}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="create-story-actions">
        <button className="story-cancel-btn" onClick={onClose}>Cancel</button>
        <button
          className="story-submit-btn"
          onClick={handleSubmit}
          disabled={creating || (storyType === "text" ? !textContent.trim() : !file)}
        >
          {creating ? (
            <><span className="story-btn-spinner" /> Sharing...</>
          ) : (
            "Share Story"
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateStory;
