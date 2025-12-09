'use client';

import { useState, useEffect } from 'react';
import { Star, MessageCircle } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { AuthModal } from './AuthModal';
import type { Review } from '@/types/database';

interface ReviewsListProps {
  businessId: string;
}

export function ReviewsList({ businessId }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
    checkUser();
  }, [businessId]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
  };

  const loadReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, user_profiles(display_name)')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data);
    }
    setLoading(false);
  };

  const handleWriteReview = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      setIsWritingReview(true);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);

    const { error } = await supabase.from('reviews').insert({
      business_id: businessId,
      user_id: user.id,
      rating,
      comment,
    });

    if (!error) {
      setComment('');
      setRating(5);
      setIsWritingReview(false);
      loadReviews();
    }

    setSubmitting(false);
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
    return <div className="text-center py-8 text-gray-600">Cargando reseñas...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-[#003893]">Reseñas y Comentarios</h3>
          <button
            onClick={handleWriteReview}
            className="bg-[#003893] text-white px-4 py-2 rounded-lg hover:bg-[#0057B7] transition"
          >
            Escribir Reseña
          </button>
        </div>

        {/* Write review form */}
        {isWritingReview && (
          <form onSubmit={handleSubmitReview} className="bg-gray-50 p-6 rounded-lg">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Calificación
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? 'fill-[#F4B942] text-[#F4B942]'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Tu comentario
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
                placeholder="Comparte tu experiencia con este negocio..."
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#003893] text-white px-6 py-2 rounded-lg hover:bg-[#0057B7] transition disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : 'Publicar Reseña'}
              </button>
              <button
                type="button"
                onClick={() => setIsWritingReview(false)}
                className="text-gray-600 hover:text-gray-800 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Reviews list */}
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Aún no hay reseñas. ¡Sé el primero en dejar una!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {review.user_profiles?.display_name || 'Usuario'}
                    </p>
                    <div className="flex items-center mt-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.created_at!).toLocaleDateString('es-NI')}
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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
