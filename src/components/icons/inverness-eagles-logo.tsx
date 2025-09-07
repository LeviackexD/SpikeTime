import React from 'react';
import Image from 'next/image';

export function InvernessEaglesLogo(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${props.className}`}>
        {/* 
            Este componente ahora usa una imagen. 
            Para cambiar el logo, reemplaza el archivo en /public/images/logo.png con tu propio logo.
            Asegúrate de que el tamaño (width y height) sea el adecuado.
        */}
      <Image 
        src="/images/logo.png" 
        alt="Inverness Eagles Logo" 
        width={32} 
        height={32} 
        data-ai-hint="eagle logo"
      />
      <span
        className="font-headline text-xl font-semibold text-foreground"
      >
        InvernessEagles
      </span>
    </div>
  );
}
