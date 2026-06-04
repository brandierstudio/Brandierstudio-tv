/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface BrandierLogoProps {
  className?: string;
  size?: number | string;
  usePurpleGradient?: boolean;
}

export default function BrandierLogo({
  className = 'text-current',
  size = '100%',
  usePurpleGradient = true, // default to true to align with brand request!
}: BrandierLogoProps) {
  const fillValue = usePurpleGradient ? 'url(#purpleBlushGrad)' : 'currentColor';
  return (
    <svg
      viewBox="0 0 500 500"
      width={size}
      height={size}
      fill={fillValue}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="purpleBlushGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="30%" stopColor="#7C3AED" />
          <stop offset="65%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      {/* 
        High-fidelity mathematical reconstruction of the BrandierStudioTV 
        interlocking geometric spiral hexagonal aperture logo.
      */}
      
      {/* 1. Left Outer Asymmetric Bracket */}
      <path d="M161.7,77.3 L92.4,136.5 L92.4,321.4 L250.0,412.3 L272.5,398.9 L150.3,328.4 L150.3,170.0 L161.7,77.3 Z" />

      {/* 2. Right Outer Asymmetric Bracket */}
      <path d="M338.3,422.7 L407.6,363.5 L407.6,178.6 L250.0,87.7 L227.5,101.1 L349.7,171.6 L349.7,330.0 L338.3,422.7 Z" />

      {/* 3. Top Right Inward Aperture Segment */}
      <path d="M221.7,40.1 L250.0,91.5 L391.2,173.0 L391.2,143.0 L260.6,67.6 L221.7,40.1 Z" />

      {/* 4. Bottom Left Inward Aperture Segment */}
      <path d="M278.3,459.9 L250.0,408.5 L108.8,327.0 L108.8,357.0 L239.4,432.4 L278.3,459.9 Z" />

      {/* 5. Central Spiral Interlocking Blades (Aperture System) */}
      {/* Frame 1 */}
      <path d="M186.5,101.9 L206.5,236.0 L309.8,210.0 L186.5,101.9 Z" />
      {/* Frame 2 */}
      <path d="M313.5,398.1 L293.5,264.0 L190.2,290.0 L313.5,398.1 Z" />
      {/* Frame 3 (Refining inner interlocking vectors) */}
      <path d="M250.0,163.4 L335.7,171.3 L293.5,263.8 L250.0,163.4 Z" />
      <path d="M250.0,336.6 L164.3,328.7 L206.5,236.2 L250.0,336.6 Z" />
    </svg>
  );
}
