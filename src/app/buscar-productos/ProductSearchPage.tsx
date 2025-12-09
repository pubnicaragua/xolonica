'use client';

import { useState, useEffect } from 'react';
import { Search, Package, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { searchProducts, getRecentProducts, type ProductSearchResult } from '@/services/products';
import { VerificationStars } from '@/components/VerificationStars';

export default function ProductSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [recentProducts, setRecentProducts] = useState<ProductSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    loadRecentProducts();
  }, []);

  const loadRecentProducts = async () => {
    const products = await getRecentProducts(12);
    setRecentProducts(products);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const products = await searchProducts(query);
      setResults(products);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const displayProducts = hasSearched ? results : recentProducts;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Busca productos y servicios
            </h1>
            <p className="text-lg text-blue-100 mb-8">
              Encuentra lo que necesitas en todos los negocios verificados de Nicaragua
            </p>

            {/* Search form */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative group">
                <div
                  className="pointer-events-none absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-blue-400 via-sky-400 to-purple-500 opacity-0 blur group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300"
                  aria-hidden="true"
                />
                <div className="relative bg-white/90 rounded-2xl shadow-2xl">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ej: licuadora, repuestos de carro, servicios de plomería..."
                    className="w-full pl-14 pr-4 py-4 rounded-2xl text-gray-900 text-lg focus:outline-none bg-transparent"
                  />
                  <button
                    type="submit"
                    disabled={isSearching || !query.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 font-semibold flex items-center gap-2"
                  >
                    {isSearching ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Buscar</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {hasSearched ? `Resultados para "${query}"` : 'Productos recientes'}
          </h2>
          <p className="text-gray-600">
            {hasSearched
              ? `${results.length} producto${results.length !== 1 ? 's' : ''} encontrado${results.length !== 1 ? 's' : ''}`
              : 'Explora los últimos productos agregados a la plataforma'}
          </p>
        </div>

        {isSearching ? (
          <div className="text-center py-16">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Buscando productos...</p>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {hasSearched ? 'No se encontraron productos' : 'No hay productos aún'}
            </h3>
            <p className="text-gray-600 mb-6">
              {hasSearched
                ? 'Intenta con otros términos de búsqueda'
                : 'Los negocios comenzarán a agregar productos pronto'}
            </p>
            {hasSearched && (
              <button
                onClick={() => {
                  setQuery('');
                  setHasSearched(false);
                }}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
              >
                Ver productos recientes
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayProducts.map((product) => (
              <Link
                key={product.id}
                href={`/negocios/${product.business_id}`}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden group"
              >
                {/* Product image */}
                {product.image_url ? (
                  <div className="relative h-48 bg-gray-100">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <Package className="w-16 h-16 text-blue-400" />
                  </div>
                )}

                <div className="p-4">
                  {/* Product name */}
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <p className="text-xl font-bold text-blue-600 mb-3">
                    C${product.price.toLocaleString('es-NI')}
                  </p>

                  {/* Business info */}
                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      {product.business_logo ? (
                        <div className="w-6 h-6 rounded-full overflow-hidden relative">
                          <Image
                            src={product.business_logo}
                            alt={product.business_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {product.business_name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {product.business_name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{product.business_city}</span>
                      <VerificationStars level={product.verification_level} size="sm" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
