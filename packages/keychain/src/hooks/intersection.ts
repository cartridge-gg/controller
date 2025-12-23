import { useEffect, useRef, useState, RefCallback } from "react";

export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = "50px",
  enabled = true,
}: {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  enabled?: boolean;
} = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  const setRef: RefCallback<HTMLElement> = (element) => {
    elementRef.current = element;
  };

  useEffect(() => {
    if (!enabled || !elementRef.current) return;

    const element = elementRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        setIsIntersecting(isIntersecting);
        if (isIntersecting) {
          setHasIntersected((prev) => {
            if (!prev) return true;
            return prev;
          });
        }
      },
      {
        threshold,
        root,
        rootMargin,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, enabled]);

  return { elementRef: setRef, isIntersecting, hasIntersected };
}
