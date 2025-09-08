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
import { Bell, Palette, UserCircle, Moon, Sun } from 'lucide-react';

export default function SettingsPage() {
  const { setTheme, theme } = useTheme();
  const [notifications, setNotifications] = React.useState({
    email: true,
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
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Bell className="h-6 w-6 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>
              Choose how you want to be notified about sessions and announcements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="email-notifications" className="font-semibold">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates about sessions and news via email.</p>
              </div>
              <Switch
                id="email-notifications"
                checked={notifications.email}
                onCheckedChange={() => handleNotificationChange('email')}
              />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="push-notifications" className="font-semibold">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Get real-time updates on your mobile device (coming soon).</p>
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
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of the app.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-between rounded-lg border p-4">
               <div className='flex items-center gap-2'>
                <Sun className="h-5 w-5 transition-all scale-100 dark:scale-0" />
                <Moon className="absolute h-5 w-5 transition-all scale-0 dark:scale-100" />
                <Label htmlFor="dark-mode" className="font-semibold pl-4">Dark Mode</Label>
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
              <UserCircle className="h-6 w-6 text-primary" />
              Account
            </CardTitle>
            <CardDescription>
              Manage your account settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline">Change Password</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
