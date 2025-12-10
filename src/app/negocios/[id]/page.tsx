import { notFound } from 'next/navigation';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  Facebook,
  Instagram,
  Globe,
} from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { ProductCard } from '@/components/ProductCard';
import { ReviewsList } from '@/components/ReviewsList';
import { BusinessChatRealtime } from '@/components/BusinessChatRealtime';
import { BusinessCard } from '@/components/BusinessCard';
import { VerificationStars } from '@/components/VerificationStars';
import type { Business, Product } from '@/types/database';

async function getBusinessData(id: string) {
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .single();

  if (!business) {
    return null;
  }

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('business_id', id)
    .order('created_at', { ascending: false });

  const { data: similarBusinesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('category', business.category)
    .eq('status', 'verified')
    .neq('id', id)
    .limit(3);

  return {
    business,
    products: products || [],
    similarBusinesses: similarBusinesses || [],
  };
}

export const revalidate = 1800; // Revalidate every 30 minutes (ISR)

export default async function BusinessProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getBusinessData(id);

  if (!data) {
    notFound();
  }

  const { business, products, similarBusinesses } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-start md:space-x-8">
            {/* Logo */}
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-[#003893] to-[#0057B7] rounded-2xl flex items-center justify-center mb-6 md:mb-0 flex-shrink-0 shadow-sm">
              <span className="text-white text-4xl md:text-5xl font-bold">
                {business.name.charAt(0)}
              </span>
            </div>

            {/* Business Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 gap-4">
                <div>
                  <h1 className="text-gray-900 mb-2 text-2xl md:text-3xl font-bold">
                    {business.name}
                  </h1>
                  <p className="text-sm md:text-base text-gray-600">
                    {business.category}
                  </p>
                </div>
                <div className="mt-1 md:mt-0 flex flex-col gap-2">
                  <VerificationStars level={business.verification_level || 1} showLabel size="lg" />
                  {business.status === 'verified' ? (
                    <span className="inline-flex items-center px-4 py-2 rounded-full bg-[#2D9B4F] text-white text-sm font-semibold">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Verificado por Xolonica
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-4 py-2 rounded-full bg-[#F4B942] text-gray-900 text-sm font-semibold">
                      <Clock className="w-5 h-5 mr-2" />
                      En proceso de verificación
                    </span>
                  )}
                </div>
              </div>

              {business.tagline && (
                <p className="text-base md:text-lg text-gray-700 mb-6">
                  {business.tagline}
                </p>
              )}

              {/* Contact Info */}
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                {business.address && (
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-[#003893] mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                        Dirección
                      </p>
                      <p className="text-gray-900 text-sm md:text-base">
                        {business.address}, {business.city}
                        {business.neighborhood && `, ${business.neighborhood}`}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-[#003893] mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Teléfono / WhatsApp</p>
                    <p className="text-gray-900">{business.phone}</p>
                    {business.whatsapp && business.whatsapp !== business.phone && (
                      <p className="text-gray-900">{business.whatsapp}</p>
                    )}
                  </div>
                </div>

                {business.email && (
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-[#003893] mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                        Email
                      </p>
                      <p className="text-gray-900 text-sm md:text-base">{business.email}</p>
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {(business.facebook || business.instagram || business.website) && (
                  <div className="flex items-start">
                    <Globe className="w-5 h-5 text-[#003893] mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                        Redes Sociales
                      </p>
                      <div className="flex space-x-3">
                        {business.facebook && (
                          <a
                            href={business.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#003893] hover:text-[#0057B7]"
                          >
                            <Facebook className="w-5 h-5" />
                          </a>
                        )}
                        {business.instagram && (
                          <a
                            href={business.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#003893] hover:text-[#0057B7]"
                          >
                            <Instagram className="w-5 h-5" />
                          </a>
                        )}
                        {business.website && (
                          <a
                            href={business.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#003893] hover:text-[#0057B7]"
                          >
                            <Globe className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* About Section */}
        {business.description && (
          <section className="">
            <h2 className="text-gray-900 mb-4 text-xl font-semibold">Acerca de {business.name}</h2>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {business.description}
              </p>
            </div>
          </section>
        )}

        {/* Products Section */}
        {products.length > 0 && (
          <section className="">
            <h2 className="text-gray-900 mb-4 text-xl font-semibold">
              Productos y Servicios ({products.length}/10)
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>Nota importante:</strong> Los pagos se realizan fuera de
                Xolonica, directamente con el negocio. Contacta al negocio para
                más información sobre precios, disponibilidad y métodos de pago.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <section className="">
          <ReviewsList businessId={business.id} />
        </section>

        {/* Chat Section */}
        <section className="">
          <h2 className="text-gray-900 mb-4 text-xl font-semibold">Contacta al Negocio</h2>
          <BusinessChatRealtime businessId={business.id} businessName={business.name} />
        </section>

        {/* Similar Businesses */}
        {similarBusinesses.length > 0 && (
          <section>
            <h2 className="text-gray-900 mb-6 text-xl font-semibold">También te puede interesar</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarBusinesses.map((similarBusiness) => (
                <BusinessCard key={similarBusiness.id} business={similarBusiness} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
