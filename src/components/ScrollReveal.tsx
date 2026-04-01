"use client";

import { useEffect, useRef } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  variant?: "up" | "fade" | "scale" | "left" | "stagger";
  delay?: number;
  threshold?: number;
};

export default function ScrollReveal({
  children,
  className = "",
  variant = "up",
  delay = 0,
  threshold = 0.15,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const addVisible = () => {
      if (delay > 0) {
        setTimeout(() => el.classList.add("is-visible"), delay);
      } else {
        el.classList.add("is-visible");
      }
    };

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 40 && rect.bottom > 0) {
      requestAnimationFrame(addVisible);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          addVisible();
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold]);

  const variantClass = {
    up: "reveal",
    fade: "reveal reveal-fade",
    scale: "reveal reveal-scale",
    left: "reveal reveal-left",
    stagger: "reveal stagger-children",
  }[variant];

  return (
    <div ref={ref} className={`${variantClass} ${className}`}>
      {children}
    </div>
  );
}
