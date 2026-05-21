import React from 'react';

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      <span className="text-3xl font-headline font-bold text-accent">GiveWay</span>
    </div>
  );
};

export default Logo;
