"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export function HeroImageSlider({ slides, intervalMs = 2000, className = "" }) {
  const normalizedSlides = useMemo(
    () => (Array.isArray(slides) ? slides.filter(Boolean) : []),
    [slides]
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (normalizedSlides.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % normalizedSlides.length);
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [intervalMs, normalizedSlides]);

  useEffect(() => {
    if (activeIndex >= normalizedSlides.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, normalizedSlides.length]);

  if (!normalizedSlides.length) {
    return null;
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`.trim()}
      aria-label="Public dashboard hero image slider"
      role="region"
    >
      <div
        className="flex h-full w-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {normalizedSlides.map((slide) => (
          <div key={slide.src} className="relative h-full min-w-full">
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={slide.priority}
              className="object-cover"
              sizes="100vw"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
