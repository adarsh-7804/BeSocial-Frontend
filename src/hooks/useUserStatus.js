import { useSelector } from 'react-redux';

/**
 * Custom hook to get user status
 * @param {string} userId - The ID of the user to check status for
 * @returns {object} { status: "online"|"offline", lastSeen: Date }
 */
export const useUserStatus = (userId) => {
  const userStatuses = useSelector((state) => state.conversation?.userStatuses || {});
  
  return userStatuses[userId] || { status: 'offline', lastSeen: null };
};

/**
 * Custom hook to format online status display
 * @param {string} userId - The ID of the user
 * @returns {string} Formatted status string (e.g., "online", "offline", "last seen 2 hours ago")
 */
export const useFormattedStatus = (userId) => {
  const { status, lastSeen } = useUserStatus(userId);

  if (status === 'online') {
    return 'online';
  }

  if (!lastSeen) {
    return 'offline';
  }

  const now = new Date();
  const diff = now - new Date(lastSeen);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) {
    return 'last seen just now';
  } else if (minutes < 60) {
    return `last seen ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (hours < 24) {
    return `last seen ${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (days < 7) {
    return `last seen ${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return `last seen on ${lastSeen.toLocaleDateString()}`;
  }
};
