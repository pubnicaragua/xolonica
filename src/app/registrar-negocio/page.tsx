'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { CATEGORIES, NICARAGUA_CITIES } from '@/types/database';
import { uploadBusinessLogo, uploadProductImage } from '@/utils/storage';
import { addWatermark } from '@/utils/watermark';

export default function RegisterBusinessPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Step 1: Business Data
  const [businessName, setBusinessName] = useState('');
  const [ruc, setRuc] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [municipality, setMunicipality] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('+505 ');
  const [whatsapp, setWhatsapp] = useState('+505 ');
  const [email, setEmail] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [website, setWebsite] = useState('');
  const [storeType, setStoreType] = useState<{
    fisica: boolean;
    online: boolean;
  }>({
    fisica: false,
    online: false,
  });

  // Step 2: Description
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Step 3: Products
  const [products, setProducts] = useState<
    Array<{
      name: string;
      description: string;
      price: string;
      notes: string;
      imageFile?: File | null;
    }>
  >([{ name: '', description: '', price: '', notes: '', imageFile: null }]);

  const addProduct = () => {
    if (products.length < 10) {
      setProducts([
        ...products,
        { name: '', description: '', price: '', notes: '', imageFile: null },
      ]);
    }
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: string, value: string) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    setProducts(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Verificar usuario autenticado
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert('Primero debes crear tu cuenta e iniciar sesión para enviar la solicitud de tu negocio.');
        setLoading(false);
        return;
      }

      console.log('👤 Usuario para el negocio:', user.id);

      // Insert business
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .insert({
          name: businessName,
          ruc,
          category,
          city,
          municipality,
          neighborhood,
          address,
          phone,
          whatsapp,
          email,
          facebook,
          instagram,
          tiktok,
          website,
          tagline,
          description,
          status: 'pending',
          has_physical_store: storeType.fisica,
          has_online_store: storeType.online,
          owner_id: user.id,
        })
        .select()
        .single();

      if (businessError || !businessData) {
        alert('Error al registrar el negocio. Inténtalo de nuevo.');
        setLoading(false);
        return;
      }

    // Insert products
    const validProducts = products.filter((p) => p.name.trim() !== '');
    let createdProducts: any[] = [];
    if (validProducts.length > 0) {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .insert(
          validProducts.map((product) => ({
            business_id: businessData.id,
            name: product.name,
            description: product.description,
            price: product.price ? parseFloat(product.price) : null,
            notes: product.notes,
            available: true,
          }))
        )
        .select();

      if (productsError) {
        alert('Error al registrar los productos. Inténtalo de nuevo.');
        setLoading(false);
        return;
      }

      createdProducts = productsData || [];
    }

    // Upload logo if provided
    if (logoFile) {
      try {
        console.log('📤 Subiendo logo...');
        const logoUrl = await uploadBusinessLogo(businessData.id, logoFile);
        console.log('✅ Logo subido:', logoUrl);
        await supabase
          .from('businesses')
          .update({ logo_url: logoUrl })
          .eq('id', businessData.id);
      } catch (e) {
        console.error('❌ Error al subir logo:', e);
        alert(`Error al subir el logo: ${(e as Error).message}. El negocio se registró pero sin logo.`);
      }
    }

    // Upload product images if provided (with watermark)
    if (createdProducts.length > 0) {
      const uploadPromises: Promise<void>[] = [];
      createdProducts.forEach((created, index) => {
        const original = validProducts[index];
        if (original?.imageFile) {
          uploadPromises.push(
            (async () => {
              try {
                console.log(`📤 Subiendo imagen del producto ${index + 1}...`);
                // Agregar marca de agua a la imagen
                const watermarkedFile = await addWatermark(original.imageFile as File);
                const imageUrl = await uploadProductImage(
                  businessData.id,
                  created.id,
                  watermarkedFile
                );
                console.log(`✅ Imagen del producto ${index + 1} subida:`, imageUrl);
                await supabase
                  .from('products')
                  .update({ image_url: imageUrl })
                  .eq('id', created.id);
              } catch (err) {
                console.error(`❌ Error al subir imagen del producto ${index + 1}:`, err);
                alert(`Error al subir imagen del producto "${original.name}": ${(err as Error).message}`);
              }
            })()
          );
        }
      });
      await Promise.all(uploadPromises);
    }

      setLoading(false);
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      alert('Error al registrar el negocio. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-[#2D9B4F] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-[#003893] mb-4">¡Solicitud Recibida!</h2>
          <p className="text-gray-700 mb-6">
            Hemos recibido tu solicitud para registrar <strong>{businessName}</strong>.
            Nuestro equipo revisará tu negocio y te notificaremos dentro de 48
            horas.
          </p>
          <p className="text-gray-600 mb-8">
            Mientras tanto, tu negocio aparecerá con el estado &quot;En revisión&quot; en
            nuestra plataforma.
          </p>
          <a
            href="/negocios"
            className="inline-block bg-[#003893] text-white px-8 py-3 rounded-lg hover:bg-[#0057B7] transition"
          >
            Ver Negocios
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#003893] text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-white mb-4">Registra tu Negocio</h1>
          <p className="text-xl text-blue-100">
            Solo C$199 al mes - Muestra hasta 10 productos y aparece como
            verificado
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 ${s !== 3 ? 'mr-4' : ''}`}
              >
                <div
                  className={`h-2 rounded-full ${
                    s <= step ? 'bg-[#003893]' : 'bg-gray-300'
                  }`}
                />
                <p
                  className={`text-sm mt-2 ${
                    s <= step ? 'text-[#003893]' : 'text-gray-500'
                  }`}
                >
                  {s === 1 && 'Datos del Negocio'}
                  {s === 2 && 'Descripción'}
                  {s === 3 && 'Productos'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Forms */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          {/* Step 1: Business Data */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-[#003893]">Paso 1: Datos del Negocio</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Nombre Comercial *
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => {
                      const value = e.target.value;
                      setBusinessName(value.charAt(0).toUpperCase() + value.slice(1));
                    }}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
                    placeholder="Mi Negocio S.A."
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    RUC / Identificación
                  </label>
                  <input
                    type="text"
                    value={ruc}
                    onChange={(e) => setRuc(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
                    placeholder="001-120424-0001U"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <div className="border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                    <p className="text-xs text-gray-600 mb-2">
                      Puedes seleccionar varias categorías. Usaremos la primera como categoría principal.
                    </p>
                    <div className="grid md:grid-cols-2 gap-2">
                      {CATEGORIES.map((cat) => {
                        const checked = selectedCategories.includes(cat);
                        return (
                          <label key={cat} className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                let next: string[];
                                if (e.target.checked) {
                                  next = [...selectedCategories, cat];
                                } else {
                                  next = selectedCategories.filter((c) => c !== cat);
                                }
                                setSelectedCategories(next);
                                setCategory(next[0] || '');
                              }}
                              className="w-4 h-4"
                            />
                            <span>{cat}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    Departamento / Ciudad *
                  </label>
                  <div className="border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                    <p className="text-xs text-gray-600 mb-2">
                      Puedes seleccionar varias ciudades. Usaremos la primera como ciudad principal.
                    </p>
                    <div className="grid md:grid-cols-2 gap-2">
                      {NICARAGUA_CITIES.map((c) => {
                        const checked = selectedCities.includes(c);
                        return (
                          <label key={c} className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                let next: string[];
                                if (e.target.checked) {
                                  next = [...selectedCities, c];
                                } else {
                                  next = selectedCities.filter((cityItem) => cityItem !== c);
                                }
                                setSelectedCities(next);
                                setCity(next[0] || '');
                              }}
                              className="w-4 h-4"
                            />
                            <span>{c}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    Municipio
                  </label>
                  <input
                    type="text"
                    value={municipality}
                    onChange={(e) => {
                      const value = e.target.value;
                      setMunicipality(value.charAt(0).toUpperCase() + value.slice(1));
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
                    placeholder="Managua"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    Barrio / Colonia
                  </label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNeighborhood(value.charAt(0).toUpperCase() + value.slice(1));
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
                    placeholder="Altamira"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Dirección completa
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
                  placeholder="De la rotonda 2c al norte, 1c arriba"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Teléfono de Contacto *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                      <span className="text-xl">🇳🇮</span>
                      <span className="text-gray-600 font-medium">+505</span>
                    </div>
                    <input
                      type="tel"
                      value={phone.replace('+505 ', '')}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '');
                        setPhone(`+505 ${digits}`);
                      }}
                      required
                      className="w-full pl-24 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
                      placeholder="8888 1234"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    WhatsApp
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                      <span className="text-xl">🇳🇮</span>
                      <span className="text-gray-600 font-medium">+505</span>
                    </div>
                    <input
                      type="tel"
                      value={whatsapp.replace('+505 ', '')}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '');
                        setWhatsapp(`+505 ${digits}`);
                      }}
                      className="w-full pl-24 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
                      placeholder="8888 1234"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
                    placeholder="contacto@minegocio.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Tipo de Tienda * (Puedes seleccionar una o ambas)
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={storeType.fisica}
                      onChange={(e) => setStoreType({ ...storeType, fisica: e.target.checked })}
                      className="mr-2 w-4 h-4"
                    />
                    <span>Tienda Física</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={storeType.online}
                      onChange={(e) => setStoreType({ ...storeType, online: e.target.checked })}
                      className="mr-2 w-4 h-4"
                    />
                    <span>Tienda en Línea</span>
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <strong>📱 Redes Sociales:</strong> Debes completar al menos Facebook o Instagram (o ambos). Puedes pegar la URL completa o escribir tu nombre de usuario.
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Ejemplo URL: https://facebook.com/MiNegocio | Ejemplo usuario: @MiNegocio
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-gray-700 mb-2 flex items-center gap-2">
                    Facebook
                    <span className="text-xs text-gray-500">(URL o @usuario)</span>
                  </label>
                  <input
                    type="text"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
                    placeholder="https://facebook.com/... o @MiNegocio"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 flex items-center gap-2">
                    Instagram
                    <span className="text-xs text-gray-500">(URL o @usuario)</span>
                  </label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
                    placeholder="https://instagram.com/... o @MiNegocio"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    Sitio Web
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
                    placeholder="https://minegocio.com"
                  />
                </div>
              </div>

            </div>
          )}

          {/* Step 2: Description */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-[#003893]">Paso 2: Descripción del Negocio</h3>

              <div>
                <label className="block text-gray-700 mb-2">
                  Eslogan / Frase Corta *
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTagline(value.charAt(0).toUpperCase() + value.slice(1));
                  }}
                  required
                  maxLength={100}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
                  placeholder="Ej: La mejor calidad al mejor precio"
                />
                <p className="text-sm text-gray-500 mt-1">Máximo 100 caracteres</p>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Descripción Completa *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDescription(value.charAt(0).toUpperCase() + value.slice(1));
                  }}
                  required
                  rows={6}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
                  placeholder="Describe tu negocio, productos o servicios que ofreces, horarios, etc."
                />
                <p className="text-sm text-gray-500 mt-1">
                  {description.length}/500 caracteres
                </p>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Logo del Negocio (Opcional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLogoFile(file);
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setLogoPreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
                />
                {logoPreview && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                    <img src={logoPreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-300" />
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Formatos: JPG, PNG. Tamaño máximo: 2MB
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Products */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-[#003893]">Paso 3: Productos o Servicios</h3>
              <p className="text-gray-600">
                Agrega hasta 10 productos o servicios. Las imágenes llevarán marca de agua de Xolonica.store automáticamente.
              </p>

              {products.map((product, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-6 space-y-4 bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">
                      Producto {index + 1}
                    </h4>
                    {products.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Nombre del Producto *
                      </label>
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateProduct(index, 'name', value.charAt(0).toUpperCase() + value.slice(1));
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
                        placeholder="Ej: Licuadora Industrial"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">
                        Precio (C$)
                      </label>
                      <input
                        type="number"
                        value={product.price}
                        onChange={(e) => updateProduct(index, 'price', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
                        placeholder="199.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={product.description}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateProduct(index, 'description', value.charAt(0).toUpperCase() + value.slice(1));
                      }}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
                      placeholder="Describe las características del producto"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      Imagen del Producto
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const updated = [...products];
                          updated[index] = { ...updated[index], imageFile: file };
                          setProducts(updated);
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
                    />
                    {product.imageFile && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-2">Vista previa (se agregará marca de agua al subir):</p>
                        <img 
                          src={URL.createObjectURL(product.imageFile)} 
                          alt="Preview" 
                          className="w-full h-48 object-cover rounded-lg border border-gray-300" 
                        />
                      </div>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Se agregará marca de agua "Xolonica.store" automáticamente
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      Notas Adicionales
                    </label>
                    <input
                      type="text"
                      value={product.notes}
                      onChange={(e) => updateProduct(index, 'notes', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
                      placeholder="Ej: Disponible en varios colores"
                    />
                  </div>
                </div>
              ))}

              {products.length < 10 && (
                <button
                  type="button"
                  onClick={addProduct}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#003893] hover:text-[#003893] transition font-semibold"
                >
                  + Agregar otro producto (máximo 10)
                </button>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center text-gray-600 hover:text-[#003893] transition"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Anterior
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={() => {
                  if (step === 1) {
                    if (!businessName || !category || !city || !phone || (!storeType.fisica && !storeType.online)) {
                      alert('Por favor completa los campos obligatorios (nombre, categoría, ciudad, teléfono y tipo de tienda)');
                      return;
                    }
                    if (!facebook.trim() && !instagram.trim()) {
                      alert('Debes completar al menos Facebook o Instagram (URL o nombre de usuario)');
                      return;
                    }
                  }
                  if (step === 2 && (!tagline || !description)) {
                    alert('Por favor completa los campos obligatorios');
                    return;
                  }
                  setStep(step + 1);
                }}
                className="flex items-center bg-[#003893] text-white px-6 py-3 rounded-lg hover:bg-[#0057B7] transition ml-auto"
              >
                Siguiente
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#2D9B4F] text-white px-8 py-3 rounded-lg hover:bg-[#248a42] transition ml-auto disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar para Verificación'}
              </button>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-[#003893] mb-2">¿Qué sucede después?</h4>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-[#2D9B4F] mr-2">✓</span>
              Revisaremos tu negocio dentro de 48 horas
            </li>
            <li className="flex items-start">
              <span className="text-[#2D9B4F] mr-2">✓</span>
              Te notificaremos cuando tu negocio esté verificado
            </li>
            <li className="flex items-start">
              <span className="text-[#2D9B4F] mr-2">✓</span>
              Recibirás instrucciones para el pago de C$199/mes
            </li>
            <li className="flex items-start">
              <span className="text-[#2D9B4F] mr-2">✓</span>
              Podrás actualizar tus productos en cualquier momento
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
