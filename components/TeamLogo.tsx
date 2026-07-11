'use client';

import { useState } from 'react';
import { Shield } from 'lucide-react';

interface TeamLogoProps {
  src: string;
  alt: string;
  className?: string;
}

export default function TeamLogo({ src, alt, className = 'w-6 h-6' }: TeamLogoProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`${className} bg-slate-800 rounded-full flex items-center justify-center text-slate-600 border border-slate-700`}>
        <Shield size="60%" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={`${className} object-contain`} onError={() => setError(true)} loading="lazy" />
  );
}
