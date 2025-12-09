'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Star, MessageCircle } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import type { Review } from '@/types/database';

export default function MyAccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      router.push('/');
      return;
    }

    setUser(session.user);

    // Load profile
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    setProfile(profileData);

    // Load reviews
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*, businesses(name)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (reviewsData) {
      setReviews(reviewsData as any);
    }

    setLoading(false);
  };

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < count ? 'fill-[#F4B942] text-[#F4B942]' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#003893] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#003893] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-white mb-2">Mi Cuenta</h1>
          <p className="text-blue-100">Gestiona tu perfil y actividad</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#003893] to-[#0057B7] rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-white" />
              </div>

              <h3 className="text-center text-gray-900 mb-1">
                {profile?.display_name || 'Usuario'}
              </h3>

              <div className="mt-6 space-y-3">
                {user?.email && (
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                )}

                {profile?.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="text-gray-900">{profile.phone}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600">Miembro desde</p>
                  <p className="text-gray-900">
                    {new Date(user?.created_at).toLocaleDateString('es-NI', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="md:col-span-2 space-y-6">
            {/* Reviews Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-6">
                <Star className="w-6 h-6 text-[#F4B942] mr-2" />
                <h3 className="text-[#003893]">Mis Reseñas</h3>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Aún no has dejado ninguna reseña
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <div
                      key={review.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {review.businesses?.name}
                          </p>
                          <div className="flex items-center mt-1">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('es-NI')}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <div className="w-12 h-12 bg-[#F4B942] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-[#F4B942]" />
                </div>
                <p className="text-3xl font-bold text-[#003893] mb-1">
                  {reviews.length}
                </p>
                <p className="text-gray-600">Reseñas</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <div className="w-12 h-12 bg-[#003893] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-[#003893]" />
                </div>
                <p className="text-3xl font-bold text-[#003893] mb-1">
                  0
                </p>
                <p className="text-gray-600">Conversaciones</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
