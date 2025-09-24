
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
import { useLanguage } from '@/context/language-context';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { signUpWithEmail } = useAuth();
  const { t } = useLanguage();
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
            title: t('toasts.incompleteFormTitle'),
            description: t('toasts.incompleteFormDescription'),
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
          title: t('toasts.accountCreatedTitle'),
          description: t('toasts.accountCreatedDescription'),
          variant: 'success'
      });
      router.push('/login');
    } else {
       toast({
          title: t('toasts.registrationFailedTitle'),
          description: t('toasts.registrationFailedDescription'),
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
          <CardTitle className="text-2xl font-headline">{t('registerPage.title')}</CardTitle>
          <CardDescription>
            {t('registerPage.description')}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('registerPage.nameLabel')}</Label>
              <Input id="name" placeholder="Alex Johnson" value={formData.name} onChange={handleInputChange} required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('registerPage.emailLabel')}</Label>
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
              <Label htmlFor="password">{t('registerPage.passwordLabel')}</Label>
              <Input id="password" type="password" value={formData.password} onChange={handleInputChange} required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skillLevel">{t('registerPage.skillLevelLabel')}</Label>
              <Select required onValueChange={handleSelectChange('skillLevel')} disabled={isLoading} value={formData.skillLevel}>
                <SelectTrigger id="skillLevel">
                  <SelectValue placeholder={t('registerPage.skillLevelPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">{t('skillLevels.Beginner')}</SelectItem>
                  <SelectItem value="Intermediate">{t('skillLevels.Intermediate')}</SelectItem>
                  <SelectItem value="Advanced">{t('skillLevels.Advanced')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="favoritePosition">{t('registerPage.favoritePositionLabel')}</Label>
              <Select required onValueChange={handleSelectChange('favoritePosition')} disabled={isLoading} value={formData.favoritePosition}>
                <SelectTrigger id="favoritePosition">
                  <SelectValue placeholder={t('registerPage.favoritePositionPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Setter">{t('positions.Setter')}</SelectItem>
                  <SelectItem value="Hitter">{t('positions.Hitter')}</SelectItem>
                  <SelectItem value="Libero">{t('positions.Libero')}</SelectItem>
                  <SelectItem value="Blocker">{t('positions.Blocker')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('registerPage.creatingAccount') : t('registerPage.createAccount')}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-muted-foreground">
              {t('registerPage.haveAccount')}{' '}
              <Link href="/login" className="underline font-semibold text-primary">
                {t('registerPage.signIn')}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
