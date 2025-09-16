/**
 * @fileoverview User login page.
 * Provides a form for users to sign in with their email and password,
 * or to use Google for authentication. Also links to the registration page.
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
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = React.useState('admin@invernesseagles.com');
  const [password, setPassword] = React.useState('password');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await signInWithEmail(email, password);
    if (success) {
      toast({
        title: 'Login Successful!',
        description: 'Welcome back!',
        variant: 'success',
      });
      router.push('/');
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password. With mock data, any user email from mock-data.ts will work.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };
  
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await signInWithGoogle();
    // This will now be handled by the mock in AuthContext
    setIsLoading(false);
    router.push('/');
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <InvernessEaglesLogo className="h-12 w-auto" />
          </div>
          <CardTitle className="text-2xl font-headline">Welcome Back!</CardTitle>
          <CardDescription>
            Enter your credentials to access your account.
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
                disabled={isLoading}
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
                disabled={isLoading}
                />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Button variant="outline" onClick={handleGoogleLogin} disabled={isLoading}>
                Google
              </Button>
            </div>
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
