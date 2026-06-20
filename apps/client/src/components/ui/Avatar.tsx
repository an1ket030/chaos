import React from 'react';

interface AvatarProps {
  url?: string | null;
  username: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ url, username, size = 'md', className = '' }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  };

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  const getColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 40%)`;
  };

  if (url) {
    return (
      <img 
        src={url} 
        alt={username} 
        className={`${sizes[size]} rounded-full object-cover border-2 border-dark-elevated ${className}`} 
      />
    );
  }

  return (
    <div 
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white border-2 border-dark-elevated shadow-inner ${className}`}
      style={{ backgroundColor: getColor(username) }}
      title={username}
    >
      {getInitials(username)}
    </div>
  );
}
