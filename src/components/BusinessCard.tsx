import Link from 'next/link';
import Image from 'next/image';
import { MapPin, CheckCircle, Clock } from 'lucide-react';
import { VerificationStars } from './VerificationStars';
import type { Business } from '@/types/database';

interface BusinessCardProps {
  business: Business;
}

export function BusinessCard({ business }: BusinessCardProps) {
  return (
    <Link href={`/negocios/${business.id}`}>
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 h-full border border-gray-100 hover:border-gray-200 group">
        {/* Logo */}
        {business.logo_url ? (
          <div className="w-20 h-20 rounded-xl overflow-hidden mb-4 relative group-hover:shadow-md transition">
            <Image
              src={business.logo_url}
              alt={business.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-20 bg-gradient-to-br from-[#003893] to-[#0057B7] rounded-xl flex items-center justify-center mb-4 group-hover:shadow-md transition">
            <span className="text-white text-2xl font-bold">
              {business.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Business name */}
        <h3 className="text-gray-900 mb-2 font-bold group-hover:text-[#003893] transition">
          {business.name}
        </h3>

        {/* Category */}
        <p className="text-sm text-gray-500 mb-3">{business.category}</p>

        {/* Location */}
        <div className="flex items-start text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-[#003893]" />
          <span className="text-sm">
            {business.city}
            {business.neighborhood && `, ${business.neighborhood}`}
          </span>
        </div>

        {/* Tagline / short description */}
        {business.tagline && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {business.tagline}
          </p>
        )}

        {/* Verification and Status */}
        <div className="flex items-center justify-between mt-4">
          <VerificationStars level={business.verification_level || 1} size="sm" />
          {business.status === 'verified' ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#2D9B4F] text-white font-semibold">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verificado
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#F4B942] text-gray-900 font-semibold">
              <Clock className="w-3 h-3 mr-1" />
              En revisión
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
