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
import { BarChart, Edit, Medal, Star, Target } from 'lucide-react';
import EditProfileModal from '@/components/profile/edit-profile-modal';
import type { User } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth-context';

const achievements = [
  { icon: Medal, label: '50+ Sessions', color: 'text-yellow-500' },
  { icon: Star, label: 'Top Player', color: 'text-blue-500' },
  { icon: Target, label: 'Perfect Attendance', color: 'text-green-500' },
];

export default function ProfilePage() {
  const { user: currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleSaveProfile = (updatedUser: User) => {
    // In a real app, you would call an API to save the user data.
    // For this prototype, we can't persist it, but we can close the modal.
    console.log('Saving user:', updatedUser);
    setIsModalOpen(false);
  };
  
  if (!currentUser) {
    return <div>Loading profile...</div>
  }

  return (
    <>
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
          <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24 border-4 border-primary/50">
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <CardTitle className="pt-4 font-headline text-2xl">
              {currentUser.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => setIsModalOpen(true)}>
              <Edit className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <BarChart className="h-6 w-6 text-primary" />
              Player Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-muted-foreground">Skill Level</p>
                <p className="font-semibold text-lg">{currentUser.skillLevel}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Favorite Position</p>
                <p className="font-semibold text-lg">{currentUser.favoritePosition}</p>
              </div>
            </div>
            <Separator />
            <div className="text-center">
                <p className="text-muted-foreground">Sessions Played</p>
                <p className="font-semibold text-2xl">{currentUser.stats.sessionsPlayed}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Medal className="h-6 w-6 text-primary" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {achievements.map((ach, index) => (
                <div key={`${ach.label}-${index}`} className="flex flex-col items-center gap-2 rounded-lg border p-4 w-32">
                   <ach.icon className={`h-8 w-8 ${ach.color}`} />
                   <span className="text-xs font-medium text-center">{ach.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
