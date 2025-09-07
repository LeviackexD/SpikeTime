
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
import { Calendar as CalendarIcon, Filter } from 'lucide-react';
import SessionCalendar from '@/components/dashboard/session-calendar';
import SessionDetailsCard from '@/components/sessions/session-details-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSessions } from '@/context/session-context';
import { currentUser } from '@/lib/mock-data';
import { Separator } from '@/components/ui/separator';

const CalendarPage: NextPage = () => {
  const { sessions, bookSession, cancelBooking, joinWaitlist } = useSessions();
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [skillFilter, setSkillFilter] = React.useState('All');
  
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };
  
  const filteredSessions = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    const isSameDay = sessionDate.toDateString() === selectedDate.toDateString();
    const skillMatch = skillFilter === 'All' || session.level === skillFilter;
    return isSameDay && skillMatch;
  }).sort((a,b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-8">
        <div className="text-center">
             <h1 className="text-3xl font-bold font-headline flex items-center justify-center gap-2">
                <CalendarIcon className="h-8 w-8 text-primary" />
                Sessions Calendar
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Browse the calendar to find upcoming volleyball sessions. Click on a day to see details.
            </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                           <Filter className="h-5 w-5 text-primary" />
                           Filters
                        </CardTitle>
                        <CardDescription>
                            Refine your search to find the perfect session.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Skill Level</label>
                            <Select value={skillFilter} onValueChange={setSkillFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select skill level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Levels</SelectItem>
                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                                    <SelectItem value="Advanced">Advanced</SelectItem>
                                     <SelectItem value="All-Rounder">All-Rounder</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-4">
                             <label className="text-sm font-medium">Date</label>
                            <SessionCalendar 
                                sessions={sessions}
                                selectedDate={selectedDate}
                                onDateChange={handleDateChange}
                                skillFilter={skillFilter}
                                currentUser={currentUser}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <h2 className="text-xl font-bold font-headline mb-4">
                    Sessions for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </h2>
                {filteredSessions.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {filteredSessions.map(session => (
                             <SessionDetailsCard
                                key={session.id}
                                session={session}
                                currentUser={currentUser}
                                onBook={bookSession}
                                onCancel={cancelBooking}
                                onWaitlist={joinWaitlist}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-12 rounded-lg bg-muted/50 border border-dashed">
                        <p className="text-muted-foreground">No sessions scheduled for this day or matching your filters.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default CalendarPage;
