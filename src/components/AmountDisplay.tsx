import React from 'react';

interface AmountDisplayProps {
  amount: number;
  className?: string;
  currencyClassName?: string;
  size?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

export const AmountDisplay: React.FC<AmountDisplayProps> = ({
  amount,
  className = '',
  currencyClassName = '',
  size = 'base',
}) => {
  const formattedDigits = Math.round(amount).toLocaleString('fr-FR');

  const sizeClasses = {
    sm: 'text-xs sm:text-sm',
    base: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
    xl: 'text-lg sm:text-xl',
    '2xl': 'text-xl sm:text-2xl',
    '3xl': 'text-2xl sm:text-3xl',
    '4xl': 'text-3xl sm:text-4xl',
    '5xl': 'text-3xl sm:text-4xl lg:text-5xl',
  };

  return (
    <span className={`font-mono font-black tabular-nums tracking-tight inline-flex items-baseline gap-1 ${sizeClasses[size]} ${className}`}>
      <span>{formattedDigits}</span>
      <span className={`text-[0.7em] font-sans font-extrabold uppercase opacity-80 ${currencyClassName}`}>
        FCFA
      </span>
    </span>
  );
};
