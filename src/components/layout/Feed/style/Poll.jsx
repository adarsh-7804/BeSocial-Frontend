import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../../../features/userSlice";
import { fetchPollVoters } from "../../../../api/postsApi";   

function avatarSrc(user) {
  if (!user?.avatar)
    return "https://i.pinimg.com/1200x/cd/4b/d9/cd4bd9b0ea2807611ba3a67c331bff0b.jpg";
  return user.avatar.startsWith("blob:") || user.avatar.startsWith("http")
    ? user.avatar
    : `http://localhost:5000/${user.avatar}`;
}

//  Voter Modal 
function VoterModal({ postId, optionIndex, optionText, onClose }) {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchPollVoters(postId, optionIndex)
      .then((res) => { if (!cancelled) setVoters(res.data.voters || []); })
      .catch(() => { if (!cancelled) setError("Couldn't load voters."); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [postId, optionIndex]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(44,26,14,0.45)", backdropFilter: "blur(2px)" }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-80 max-h-[70vh] flex flex-col overflow-hidden"
        style={{ border: "1.5px solid rgba(192,133,82,0.25)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#815F3C] rounded-t-2xl">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-white text-lg font-bold">📊</span>
            <div className="min-w-0">
              <p className="text-white text-xs font-bold uppercase tracking-widest truncate">
                Voted for
              </p>
              <p className="text-[#FFD6A8] text-sm font-semibold truncate mt-0.5">
                {optionText}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-3 flex-shrink-0 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-base transition cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {loading && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <span className="w-7 h-7 border-2 border-[#C08552] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[#8C5A3C]">Loading voters…</p>
            </div>
          )}
          {error && !loading && (
            <p className="text-center text-xs text-red-400 py-8">{error}</p>
          )}
          {!loading && !error && voters.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <span className="text-3xl">🗳️</span>
              <p className="text-xs text-gray-400">No votes yet</p>
            </div>
          )}
          {!loading && !error && voters.length > 0 && (
            <ul className="divide-y divide-[rgba(192,133,82,0.12)]">
              {voters.map((user, idx) => (
                <li key={user._id || idx} className="flex items-center gap-3 py-2.5 px-1">
                  <img
                    src={avatarSrc(user)}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0 border-2 border-[rgba(192,133,82,0.25)]"
                  />
                  <p className="text-sm font-semibold text-[#2C1A0E] truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <span className="ml-auto text-[10px] text-[#C08552] bg-[#FFF0E4] px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                    voted
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!loading && voters.length > 0 && (
          <div className="px-4 py-2.5 border-t border-[rgba(192,133,82,0.15)] bg-[#FFF8F0]">
            <p className="text-[11px] text-[#8C5A3C] font-semibold text-center">
              {voters.length} {voters.length === 1 ? "person" : "people"} voted for this option
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

//  Poll Component 
const Poll = ({ post, onVote }) => {
  const currentUser = useSelector(selectUser);
  const [modal, setModal] = useState(null);
  const [optimisticVote, setOptimisticVote] = useState(null); // Track optimistic vote

  if (!post?.poll) return null;

  const { question, options } = post.poll;
  const totalVotes = options.reduce((sum, opt) => sum + opt.votes.length, 0);

  
  const votedOptionIndex = options.findIndex((opt) =>
    opt.votes.some(
      (v) =>
        String(v) === String(currentUser?._id) ||
        String(v?._id) === String(currentUser?._id)
    )
  );
  
  const effectiveVotedIndex = optimisticVote !== null ? optimisticVote : votedOptionIndex;
  const hasVoted = effectiveVotedIndex !== -1;

  const handleVoteClick = (i) => {
    if (hasVoted) return;
    
    setOptimisticVote(i);
    
    onVote(post._id, i);
  };

  const openVoters = (e, idx, text) => {
    e.stopPropagation();
    e.preventDefault(); 
    if (options[idx].votes.length === 0) return;
    setModal({ optionIndex: idx, optionText: text });
  };

  return (
    <>
      <div className="mt-2 mb-1 px-1">
        <p className="text-sm font-bold text-[#2C1A0E] mb-2">{question}</p>

        {hasVoted && (
          <p className="text-[10px] text-[#C08552] bg-[#FFF0E4] px-2 py-1 rounded-full inline-block mb-2 font-medium">
            ✓ You voted · {totalVotes} total {totalVotes === 1 ? "vote" : "votes"}
          </p>
        )}

        <div className="space-y-2">
          {options.map((opt, i) => {
            const count = opt.votes.length;
            const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const isMyVote = effectiveVotedIndex === i;
            const isWinning =
              count > 0 &&
              count === Math.max(...options.map((o) => o.votes.length));

            return (
              <div key={i} className="relative">
                {!hasVoted && (
                  <button
                    onClick={() => handleVoteClick(i)}
                    className="absolute inset-0 w-full h-full z-10 cursor-pointer"
                    style={{ background: 'transparent' }}
                    title="Click to vote"
                  />
                )}

                <div className="flex items-center justify-between mb-0.5 relative z-20 pointer-events-none">
                  <div
                    className={`text-xs font-semibold text-left flex items-center gap-1.5 ${
                      hasVoted
                        ? isMyVote
                          ? "text-[#C08552]"
                          : "text-[#4B2E2B]"
                        : "text-[#4B2E2B]"
                    }`}
                  >
                    {isMyVote && (
                      <span className="w-4 h-4 rounded-full bg-[#C08552] text-white flex items-center justify-center text-[9px] flex-shrink-0">
                        ✓
                      </span>
                    )}
                    {opt.text}
                  </div>

                  <div className="flex items-center gap-1.5 ml-2 flex-shrink-0 pointer-events-auto">
                    {hasVoted && (
                      <span className="text-[10px] text-gray-400 font-medium">{pct}%</span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => openVoters(e, i, opt.text)}
                      disabled={count === 0}
                      className={`text-xs font-semibold transition px-2 py-1 rounded ${
                        count > 0
                          ? "text-[#C08552] hover:bg-[#FFF0E4] hover:underline cursor-pointer"
                          : "text-gray-400 cursor-default"
                      }`}
                      title={count > 0 ? "See who voted" : "No votes yet"}
                    >
                      {count} {count === 1 ? "vote" : "votes"}
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden relative z-0">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: isMyVote
                        ? "linear-gradient(90deg, #C08552, #8C5A3C)"
                        : isWinning
                        ? "#D9B896"
                        : "#E8D5C4",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {!hasVoted && (
          <p className="text-[10px] text-gray-400 mt-2">
            {totalVotes > 0 ? `${totalVotes} ${totalVotes === 1 ? "vote" : "votes"} · ` : ""}
            Click an option to vote
          </p>
        )}

      </div>

      {modal && (
        <VoterModal
          postId={post._id}
          optionIndex={modal.optionIndex}
          optionText={modal.optionText}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
};

export default Poll;