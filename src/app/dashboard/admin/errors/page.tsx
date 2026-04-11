/**
 * Admin Error Monitoring Dashboard
 * Route: /dashboard/admin/errors
 */

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import ErrorMonitoringDashboard from '@/components/dashboard/ErrorMonitoringDashboard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auditI18n.errorMonitoring')

  return {
    title: t('metadataTitle'),
    description: t('metadataDescription'),
  }
}

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
