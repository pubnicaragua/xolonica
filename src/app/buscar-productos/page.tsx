import { Metadata } from 'next';
import ProductSearchPage from './ProductSearchPage';

export const metadata: Metadata = {
  title: 'Buscar Productos - Xolonica.store',
  description: 'Busca productos y servicios en todos los negocios verificados de Nicaragua',
};

export default function Page() {
  return <ProductSearchPage />;
}
