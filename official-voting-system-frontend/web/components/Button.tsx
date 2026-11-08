import * as React from 'react';
import { useState, useEffect } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabledTooltip?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  disabledTooltip,
  ...props
}) => {
  // Mobile-first base: consistent touch target, rounded token, focus-visible ring
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-btn min-h-touch focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles: Record<string, string> = {
    primary: 'bg-dmi-blue-700 text-white hover:bg-dmi-blue-800 focus-visible:ring-dmi-blue-500',
    secondary: 'bg-gray-100 text-dmi-blue-800 hover:bg-gray-200 focus-visible:ring-dmi-blue-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
  };

  const sizeStyles: Record<string, string> = {
    sm: 'text-sm py-2 px-3',
    md: 'text-base py-2.5 px-5',
    lg: 'text-lg py-3 px-6',
  };

  const combined = `${baseStyles} ${variantStyles[variant] ?? variantStyles.primary} ${sizeStyles[size] ?? sizeStyles.md} ${className}`;

  const buttonElement = (
    <button
      type={props.type ?? 'button'}
      className={combined}
      aria-disabled={disabled ? 'true' : undefined}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );

  if (disabled && disabledTooltip) {
    const tooltipId = `btn-tooltip-${Math.random().toString(36).slice(2, 9)}`;
    return (
      <div className="relative inline-block">
        <span className="cursor-not-allowed inline-block" aria-describedby={tooltipId}>
          {buttonElement}
        </span>
        <div
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none absolute hidden md:block bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap z-10"
        >
          {disabledTooltip}
        </div>

        {/* Small-screen helper text (visible on touch devices) */}
        <div className="md:hidden mt-1 text-xs text-gray-500 text-center">{disabledTooltip}</div>
      </div>
    );
  }

  return buttonElement;
};

export default Button;
