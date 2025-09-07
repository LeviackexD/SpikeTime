import React from 'react';

export function SpikeTimeLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 40"
      aria-label="SpikeTime Logo"
      {...props}
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="16" fill="url(#grad1)" />
      <path d="M12,14 C16,10 24,10 28,14" fill="none" stroke="hsl(var(--primary-foreground))" strokeWidth="1.5" strokeOpacity="0.7" />
      <path d="M12,26 C16,30 24,30 28,26" fill="none" stroke="hsl(var(--primary-foreground))" strokeWidth="1.5" strokeOpacity="0.7" />
      <path d="M14,12 C10,16 10,24 14,28" fill="none" stroke="hsl(var(--primary-foreground))" strokeWidth="1.5" strokeOpacity="0.7" transform="rotate(90 20 20)" />
      <path d="M26,12 C30,16 30,24 26,28" fill="none" stroke="hsl(var(--primary-foreground))" strokeWidth="1.5" strokeOpacity="0.7" transform="rotate(90 20 20)" />

      <text
        x="45"
        y="27"
        fontFamily="Poppins, sans-serif"
        fontSize="24"
        fontWeight="600"
        fill="hsl(var(--foreground))"
        className="font-headline"
      >
        SpikeTime
      </text>
    </svg>
  );
}
