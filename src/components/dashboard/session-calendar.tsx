/**
 * @fileoverview A chalkboard-style calendar component for displaying sessions.
 * It uses react-day-picker, customized to look like a chalkboard.
 */

'use client';

import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import type { Session } from '@/lib/types';
import { getSafeDate, toYYYYMMDD } from '@/lib/utils';

interface SessionCalendarProps {
  sessions: Session[];
  selectedDate: Date;
  onDateChange: (date: Date | undefined) => void;
}


export default function SessionCalendar({ sessions, selectedDate, onDateChange }: SessionCalendarProps) {
  const sessionsByDate = React.useMemo(() => {
    const dateSet = new Set<string>();
    sessions.forEach(session => {
      dateSet.add(toYYYYMMDD(getSafeDate(session.date)));
    });
    return dateSet;
  }, [sessions]);
  
  
  return (
      <Calendar
        key={JSON.stringify(sessions)}
        mode="single"
        selected={selectedDate}
        onSelect={onDateChange}
        className="p-0"
        modifiers={{
            hasSessions: (day) => {
                return sessionsByDate.has(toYYYYMMDD(day));
            }
        }}
        modifiersClassNames={{
            hasSessions: 'day-with-session',
        }}
        classNames={{
            root: 'border-0',
            months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
            month: 'space-y-4 w-full',
            caption: 'flex justify-center pt-1 relative items-center text-chalk',
            caption_label: 'text-2xl font-handwriting',
            nav: 'space-x-1 flex items-center',
            nav_button: 'h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 text-chalk',
            table: 'w-full border-collapse space-y-1',
            head_row: 'flex justify-around',
            head_cell: 'text-chalk/70 rounded-md w-full font-semibold text-sm',
            row: 'flex w-full mt-2 justify-around',
            cell: "h-14 w-full text-center text-lg p-0 relative focus-within:relative focus-within:z-20 font-handwriting",
            day: "h-14 w-full p-0 font-normal aria-selected:opacity-100 text-chalk/80 hover:bg-white/10 rounded-md",
            day_selected: "bg-brown text-cream hover:bg-brown hover:text-cream focus:bg-brown focus:text-cream rounded-md",
            day_today: "font-bold text-cream",
            day_outside: "text-chalk/30",
        }}
      />
  );
}
