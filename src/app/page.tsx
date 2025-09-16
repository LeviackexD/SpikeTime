/**
 * @fileoverview The main dashboard page for authenticated users.
 * Displays a welcome message, a list of the user's upcoming sessions,
 * a list of other available sessions, and recent club announcements.
 */

'use client';

import * as React from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { Volleyball, Megaphone } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';

// Custom Components
import SectionHeader from '@/components/layout/section-header';
import SessionDetailsModal from '@/components/sessions/session-details-modal';
import AnnouncementDetailsModal from '@/components/announcements/announcement-details-modal';
import SessionListItem from '@/components/sessions/session-list-item';

// Context and Hooks
import { useSessions } from '@/context/session-context';
import { useAuth } from '@/context/auth-context';
import { useUpcomingSessions, useAvailableSessions } from '@/hooks/use-session-filters';

// Mock Data (for announcements)
import { mockAnnouncements } from '@/lib/mock-data';

// Types
import type { Session, Announcement } from '@/lib/types';


const DashboardPage: NextPage = () => {
  // --- STATE MANAGEMENT ---
  const [sessionToView, setSessionToView] = React.useState<Session | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = React.useState<Announcement | null>(null);

  // --- HOOKS ---
  const { sessions, bookSession, cancelBooking, joinWaitlist, leaveWaitlist } = useSessions();
  const { user: currentUser } = useAuth();
  
  // --- DERIVED STATE FROM CUSTOM HOOKS ---
  const upcomingSessions = useUpcomingSessions(currentUser, sessions);
  const availableSessions = useAvailableSessions(currentUser, sessions);
  const recentAnnouncements = mockAnnouncements.slice(0, 3);

  // --- EVENT HANDLERS ---
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

  // --- RENDER ---
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading user data...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold font-headline">Welcome back, {currentUser.name}!</h1>
          <p className="text-muted-foreground">Here's what's happening in your volleyball world.</p>
        </div>
        
        <Accordion type="multiple" defaultValue={['my-sessions', 'next-sessions']} className="w-full space-y-8">
          {/* My Upcoming Sessions Section */}
          <AccordionItem value="my-sessions" className="border-b-0">
            <div className="flex items-center">
              <SectionHeader icon={Volleyball} title="My Upcoming Sessions" />
              <AccordionTrigger className="ml-auto" />
            </div>
            <AccordionContent className="pt-4">
              {upcomingSessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {upcomingSessions.map((session, index) => (
                    <SessionListItem
                      key={session.id}
                      session={session}
                      onBook={bookSession}
                      onCancel={cancelBooking}
                      onWaitlist={joinWaitlist}
                      onLeaveWaitlist={leaveWaitlist}
                      onViewPlayers={handleViewPlayers}
                      priority={index === 0} // Prioritize loading the first image
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

          {/* Next Available Sessions Section */}
          <AccordionItem value="next-sessions" className="border-b-0">
            <div className="flex items-center">
              <SectionHeader icon={Volleyball} title="Next Sessions" />
              <AccordionTrigger className="ml-auto" />
            </div>
            <AccordionContent className="pt-4">
              {availableSessions.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {availableSessions.map((session, index) => (
                    <SessionListItem
                      key={session.id}
                      session={session}
                      onBook={bookSession}
                      onCancel={cancelBooking}
                      onWaitlist={joinWaitlist}
                      onLeaveWaitlist={leaveWaitlist}
                      onViewPlayers={handleViewPlayers}
                      priority={index === 0}
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

        {/* Recent Announcements Section */}
        <div className="space-y-4">
            <SectionHeader icon={Megaphone} title="Recent Announcements">
                <Button variant="link" asChild>
                    <Link href="/announcements">View all</Link>
                </Button>
            </SectionHeader>
            <Card>
                <CardContent className="p-0">
                     <ul className="divide-y">
                        {recentAnnouncements.map((announcement) => (
                          <li key={announcement.id} className="p-4">
                            <button
                              onClick={() => handleOpenAnnouncementModal(announcement)}
                              className="w-full text-left transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary rounded-md p-2 -m-2"
                            >
                              <h3 className="font-semibold text-foreground">{announcement.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">{announcement.content}</p>
                              <p className="text-xs text-muted-foreground mt-1">{new Date(announcement.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</p>
                            </button>
                          </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
      </div>

      {/* --- MODALS --- */}
      <SessionDetailsModal
        session={sessionToView}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onBook={bookSession}
        onCancel={cancelBooking}
        onWaitlist={joinWaitlist}
        onLeaveWaitlist={leaveWaitlist}
      />

      <AnnouncementDetailsModal
        isOpen={!!selectedAnnouncement}
        onClose={handleCloseAnnouncementModal}
        announcement={selectedAnnouncement}
      />
    </>
  );
};

export default DashboardPage;
