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
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a5.5 5.5 0 0 0-5.5 5.5c0 1.62 1.94 4.5 5.5 4.5s5.5-2.88 5.5-4.5A5.5 5.5 0 0 0 12 2z" />
      <path d="M2.5 9.5c0 1.62 4.5 4.5 9.5 4.5s9.5-2.88 9.5-4.5" />
      <path d="M2.5 14.5c0-1.62 4.5-4.5 9.5-4.5s9.5 2.88 9.5 4.5" />
    </svg>
  );
}
