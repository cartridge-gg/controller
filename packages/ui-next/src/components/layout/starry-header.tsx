import React, { useEffect, useRef, useCallback } from "react";
import { cn } from "@/utils";

interface StarryHeaderBackgroundProps {
  width?: number;
  height?: number;
  backgroundColor?: string; // e.g., '#171A17'
  starColor?: string; // e.g., '#FBCB4A'
  className?: string;
}

// Star settings (adjustments for desired look)
const FOREGROUND_STARS = 15;
const MIDDLE_STARS = 50;
const BACKGROUND_STARS = 250;
const CLUSTER_CHANCE = 0.15;
const STARS_PER_CLUSTER = 4;
const CLUSTER_RADIUS = 15;
const SHOOTING_STAR_SPAWN_CHANCE = 0.005;
const MAX_SHOOTING_STARS = 3;
const SHOOTING_STAR_SPEED_MIN = 2.5;
const SHOOTING_STAR_SPEED_MAX = 4.0;
const SHOOTING_STAR_LIFESPAN = 150; // Frames

// Define star data types
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
  container?: HTMLDivElement; // Reference to the container div
}

interface ShootingStarData {
  element: HTMLDivElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  lifespan: number;
  rotation: number;
  container?: HTMLDivElement; // Reference to the container div
}

