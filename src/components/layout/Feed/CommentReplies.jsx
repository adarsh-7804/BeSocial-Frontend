import React from "react";
import { AiOutlineDelete } from "react-icons/ai";

const CommentReplies = ({
  c,
  openReplies,
  toggleReplies,
  handleReplyClick,
  handleDeleteReply,
  replyingTo,
  replyingToReply,
  reply,
  setReply,
  handleReply,
  currentUser,
}) => {
  return (
    <>
      {/* View / Hide replies button */}
      {c.replies?.length > 0 && (
        <button
          onClick={() => toggleReplies(c._id)}
          className="text-xs text-gray-500 ml-4 mt-1 font-medium hover:text-gray-700"
        >
          {openReplies[c._id]
            ? "Hide replies"
            : `View replies (${c.replies.length})`}
        </button>
      )}

      {/* Replies */}
      {openReplies[c._id] &&
        c.replies?.filter(Boolean).map((r) => (
          <div key={r._id} className="flex gap-2 items-start mt-2 ml-4">
            <img
              src={
                r.user?.profilePicture ||
                "https://i.pinimg.com/1200x/cd/4b/d9/cd4bd9b0ea2807611ba3a67c331bff0b.jpg"
              }
              className="w-6 h-6 rounded-full object-cover border border-[#E9D8C4]"
            />

            <div className="flex-1">
              <div className="bg-[#F4E9E0] rounded-lg px-2.5 py-1.5 border border-[#E9D8C4]">
                <strong className="text-xs text-amber-800">
                  @{r.user ? `${r.user.firstName} ${r.user.lastName}` : "User"}
                </strong>
                <p className="text-xs text-amber-950">{r.text}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() =>
                    handleReplyClick(c._id, r.user, r._id)
                  }
                  className="text-xs text-amber-800 font-bold"
                >
                  {replyingTo === c._id &&
                  replyingToReply === r._id
                    ? "Cancel"
                    : "Reply"}
                </button>

                {currentUser?._id === r.user?._id && (
                  <button
                    onClick={() =>
                      handleDeleteReply(c._id, r._id)
                    }
                    className="text-xs text-red-400 flex items-center gap-1"
                  >
                    <AiOutlineDelete size={12} /> Delete
                  </button>
                )}
              </div>

              {/* Nested reply input */}
              {replyingTo === c._id &&
                replyingToReply === r._id && (
                  <form onSubmit={handleReply} className="flex gap-2 mt-2">
                    <input
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder={`Reply to @${r.user?.firstName}`}
                      className="w-full bg-[#F9F4F1] border border-[#E1BC9C] rounded-full pl-2 pr-4 py-1  text-sm text-amber-950 outline-none "
                    />
                    <button type="submit" className="text-xs bg-amber-600 text-white px-3 py-1 rounded-full">
                      Reply
                    </button>
                  </form>
                )}
            </div>
          </div>
        ))}
    </>
  );
};

export default CommentReplies;