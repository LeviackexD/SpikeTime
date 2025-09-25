
/**
 * @fileoverview Registration page for new users.
 * Collects user information like name, email, password, skill level, and favorite position.
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { SkillLevel, PlayerPosition } from '@/lib/types';
import { useLanguage } from '@/context/language-context';
import { Loader2 } from 'lucide-react';
import { InvernessEaglesLogo } from '@/components/icons/inverness-eagles-logo';

export default function RegisterPage() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [skillLevel, setSkillLevel] = React.useState<SkillLevel | ''>('');
  const [favoritePosition, setFavoritePosition] = React.useState<PlayerPosition | ''>('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { signUpWithEmail, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();

  React.useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillLevel || !favoritePosition) {
        toast({
            title: t('toasts.incompleteFormTitle'),
            description: t('toasts.incompleteFormDescription'),
            variant: "destructive"
        });
        return;
    }
    setIsLoading(true);

    const userData = {
        name,
        skillLevel,
        favoritePosition,
    };

    // This is now a mock function
    const success = await signUpWithEmail(email, password, userData);
    setIsLoading(false);
    if (success) {
      toast({
        title: t('toasts.accountCreatedTitle'),
        description: t('toasts.accountCreatedDescription'),
        variant: 'success',
      });
      router.push('/login');
    } else {
      toast({
        title: t('toasts.registrationFailedTitle'),
        description: t('toasts.registrationFailedDescription'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <InvernessEaglesLogo className="h-10 w-auto mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold">{t('registerPage.title')}</CardTitle>
          <CardDescription>
            {t('registerPage.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="name">{t('registerPage.nameLabel')}</Label>
                <Input id="name" required value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('registerPage.emailLabel')}</Label>
                <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('registerPage.passwordLabel')}</Label>
                <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="skill-level">{t('registerPage.skillLevelLabel')}</Label>
                <Select onValueChange={(value) => setSkillLevel(value as SkillLevel)} required>
                  <SelectTrigger id="skill-level">
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
                <Label htmlFor="favorite-position">{t('registerPage.favoritePositionLabel')}</Label>
                <Select onValueChange={(value) => setFavoritePosition(value as PlayerPosition)} required>
                  <SelectTrigger id="favorite-position">
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
                 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('registerPage.createAccount')}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            {t('registerPage.haveAccount')}{' '}
            <Link href="/login" className="underline">
              {t('registerPage.signIn')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
