'use client';

import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { BusinessCard } from '@/components/BusinessCard';
import { supabase } from '@/utils/supabase/client';
import { CATEGORIES, NICARAGUA_CITIES } from '@/types/database';
import type { Business } from '@/types/database';

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('verified');

  useEffect(() => {
    loadBusinesses();
  }, [categoryFilter, cityFilter, statusFilter]);

  const loadBusinesses = async () => {
    setLoading(true);

    let query = supabase.from('businesses').select('*');

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    if (categoryFilter) {
      query = query.eq('category', categoryFilter);
    }

    if (cityFilter) {
      query = query.eq('city', cityFilter);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (!error && data) {
      setBusinesses(data);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#003893] via-[#0057B7] to-[#003893] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <h1 className="text-white mb-3 text-3xl md:text-4xl font-bold">
            Directorio de Negocios
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl">
            Encuentra negocios verificados en toda Nicaragua por categoría, ciudad y estado.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="relative mb-10 group">
          <div
            className="pointer-events-none absolute -inset-[2px] rounded-3xl bg-gradient-to-r from-blue-400 via-sky-400 to-purple-500 opacity-0 blur group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300"
            aria-hidden="true"
          />
          <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 border border-gray-100 relative">
          <div className="flex items-center mb-6">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center mr-3">
              <Filter className="w-5 h-5 text-[#003893]" />
            </div>
        </div>
            <div>
              <h3 className="text-gray-900 font-semibold">Filtrar negocios</h3>
              <p className="text-sm text-gray-500">Ajusta los filtros para encontrar el negocio ideal.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-gray-700 mb-2 font-semibold">
                Categoría
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003893] focus:border-transparent bg-white"
              >
                <option value="">Todas las categorías</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-semibold">
                Ciudad
              </label>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
              >
                <option value="">Todas las ciudades</option>
                {NICARAGUA_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-semibold">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
              >
                <option value="">Todos</option>
                <option value="verified">Verificado</option>
                <option value="pending">En revisión</option>
              </select>
            </div>
          </div>

              {(categoryFilter || cityFilter || statusFilter !== 'verified') && (
                <button
                  onClick={() => {
                    setCategoryFilter('');
                    setCityFilter('');
                    setStatusFilter('verified');
                  }}
                  className="mt-4 inline-flex items-center text-[#003893] hover:text-[#0057B7] text-sm font-medium"
                >
                  Limpiar filtros
                </button>
              )}
          </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-[#003893] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Cargando negocios...</p>
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2 text-lg font-semibold">No se encontraron negocios</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Intenta ajustar los filtros para ver más resultados o cambia de ciudad o categoría.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
              <p className="text-gray-600 text-sm">
                Mostrando {businesses.length} negocio{businesses.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
