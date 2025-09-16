/**
 * @fileoverview New user registration page.
 * Provides a form for new users to create an account with their name, email,
 * password, skill level, and favorite position.
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InvernessEaglesLogo } from '@/components/icons/inverness-eagles-logo';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { SkillLevel, PlayerPosition } from '@/lib/types';
import { useAuth } from '@/context/auth-context';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { signUpWithEmail } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    skillLevel: '' as SkillLevel | '',
    favoritePosition: '' as PlayerPosition | '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (field: 'skillLevel' | 'favoritePosition') => (value: string) => {
    setFormData({ ...formData, [field]: value as any });
  };


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.skillLevel || !formData.favoritePosition) {
        toast({
            title: 'Incomplete Form',
            description: 'Please select a skill level and favorite position.',
            variant: 'destructive'
        });
        return;
    }
    setIsLoading(true);
    
    const success = await signUpWithEmail(formData.email, formData.password, {
      name: formData.name,
      skillLevel: formData.skillLevel as SkillLevel,
      favoritePosition: formData.favoritePosition as PlayerPosition,
    });

    if (success) {
      toast({
          title: 'Account Created!',
          description: 'You can now log in with your credentials.',
          variant: 'success'
      });
      router.push('/login');
    } else {
       toast({
          title: 'Registration Failed',
          description: 'This email might already be in use or the password is too weak.',
          variant: 'destructive'
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <InvernessEaglesLogo className="h-12 w-auto" />
          </div>
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>
            Join the Inverness Eagles community today!
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Alex Johnson" value={formData.name} onChange={handleInputChange} required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="alex@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={formData.password} onChange={handleInputChange} required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skillLevel">Skill Level</Label>
              <Select required onValueChange={handleSelectChange('skillLevel')} disabled={isLoading}>
                <SelectTrigger id="skillLevel">
                  <SelectValue placeholder="Select your skill level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="favoritePosition">Favorite Position</Label>
              <Select required onValueChange={handleSelectChange('favoritePosition')} disabled={isLoading}>
                <SelectTrigger id="favoritePosition">
                  <SelectValue placeholder="Select your favorite position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Setter">Setter</SelectItem>
                  <SelectItem value="Hitter">Hitter</SelectItem>
                  <SelectItem value="Libero">Libero</SelectItem>
                  <SelectItem value="Blocker">Blocker</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="underline font-semibold text-primary">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
