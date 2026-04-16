import { type SVGProps } from "react";

export function GachaCapsuleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <ellipse cx="32" cy="32" rx="24" ry="28" fill="currentColor" opacity="0.15" />
      <path
        d="M12 30C12 18.954 20.954 8 32 8s20 10.954 20 22v4c0 11.046-8.954 22-20 22S12 45.046 12 34v-4z"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
      <line x1="12" y1="32" x2="52" y2="32" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="4" fill="currentColor" />
    </svg>
  );
}

export function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function GachaLogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <ellipse cx="20" cy="20" rx="14" ry="16" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="6" y1="20" x2="34" y2="20" stroke="currentColor" strokeWidth="2" />
      <circle cx="20" cy="20" r="3" fill="currentColor" />
    </svg>
  );
}