export const StarryHeaderBackground: React.FC<StarryHeaderBackgroundProps> = ({
  width = 430,
  height = 136,
  backgroundColor = "#171A17",
  starColor = "#FBCB4A",
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const starfieldRef = useRef<HTMLDivElement>(null);
  const allStarsRef = useRef<StarData[]>([]);
  const activeShootingStarsRef = useRef<ShootingStarData[]>([]);
  const mousePosRef = useRef<{ x: number; y: number }>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const animationFrameRef = useRef<number>();
  const containerRectRef = useRef<DOMRect | null>(null);

  const starColorClass = starColor === "#FBCB4A" ? "yellow-star" : "black-star";
  const shootingStarColorClass = starColor === "#FBCB4A" ? "yellow" : "black";

  // --- Dynamic Style Injection ---
  useEffect(() => {
    const styleId = "starry-background-styles";
    if (document.getElementById(styleId)) return; // Inject only once

    const styleSheet = document.createElement("style");
    styleSheet.id = styleId;
    styleSheet.textContent = `
            .starry-container .star {
                position: absolute;
                transform-origin: center center; /* Ensure rotation is centered */
            }
            .starry-container .black-star { background-color: #171A17; }
            .starry-container .yellow-star { background-color: #FBCB4A; }

            /* Soften foreground star corners with a small pixel value */
            .starry-container .star.foreground {
                border-radius: 1px; /* Use fixed pixel value */
            }

            /* Glows - Enhanced */
            .starry-container .black-star.foreground { box-shadow: 0 0 8px rgba(23, 26, 23, 0.8); }
            .starry-container .black-star.middle { box-shadow: 0 0 6px rgba(23, 26, 23, 0.6); }
            .starry-container .black-star.background { box-shadow: 0 0 3px rgba(23, 26, 23, 0.4); }
            .starry-container .yellow-star.foreground { box-shadow: 0 0 8px rgba(251, 203, 74, 0.8); }
            .starry-container .yellow-star.middle { box-shadow: 0 0 6px rgba(251, 203, 74, 0.6); }
            .starry-container .yellow-star.background { box-shadow: 0 0 3px rgba(251, 203, 74, 0.4); }

             /* Shooting Stars */
            .starry-container .shooting-star {
                position: absolute;
                width: 70px;
                height: 1px;
                background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.6));
                opacity: 0;
                transition: opacity 0.5s ease-out;
                transform-origin: left center; /* Rotate around the start point */
             }
            .starry-container .shooting-star.yellow { background: linear-gradient(to right, transparent, rgba(251, 203, 74, 0.8)); }
            .starry-container .shooting-star.black { background: linear-gradient(to right, transparent, rgba(50, 50, 50, 0.8)); }

            .starry-container .gradient-fade {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 50px; /* Increased gradient height */
                background: linear-gradient(to bottom, transparent, ${backgroundColor});
                pointer-events: none; /* Allow interaction with elements behind */
            }
        `;
    document.head.appendChild(styleSheet);

    // No cleanup needed for styles injected once
  }, [backgroundColor]); // Re-inject if background color changes drastically enough to need gradient update

  // --- Star Creation Logic ---
  const createStarInLayer = useCallback(
    (
      starfield: HTMLElement,
      stars: StarData[],
      layerClass: "foreground" | "middle" | "background",
      minSize: number,
      maxSize: number,
      minOpacity: number,
      maxOpacity: number,
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

      const xPos = forceX !== null ? forceX : Math.random() * width;
      const yPos = forceY !== null ? forceY : Math.random() * height;
      element.style.transform = `translate(${xPos}px, ${yPos}px) rotate(45deg)`;

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
        container: containerRef.current ?? undefined, // Associate with the container
      };

      if (returnData) {
        return starData;
      } else {
        starfield.appendChild(element);
        stars.push(starData);
      }
      return undefined; // Explicit return if not returning data
    },
    [width, height, starColorClass],
  ); // Dependencies for star creation

  const createShootingStar = useCallback(
    (starfield: HTMLElement) => {
      if (!containerRef.current) return;

      const element = document.createElement("div");
      element.className = `shooting-star ${shootingStarColorClass}`;

      let startX: number, startY: number, angle: number;
      const side = Math.floor(Math.random() * 4);
      angle = (Math.random() * Math.PI) / 2;

      switch (side) {
        case 0:
          startX = Math.random() * width;
          startY = -10;
          angle += Math.PI / 4 + (Math.random() > 0.5 ? 0 : Math.PI / 2);
          break;
        case 1:
          startX = width + 10;
          startY = Math.random() * height;
          angle += (3 * Math.PI) / 4 + (Math.random() > 0.5 ? 0 : Math.PI / 2);
          break;
        case 2:
          startX = Math.random() * width;
          startY = height + 10;
          angle += (5 * Math.PI) / 4 + (Math.random() > 0.5 ? 0 : Math.PI / 2);
          break;
        default:
          startX = -10;
          startY = Math.random() * height;
          angle += (7 * Math.PI) / 4 + (Math.random() > 0.5 ? 0 : Math.PI / 2);
          break;
      }

      const speed =
        SHOOTING_STAR_SPEED_MIN +
        Math.random() * (SHOOTING_STAR_SPEED_MAX - SHOOTING_STAR_SPEED_MIN);
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;
      const rotation = angle * (180 / Math.PI);

      element.style.transform = `translate(${startX}px, ${startY}px) rotate(${rotation}deg)`;
      starfield.appendChild(element);
      // Trigger fade-in (might need slight delay or force reflow)
      requestAnimationFrame(() => {
        element.style.opacity = "1";
      });

      activeShootingStarsRef.current.push({
        element,
        x: startX,
        y: startY,
        vx: velocityX,
        vy: velocityY,
        lifespan: SHOOTING_STAR_LIFESPAN,
        rotation,
        container: containerRef.current ?? undefined,
      });
    },
    [width, height, shootingStarColorClass],
  ); // Dependencies for shooting star creation

  // --- Initialization ---
  useEffect(() => {
    const starfield = starfieldRef.current;
    const container = containerRef.current;
    if (!starfield || !container) return;

    // Clear previous stars if component re-renders heavily (though refs should prevent this)
    allStarsRef.current = [];
    activeShootingStarsRef.current = [];
    starfield.innerHTML = ""; // Clear DOM elements

    const containerStars: StarData[] = []; // Temporary array for this container

    // Create foreground stars
    for (let i = 0; i < FOREGROUND_STARS; i++) {
      createStarInLayer(
        starfield,
        containerStars,
        "foreground",
        2.0,
        3.5,
        0.7,
        1.0,
      );
    }
    // Create middle stars
    for (let i = 0; i < MIDDLE_STARS; i++) {
      createStarInLayer(
        starfield,
        containerStars,
        "middle",
        1.5,
        2.8,
        0.5,
        0.8,
      );
    }
    // Create background stars with clustering
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
        true,
      );
      if (!primaryStarData) continue; // Should not happen if returnData=true
      currentBackgroundStars++;

      const potentialTotalAfterCluster =
        currentBackgroundStars + STARS_PER_CLUSTER;
      if (
        Math.random() < CLUSTER_CHANCE &&
        potentialTotalAfterCluster <= BACKGROUND_STARS
      ) {
        starfield.appendChild(primaryStarData.element); // Add cluster center first
        containerStars.push(primaryStarData);

        for (let j = 0; j < STARS_PER_CLUSTER; j++) {
          const clusterOffsetX = (Math.random() - 0.5) * 2 * CLUSTER_RADIUS;
          const clusterOffsetY = (Math.random() - 0.5) * 2 * CLUSTER_RADIUS;
          let clusterX = primaryStarData.x + clusterOffsetX;
          let clusterY = primaryStarData.y + clusterOffsetY;
          clusterX = Math.max(0, Math.min(width, clusterX));
          clusterY = Math.max(0, Math.min(height, clusterY));

          createStarInLayer(
            starfield,
            containerStars,
            "background",
            0.4,
            1.0,
            0.25,
            0.45,
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

    // Add container reference and push to global ref
    containerStars.forEach((star) => {
      star.container = container; // Add container ref
      allStarsRef.current.push(star);
    });

    // Initial rect calculation
    containerRectRef.current = container.getBoundingClientRect();
  }, [width, height, createStarInLayer]); // Re-initialize if dimensions change

  // --- Animation Loop ---
  const animate = useCallback(() => {
    const allStars = allStarsRef.current;
    const activeShootingStars = activeShootingStarsRef.current;
    const containerRect = containerRectRef.current;
    const starfield = starfieldRef.current;

    if (!containerRect || !starfield) {
      animationFrameRef.current = requestAnimationFrame(animate);
      return;
    }

    const mouseX = mousePosRef.current.x;
    const mouseY = mousePosRef.current.y;
    const containerCenterX = width / 2;
    const containerCenterY = height / 2;

    // Update regular stars
    allStars.forEach((star) => {
      const relativeMouseX = mouseX - containerRect.left;
      const relativeMouseY = mouseY - containerRect.top;
      const mouseOffsetX = relativeMouseX - containerCenterX;
      const mouseOffsetY = relativeMouseY - containerCenterY;

      let maxDisplacement = 0;
      let ease = 0.1;
      let velocityDamping = 0.85;

      switch (star.layer) {
        case "foreground":
          maxDisplacement = 15;
          ease = 0.15;
          velocityDamping = 0.8;
          break;
        case "middle":
          maxDisplacement = 8;
          ease = 0.1;
          velocityDamping = 0.85;
          break;
        case "background":
          maxDisplacement = 4;
          ease = 0.07;
          velocityDamping = 0.9;
          break;
      }

      const influenceRangeX = width * 1.5;
      const influenceRangeY = height * 2;
      const influenceX = Math.max(
        -1,
        Math.min(1, mouseOffsetX / influenceRangeX),
      );
      const influenceY = Math.max(
        -1,
        Math.min(1, mouseOffsetY / influenceRangeY),
      );
      const targetOffsetX = influenceX * maxDisplacement;
      const targetOffsetY = influenceY * maxDisplacement;
      const targetX = star.originX + targetOffsetX;
      const targetY = star.originY + targetOffsetY;
      const diffX = targetX - star.x;
      const diffY = targetY - star.y;
      const targetDx = diffX * ease;
      const targetDy = diffY * ease;

      star.dx += (targetDx - star.dx) * 0.5;
      star.dy += (targetDy - star.dy) * 0.5;
      star.dx *= velocityDamping;
      star.dy *= velocityDamping;
      star.x += star.dx;
      star.y += star.dy;

      // Twinkle
      const twinkleIntensity = 0.25;
      const minOpacityFactor = 0.6;
      const maxOpacityFactor = 1.2;
      const twinkleAmount = (Math.random() - 0.5) * twinkleIntensity;
      const baseOpacity = star.initialOpacity;
      let newOpacity = baseOpacity + twinkleAmount;
      newOpacity = Math.max(
        baseOpacity * minOpacityFactor,
        Math.min(baseOpacity * maxOpacityFactor, newOpacity),
      );

      // Apply transform and opacity
      star.element.style.transform = `translate(${star.x}px, ${star.y}px) rotate(45deg)`;
      star.element.style.opacity = newOpacity.toString();
    });

    // Update shooting stars
    let currentShootingStarCount = 0;
    for (let i = activeShootingStars.length - 1; i >= 0; i--) {
      currentShootingStarCount++;
      const ss = activeShootingStars[i];
      ss.x += ss.vx;
      ss.y += ss.vy;
      ss.lifespan--;
      ss.element.style.transform = `translate(${ss.x}px, ${ss.y}px) rotate(${ss.rotation}deg)`;

      const buffer = 70; // Match shooting star width
      if (
        ss.lifespan <= 0 ||
        ss.x < -buffer ||
        ss.x > width + buffer ||
        ss.y < -buffer ||
        ss.y > height + buffer
      ) {
        ss.element.style.opacity = "0";
        setTimeout(() => {
          ss.element.remove();
        }, 500); // Match CSS transition
        activeShootingStars.splice(i, 1);
        currentShootingStarCount--; // Adjust count as one is removed
      }
    }

    // Spawn new shooting stars
    if (
      currentShootingStarCount < MAX_SHOOTING_STARS &&
      Math.random() < SHOOTING_STAR_SPAWN_CHANCE
    ) {
      createShootingStar(starfield);
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [width, height, createShootingStar]); // Ensure width/height are dependencies if needed by logic inside

  // --- Event Listeners & Animation Control ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleResize = () => {
      // Update container rect on resize
      if (containerRef.current) {
        containerRectRef.current = containerRef.current.getBoundingClientRect();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Optional: Remove injected styles if component unmounts frequently
      // const styleSheet = document.getElementById('starry-background-styles');
      // if (styleSheet) styleSheet.remove();
    };
  }, [animate]); // Only run effect once on mount/unmount essentially, but include animate dependency

  return (
    <div
      ref={containerRef}
      className={cn(
        "starry-container",
        "relative overflow-hidden rounded-[10px]",
        className,
      )} // Added rounded corners like original
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: backgroundColor,
      }}
    >
      <div ref={starfieldRef} className="starfield absolute inset-0">
        {/* Stars are added here dynamically by the script */}
      </div>
      <div className="gradient-fade"></div>
    </div>
  );
};
