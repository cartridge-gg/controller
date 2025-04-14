import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/utils";

interface Star {
  element: HTMLDivElement;
  x: number;
  y: number;
  size: number;
  speed: number;
  layer: "foreground" | "middle" | "background";
  dx: number;
  dy: number;
  baseOpacity: number;
}

interface StarBackgroundProps {
  width?: number | string;
  height?: number;
  starCount?: number;
  className?: string;
}

export const StarBackground = ({
  width = 400,
  height = 120,
  starCount = 120,
  className = "",
}: React.ComponentProps<"div"> & StarBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const starfieldRef = useRef<HTMLDivElement>(null);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const starsRef = useRef<Star[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(
    typeof width === "number" ? width : 400,
  );

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Update container position on resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerRect(containerRef.current.getBoundingClientRect());
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial setup

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Create stars
  useEffect(() => {
    if (!starfieldRef.current) return;

    const starfield = starfieldRef.current;
    const stars: Star[] = [];

    // Layer distribution
    const foregroundCount = Math.round(starCount * 0.15);
    const middleCount = Math.round(starCount * 0.25);
    const backgroundCount = starCount - foregroundCount - middleCount;

    // Helper to create a star in a specific layer
    const createStarInLayer = (
      layerClass: "foreground" | "middle" | "background",
      minSize: number,
      maxSize: number,
      minOpacity: number,
      maxOpacity: number,
      maxSpeed: number,
    ) => {
      // Generate random size and opacity
      const size = minSize + Math.random() * (maxSize - minSize);
      const baseOpacity = minOpacity + Math.random() * (maxOpacity - minOpacity);
      const speed = 0.2 + Math.random() * maxSpeed;

      // Create the DOM element
      const element = document.createElement("div");

      // Apply Tailwind classes based on layer
      if (layerClass === "foreground") {
        element.className = "absolute bg-primary rotate-45 z-10";
        element.style.boxShadow = "0 0 8px 2px rgba(255, 255, 255, 0.8)";
      } else if (layerClass === "middle") {
        element.className = "absolute bg-primary rotate-45 z-5";
        element.style.boxShadow = "0 0 6px 1px rgba(255, 255, 255, 0.6)";
      } else {
        element.className = "absolute bg-primary rotate-45 z-0";
        element.style.boxShadow = "0 0 4px 1px rgba(255, 255, 255, 0.4)";
      }

      element.style.width = `${size}px`;
      element.style.height = `${size}px`;
      element.style.opacity = baseOpacity.toString();

      // Position the star randomly within the header bounds
      const xPos = Math.random() * containerWidth;
      const yPos = Math.random() * height;
      element.style.left = `${xPos}px`;
      element.style.top = `${yPos}px`;

      starfield.appendChild(element);

      // Add to the stars array
      stars.push({
        element,
        x: xPos,
        y: yPos,
        size,
        speed,
        layer: layerClass,
        dx: 0,
        dy: 0,
        baseOpacity,
      });
    };

    // Create foreground stars (15%)
    for (let i = 0; i < foregroundCount; i++) {
      createStarInLayer("foreground", 2.0, 3.5, 0.8, 1.0, 0.6); // Increased maxSpeed
    }

    // Create middle stars (25%)
    for (let i = 0; i < middleCount; i++) {
      createStarInLayer("middle", 1.2, 2.2, 0.6, 0.8, 0.4); // Increased maxSpeed
    }

    // Create background stars (60%)
    for (let i = 0; i < backgroundCount; i++) {
      createStarInLayer("background", 0.5, 1.3, 0.4, 0.6, 0.2); // Increased maxSpeed
    }

    starsRef.current = stars;

    // Cleanup function
    return () => {
      stars.forEach((star) => {
        star.element.remove();
      });
    };
  }, [containerWidth, height, starCount]);

  // Animation loop
  useEffect(() => {
    if (!containerRect) return;

    const animate = () => {
      const stars = starsRef.current;

      // Get the center of the header
      const headerCenterX = containerRect.left + containerWidth / 2;
      const headerCenterY = containerRect.top + height / 2;

      // Calculate the vector from center to mouse
      const dx = mouseX - headerCenterX;
      const dy = mouseY - headerCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Calculate influence based on distance
      const maxDist = Math.max(window.innerWidth, window.innerHeight) / 2.5;
      let influence = Math.max(0, 1 - dist / maxDist);
      influence = Math.pow(influence, 0.4);

      // Check if cursor is in range
      const cursorInRange = dist < maxDist;

      // Target movement direction - only if cursor is in range
      const targetX = cursorInRange ? (dx / dist) * influence : 0;
      const targetY = cursorInRange ? (dy / dist) * influence * 0.5 : 0;

      // Update each star
      stars.forEach((star) => {
        // Different easing based on layer
        const ease =
          star.layer === "foreground"
            ? 0.12
            : star.layer === "middle"
              ? 0.08
              : 0.04;

        // Ease toward target direction
        star.dx += (targetX - star.dx) * ease;
        star.dy += (targetY - star.dy) * ease;

        // Apply movement
        star.x += star.dx * star.speed;
        star.y += star.dy * star.speed;

        // Wrap around edges
        if (star.x < -5) star.x = containerWidth + 5;
        else if (star.x > containerWidth + 5) star.x = -5;

        if (star.y < -5) star.y = height + 5;
        else if (star.y > height + 5) star.y = -5;

        // Calculate opacity based on position in gradient area
        const gradientStart = height - 16; // 16px from bottom
        const gradientEnd = height;
        const starY = star.y;
        
        let opacity = star.baseOpacity;
        if (starY > gradientStart) {
          const gradientProgress = (starY - gradientStart) / (gradientEnd - gradientStart);
          opacity = star.baseOpacity * (1 - gradientProgress);
        }

        // Update DOM element position and opacity
        star.element.style.left = `${star.x}px`;
        star.element.style.top = `${star.y}px`;
        star.element.style.opacity = opacity.toString();
      });

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mouseX, mouseY, containerRect, containerWidth, height]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      style={{ width, height }}
    >
      <div ref={starfieldRef} className="absolute inset-0" />
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-b from-transparent to-background z-20" />
    </div>
  );
};
