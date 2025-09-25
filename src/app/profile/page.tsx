
/**
 * @fileoverview User profile page.
 * Displays the current user's information, including their name, avatar,
 * skill level, favorite position, and session stats. Allows users to
 * edit their profile information via a modal.
 */

'use client';

import * as React from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Edit, Star, Target, CheckCircle, LineChart } from 'lucide-react';
import EditProfileModal from '@/components/profile/edit-profile-modal';
import type { User } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';

const StatCard = ({ icon: Icon, label, value, badge }: { icon: React.ElementType, label: string, value: string | React.ReactNode, badge?: boolean }) => (
    <Card className="flex flex-col items-center justify-center p-4 text-center transition-all hover:shadow-lg hover:-translate-y-1">
        <Icon className="h-8 w-8 text-primary mb-2" />
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        {badge ? (
             <Badge variant="secondary" className="text-lg font-semibold">{value}</Badge>
        ) : (
            <p className="font-semibold text-2xl">{value}</p>
        )}
    </Card>
)


export default function ProfilePage() {
  const { user: currentUser, updateUser } = useAuth();
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleSaveProfile = (updatedUser: User) => {
    updateUser(updatedUser);
    setIsModalOpen(false);
  };
  
  if (!currentUser) {
    return <div>{t('profilePage.loading')}</div>
  }

  return (
    <>
    <div className="space-y-8 animate-fade-in">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <Card className="shadow-lg">
              <CardHeader className="items-center text-center p-6">
                <Avatar className="h-24 w-24 border-4 border-primary/50 shadow-md">
                  <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="pt-4 font-headline text-3xl">
                  {currentUser.name}
                </CardTitle>
                 <CardDescription>
                    @{currentUser.username}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center p-6 pt-0">
                <Button onClick={() => setIsModalOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" /> {t('profilePage.editProfile')}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <BarChart className="h-6 w-6 text-primary" />
                  {t('profilePage.playerDetails')}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={Star} label={t('profilePage.skillLevel')} value={t(`skillLevels.${currentUser.skillLevel}`)} badge />
                  <StatCard icon={Target} label={t('profilePage.favoritePosition')} value={t(`positions.${currentUser.favoritePosition}`)} badge />
                  <StatCard icon={BarChart} label={t('profilePage.sessionsPlayed')} value={currentUser.stats.sessionsPlayed} />
                  <StatCard icon={CheckCircle} label={t('profilePage.attendanceRate')} value={`${currentUser.stats.attendanceRate}%`} />
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
    <EditProfileModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProfile}
        user={currentUser}
    />
    </>
  );
}
