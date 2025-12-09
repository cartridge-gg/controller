import { ProgressBar } from "../components/progress-bar";

/**
 * Add a progress bar to a toast element
 *
 * @param toast - The toast element to add the progress bar to
 * @param duration - Duration in milliseconds
 * @param onComplete - Callback when progress completes
 * @param borderRadius - Optional border radius in pixels (default: 8px)
 */
export function addProgressBarToToast(
  toast: HTMLElement,
  duration: number,
  onComplete: () => void,
  borderRadius?: number,
): void {
  const progressBar = ProgressBar({
    duration,
    onComplete,
    borderRadius,
  });
  toast.appendChild(progressBar);
}
