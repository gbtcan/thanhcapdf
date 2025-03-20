import React from 'react';

interface LogoIconProps {
  className?: string;
}

const LogoIcon: React.FC<LogoIconProps> = ({ className = 'h-6 w-6' }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M8 3v1m8-1v1m-4-1v1m0 0v4m0 4v1m0 0v4" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M9.5 10.5a.5.5 0 11-1 0 .5.5 0 011 0zm0 3a.5.5 0 11-1 0 .5.5 0 011 0zm3 0a.5.5 0 11-1 0 .5.5 0 011 0zm3 0a.5.5 0 11-1 0 .5.5 0 011 0zm-6 3a.5.5 0 11-1 0 .5.5 0 011 0zm3 0a.5.5 0 11-1 0 .5.5 0 011 0zm3 0a.5.5 0 11-1 0 .5.5 0 011 0zm0-6a.5.5 0 11-1 0 .5.5 0 011 0z" 
        fill="currentColor"
      />
    </svg>
  );
};

export default LogoIcon;
