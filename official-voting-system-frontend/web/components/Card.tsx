import * as React from 'react';
import { useState, useEffect } from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white rounded-card shadow-md overflow-hidden ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b bg-white">
          <h3 className="text-lg font-semibold text-dmi-blue-900">{title}</h3>
        </div>
      )}
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
