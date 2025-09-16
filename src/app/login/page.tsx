/**
 * @fileoverview User login page.
 * Provides a form for users to sign in with their email and password.
 * Also links to the registration page.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InvernessEaglesLogo } from '@/components/icons/inverness-eagles-logo';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { signInWithEmail, user, loading } = useAuth();
  const [email, setEmail] = React.useState('admin@invernesseagles.com');
  const [password, setPassword] = React.useState('password');
  const [isEmailLoading, setIsEmailLoading] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailLoading(true);
    const success = await signInWithEmail(email, password);
    if (success) {
      toast({
        title: 'Login Successful!',
        description: 'Welcome back!',
        variant: 'success',
      });
      router.push('/');
    }
    // Error toast is handled by the context
    setIsEmailLoading(false);
  };

  const isFormDisabled = isEmailLoading || loading;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <InvernessEaglesLogo className="h-12 w-auto" />
          </div>
          <CardTitle className="text-2xl font-headline">Welcome Back!</CardTitle>
          <CardDescription>
            {loading ? 'Checking authentication...' : 'Enter your credentials to access your account.'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                disabled={isFormDisabled}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required 
                disabled={isFormDisabled}
                />
            </div>
            <Button type="submit" className="w-full" disabled={isFormDisabled}>
              {isEmailLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="underline font-semibold text-primary">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
