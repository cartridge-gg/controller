import { useConnection } from "@/hooks/connection";
import { useEffect, useRef, useState, useCallback } from "react";

export function OcclusionDetector() {
  const { parent } = useConnection();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOccluded, setIsOccluded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleIntersectionChange = useCallback(
    (changes: IntersectionObserverEntry[]) => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set a new timeout
      const timeout = setTimeout(() => {
        const change = changes[changes.length - 1]; // Get the most recent change
        if (!change) return;

        // Feature detection for Intersection Observer v2
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof (change as any).isVisible === "undefined") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (change as any).isVisible = true;
        }

        if (parent) {
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

      timeoutRef.current = timeout;
    },
    [parent],
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

  // Add this effect to handle scroll locking
  useEffect(() => {
    if (isOccluded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOccluded]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          zIndex: 1000,
          pointerEvents: isOccluded ? "auto" : "none",
          opacity: isOccluded ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      ></div>
    </div>
  );
}
