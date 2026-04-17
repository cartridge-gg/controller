import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { cn } from "@/utils";

interface StarryHeaderBackgroundProps {
  width?: number;
  height?: number;
  backgroundColor?: string; // e.g., '#171A17'
  starColor?: string; // e.g., '#FBCB4A'
  className?: string;
  reducedMotion?: boolean; // New prop for accessibility
}

// Original star settings - keeping visual fidelity
const FOREGROUND_STARS = 15;
const MIDDLE_STARS = 50;
const BACKGROUND_STARS = 250;
const CLUSTER_CHANCE = 0.15;
const STARS_PER_CLUSTER = 4;
const CLUSTER_RADIUS = 15;

// Performance optimization constants
const TARGET_FPS = 60; // Keep original 60fps
const FRAME_INTERVAL = 1000 / TARGET_FPS;
const MOUSE_THROTTLE_MS = 16; // ~60fps for mouse tracking
const TRANSFORM_PRECISION = 1; // Decimal places for transform values
const OPACITY_PRECISION = 2; // Decimal places for opacity values
const SIGNIFICANT_CHANGE_THRESHOLD = 0.1; // Minimum change to trigger DOM update

// Define star data types with performance caching
interface StarData {
  element: HTMLDivElement;
  x: number;
  y: number;
  originX: number;
  originY: number;
  initialOpacity: number;
  size: number;
  layer: "foreground" | "middle" | "background";
  dx: number;
  dy: number;
  container?: HTMLDivElement;
  // Performance caching
  lastTransform?: string;
  lastOpacity?: number;
  lastX?: number;
  lastY?: number;
  // Pre-calculated values
  maxDisplacement: number;
  ease: number;
  velocityDamping: number;
  influenceRangeX: number;
  influenceRangeY: number;
  twinkleIntensity: number;
  minOpacityFactor: number;
  maxOpacityFactor: number;
}

