import Image from 'next/image';
import type { Product } from '@/types/database';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Product image */}
      {product.image_url ? (
        <div className="w-full h-48 rounded-lg mb-4 relative overflow-hidden">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
          <span className="text-gray-400 text-4xl">📦</span>
        </div>
      )}

      {/* Product name */}
      <h4 className="text-gray-900 mb-2">{product.name}</h4>

      {/* Description */}
      {product.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>
      )}

      {/* Price */}
      {product.price && (
        <p className="text-lg text-[#003893] mb-2">
          C${product.price.toFixed(2)}
        </p>
      )}

      {/* Notes */}
      {product.notes && (
        <p className="text-xs text-gray-500 mb-3">{product.notes}</p>
      )}

      {/* Availability */}
      <div className="flex items-center justify-between">
        <span
          className={`text-xs px-2 py-1 rounded ${
            product.available
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {product.available ? 'Disponible' : 'No disponible'}
        </span>
      </div>
    </div>
  );
}
