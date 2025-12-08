export interface ProgressBarOptions {
  duration: number; // in milliseconds (0 or Infinity for static full bar)
  onComplete?: () => void;
  borderRadius?: number; // Optional border radius in pixels (default: 8px)
}

export const ProgressBar = (options: ProgressBarOptions): HTMLDivElement => {
  const borderRadius = options.borderRadius ?? 8;
  const isInfiniteDuration =
    !isFinite(options.duration) || options.duration <= 0;

  const container = document.createElement("div");
  container.className = "cartridge-toast-progress-bar";
  container.style.position = "absolute";
  container.style.bottom = "0";
  container.style.left = "0";
  container.style.right = "0";
  container.style.height = "4px";
  container.style.overflow = "hidden";
  container.style.borderBottomLeftRadius = `${borderRadius}px`;
  container.style.borderBottomRightRadius = `${borderRadius}px`;
  container.style.backgroundColor = "rgba(255, 255, 255, 0.2)";

  const inside = document.createElement("div");
  inside.className = "cartridge-toast-progress-bar-fill";
  inside.style.position = "absolute";
  inside.style.bottom = "0";
  inside.style.left = "0";
  inside.style.height = "100%";
  inside.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
  inside.style.borderBottomLeftRadius = `${borderRadius}px`;

  if (isInfiniteDuration) {
    // For infinite duration, show full bar immediately without animation
    inside.style.width = "100%";
    inside.style.transition = "none";
  } else {
    // For finite duration, animate the progress bar
    inside.style.width = "0%";
    inside.style.transition = `width ${options.duration}ms linear`;

    // Start animation after a brief delay to ensure styles are applied
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        inside.style.width = "100%";
      });
    });

    // Call onComplete when animation finishes
    if (options.onComplete) {
      setTimeout(() => {
        options.onComplete?.();
      }, options.duration);
    }
  }

  container.appendChild(inside);

  return container;
};
