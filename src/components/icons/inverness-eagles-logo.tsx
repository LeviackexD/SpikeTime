import React from 'react';

export function InvernessEaglesLogo(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${props.className}`}>
       <svg
        width="32"
        height="32"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
        className="" 
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="url(#grad1)" stroke="hsl(var(--primary))" strokeWidth="2" />
        
        <path d="M 15,20 C 40,40 60,40 85,20" fill="none" stroke="hsl(var(--primary-foreground))" strokeWidth="3" />
        <path d="M 15,80 C 40,60 60,60 85,80" fill="none" stroke="hsl(var(--primary-foreground))" strokeWidth="3" />
        <path d="M 20,15 C 40,40 40,60 20,85" fill="none" stroke="hsl(var(--primary-foreground))" strokeWidth="3" />
        <path d="M 80,15 C 60,40 60,60 80,85" fill="none" stroke="hsl(var(--primary-foreground))" strokeWidth="3" />

      </svg>
      <span
        className="font-headline text-xl font-semibold text-foreground"
      >
        InvernessEagles
      </span>
    </div>
  );
}
