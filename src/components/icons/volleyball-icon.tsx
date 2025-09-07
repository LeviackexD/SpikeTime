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
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2z" />
      <path d="M12 2c0 0-4.48 4.48-4.48 10S12 22 12 22" />
      <path d="M22 12c0 0-4.48-4.48-10-4.48S2 12 2 12" />
    </svg>
  );
}
