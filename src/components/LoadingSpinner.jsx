import React from 'react';

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        {/* Outer spinning ring */}
        <div className={`${sizeClasses[size]} rounded-full border-4 border-t-blue-600 border-r-blue-400 border-b-blue-300 border-l-blue-500 animate-spin`}></div>
        
        {/* Inner pulsing circle */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-5 w-5' : size === 'lg' ? 'h-8 w-8' : 'h-12 w-12'} bg-blue-500 rounded-full animate-pulse opacity-75`}></div>
      </div>
      
      {text && (
        <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
