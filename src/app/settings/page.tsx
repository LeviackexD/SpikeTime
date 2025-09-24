
/**
 * @fileoverview User settings page.
 * Allows users to manage their preferences, including notification settings
 * (email, push), appearance (light/dark mode), and account actions like
 * changing their password.
 */

'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell, Palette, UserCircle, Moon, Sun, Globe } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

export default function SettingsPage() {
  const { setTheme, theme } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const [notifications, setNotifications] = React.useState({
    email: false,
    push: false,
  });

  const handleNotificationChange = (key: 'email' | 'push') => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t('settingsPage.title')}</h1>
        <p className="text-muted-foreground">{t('settingsPage.subtitle')}</p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Bell className="h-6 w-6 text-primary" />
              {t('settingsPage.notifications.title')}
            </CardTitle>
            <CardDescription>
              {t('settingsPage.notifications.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="email-notifications" className="font-semibold">{t('settingsPage.notifications.email')}</Label>
                <p className="text-sm text-muted-foreground">{t('settingsPage.notifications.emailSubtitle')}</p>
              </div>
              <Switch
                id="email-notifications"
                checked={notifications.email}
                onCheckedChange={() => handleNotificationChange('email')}
                disabled
              />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="push-notifications" className="font-semibold">{t('settingsPage.notifications.push')}</Label>
                <p className="text-sm text-muted-foreground">{t('settingsPage.notifications.pushSubtitle')}</p>
              </div>
              <Switch
                id="push-notifications"
                checked={notifications.push}
                onCheckedChange={() => handleNotificationChange('push')}
                disabled
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Palette className="h-6 w-6 text-primary" />
              {t('settingsPage.appearance.title')}
            </CardTitle>
            <CardDescription>
              {t('settingsPage.appearance.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-between rounded-lg border p-4">
               <div className='flex items-center gap-2'>
                <Sun className="h-5 w-5 transition-all scale-100 dark:scale-0" />
                <Moon className="absolute h-5 w-5 transition-all scale-0 dark:scale-100" />
                <Label htmlFor="dark-mode" className="font-semibold pl-4">{t('settingsPage.appearance.darkMode')}</Label>
               </div>
              <Switch 
                id="dark-mode"
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Globe className="h-6 w-6 text-primary" />
              {t('settingsPage.language.title')}
            </CardTitle>
            <CardDescription>
              {t('settingsPage.language.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border p-4">
                <Select value={locale} onValueChange={(value) => setLocale(value as 'en' | 'es')}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={t('settingsPage.language.select')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="en">{t('languages.en')}</SelectItem>
                        <SelectItem value="es">{t('languages.es')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <UserCircle className="h-6 w-6 text-primary" />
              {t('settingsPage.account.title')}
            </CardTitle>
            <CardDescription>
              {t('settingsPage.account.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline">{t('settingsPage.account.changePassword')}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
