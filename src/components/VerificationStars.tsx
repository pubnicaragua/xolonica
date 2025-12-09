'use client';

import { Star } from 'lucide-react';

interface VerificationStarsProps {
  level: number; // 1, 2, o 3
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const VERIFICATION_LABELS = {
  1: 'Verificación básica',
  2: 'Cédula verificada',
  3: 'Tienda física verificada',
};

const VERIFICATION_DESCRIPTIONS = {
  1: 'Nombre del negocio verificado',
  2: 'Cédula y foto verificadas',
  3: 'Tienda física, RUC y cuenta bancaria verificados',
};

export function VerificationStars({ level, showLabel = false, size = 'md' }: VerificationStarsProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="inline-flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= level
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
      {showLabel && (
        <span className={`${textSizeClasses[size]} font-medium text-gray-700`}>
          {VERIFICATION_LABELS[level as keyof typeof VERIFICATION_LABELS]}
        </span>
      )}
    </div>
  );
}

export function VerificationBadge({ level }: { level: number }) {
  const colors = {
    1: 'bg-blue-100 text-blue-700 border-blue-200',
    2: 'bg-green-100 text-green-700 border-green-200',
    3: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${
        colors[level as keyof typeof colors]
      }`}
    >
      <VerificationStars level={level} size="sm" />
      <span className="text-xs font-semibold">
        {VERIFICATION_LABELS[level as keyof typeof VERIFICATION_LABELS]}
      </span>
    </div>
  );
}

export function VerificationTooltip({ level }: { level: number }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <VerificationStars level={level} size="md" />
        <span className="font-semibold text-gray-900">
          Nivel {level} de 3
        </span>
      </div>
      <p className="text-sm text-gray-600">
        {VERIFICATION_DESCRIPTIONS[level as keyof typeof VERIFICATION_DESCRIPTIONS]}
      </p>
      {level < 3 && (
        <p className="text-xs text-gray-500 mt-2">
          Este negocio puede aumentar su nivel de verificación completando más pasos.
        </p>
      )}
    </div>
  );
}
