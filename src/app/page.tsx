import Link from 'next/link';
import { Search, CheckCircle, Users, Star, ArrowRight } from 'lucide-react';
import { BusinessCard } from '@/components/BusinessCard';
import { supabase } from '@/utils/supabase/client';
import { CATEGORIES, NICARAGUA_CITIES } from '@/types/database';

async function getFeaturedBusinesses() {
  const { data } = await supabase
    .from('businesses')
    .select('*')
    .eq('status', 'verified')
    .limit(6);

  return data || [];
}

export const revalidate = 3600; // Revalidate every hour (ISR)

export default async function HomePage() {
  const featuredBusinesses = await getFeaturedBusinesses();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMy4zMTQgMi42ODYtNiA2LTZzNiAyLjY4NiA2IDYtMi42ODYgNi02IDYtNi0yLjY4Ni02LTZ6TTAgMTZjMC0zLjMxNCAyLjY4Ni02IDYtNnM2IDIuNjg2IDYgNi0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNnpNMzYgNTJjMC0zLjMxNCAyLjY4Ni02IDYtNnM2IDIuNjg2IDYgNi0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNnpNMCA1MmMwLTMuMzE0IDIuNjg2LTYgNi02czYgMi42ODYgNiA2LTIuNjg2IDYtNiA2LTYtMi42ODYtNi02eiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <CheckCircle className="w-4 h-4 text-green-300" />
              <span className="text-sm font-medium">Plataforma verificada • Nicaragua</span>
            </div>
            
            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Conecta con negocios
              <span className="block bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                verificados en Nicaragua
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Descubre negocios locales evaluados por nuestro equipo. Información clara,
              contacto directo y reseñas reales.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/negocios"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl hover:shadow-2xl hover:scale-105 transition-all font-semibold text-lg"
              >
                <Search className="w-5 h-5" />
                Explorar negocios
              </Link>
              <Link
                href="/registrar-negocio"
                className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 px-8 py-4 rounded-xl hover:shadow-2xl hover:scale-105 transition-all font-semibold text-lg"
              >
                <Star className="w-5 h-5" />
                Registra tu negocio
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-blue-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span>Verificación manual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <span>Chat en tiempo real</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span>Sin comisiones</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 md:h-16 text-gray-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C300,80 600,80 900,40 L1200,0 L1200,120 L0,120 Z" fill="currentColor"></path>
          </svg>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Encuentra tu negocio ideal
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Filtra por categoría o ciudad para descubrir negocios verificados cerca de ti
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <form
              method="GET"
              action="/negocios"
              className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100"
            >
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 mb-3 text-sm font-semibold uppercase tracking-wide">
                    Categoría
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      name="category"
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 font-medium"
                    >
                      <option value="">Todas las categorías</option>
                      {CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-3 text-sm font-semibold uppercase tracking-wide">
                    Ciudad
                  </label>
                  <select
                    name="city"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 font-medium"
                  >
                    <option value="">Todas las ciudades</option>
                    {NICARAGUA_CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all font-semibold"
                >
                  Ver negocios filtrados
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Businesses */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-semibold mb-4">
              ✓ Verificados por Xolonica
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Negocios destacados
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Estos negocios han sido verificados manualmente por nuestro equipo y cumplen
              con nuestros estándares de calidad
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {featuredBusinesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/negocios"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 hover:shadow-xl transition-all font-semibold text-lg"
            >
              Ver todos los negocios
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Cómo funciona Xolonica?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Un proceso simple y transparente para conectar negocios con clientes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl transition-all border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-3">
                PASO 1
              </div>
              <h3 className="text-gray-900 mb-3 font-bold text-xl">El negocio se registra</h3>
              <p className="text-gray-600 leading-relaxed">
                Los negocios completan un formulario con su información,
                productos y servicios
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl transition-all border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold mb-3">
                PASO 2
              </div>
              <h3 className="text-gray-900 mb-3 font-bold text-xl">Xolonica verifica</h3>
              <p className="text-gray-600 leading-relaxed">
                Nuestro equipo revisa y verifica la información del negocio en
                48 horas
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl transition-all border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Star className="w-10 h-10 text-white" />
              </div>
              <div className="inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold mb-3">
                PASO 3
              </div>
              <h3 className="text-gray-900 mb-3 font-bold text-xl">Clientes confían</h3>
              <p className="text-gray-600 leading-relaxed">
                Los usuarios pueden ver el negocio, contactarlo y dejar reseñas
                verificadas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMy4zMTQgMi42ODYtNiA2LTZzNiAyLjY4NiA2IDYtMi42ODYgNi02IDYtNi0yLjY4Ni02LTZ6TTAgMTZjMC0zLjMxNCAyLjY4Ni02IDYtNnM2IDIuNjg2IDYgNi0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNnpNMzYgNTJjMC0zLjMxNCAyLjY4Ni02IDYtNnM2IDIuNjg2IDYgNi0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNnpNMCA1MmMwLTMuMzE0IDIuNjg2LTYgNi02czYgMi42ODYgNiA2LTIuNjg2IDYtNiA2LTYtMi42ODYtNi02eiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Tienes un negocio en Nicaragua?
          </h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed max-w-2xl mx-auto">
            Únete a Xolonica.store y llega a más clientes con un perfil verificado.
            <span className="block mt-2 text-yellow-300 font-semibold">Solo C$199 al mes</span>
          </p>
          <Link
            href="/registrar-negocio"
            className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 px-10 py-5 rounded-xl hover:bg-yellow-300 hover:shadow-2xl hover:scale-105 transition-all font-bold text-lg"
          >
            <Star className="w-6 h-6" />
            Registra tu negocio ahora
          </Link>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>Hasta 10 productos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>Perfil verificado</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>Chat con clientes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border-2 border-blue-100 p-8 md:p-10 rounded-3xl shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Información importante</h3>
                <p className="text-gray-700 leading-relaxed">
                  Xolonica no procesa pagos ni realiza transacciones. Somos una plataforma
                  que conecta clientes con negocios verificados en Nicaragua. Todos
                  los pagos y transacciones se realizan directamente entre el
                  cliente y el negocio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
