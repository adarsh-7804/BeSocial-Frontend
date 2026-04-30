import { useDispatch, useSelector } from "react-redux";
import {
  sendRequest,
  cancelRequest,
  acceptRequest,
  rejectRequest,
  unfriend,
  selectUser,
} from "../../features/userSlice";
import { FaUserFriends } from "react-icons/fa";

export default function FriendButton({ userId, onCancel, onSend, onRemove }) {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);

  const safeUserId = userId?.toString?.() || userId;

  if (!safeUserId) {
    return null;
  }

  const isFriend = currentUser?.friends?.some((user) =>
    user?._id
      ? user._id.toString() === userId.toString()
      : user?.toString() === userId.toString(),
  );

  const isRequestSent = currentUser?.friendRequestsSent?.some((user) =>
    user?._id
      ? user._id.toString() === userId.toString()
      : user?.toString() === userId.toString(),
  );

  const isRequestReceived = currentUser?.friendRequestsReceived?.some((user) =>
    user?._id
      ? user._id.toString() === userId.toString()
      : user?.toString() === userId.toString(),
  );

  // Handle cancel with callback
  const handleCancel = async () => {
    try {
      await dispatch(cancelRequest(userId)).unwrap();
      if (onCancel) {
        onCancel(userId);
      }
    } catch (err) {
      console.error("Cancel failed:", err);
    }
  };

  // Handle send with callback
  const handleSend = async () => {
    try {
      await dispatch(sendRequest(userId)).unwrap();
      if (onSend) {
        onSend(userId);
      }
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  const handleUnfriend = async () => {
    try {
      await dispatch(unfriend(userId)).unwrap();
      if (onRemove) {
        onRemove(userId);
      }
    } catch (err) {
      console.error("Unfriend failed:", err);
    }
  };

  return (
    <div className="text-xs font-bold overflow-hidden rounded-full">
      {isFriend ? (
        <button
          onClick={handleUnfriend}
          className="px-5 py-2 bg-gradient-to-br from-[#C08552] to-[#131912] rounded-full text-white shadow-md transition-all duration-200 hover:scale-105 cursor-pointer"
        >
          Unfollow
        </button>
      ) : isRequestSent ? (
        <button
          onClick={handleCancel}
          className="bg-gradient-to-br from-[#C08552] to-[#131912] px-5 py-2 rounded-full text-white hover:opacity-80 transition cursor-pointer"
          title="Click to cancel request"
        >
          Requested
        </button>
      ) : isRequestReceived ? (
        <div className="flex gap-1 bg-[#FFF8F0]">
          <button
            onClick={() => dispatch(acceptRequest(userId))}
            className="px-5 py-2 bg-gradient-to-br from-[#C08552] to-[#131912] rounded-full text-white shadow hover:scale-105 transition cursor-pointer"
          >
            Accept
          </button>
          <button
            onClick={() => dispatch(rejectRequest(userId))}
            className="px-5 py-2 bg-gradient-to-br from-[#C08552] to-[#131912] rounded-full shadow hover:scale-105 transition text-white cursor-pointer"
          >
            Reject
          </button>
        </div>
      ) : (
        <button
          onClick={handleSend} 
          className="w-[7vw] bg-gradient-to-br from-[#C08552] to-[#131912] flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-bold text-white shadow-md transition-all duration-200 hover:scale-105 cursor-pointer"
        >
          <span className="p-0.5 font-extrabold">
            <FaUserFriends />
          </span>
          Friend
        </button>
      )}
    </div>
  );
}
