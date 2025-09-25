
/**
 * @fileoverview Login page for users to access their account.
 * It provides a form for email and password authentication and links to the registration page.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { Loader2 } from 'lucide-react';
import { InvernessEaglesLogo } from '@/components/icons/inverness-eagles-logo';

export default function LoginPage() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { signInWithEmail, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();

  React.useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmail(email, password);
      // The redirection is now handled by the AuthContext's useEffect,
      // which is a more robust pattern.
    } catch (error) {
       toast({
        title: t('toasts.authFailedTitle'),
        description: t('toasts.authFailedDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
            <InvernessEaglesLogo className="h-10 w-auto mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold">{t('loginPage.welcome')}</CardTitle>
          <CardDescription>
            {t('loginPage.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('loginPage.emailLabel')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="password">{t('loginPage.passwordLabel')}</Label>
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline"
                  >
                    {t('loginPage.forgotPassword')}
                  </Link>
                </div>
                <Input 
                    id="password" 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('loginPage.signIn')}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            {t('loginPage.noAccount')}{' '}
            <Link href="/register" className="underline">
              {t('loginPage.signUp')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
