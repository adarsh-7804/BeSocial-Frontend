import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addStoryToHighlight } from "../../../features/highlightSlice";
import { toast } from "react-toastify";

const HighlightSelectorModal = ({ storyId, onClose }) => {
  const dispatch = useDispatch();
  const { highlights, loading } = useSelector((s) => s.highlights);
  const [selectedHighlight, setSelectedHighlight] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToHighlight = async () => {
    if (!selectedHighlight) {
      toast.warning("Please select a highlight");
      return;
    }

    try {
      setIsAdding(true);
      const result = await dispatch(
        addStoryToHighlight({
          highlightId: selectedHighlight._id,
          storyId: storyId,
        })
      ).unwrap();

      toast.success(`Story added to ${selectedHighlight.title}!`);
      onClose();
    } catch (error) {
      toast.error(error || "Failed to add story to highlight");
      console.error("Error adding story to highlight:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <style>{`
        .highlight-selector-modal {
          background: linear-gradient(135deg, #FFF8F0 0%, #FAF3EB 100%);
          border-radius: 20px;
          padding: 28px;
          max-width: 420px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          font-size: 24px;
          font-weight: 700;
          color: #27261A;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #8C5A3C;
          transition: all 0.2s ease;
        }

        .modal-close-btn:hover {
          color: #27261A;
          transform: scale(1.1);
        }

        .highlights-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
          max-height: 400px;
          overflow-y: auto;
        }

        .highlights-list::-webkit-scrollbar {
          width: 6px;
        }

        .highlights-list::-webkit-scrollbar-track {
          background: #f1e0d0;
          border-radius: 10px;
        }

        .highlights-list::-webkit-scrollbar-thumb {
          background: #A7764A;
          border-radius: 10px;
        }

        .highlight-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 2px solid #e8d5c0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
        }

        .highlight-item:hover {
          border-color: #A7764A;
          background: #FFF8F0;
        }

        .highlight-item.selected {
          border-color: #A7764A;
          background: linear-gradient(135deg, #FFF8F0 0%, #f5ede3 100%);
          box-shadow: 0 0 0 3px rgba(167, 118, 74, 0.1);
        }

        .highlight-item input[type="radio"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #A7764A;
        }

        .highlight-thumbnail {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          overflow: hidden;
          background: #e8d5c0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        }

        .highlight-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .highlight-info {
          flex: 1;
          min-width: 0;
        }

        .highlight-name {
          font-weight: 600;
          color: #27261A;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .highlight-story-count {
          font-size: 12px;
          color: #8C5A3C;
          opacity: 0.7;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #8C5A3C;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .empty-text {
          font-size: 14px;
          margin-bottom: 16px;
        }

        .modal-buttons {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .btn-cancel,
        .btn-add {
          flex: 1;
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-cancel {
          border: 2px solid #e8d5c0;
          color: #8C5A3C;
          background-color: transparent;
        }

        .btn-cancel:hover {
          background-color: #f5ede3;
          border-color: #A7764A;
        }

        .btn-add {
          background: linear-gradient(135deg, #A7764A 0%, #27261A 100%);
          color: #FFF8F0;
          box-shadow: 0 4px 12px rgba(167, 118, 74, 0.2);
        }

        .btn-add:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(167, 118, 74, 0.3);
        }

        .btn-add:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loading-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(167, 118, 74, 0.2);
          border-top-color: #A7764A;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          margin-right: 8px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <div className="highlight-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>⭐ Add to Highlight</span>
          <button 
            className="modal-close-btn" 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading highlights...</p>
          </div>
        ) : highlights.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-text">No highlights yet</div>
            <p style={{ fontSize: "12px", opacity: 0.7 }}>
              Create a highlight first to add stories
            </p>
          </div>
        ) : (
          <>
            <div className="highlights-list">
              {highlights.map((highlight) => (
                <label
                  key={highlight._id}
                  className={`highlight-item ${
                    selectedHighlight?._id === highlight._id ? "selected" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <input
                    type="radio"
                    name="highlight"
                    value={highlight._id}
                    checked={selectedHighlight?._id === highlight._id}
                    onChange={() => setSelectedHighlight(highlight)}
                  />
                  <div className="highlight-thumbnail">
                    {highlight.coverImage ? (
                      <img
                        src={highlight.coverImage}
                        alt={highlight.title}
                      />
                    ) : (
                      <span>📸</span>
                    )}
                  </div>
                  <div className="highlight-info">
                    <div className="highlight-name">{highlight.title}</div>
                    <div className="highlight-story-count">
                      {highlight.stories?.length || 0} stories
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="modal-buttons">
              <button 
                className="btn-cancel" 
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
              >
                Cancel
              </button>
              <button
                className="btn-add"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToHighlight();
                }}
                disabled={!selectedHighlight || isAdding}
              >
                {isAdding ? (
                  <>
                    <span className="loading-spinner"></span>
                    Adding...
                  </>
                ) : (
                  "Add Story"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HighlightSelectorModal;