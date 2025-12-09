import { Metadata } from 'next';
import AdminDashboard from './AdminDashboard';

export const metadata: Metadata = {
  title: 'Panel de Administración - Xolonica.store',
  description: 'Panel de administración para gestionar negocios y productos',
};

export default function Page() {
  return <AdminDashboard />;
}
