import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}: ButtonProps) {
  
  const base = "inline-flex items-center justify-center font-bold tracking-wide uppercase transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-lg";
  
  const variants = {
    primary: "bg-[#C8FF00] text-black hover:bg-[#b8ef00] shadow-[0_0_20px_rgba(200,255,0,0.4)] hover:shadow-[0_0_30px_rgba(200,255,0,0.6)]",
    secondary: "bg-[#1a1a1a] text-white border border-white/10 hover:border-white/20 hover:bg-white/5",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-[0_0_15px_rgba(255,68,68,0.3)] hover:shadow-[0_0_25px_rgba(255,68,68,0.5)]",
    ghost: "bg-transparent text-gray-300 hover:text-white hover:bg-white/5",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button 
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
      ) : children}
    </button>
  );
}
