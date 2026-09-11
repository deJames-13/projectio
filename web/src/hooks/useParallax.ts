"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Hook to calculate smooth parallax scroll offset.
 * @param speed Multiplier for scroll distance (e.g. 0.08 for subtle, 0.2 for deeper depth)
 */
export function useParallax(speed = 0.1) {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let rafId: number;

    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        setOffsetY(window.scrollY * speed);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [speed]);

  return offsetY;
}

/**
 * Hook to detect when a component scrolls into view and trigger reveal transitions.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsRevealed(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isRevealed };
}

/**
 * Hook to observe cards with .loco-card or [data-scroll] within a container
 * and trigger staggered in-view transitions (Locomotive Scroll style).
 */
export function useLocomotiveCards<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.1,
  deps: React.DependencyList = []
) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = container.querySelectorAll<HTMLElement>(".loco-card, [data-scroll]");

    if (prefersReducedMotion) {
      cards.forEach((card) => card.classList.add("is-inview"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    cards.forEach((card) => {
      // If card already has is-inview, keep it, else observe
      if (!card.classList.contains("is-inview")) {
        observer.observe(card);
      }
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold, ...deps]);

  return containerRef;
}
