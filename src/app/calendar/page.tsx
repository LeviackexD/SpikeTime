/**
 * @fileoverview Provides a full-page calendar view of all volleyball sessions.
 * Users can filter sessions by skill level and click on a date to see the
 * sessions scheduled for that day.
 */

'use client';

import * as React from 'react';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';
import SessionDetailsCard from '@/components/sessions/session-details-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSessions } from '@/context/session-context';
import { useAuth } from '@/context/auth-context';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { skillLevelColors, type SkillLevel } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const SessionCalendar = dynamic(() => import('@/components/dashboard/session-calendar'), {
  ssr: false,
  loading: () => <Skeleton className="h-[380px] w-full" />,
});


const skillLevels: (SkillLevel | 'All')[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const CalendarPage: NextPage = () => {
  const { sessions, bookSession, cancelBooking, joinWaitlist, leaveWaitlist } = useSessions();
  const { user: currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [skillFilter, setSkillFilter] = React.useState<SkillLevel | 'All'>('All');
  
  const handleDateChange = (date: Date | undefined) => {
    if(date) {
      setSelectedDate(date);
    }
  };
  
  if (!currentUser) {
    return null; // or a loading indicator
  }

  const filteredSessions = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    const isSameDay = sessionDate.toDateString() === selectedDate.toDateString();
    const skillMatch = skillFilter === 'All' || session.level === skillFilter;
    return isSameDay && skillMatch;
  }).sort((a,b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="text-center">
             <h1 className="text-3xl font-bold font-headline flex items-center justify-center gap-2">
                <CalendarIcon className="h-8 w-8 text-primary" />
                Sessions Calendar
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Browse the calendar to find upcoming volleyball sessions. Click on a day to see details.
            </p>
        </div>

        <Card>
            <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle className="font-headline">
                        Session Calendar
                    </CardTitle>
                    <CardDescription>
                        Click on a day to view available sessions. Colors indicate session levels.
                    </CardDescription>
                </div>
                <div className="flex items-center flex-wrap gap-2">
                     <div className='flex items-center gap-2'>
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select value={skillFilter} onValueChange={(value) => setSkillFilter(value as SkillLevel | 'All')}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by skill level" />
                            </SelectTrigger>
                            <SelectContent>
                                {skillLevels.map(level => (
                                    <SelectItem key={level} value={level}>
                                        <div className="flex items-center gap-2">
                                            {level !== 'All' && (
                                                <div className={cn("h-3 w-3 rounded-full", skillLevelColors[level as keyof typeof skillLevelColors])} />
                                            )}
                                            {level === 'All' ? 'All Levels' : level}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                     </div>
                </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
                 <SessionCalendar 
                    sessions={sessions}
                    selectedDate={selectedDate}
                    onDateChange={handleDateChange}
                    skillFilter={skillFilter}
                />
            </CardContent>
        </Card>
        
        <div>
            <h2 className="text-xl font-bold font-headline mb-4">
                Available Sessions for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
             <Separator className="mb-6"/>
            {filteredSessions.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {filteredSessions.map((session, index) => (
                         <SessionDetailsCard
                            key={session.id}
                            session={session}
                            onBook={bookSession}
                            onCancel={cancelBooking}
                            onWaitlist={joinWaitlist}
                            onLeaveWaitlist={leaveWaitlist}
                            priority={index < 2}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center p-12 rounded-lg bg-muted/50 border border-dashed animate-fade-in">
                    <p className="text-muted-foreground">No sessions scheduled for this day or matching your filters.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default CalendarPage;
