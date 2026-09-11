import React, { useState } from 'react';
import { getTacticalAvatarUrl } from '../../constants/avatars';

interface AvatarProps {
  url?: string | null;
  username: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBorder?: boolean;
}

export function Avatar({
  url,
  username,
  size = 'md',
  className = '',
  showBorder = true,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const ringSizes = {
    sm: 'border-[1.5px]',
    md: 'border-2',
    lg: 'border-2',
    xl: 'border-[3px]',
  };

  // Determine avatar source: provided URL or deterministic tactical manager avatar
  const avatarSrc = !imageError && url && url.trim().length > 0
    ? url
    : getTacticalAvatarUrl(username);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-xl overflow-hidden bg-[#0F1520] transition-all duration-200 ${sizes[size]} ${
        showBorder ? `${ringSizes[size]} border-[#2A364F] shadow-sm hover:border-[#FF6B2B]/60` : ''
      } ${className}`}
      title={username}
    >
      <img
        src={avatarSrc}
        alt={username}
        onError={() => setImageError(true)}
        className="w-full h-full object-cover rounded-[10px] p-0.5 bg-[#0F1520]"
        loading="lazy"
      />
      {/* Subtle tactical corner accent */}
      <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#FF6B2B]/30 rounded-bl-sm pointer-events-none" />
    </div>
  );
}