export const StarryHeaderBackground: React.FC<StarryHeaderBackgroundProps> = ({
  height = 136,
  backgroundColor = "#171A17",
  starColor = "#FBCB4A",
  className,
  reducedMotion = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const starfieldRef = useRef<HTMLDivElement>(null);
  const allStarsRef = useRef<StarData[]>([]);
  const mousePosRef = useRef<{ x: number; y: number }>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const animationFrameRef = useRef<number>();
  const containerRectRef = useRef<DOMRect | null>(null);

  // Performance optimization refs
  const lastFrameTimeRef = useRef<number>(0);
  const lastMouseUpdateRef = useRef<number>(0);

  // Cached calculations - will be updated when container size changes
  const containerCenterRef = useRef<{ x: number; y: number }>({
    x: 0,
    y: height / 2,
  });
  const containerSizeRef = useRef<{ width: number; height: number }>({
    width: 430,
    height,
  });
  const pendingUpdatesRef = useRef<Array<() => void>>([]);

  // Memoized values for performance
  const starColorClass = useMemo(
    () => (starColor === "#FBCB4A" ? "yellow-star" : "black-star"),
    [starColor],
  );

  // Update cached dimensions when container size changes
  const updateContainerDimensions = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0) {
        containerSizeRef.current = { width: rect.width, height: rect.height };
        containerCenterRef.current = { x: rect.width / 2, y: rect.height / 2 };
        containerRectRef.current = rect;
      }
    }
  }, []);

  // Track if stars have been initialized to avoid race conditions
  const starsInitializedRef = useRef(false);
  // Track if star creation is already pending to prevent duplicates
  const starCreationPendingRef = useRef(false);

  // --- Dynamic Style Injection (updated to remove shooting star styles) ---
  useEffect(() => {
    const styleId = "starry-background-styles";
    if (document.getElementById(styleId)) return;

    const styleSheet = document.createElement("style");
    styleSheet.id = styleId;
    styleSheet.textContent = `
            .starry-container .star {
                position: absolute;
                transform-origin: center center;
                will-change: transform, opacity;
            }
            .starry-container .black-star { background-color: #171A17; }
            .starry-container .yellow-star { background-color: #FBCB4A; }

            .starry-container .star.foreground {
                border-radius: 1px;
            }

            /* Original glows - keeping visual fidelity */
            .starry-container .black-star.foreground { box-shadow: 0 0 8px rgba(23, 26, 23, 0.8); }
            .starry-container .black-star.middle { box-shadow: 0 0 6px rgba(23, 26, 23, 0.6); }
            .starry-container .black-star.background { box-shadow: 0 0 3px rgba(23, 26, 23, 0.4); }
            .starry-container .yellow-star.foreground { box-shadow: 0 0 8px rgba(251, 203, 74, 0.8); }
            .starry-container .yellow-star.middle { box-shadow: 0 0 6px rgba(251, 203, 74, 0.6); }
            .starry-container .yellow-star.background { box-shadow: 0 0 3px rgba(251, 203, 74, 0.4); }

            .starry-container .gradient-fade {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 50px;
                background: linear-gradient(to bottom, transparent, ${backgroundColor});
                pointer-events: none;
            }
        `;
    document.head.appendChild(styleSheet);
  }, [backgroundColor]);

  // --- Optimized Star Creation Logic with Pre-calculations ---
  const createStarInLayer = useCallback(
    (
      starfield: HTMLElement,
      stars: StarData[],
      layerClass: "foreground" | "middle" | "background",
      minSize: number,
      maxSize: number,
      minOpacity: number,
      maxOpacity: number,
      containerWidth: number,
      containerHeight: number,
      returnData = false,
      forceX: number | null = null,
      forceY: number | null = null,
    ): StarData | undefined => {
      let layerMinSize = minSize;
      let layerMaxSize = maxSize;
      if (layerClass === "foreground") {
        layerMinSize = 2.0;
        layerMaxSize = 3.5;
      } else if (layerClass === "middle") {
        layerMinSize = 1.5;
        layerMaxSize = 2.8;
      }

      const size = layerMinSize + Math.random() * (layerMaxSize - layerMinSize);
      const opacity = minOpacity + Math.random() * (maxOpacity - minOpacity);

      const element = document.createElement("div");
      element.className = `star ${starColorClass} ${layerClass}`;
      element.style.width = `${size}px`;
      element.style.height = `${size}px`;
      element.style.opacity = opacity.toString();

      const xPos = forceX !== null ? forceX : Math.random() * containerWidth;
      const yPos = forceY !== null ? forceY : Math.random() * containerHeight;
      const initialTransform = `translate(${xPos}px, ${yPos}px) rotate(45deg)`;
      element.style.transform = initialTransform;

      // Pre-calculate layer-specific values for performance
      let maxDisplacement = 0;
      let ease = 0.1;
      let velocityDamping = 0.85;
      let twinkleIntensity = 0.25;

      switch (layerClass) {
        case "foreground":
          maxDisplacement = 15;
          ease = 0.15;
          velocityDamping = 0.8;
          twinkleIntensity = 0.25;
          break;
        case "middle":
          maxDisplacement = 8;
          ease = 0.1;
          velocityDamping = 0.85;
          twinkleIntensity = 0.2;
          break;
        case "background":
          maxDisplacement = 4;
          ease = 0.07;
          velocityDamping = 0.9;
          twinkleIntensity = 0.15;
          break;
      }

      const starData: StarData = {
        element,
        x: xPos,
        y: yPos,
        originX: xPos,
        originY: yPos,
        initialOpacity: opacity,
        size,
        layer: layerClass,
        dx: 0,
        dy: 0,
        container: containerRef.current ?? undefined,
        lastTransform: initialTransform,
        lastOpacity: opacity,
        lastX: xPos,
        lastY: yPos,
        // Pre-calculated performance values using actual container dimensions
        maxDisplacement,
        ease,
        velocityDamping,
        influenceRangeX: containerWidth * 1.5,
        influenceRangeY: containerHeight * 2,
        twinkleIntensity,
        minOpacityFactor: 0.6,
        maxOpacityFactor: 1.2,
      };

      if (returnData) {
        return starData;
      } else {
        starfield.appendChild(element);
        stars.push(starData);
      }
      return undefined;
    },
    [starColorClass],
  );

  // Helper function to create all stars
  const createAllStars = useCallback(() => {
    const starfield = starfieldRef.current;
    const container = containerRef.current;
    if (!starfield || !container) return;

    // Ensure we have current dimensions
    updateContainerDimensions();
    const { width: containerWidth, height: containerHeight } =
      containerSizeRef.current;

    // Don't create stars if container is too small
    if (containerWidth < 50) {
      return;
    }

    allStarsRef.current = [];
    starfield.innerHTML = "";
    starsInitializedRef.current = true;

    const containerStars: StarData[] = [];

    // Create foreground stars (original count)
    for (let i = 0; i < FOREGROUND_STARS; i++) {
      createStarInLayer(
        starfield,
        containerStars,
        "foreground",
        2.0,
        3.5,
        0.7,
        1.0,
        containerWidth,
        containerHeight,
      );
    }

    // Create middle stars (original count)
    for (let i = 0; i < MIDDLE_STARS; i++) {
      createStarInLayer(
        starfield,
        containerStars,
        "middle",
        1.5,
        2.8,
        0.5,
        0.8,
        containerWidth,
        containerHeight,
      );
    }

    // Create background stars with clustering (original logic)
    let currentBackgroundStars = 0;
    while (currentBackgroundStars < BACKGROUND_STARS) {
      const primaryStarData = createStarInLayer(
        starfield,
        containerStars,
        "background",
        0.5,
        1.3,
        0.3,
        0.5,
        containerWidth,
        containerHeight,
        true,
      );
      if (!primaryStarData) continue;
      currentBackgroundStars++;

      const potentialTotalAfterCluster =
        currentBackgroundStars + STARS_PER_CLUSTER;
      if (
        Math.random() < CLUSTER_CHANCE &&
        potentialTotalAfterCluster <= BACKGROUND_STARS
      ) {
        starfield.appendChild(primaryStarData.element);
        containerStars.push(primaryStarData);

        for (let j = 0; j < STARS_PER_CLUSTER; j++) {
          const clusterOffsetX = (Math.random() - 0.5) * 2 * CLUSTER_RADIUS;
          const clusterOffsetY = (Math.random() - 0.5) * 2 * CLUSTER_RADIUS;
          let clusterX = primaryStarData.x + clusterOffsetX;
          let clusterY = primaryStarData.y + clusterOffsetY;
          clusterX = Math.max(0, Math.min(containerWidth, clusterX));
          clusterY = Math.max(0, Math.min(containerHeight, clusterY));

          createStarInLayer(
            starfield,
            containerStars,
            "background",
            0.4,
            1.0,
            0.25,
            0.45,
            containerWidth,
            containerHeight,
            false,
            clusterX,
            clusterY,
          );
          currentBackgroundStars++;
        }
      } else {
        starfield.appendChild(primaryStarData.element);
        containerStars.push(primaryStarData);
      }
    }

    containerStars.forEach((star) => {
      star.container = container;
      allStarsRef.current.push(star);
    });
  }, [createStarInLayer, updateContainerDimensions]);

  // --- Simple initialization with layout effect ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeoutId: NodeJS.Timeout | null = null;

    const initializeStars = () => {
      if (timeoutId) clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        const rect = container.getBoundingClientRect();
        if (rect.width > 50 && !starCreationPendingRef.current) {
          // Update cached dimensions
          containerSizeRef.current = { width: rect.width, height: rect.height };
          containerCenterRef.current = {
            x: rect.width / 2,
            y: rect.height / 2,
          };
          containerRectRef.current = rect;

          starCreationPendingRef.current = true;
          requestAnimationFrame(() => {
            createAllStars();
            starCreationPendingRef.current = false;
          });
        }
      }, 0);
    };

    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        const rect = container.getBoundingClientRect();
        if (rect.width > 50) {
          const oldWidth = containerSizeRef.current.width;
          const sizeChanged =
            Math.abs(rect.width - oldWidth) / Math.max(oldWidth, 1) > 0.1;

          if (sizeChanged && !starCreationPendingRef.current) {
            // Update cached dimensions
            containerSizeRef.current = {
              width: rect.width,
              height: rect.height,
            };
            containerCenterRef.current = {
              x: rect.width / 2,
              y: rect.height / 2,
            };
            containerRectRef.current = rect;

            starCreationPendingRef.current = true;
            requestAnimationFrame(() => {
              createAllStars();
              starCreationPendingRef.current = false;
            });
          }
        }
      }, 100); // Debounce resize events
    };

    // Initialize stars immediately
    initializeStars();

    // Listen for window resize events
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [createAllStars]);

  // --- Highly Optimized Animation Loop with Caching ---
  const animate = useCallback(
    (currentTime: number) => {
      // Frame rate throttling
      if (currentTime - lastFrameTimeRef.current < FRAME_INTERVAL) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      lastFrameTimeRef.current = currentTime;

      const allStars = allStarsRef.current;
      const containerRect = containerRectRef.current;
      const starfield = starfieldRef.current;

      if (
        !containerRect ||
        !starfield ||
        !starsInitializedRef.current ||
        allStars.length === 0
      ) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const mouseX = mousePosRef.current.x;
      const mouseY = mousePosRef.current.y;
      const containerCenter = containerCenterRef.current;

      // Clear pending updates array
      pendingUpdatesRef.current.length = 0;

      // Cache frequently used calculations
      const relativeMouseX = mouseX - containerRect.left;
      const relativeMouseY = mouseY - containerRect.top;
      const mouseOffsetX = relativeMouseX - containerCenter.x;
      const mouseOffsetY = relativeMouseY - containerCenter.y;

      // Update regular stars with cached calculations
      const motionMultiplier = reducedMotion ? 0.3 : 1;

      for (let i = 0; i < allStars.length; i++) {
        const star = allStars[i];

        // Use pre-calculated values
        const influenceX = Math.max(
          -1,
          Math.min(1, mouseOffsetX / star.influenceRangeX),
        );
        const influenceY = Math.max(
          -1,
          Math.min(1, mouseOffsetY / star.influenceRangeY),
        );
        const targetOffsetX =
          influenceX * star.maxDisplacement * motionMultiplier;
        const targetOffsetY =
          influenceY * star.maxDisplacement * motionMultiplier;
        const targetX = star.originX + targetOffsetX;
        const targetY = star.originY + targetOffsetY;
        const diffX = targetX - star.x;
        const diffY = targetY - star.y;
        const targetDx = diffX * star.ease;
        const targetDy = diffY * star.ease;

        star.dx += (targetDx - star.dx) * 0.5;
        star.dy += (targetDy - star.dy) * 0.5;
        star.dx *= star.velocityDamping;
        star.dy *= star.velocityDamping;
        star.x += star.dx;
        star.y += star.dy;

        // Optimized twinkle calculation
        let newOpacity = star.initialOpacity;
        if (!reducedMotion) {
          const twinkleAmount = (Math.random() - 0.5) * star.twinkleIntensity;
          newOpacity = Math.max(
            star.initialOpacity * star.minOpacityFactor,
            Math.min(
              star.initialOpacity * star.maxOpacityFactor,
              star.initialOpacity + twinkleAmount,
            ),
          );
        }

        // Only update DOM if values changed significantly
        const xChanged =
          Math.abs(star.x - (star.lastX || 0)) > SIGNIFICANT_CHANGE_THRESHOLD;
        const yChanged =
          Math.abs(star.y - (star.lastY || 0)) > SIGNIFICANT_CHANGE_THRESHOLD;
        const opacityChanged =
          Math.abs(newOpacity - (star.lastOpacity || 0)) > 0.01;

        if (xChanged || yChanged || opacityChanged) {
          const newTransform = `translate(${star.x.toFixed(TRANSFORM_PRECISION)}px, ${star.y.toFixed(TRANSFORM_PRECISION)}px) rotate(45deg)`;

          pendingUpdatesRef.current.push(() => {
            if (xChanged || yChanged) {
              star.element.style.transform = newTransform;
              star.lastTransform = newTransform;
              star.lastX = star.x;
              star.lastY = star.y;
            }
            if (opacityChanged) {
              star.element.style.opacity =
                newOpacity.toFixed(OPACITY_PRECISION);
              star.lastOpacity = newOpacity;
            }
          });
        }
      }

      // Apply all DOM updates in a single batch
      const updates = pendingUpdatesRef.current;
      for (let i = 0; i < updates.length; i++) {
        updates[i]();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [reducedMotion],
  );

  // --- Optimized Event Listeners ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMouseUpdateRef.current < MOUSE_THROTTLE_MS) return;

      lastMouseUpdateRef.current = now;
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    // Use passive listeners for better performance
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  return (
    <div
      ref={containerRef}
      className={cn("starry-container", "relative overflow-hidden", className)}
      style={{
        width: "100%",
        height: `${height}px`,
        backgroundColor: backgroundColor,
      }}
    >
      <div ref={starfieldRef} className="starfield absolute inset-0">
        {/* Stars are added here dynamically */}
      </div>
      <div className="gradient-fade"></div>
    </div>
  );
};
