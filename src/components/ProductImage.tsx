"use client";

import { useState } from "react";
import Image from "next/image";

type ProductImageProps = {
  src: string | null;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
  showSourceBadge?: boolean;
};

function extractDomain(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export default function ProductImage({
  src,
  alt,
  fill,
  sizes,
  className,
  priority,
  showSourceBadge = true,
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[#f5f5f7]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="h-8 w-8 text-[#c0c0cc]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
          />
        </svg>
        <span className="text-[#9b9bab] text-xs">No Image</span>
      </div>
    );
  }

  const isExternal = src.startsWith("http");
  const resolvedSrc = isExternal ? src : src.startsWith("/") ? src : `/${src}`;
  const domain = isExternal ? extractDomain(src) : null;

  if (isExternal) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolvedSrc}
          alt={alt}
          onError={() => setHasError(true)}
          referrerPolicy="no-referrer"
          loading={priority ? "eager" : "lazy"}
          className={className}
          style={
            fill
              ? {
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  padding: "4px",
                }
              : undefined
          }
        />
        {showSourceBadge && domain && (
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-md bg-black/60 backdrop-blur-sm px-2 py-1 text-[10px] text-white/90 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-2.5 w-2.5 shrink-0"
            >
              <path d="M8.914 6.025a.75.75 0 0 1 1.06 0 3.5 3.5 0 0 1 0 4.95l-2 2a3.5 3.5 0 0 1-5.396-4.402.75.75 0 0 1 1.251.827 2 2 0 0 0 3.085 2.514l2-2a2 2 0 0 0 0-2.828.75.75 0 0 1 0-1.06Z" />
              <path d="M7.086 9.975a.75.75 0 0 1-1.06 0 3.5 3.5 0 0 1 0-4.95l2-2a3.5 3.5 0 0 1 5.396 4.402.75.75 0 0 1-1.251-.827 2 2 0 0 0-3.085-2.514l-2 2a2 2 0 0 0 0 2.828.75.75 0 0 1 0 1.06Z" />
            </svg>
            {domain}
          </div>
        )}
      </>
    );
  }

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={className}
      priority={priority}
      onError={() => setHasError(true)}
    />
  );
}
