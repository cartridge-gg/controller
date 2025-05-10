export const getDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (
    date.toDateString() ===
    new Date(today.getTime() - 24 * 60 * 60 * 1000).toDateString()
  ) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
};
