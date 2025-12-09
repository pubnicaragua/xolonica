'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, User, LogOut } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { AuthModal } from './AuthModal';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center group" aria-label="Ir al inicio de Xolonica.store">
              <div className="relative w-48 h-14 md:w-56 md:h-16 group-hover:scale-105 transition-transform">
                <Image
                  src="/Logo.png"
                  alt="Xolonica.store"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg transition font-medium hover:bg-blue-50"
              >
                Inicio
              </Link>
              <Link
                href="/negocios"
                className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg transition font-medium hover:bg-blue-50"
              >
                Negocios
              </Link>
              <Link
                href="/buscar-productos"
                className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg transition font-medium hover:bg-blue-50"
              >
                Buscar Productos
              </Link>
              <Link
                href="/registrar-negocio"
                className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg transition font-medium hover:bg-blue-50"
              >
                Registra tu negocio
              </Link>

              {user ? (
                <div className="flex items-center space-x-2 ml-6 pl-6 border-l border-gray-300">
                  <Link
                    href="/mi-cuenta"
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg transition hover:bg-blue-50 font-medium"
                  >
                    <User className="w-5 h-5" />
                    <span>Mi cuenta</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 text-gray-700 hover:text-red-600 px-3 py-2 rounded-lg transition hover:bg-red-50 font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Salir</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all ml-6 font-semibold"
                >
                  Entrar
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-3">
                <Link
                  href="/"
                  className="text-gray-700 hover:text-blue-600 transition font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inicio
                </Link>
                <Link
                  href="/negocios"
                  className="text-gray-700 hover:text-blue-600 transition font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Negocios
                </Link>
                <Link
                  href="/buscar-productos"
                  className="text-gray-700 hover:text-blue-600 transition font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Buscar Productos
                </Link>
                <Link
                  href="/registrar-negocio"
                  className="text-gray-700 hover:text-blue-600 transition font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Registra tu negocio
                </Link>

                {user ? (
                  <>
                    <Link
                      href="/mi-cuenta"
                      className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition font-medium py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      <span>Mi cuenta</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition text-left font-medium py-2"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Salir</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition text-center font-semibold mt-2"
                  >
                    Entrar
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
