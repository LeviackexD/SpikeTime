'use client';

import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import type { Session } from '@/lib/types';
import SessionDetailsModal from '../sessions/session-details-modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SessionCalendarProps {
  sessions: Session[];
}

export default function SessionCalendar({ sessions }: SessionCalendarProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedSession, setSelectedSession] = React.useState<Session | null>(null);
  const [skillFilter, setSkillFilter] = React.useState<string>('All');

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
    if (daySessions.length === 0) return <div>{day.getDate()}</div>;
    
    const getDotColor = (level: string) => {
        switch (level) {
          case 'Beginner':
            return 'bg-green-500'; // Let's keep a distinct color for beginners
          case 'Intermediate':
            return 'bg-primary';
          case 'Advanced':
            return 'bg-destructive';
          default:
            return 'bg-accent';
        }
    }

    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center">
        {day.getDate()}
        <div className="absolute bottom-1 flex gap-1">
          {daySessions.map((session) => (
            <span
              key={session.id}
              className={`h-1.5 w-1.5 rounded-full ${getDotColor(session.level)}`}
            ></span>
          ))}
        </div>
      </div>
    );
  };

  const handleDayClick = (day: Date) => {
    const dateString = day.toISOString().split('T')[0];
    const daySessions = filteredSessionsByDate[dateString];
    if (daySessions && daySessions.length > 0) {
      // For simplicity, we open the first session of the day. A real app might show a list.
      setSelectedSession(daySessions[0]);
    }
    setDate(day);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filter by Skill Level</h3>
        <Select value={skillFilter} onValueChange={setSkillFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select skill level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Levels</SelectItem>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        onDayClick={handleDayClick}
        className="rounded-md border"
        components={{
          DayContent: ({ date }) => DayContent(date),
        }}
      />
      
      {selectedSession && (
        <SessionDetailsModal
          session={selectedSession}
          isOpen={!!selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
}
