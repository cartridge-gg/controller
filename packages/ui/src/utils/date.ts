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

export const getDuration = (deltatime: number, detailed?: boolean) => {
  const state = {
    seconds: Math.floor(deltatime / 1000),
    minutes: Math.floor(deltatime / (1000 * 60)),
    hours: Math.floor(deltatime / (1000 * 60 * 60)),
    days: Math.floor(deltatime / (1000 * 60 * 60 * 24)),
    months: Math.floor(deltatime / (1000 * 60 * 60 * 24 * 30)),
    years: Math.floor(deltatime / (1000 * 60 * 60 * 24 * 30 * 12)),
  };
  if (state.years > 0) {
    const months = detailed ? state.months % 12 : 0;
    return `${state.years}y${months > 0 ? ` ${months}mo` : ""}`;
  }
  if (state.months > 0) {
    const days = detailed ? state.days % 30 : 0;
    return `${state.months}mo${days > 0 ? ` ${days}d` : ""}`;
  }
  if (state.days > 0) {
    const hours = detailed ? state.hours % 24 : 0;
    return `${state.days}d${hours > 0 ? ` ${hours}h` : ""}`;
  }
  if (state.hours > 0) {
    const minutes = detailed ? state.minutes % 60 : 0;
    return `${state.hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
  }
  if (state.minutes > 0) {
    const seconds = detailed ? state.seconds % 60 : 0;
    return `${state.minutes}m${seconds > 0 ? ` ${seconds}s` : ""}`;
  }
  return `${state.seconds}s`;
};
