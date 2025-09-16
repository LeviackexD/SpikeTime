/**
 * @fileoverview Displays a list of all club announcements.
 * Users can view all announcements in a grid format and open a modal for more details.
 * Features an AI-powered button to summarize all announcements.
 */

'use client';

import * as React from 'react';
import type { NextPage } from 'next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { mockAnnouncements } from '@/lib/mock-data';
import { Megaphone } from 'lucide-react';
import SummarizeButton from '@/components/ai/summarize-button';
import type { Announcement } from '@/lib/types';
import AnnouncementDetailsModal from '@/components/announcements/announcement-details-modal';

const AnnouncementsPage: NextPage = () => {
  const [selectedAnnouncement, setSelectedAnnouncement] = React.useState<Announcement | null>(null);

  const handleOpenModal = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
  };

  const handleCloseModal = () => {
    setSelectedAnnouncement(null);
  };
  
  const announcementText = React.useMemo(() => {
    return mockAnnouncements.map(a => `${a.title}: ${a.content}`).join('\n\n');
  }, []);

  return (
    <>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <Megaphone className="h-8 w-8 text-primary" />
            Announcements
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Stay up-to-date with the latest news, events, and updates from the Inverness Eagles Volleyball Club.
          </p>
          <div className="mt-4">
            <SummarizeButton announcements={announcementText} />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockAnnouncements.map((announcement, index) => (
            <Card 
              key={announcement.id} 
              className="flex flex-col cursor-pointer hover:shadow-lg transition-shadow duration-300 animate-slide-up-and-fade"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleOpenModal(announcement)}
            >
              <CardHeader>
                <CardTitle className="font-headline text-xl">{announcement.title}</CardTitle>
                <CardDescription>
                  {new Date(announcement.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    timeZone: 'UTC'
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">{announcement.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <AnnouncementDetailsModal
        isOpen={!!selectedAnnouncement}
        onClose={handleCloseModal}
        announcement={selectedAnnouncement}
      />
    </>
  );
};

export default AnnouncementsPage;
