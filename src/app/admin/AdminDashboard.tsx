'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import {
  Store,
  Package,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  Search,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { VerificationStars } from '@/components/VerificationStars';

interface Business {
  id: string;
  name: string;
  category: string;
  city: string;
  status: string;
  verification_level: number;
  product_count: number;
  created_at: string;
}

interface Stats {
  verified_businesses: number;
  pending_businesses: number;
  total_products: number;
  total_reviews: number;
  active_users: number;
}

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, filter]);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    const { data } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .single();

    setIsAdmin(!!data);
    setIsLoading(false);
  };

  const loadData = async () => {
    // Cargar estadísticas
    const { data: statsData } = await supabase
      .from('admin_stats')
      .select('*')
      .single();

    if (statsData) {
      setStats(statsData);
    }

    // Cargar negocios
    let query = supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data: businessesData } = await query;
    setBusinesses(businessesData || []);
  };

  const handleApprove = async (businessId: string) => {
    try {
      // Actualizar estado
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ status: 'verified' })
        .eq('id', businessId);

      if (updateError) throw updateError;

      // Crear notificación para el dueño
      const business = businesses.find(b => b.id === businessId);
      if (business) {
        await supabase
          .from('notifications')
          .insert({
            user_id: business.id,
            title: '¡Tu negocio ha sido verificado!',
            message: `Tu negocio "${business.name}" ha sido aprobado y ahora aparece en Xolonica.store`,
            type: 'approval',
            read: false,
          });
      }

      // Recargar datos
      await loadData();
      alert('Negocio aprobado exitosamente');
    } catch (error) {
      console.error(error);
      alert('Error al aprobar el negocio');
    }
  };

  const handleReject = async (businessId: string) => {
    const reason = prompt('Razón del rechazo (opcional):');
    
    try {
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ status: 'rejected' })
        .eq('id', businessId);

      if (updateError) throw updateError;

      // Crear notificación para el dueño
      const business = businesses.find(b => b.id === businessId);
      if (business) {
        await supabase
          .from('notifications')
          .insert({
            user_id: business.id,
            title: 'Tu negocio ha sido rechazado',
            message: `Tu negocio "${business.name}" ha sido rechazado. Razón: ${reason || 'No especificada'}`,
            type: 'rejection',
            read: false,
          });
      }

      await loadData();
      alert('Negocio rechazado');
    } catch (error) {
      console.error(error);
      alert('Error al rechazar el negocio');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">
            No tienes permisos para acceder al panel de administración.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const filteredBusinesses = businesses.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
          <p className="text-blue-100">Gestiona negocios, productos y usuarios de Xolonica</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <Store className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.verified_businesses}</p>
              <p className="text-sm text-gray-600">Negocios verificados</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending_businesses}</p>
              <p className="text-sm text-gray-600">Pendientes</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.total_products}</p>
              <p className="text-sm text-gray-600">Productos totales</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.total_reviews}</p>
              <p className="text-sm text-gray-600">Reseñas</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.active_users}</p>
              <p className="text-sm text-gray-600">Usuarios activos</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pendientes
              </button>
              <button
                onClick={() => setFilter('verified')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'verified'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Verificados
              </button>
            </div>

            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar negocio..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
              />
            </div>
          </div>
        </div>

        {/* Businesses table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Negocio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ciudad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Verificación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Productos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBusinesses.map((business) => (
                  <tr key={business.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/negocios/${business.id}`}
                        className="font-medium text-blue-600 hover:text-blue-700"
                      >
                        {business.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{business.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{business.city}</td>
                    <td className="px-6 py-4">
                      <VerificationStars level={business.verification_level} size="sm" />
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm font-medium ${
                          business.product_count >= 10 ? 'text-red-600' : 'text-gray-900'
                        }`}
                      >
                        {business.product_count}/10
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {business.status === 'verified' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verificado
                        </span>
                      ) : business.status === 'pending' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Pendiente
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          Rechazado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {business.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(business.id)}
                            className="text-green-600 hover:text-green-700 font-medium text-sm"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleReject(business.id)}
                            className="text-red-600 hover:text-red-700 font-medium text-sm"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
