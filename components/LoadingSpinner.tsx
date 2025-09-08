import React from 'react';

interface LoadingSpinnerProps {
  message: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-10">
      <div className="w-12 h-12 border-4 border-foundry-slate border-t-foundry-accent border-solid rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-foundry-light-slate">{message || 'AIP Agent is thinking...'}</p>
    </div>
  );
};

export default LoadingSpinner;
