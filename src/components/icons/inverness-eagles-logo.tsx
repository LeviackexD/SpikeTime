import React from 'react';
import { VolleyballIcon } from './volleyball-icon';

export function InvernessEaglesLogo(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${props.className}`}>
       <VolleyballIcon 
        className="h-8 w-8 text-orange-500"
      />
      <span
        className="font-headline text-xl font-semibold text-current"
      >
        InvernessEagles
      </span>
    </div>
  );
}
