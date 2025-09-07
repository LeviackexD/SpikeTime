
'use client';

import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import type { Session, SkillLevel } from '@/lib/types';
import { skillLevelColors } from '@/lib/types';
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
  onDateChange: (date: Date | undefined) => void;
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
    
    // Get unique skill levels for the day to display dots
    const uniqueLevels = [...new Set(daySessions.map(s => s.level))] as SkillLevel[];

    const content = (
        <div className="relative flex h-full w-full flex-col items-center justify-center">
            {day.getDate()}
            {uniqueLevels.length > 0 && (
              <div className="absolute bottom-1 flex gap-1">
                {uniqueLevels.map(level => (
                  <div key={level} className={cn("h-1.5 w-1.5 rounded-full", skillLevelColors[level])} />
                ))}
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
                    <div className="p-2 text-sm space-y-2">
                        <h4 className="font-semibold mb-1">Sessions on this day:</h4>
                         <ul className="space-y-1 list-none p-0">
                          {daySessions.map(session => (
                              <li key={session.id} className="flex items-center gap-2">
                                <div className={cn("h-2 w-2 rounded-full", skillLevelColors[session.level])} />
                                <span className="font-semibold">{session.level}:</span> {session.startTime} - {session.endTime}
                              </li>
                          ))}
                        </ul>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
  };
  
  return (
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateChange}
        className="rounded-md border p-0"
        classNames={{
            months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
            month: 'space-y-4 w-full',
            caption: 'flex justify-center pt-1 relative items-center',
            caption_label: 'text-lg font-medium',
            nav: 'space-x-1 flex items-center',
            nav_button: 'h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100',
            table: 'w-full border-collapse space-y-1',
            head_row: 'flex justify-around',
            head_cell: 'text-muted-foreground rounded-md w-full font-normal text-[0.8rem]',
            row: 'flex w-full mt-2 justify-around',
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
