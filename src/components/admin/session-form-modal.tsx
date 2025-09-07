
'use client';

import * as React from 'react';
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { Session, SkillLevel } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SessionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: Session) => void;
  session: Session | null;
}

const emptySession: Omit<Session, 'id' | 'players' | 'waitlist'> = {
  date: new Date().toISOString(),
  startTime: '',
  endTime: '',
  location: '',
  level: 'Beginner',
  maxPlayers: 12,
  imageUrl: '',
};


export default function SessionFormModal({ isOpen, onClose, onSave, session }: SessionFormModalProps) {
    const [formData, setFormData] = React.useState<Omit<Session, 'id' | 'players' | 'waitlist'>>({ ...emptySession });

    React.useEffect(() => {
        if (isOpen) {
            if(session) {
                setFormData(session);
            } else {
                setFormData({ ...emptySession });
            }
        }
    }, [session, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value}));
    };

    const handleSelectChange = (value: SkillLevel) => {
        setFormData(prev => ({ ...prev, level: value }));
    };

    const handleDateChange = (date: Date | undefined) => {
      if (date) {
        setFormData(prev => ({...prev, date: date.toISOString()}));
      }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...(session || { id: '', players: [], waitlist: [] }),
            ...formData,
        });
    }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">{session ? 'Edit Session' : 'Create Session'}</DialogTitle>
          <DialogDescription>
            {session ? 'Update the details for this session.' : 'Fill out the form to create a new session.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2 space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.date ? format(new Date(formData.date), "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.date ? new Date(formData.date) : undefined}
                          onSelect={handleDateChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input id="startTime" type="time" value={formData.startTime} onChange={handleChange} required/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input id="endTime" type="time" value={formData.endTime} onChange={handleChange} required/>
                </div>
                <div className="col-span-2 space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" value={formData.location} onChange={handleChange} placeholder="e.g., Beach Court 1" required/>
                </div>
                 <div className="col-span-2 space-y-2">
                    <Label htmlFor="imageUrl">Cover Image URL</Label>
                    <Input id="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://example.com/image.png"/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="level">Level</Label>
                    <Select value={formData.level} onValueChange={handleSelectChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                            <SelectItem value="All-Rounder">All-Rounder</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="maxPlayers">Max Players</Label>
                    <Input id="maxPlayers" type="number" value={formData.maxPlayers} onChange={handleChange} required/>
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save Session</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
