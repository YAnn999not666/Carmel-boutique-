import React from 'react';
import { PaymentType } from '../types';

interface PaymentBadgeProps {
  type: PaymentType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  useShortLabel?: boolean;
  className?: string;
}

export const PAYMENT_CONFIG: Record<
  PaymentType,
  {
    name: string;
    shortLabel: string;
    logo: string;
    bgClass: string;
    borderClass: string;
    textClass: string;
    brandColor: string;
  }
> = {
  Wave: {
    name: 'Wave',
    shortLabel: 'W',
    logo: '/W.jpg',
    bgClass: 'bg-sky-50',
    borderClass: 'border-sky-200 hover:border-sky-300',
    textClass: 'text-sky-950',
    brandColor: '#00a3e0',
  },
  'Wave Business': {
    name: 'Wave Bus.',
    shortLabel: 'WB',
    logo: '/Wb.png',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200 hover:border-blue-300',
    textClass: 'text-blue-950',
    brandColor: '#1d4ed8',
  },
  OM: {
    name: 'OM',
    shortLabel: 'OM',
    logo: '/Om.png',
    bgClass: 'bg-orange-50',
    borderClass: 'border-orange-200 hover:border-orange-300',
    textClass: 'text-orange-950',
    brandColor: '#ff7900',
  },
  Cash: {
    name: 'Espèces',
    shortLabel: 'Cash',
    logo: '/Cash.jpg',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200 hover:border-emerald-300',
    textClass: 'text-emerald-950',
    brandColor: '#059669',
  },
};

export const PaymentBadge: React.FC<PaymentBadgeProps> = ({
  type,
  size = 'md',
  showLabel = true,
  useShortLabel = false,
  className = '',
}) => {
  const config = PAYMENT_CONFIG[type] || PAYMENT_CONFIG['Cash'];

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-[11px] gap-1.5 rounded-lg',
      logo: 'w-4 h-4 rounded-sm',
    },
    md: {
      container: 'px-2.5 py-1.5 text-xs gap-2 rounded-xl',
      logo: 'w-5 h-5 rounded-md',
    },
    lg: {
      container: 'px-3.5 py-2 text-sm gap-2.5 rounded-xl',
      logo: 'w-6 h-6 rounded-md',
    },
  };

  const selectedSize = sizeClasses[size];
  const displayedLabel = useShortLabel ? config.shortLabel : config.name;

  return (
    <span
      className={`inline-flex items-center font-black uppercase tracking-wider border shadow-2xs transition-all whitespace-nowrap ${config.bgClass} ${config.borderClass} ${config.textClass} ${selectedSize.container} ${className}`}
    >
      <img
        src={config.logo}
        alt={config.name}
        referrerPolicy="no-referrer"
        className={`${selectedSize.logo} object-contain shrink-0 bg-white p-0.5 border border-black/10 shadow-2xs`}
      />
      {showLabel && <span>{displayedLabel}</span>}
    </span>
  );
};
