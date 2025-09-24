/**
 * @fileoverview Provides a full-page calendar view of all volleyball sessions.
 * Users can browse a chalkboard-style calendar and see sessions for the
 * selected day displayed as notes on a corkboard.
 */

'use client';

import * as React from 'react';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { Chalkboard, Pin } from 'lucide-react';
import { useSessions, getSafeDate } from '@/context/session-context';
import { useAuth } from '@/context/auth-context';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import SessionNoteCard from '@/components/sessions/session-note-card';

const SessionCalendar = dynamic(() => import('@/components/dashboard/session-calendar'), {
  ssr: false,
  loading: () => <Skeleton className="h-[420px] w-full" />,
});


const CalendarPage: NextPage = () => {
  const { sessions, bookSession, cancelBooking, joinWaitlist, leaveWaitlist } = useSessions();
  const { user: currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  
  const handleDateChange = (date: Date | undefined) => {
    if(date) {
      setSelectedDate(date);
    }
  };
  
  if (!currentUser) {
    return null; // or a loading indicator
  }

  const filteredSessions = sessions.filter(session => {
    const sessionDate = getSafeDate(session.date);
    return sessionDate.toDateString() === selectedDate.toDateString();
  }).sort((a,b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="text-center">
             <h1 className="text-4xl font-bold font-handwriting text-brown-dark flex items-center justify-center gap-3">
                <Chalkboard className="h-10 w-10 text-brown" />
                Session Planner
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Browse the planner to find upcoming sessions. Click a day to see the notes.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
             <div className="chalkboard-bg rounded-lg p-4 shadow-lg">
                <SessionCalendar 
                    sessions={sessions}
                    selectedDate={selectedDate}
                    onDateChange={handleDateChange}
                />
             </div>
          </div>
          
          <div className="lg:col-span-2">
              <div className="cork-texture rounded-lg p-6 min-h-full border-4 border-brown-dark/50 shadow-lg">
                <h2 className="text-3xl font-bold font-handwriting text-brown-dark mb-4 flex items-center gap-2">
                    <Pin className="h-7 w-7 -rotate-45 text-red-600" />
                    Notes for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </h2>
                <Separator className="mb-6 bg-brown-dark/20"/>
                {filteredSessions.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {filteredSessions.map((session, index) => (
                            <SessionNoteCard
                                key={session.id}
                                session={session}
                                onBook={bookSession}
                                onCancel={cancelBooking}
                                onWaitlist={joinWaitlist}
                                onLeaveWaitlist={leaveWaitlist}
                                index={index}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-12 rounded-lg bg-cream/50 border border-dashed animate-fade-in">
                        <p className="text-brown-dark font-semibold">No sessions pinned for this day.</p>
                    </div>
                )}
              </div>
          </div>
        </div>
    </div>
  );
};

export default CalendarPage;
