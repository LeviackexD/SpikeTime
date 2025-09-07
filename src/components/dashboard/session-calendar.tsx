
'use client';

import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import type { Session } from '@/lib/types';
import { currentUser } from '@/lib/mock-data';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

interface SessionCalendarProps {
  sessions: Session[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  skillFilter: string;
}

export default function SessionCalendar({ sessions, selectedDate, onDateChange, skillFilter }: SessionCalendarProps) {

  const sessionsByDate = React.useMemo(() => {
    return sessions.reduce((acc, session) => {
      const date = session.date.split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(session);
      return acc;
    }, {} as Record<string, Session[]>);
  }, [sessions]);
  
  const filteredSessionsByDate = React.useMemo(() => {
    if (skillFilter === 'All') return sessionsByDate;
    const filtered: Record<string, Session[]> = {};
    for (const date in sessionsByDate) {
      const dailySessions = sessionsByDate[date].filter(session => session.level === skillFilter);
      if (dailySessions.length > 0) {
        filtered[date] = dailySessions;
      }
    }
    return filtered;
  }, [sessionsByDate, skillFilter]);

  const DayContent = (day: Date) => {
    const dateString = day.toISOString().split('T')[0];
    const daySessions = filteredSessionsByDate[dateString] || [];
    
    const bookedSessions = currentUser ? daySessions.filter(s => s.players.some(p => p.id === currentUser.id)) : [];
    const availableSessions = currentUser ? daySessions.filter(s => 
      !s.players.some(p => p.id === currentUser.id) && s.players.length < s.maxPlayers
    ) : daySessions.filter(s => s.players.length < s.maxPlayers);

    const content = (
        <div className="relative flex h-full w-full flex-col items-center justify-center">
            {day.getDate()}
            {(bookedSessions.length > 0 || availableSessions.length > 0) && (
              <div className="absolute bottom-1 flex gap-1">
                {bookedSessions.length > 0 && <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />}
                {availableSessions.length > 0 && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
              </div>
            )}
        </div>
    );

    if (daySessions.length === 0) {
        return content;
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {content}
                </TooltipTrigger>
                <TooltipContent>
                    <div className="p-2 text-sm">
                        {bookedSessions.length > 0 && (
                            <div className='mb-2'>
                                <h4 className="font-semibold mb-1">My Sessions:</h4>
                                <ul className="space-y-1 list-disc list-inside">
                                {bookedSessions.map(session => (
                                    <li key={session.id}>
                                    <span className="font-semibold">{session.level}:</span> {session.startTime} - {session.endTime}
                                    </li>
                                ))}
                                </ul>
                            </div>
                        )}
                        {availableSessions.length > 0 && (
                             <div>
                                <h4 className="font-semibold mb-1">Available Sessions:</h4>
                                <ul className="space-y-1 list-disc list-inside">
                                {availableSessions.map(session => (
                                    <li key={session.id}>
                                    <span className="font-semibold">{session.level}:</span> {session.startTime} - {session.endTime}
                                    </li>
                                ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
  };

  const handleDayClick = (day: Date | undefined) => {
    if (day) {
      const utcDate = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()));
      onDateChange(utcDate);
    }
  };
  
  return (
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleDayClick}
        className="rounded-md border p-0 w-full"
        classNames={{
            root: "w-full",
            month: "w-full space-y-4",
            table: "w-full border-collapse space-y-1",
            head_row: "flex justify-around",
            head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
            row: "flex w-full mt-2 justify-around",
            cell: "h-14 w-full text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: "h-14 w-full p-0 font-normal aria-selected:opacity-100",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        }}
        components={{
          DayContent: ({ date }) => DayContent(date),
        }}
      />
  );
}
