
/**
 * @fileoverview Main calendar component for displaying sessions.
 * It uses react-day-picker to render a calendar, highlighting days with scheduled sessions
 * by displaying colored dots for each skill level present on that day.
 */

'use client';

import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import type { Session, SkillLevel } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DayProps } from 'react-day-picker';
import { skillLevelColors } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getSafeDate } from '@/context/session-context';

interface SessionCalendarProps {
  sessions: Session[];
  selectedDate: Date;
  onDateChange: (date: Date | undefined) => void;
  skillFilter: string;
}

export default function SessionCalendar({ sessions, selectedDate, onDateChange, skillFilter }: SessionCalendarProps) {
  const sessionsByDate = React.useMemo(() => {
    return sessions.reduce((acc, session) => {
      const date = getSafeDate(session.date).toISOString().split('T')[0];
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

  const DayContent = ({ date: day, ...props }: DayProps) => {
    const dateString = day.toISOString().split('T')[0];
    const dailySessions = sessionsByDate[dateString] || [];
    const skillLevelsOnDay = [...new Set(dailySessions.map(s => s.level))] as SkillLevel[];

    return (
        <div className='relative flex flex-col items-center justify-center h-full w-full'>
            <p>{day.getDate()}</p>
            {dailySessions.length > 0 && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="absolute bottom-2 flex space-x-1">
                                {skillLevelsOnDay.map((level) => (
                                    <div
                                        key={level}
                                        className={cn("h-1.5 w-1.5 rounded-full", skillLevelColors[level as keyof typeof skillLevelColors])}
                                    />
                                ))}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{dailySessions.length} session{dailySessions.length > 1 ? 's' : ''}</p>
                            <ul className="text-xs list-disc list-inside">
                                {skillLevelsOnDay.map(level => <li key={level}>{level}</li>)}
                            </ul>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
    );
  };
  
  return (
      <Calendar
        key={JSON.stringify(sessions)}
        mode="single"
        selected={selectedDate}
        onSelect={onDateChange}
        className="rounded-md border p-0"
        modifiers={{
            hasSessions: (day) => {
                const dateString = day.toISOString().split('T')[0];
                return !!filteredSessionsByDate[dateString];
            }
        }}
        modifiersClassNames={{
            hasSessions: 'day-with-session',
        }}
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
            cell: "h-14 w-full text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
            day: "h-14 w-full p-0 font-normal aria-selected:opacity-100",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "font-bold text-primary",
        }}
        components={{
          DayContent: DayContent,
        }}
      />
  );
}
