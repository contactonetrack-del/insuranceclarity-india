/**
 * Admin Error Monitoring Dashboard
 * Route: /dashboard/admin/errors
 */

import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import ErrorMonitoringDashboard from '@/components/dashboard/ErrorMonitoringDashboard';

export const metadata = {
  title: 'Error Monitoring Dashboard | Insurance Clarity Admin',
  description: 'Real-time error tracking and monitoring for Insurance Clarity API',
};

export default async function AdminErrorsDashboard() {
  // Check admin auth
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const role = (session.user as { role?: string }).role;
  if (role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6">
        <ErrorMonitoringDashboard />
      </div>
    </div>
  );
}
