import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'green' | 'blue' | 'yellow' | 'red' | 'gray';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'gray', className = '' }) => {
  const colors = {
    green: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700',
    yellow: 'bg-amber-100 text-amber-800',
    red: 'bg-red-100 text-red-700',
    gray: 'bg-slate-100 text-slate-700'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]} ${className}`}>
      {children}
    </span>
  );
};
