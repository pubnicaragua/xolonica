import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { GlobalChatbot } from '@/components/GlobalChatbot';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Xolonica.store - Negocios Verificados en Nicaragua',
  description:
    'Conectamos clientes con negocios verificados en Nicaragua. Compra con confianza en Xolonica.store',
  keywords: 'Nicaragua, negocios, comercio, tiendas, servicios, verificado',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <GlobalChatbot />
      </body>
    </html>
  );
}
