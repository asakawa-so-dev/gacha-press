"use client";

import { useState } from "react";
import Image from "next/image";

export default function CapsuleLogo({ size = 80 }: { size?: number }) {
  const [open, setOpen] = useState(false);

  const handleInteraction = () => {
    if (open) return;
    setOpen(true);
    setTimeout(() => setOpen(false), 1200);
  };

  return (
    <div
      className="capsule-logo relative cursor-pointer"
      style={{ width: size, height: size }}
      onClick={handleInteraction}
      onMouseEnter={handleInteraction}
    >
      {/* Behind: top half splits open to the left */}
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          clipPath: "inset(0 0 50% 0)",
          transform: open ? "rotate(-70deg)" : "none",
          transformOrigin: "0% 100%",
          transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <Image
          src="/images/logo.png"
          alt=""
          width={size}
          height={size}
          className="rounded-full"
          aria-hidden
        />
      </div>

      {/* Behind: bottom half stays */}
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          clipPath: "inset(50% 0 0 0)",
          transform: open ? "translateY(2px)" : "none",
          transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <Image
          src="/images/logo.png"
          alt=""
          width={size}
          height={size}
          className="rounded-full"
          aria-hidden
        />
      </div>

      {/* Front: full image stays still (character doesn't move) */}
      <Image
        src="/images/logo.png"
        alt="marupaca"
        width={size}
        height={size}
        className="relative z-10 rounded-full"
      />

    </div>
  );
}
