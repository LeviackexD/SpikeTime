
import * as React from 'react';

export function VolleyballIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
        <path d="M22 17a5 5 0 0 1-5.6-4H8.4A5 5 0 0 1 3 17" />
        <path d="M4 17c0-2.3 1-4.3 2.5-5.5" />
        <path d="M17.5 11.5c1.5 1.2 2.5 3.2 2.5 5.5" />
        <path d="M12 8a2 2 0 0 0-2 2c0 1.1.9 2 2 2s2-.9 2-2c0-1.1-.9-2-2-2z" />
        <path d="M8.4 13c-2 .5-3.4 2.2-3.4 4" />
        <path d="M19 17c0-1.8-1.4-3.5-3.4-4" />
    </svg>
  );
}
