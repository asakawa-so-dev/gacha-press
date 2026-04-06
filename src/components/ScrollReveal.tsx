"use client";

import { useEffect, useRef, useState } from "react";

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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => {
      if (delay > 0) {
        setTimeout(() => setVisible(true), delay);
      } else {
        setVisible(true);
      }
    };

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 40 && rect.bottom > 0) {
      requestAnimationFrame(show);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          show();
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
    <div ref={ref} className={`${variantClass}${visible ? " is-visible" : ""} ${className}`}>
      {children}
    </div>
  );
}
