'use client';

import { useState } from 'react';
import { Star, HelpCircle } from 'lucide-react';

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
  1: 'Información básica del negocio verificada por nuestro equipo.',
  2: 'Cédula del propietario y documentos verificados. Mayor confianza.',
  3: 'Tienda física verificada con visita, RUC y cuenta bancaria. Máxima confianza.',
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
          {level}/3 - {VERIFICATION_LABELS[level as keyof typeof VERIFICATION_LABELS]}
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

export function VerificationStarsWithTooltip({ level, size = 'md' }: { level: number; size?: 'sm' | 'md' | 'lg' }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="inline-flex items-center gap-2 relative">
      <VerificationStars level={level} size={size} />
      <span className="text-sm font-medium text-gray-700">{level}/3</span>
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="text-blue-600 hover:text-blue-700 transition"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      {showTooltip && (
        <div className="absolute left-0 top-full mt-2 z-50">
          <VerificationTooltip level={level} />
        </div>
      )}
    </div>
  );
}
