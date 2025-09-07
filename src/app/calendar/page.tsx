
'use client';

import * as React from 'react';
import type { NextPage } from 'next';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar as CalendarIcon, Info, Search, SlidersHorizontal } from 'lucide-react';
import SessionDetailsCard from '@/components/sessions/session-details-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSessions } from '@/context/session-context';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';

const CalendarPage: NextPage = () => {
  const { sessions, bookSession, cancelBooking, joinWaitlist } = useSessions();
  const { user: currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
  const [skillFilter, setSkillFilter] = React.useState<string>('All');
  const [locationFilter, setLocationFilter] = React.useState<string>('');

  const filteredSessions = React.useMemo(() => {
    return sessions.filter(session => {
        // Date filter
        const sessionDate = new Date(session.date);
        const dateMatch = !selectedDate || sessionDate.toDateString() === selectedDate.toDateString();

        // Skill level filter
        const skillMatch = skillFilter === 'All' || session.level === skillFilter;

        // Location filter
        const locationMatch = !locationFilter || session.location.toLowerCase().includes(locationFilter.toLowerCase());

        // Upcoming sessions only
        const isUpcoming = sessionDate >= new Date(new Date().setDate(new Date().getDate() -1));

        return dateMatch && skillMatch && locationMatch && isUpcoming;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sessions, selectedDate, skillFilter, locationFilter]);
  
  if (!currentUser) {
    return null; // Or a loading spinner
  }


  return (
    <div className="space-y-8">
        <div className="text-center">
             <h1 className="text-3xl font-bold font-headline flex items-center justify-center gap-2">
                <CalendarIcon className="h-8 w-8 text-primary" />
                Find a Session
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Use the filters below to find the perfect volleyball session for you.
            </p>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <SlidersHorizontal className="h-6 w-6 text-primary" />
                    Filters
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="date-picker">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date-picker"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                </div>
                <div className="space-y-2">
                     <Label htmlFor="skill-filter">Skill Level</Label>
                    <Select value={skillFilter} onValueChange={setSkillFilter}>
                        <SelectTrigger id="skill-filter">
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
                 <div className="space-y-2">
                    <Label htmlFor="location-search">Location</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="location-search"
                            placeholder="Search by location..."
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
        
        <div>
            <h2 className="text-xl font-bold font-headline mb-4">Available Sessions ({filteredSessions.length})</h2>
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
                <div className="flex flex-col items-center justify-center text-center py-16 rounded-lg bg-muted/50 border border-dashed">
                    <Info className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold">No Sessions Found</h3>
                    <p className="text-muted-foreground max-w-sm">No sessions match your current filters. Try adjusting your search criteria.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default CalendarPage;
