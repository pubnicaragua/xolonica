'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { uploadUserAvatar } from '@/utils/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+505 ');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [omitAvatar, setOmitAvatar] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      onClose();
      resetForm();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

     if (!omitAvatar && !profileImageFile) {
       setError('Para ser usuario verificado, toma una foto de perfil o marca que la omites por ahora.');
       setLoading(false);
       return;
     }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone,
          display_name: displayName,
          profile_verified: !omitAvatar && !!profileImageFile,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.user) {
      let avatarUrl: string | null = null;

      if (!omitAvatar && profileImageFile) {
        try {
          avatarUrl = await uploadUserAvatar(data.user.id, profileImageFile);
        } catch (uploadError) {
          console.error('Error al subir avatar:', uploadError);
        }
      }

      // Actualizar metadata del usuario con avatar y estado de verificación de perfil
      try {
        await supabase.auth.updateUser({
          data: {
            phone,
            display_name: displayName,
            avatar_url: avatarUrl,
            profile_verified: !!avatarUrl,
          },
        });
      } catch (updateError) {
        console.error('Error al actualizar metadata del usuario:', updateError);
      }

      // Create user profile básico (sin asumir columnas extra en la tabla)
      await supabase.from('user_profiles').insert({
        id: data.user.id,
        phone,
        display_name: displayName,
      });

      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setPhone('+505 ');
    setDisplayName('');
    setError('');
    setLoading(false);
    setProfileImageFile(null);
    setProfileImagePreview(null);
    setOmitAvatar(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Close button */}
        <button
          onClick={() => {
            onClose();
            resetForm();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-[#003893] mb-2">
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="text-gray-600">
            {mode === 'login'
              ? 'Ingresa tus credenciales'
              : 'Regístrate para dejar reseñas y usar el chat'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 py-2 px-4 rounded-md transition ${
              mode === 'login'
                ? 'bg-white text-[#003893] shadow'
                : 'text-gray-600'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`flex-1 py-2 px-4 rounded-md transition ${
              mode === 'register'
                ? 'bg-white text-[#003893] shadow'
                : 'text-gray-600'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Forms */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#003893] text-white py-3 rounded-lg hover:bg-[#0057B7] transition disabled:opacity-50"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
                placeholder="Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">
                Número de teléfono
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
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
                placeholder="••••••••"
              />
            </div>
            <div className="border border-blue-100 rounded-lg p-3 bg-blue-50">
              <p className="text-sm text-gray-700 font-medium mb-1">
                Foto de perfil (requerida para ser usuario verificado)
              </p>
              <p className="text-xs text-gray-600 mb-2">
                Toma una foto desde la cámara de tu dispositivo. Si omites la foto, podrás usar la plataforma pero no serás un usuario verificado.
              </p>
              <input
                type="file"
                accept="image/*"
                capture="user"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setProfileImageFile(file);
                    setOmitAvatar(false);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setProfileImagePreview(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                required={!omitAvatar}
                className="w-full text-sm text-gray-700"
              />
              {profileImagePreview && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={profileImagePreview}
                    alt="Foto de perfil"
                    className="w-16 h-16 rounded-full object-cover border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setProfileImageFile(null);
                      setProfileImagePreview(null);
                    }}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Quitar foto
                  </button>
                </div>
              )}
              <label className="mt-3 flex items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={omitAvatar}
                  onChange={(e) => {
                    setOmitAvatar(e.target.checked);
                    if (e.target.checked) {
                      setProfileImageFile(null);
                      setProfileImagePreview(null);
                    }
                  }}
                  className="w-4 h-4"
                />
                <span>
                  Omitir foto por ahora (no seré usuario verificado hasta subir una foto)
                </span>
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#003893] text-white py-3 rounded-lg hover:bg-[#0057B7] transition disabled:opacity-50"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
