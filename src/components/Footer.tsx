import Link from 'next/link';
import Image from 'next/image';
import { Music2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#003893] text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="relative w-40 h-12 md:w-48 md:h-14">
                <Image
                  src="/Logo.png"
                  alt="Xolonica.store"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <p className="text-blue-100 mb-4">
              Conectamos clientes con negocios verificados en Nicaragua. 
              Compra con confianza, apoya lo local.
            </p>
            <p className="text-sm text-blue-200">
              <strong>Importante:</strong> Xolonica no procesa pagos. Los pagos se 
              realizan directamente con cada negocio verificado.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-blue-100 hover:text-white transition">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/negocios" className="text-blue-100 hover:text-white transition">
                  Negocios
                </Link>
              </li>
              <li>
                <Link href="/registrar-negocio" className="text-blue-100 hover:text-white transition">
                  Registra tu negocio
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2">
              <li className="text-blue-100">
                Nicaragua
              </li>
              <li>
                <a 
                  href="https://www.tiktok.com/@gabriella113013" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-100 hover:text-white transition"
                >
                  @gabriella113013
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social & Copyright */}
        <div className="border-t border-blue-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-blue-100 text-sm">
              © 2024 Xolonica.store. Todos los derechos reservados.
            </p>
            <p className="text-xs text-blue-200">
              Próximas integraciones: DGI, Facturación, Deliverys
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="https://www.tiktok.com/@gabriella113013"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-100 hover:text-white transition text-sm"
            >
              <Music2 className="w-5 h-5" />
              <span>TikTok</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
