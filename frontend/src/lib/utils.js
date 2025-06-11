export function formatMessageTime(date) {
  const messageDate = new Date(date);
  const now = new Date();
  const diffMs = now - messageDate;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);

  const isToday = messageDate.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = messageDate.toDateString() === yesterday.toDateString();

  const formatTime = (d) =>
    d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  const formatFullDateTime = (d) => {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  if (diffSec < 60) {
    return "Just now";
  } else if (diffMin < 60) {
    return `${diffMin} min ago`;
  } else if (isToday) {
    return `Today at ${formatTime(messageDate)}`;
  } else if (isYesterday) {
    return `Yesterday at ${formatTime(messageDate)}`;
  } else {
    return formatFullDateTime(messageDate);
  }
}
