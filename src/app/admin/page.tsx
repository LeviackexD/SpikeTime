/**
 * @fileoverview Entry point for the /admin route.
 * This page acts as a wrapper and security gateway for the main admin panel component.
 * It ensures that only users with the 'admin' role can access the content.
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import AdminPageComponent from '@/components/admin/page';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  React.useEffect(() => {
    if (!loading && user?.role !== 'admin') {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center text-center">
        <div className="space-y-2">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">{t('adminPage.redirecting')}</p>
        </div>
      </div>
    );
  }
  
  return <AdminPageComponent />;
}
