
'use client';

import * as React from 'react';
import type { NextPage } from 'next';
import { Button } from '@/components/ui/button';
import { currentUser, mockAnnouncements } from '@/lib/mock-data';
import Link from 'next/link';
import type { Session, Announcement } from '@/lib/types';
import SessionListItem from '@/components/sessions/session-list-item';
import SectionHeader from '@/components/layout/section-header';
import { Volleyball, Megaphone } from 'lucide-react';
import SessionDetailsModal from '@/components/sessions/session-details-modal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import AnnouncementDetailsModal from '@/components/announcements/announcement-details-modal';
import { useSessions } from '@/context/session-context';

const DashboardPage: NextPage = () => {
  const { sessions, bookSession, cancelBooking, joinWaitlist } = useSessions();
  const [sessionToView, setSessionToView] = React.useState<Session | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = React.useState<Announcement | null>(null);

  const handleViewPlayers = (session: Session) => {
    setSessionToView(session);
    setIsViewModalOpen(true);
  };
  
  const handleOpenAnnouncementModal = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
  };

  const handleCloseAnnouncementModal = () => {
    setSelectedAnnouncement(null);
  };

  const upcomingSessions = sessions.filter(session => 
    new Date(session.date) >= new Date() && session.players.some(p => p.id === currentUser.id)
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const availableSessions = sessions.filter(session =>
    new Date(session.date) >= new Date() && !session.players.some(p => p.id === currentUser.id)
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const recentAnnouncements = mockAnnouncements.slice(0, 3);


  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline">Welcome back, Manu!</h1>
        <p className="text-muted-foreground">Here's what's happening in your volleyball world.</p>
      </div>
      
      <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full space-y-8">
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="hover:no-underline p-0">
              <SectionHeader icon={Volleyball} title="My Upcoming Sessions" />
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            {upcomingSessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {upcomingSessions.map((session, index) => (
                  <SessionListItem 
                      key={session.id}
                      session={session}
                      currentUser={currentUser}
                      onBook={bookSession}
                      onCancel={cancelBooking}
                      onWaitlist={joinWaitlist}
                      onViewPlayers={handleViewPlayers}
                      priority={index === 0}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 rounded-lg bg-muted/50 border border-dashed">
                <p className="text-muted-foreground mb-4">You have no upcoming sessions booked.</p>
                <Button asChild>
                  <Link href="/calendar">Browse Sessions</Link>
                </Button>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2" className="border-b-0">
          <AccordionTrigger className="hover:no-underline p-0">
            <SectionHeader icon={Volleyball} title="Next Sessions" />
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            {availableSessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {availableSessions.map((session) => (
                  <SessionListItem 
                      key={session.id}
                      session={session}
                      currentUser={currentUser}
                      onBook={bookSession}
                      onCancel={cancelBooking}
                      onWaitlist={joinWaitlist}
                      onViewPlayers={handleViewPlayers}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 rounded-lg bg-muted/50 border border-dashed">
                <p className="text-muted-foreground">No other sessions available at the moment.</p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="space-y-4">
        <SectionHeader icon={Megaphone} title="Recent Announcements">
            <Button variant="link" asChild>
                <Link href="/announcements">View all</Link>
            </Button>
        </SectionHeader>
        <Card>
            <CardContent className="p-6">
                 <ul className="space-y-4">
                    {recentAnnouncements.map((announcement) => (
                    <li 
                      key={announcement.id} 
                      className="border-l-4 border-primary pl-4 cursor-pointer hover:bg-muted/50 rounded-r-md transition-colors"
                      onClick={() => handleOpenAnnouncementModal(announcement)}
                    >
                        <h3 className="font-semibold text-foreground">{announcement.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{announcement.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(announcement.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</p>
                    </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      </div>

      <SessionDetailsModal
        session={sessionToView}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onBook={bookSession}
        onCancel={cancelBooking}
        onWaitlist={joinWaitlist}
      />

      <AnnouncementDetailsModal
        isOpen={!!selectedAnnouncement}
        onClose={handleCloseAnnouncementModal}
        announcement={selectedAnnouncement}
      />
    </div>
  );
};

export default DashboardPage;
