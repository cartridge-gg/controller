import { useConnection } from "@/hooks/connection";
import { useEffect, useRef, useState, useCallback } from "react";

export function OcclusionDetector() {
  const { context } = useConnection();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOccluded, setIsOccluded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleIntersectionChange = useCallback(
    (changes: IntersectionObserverEntry[]) => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set a new timeout
      timeoutRef.current = setTimeout(() => {
        const change = changes[changes.length - 1]; // Get the most recent change
        if (!change) return;

        // Feature detection for Intersection Observer v2
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof (change as any).isVisible === "undefined") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (change as any).isVisible = true;
        }

        if (context) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (change.isIntersecting && !(change as any).isVisible) {
            setIsOccluded(true);
          } else {
            setIsOccluded(false);
          }
        } else {
          setIsOccluded(false);
        }
      }, 250);
    },
    [context],
  );

  useEffect(() => {
    if (!containerRef.current || !window.IntersectionObserver) return;

    const observer = new IntersectionObserver(handleIntersectionChange, {
      threshold: [1.0],
      trackVisibility: true,
      delay: 100,
    });

    observer.observe(containerRef.current);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      observer.disconnect();
    };
  }, [handleIntersectionChange]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      {isOccluded && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            zIndex: 1000,
            pointerEvents: "auto",
          }}
        >
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p>This window is currently blocked by another element.</p>
            <p>Please close or move the blocking element to continue.</p>
          </div>
        </div>
      )}
    </div>
  );
}
