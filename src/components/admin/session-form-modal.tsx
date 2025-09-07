
'use client';

import * as React from 'react';
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
import type { Session, SkillLevel } from '@/lib/types';

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
                setFormData({
                    date: session.date,
                    startTime: session.startTime,
                    endTime: session.endTime,
                    location: session.location,
                    level: session.level,
                    maxPlayers: session.maxPlayers,
                    imageUrl: session.imageUrl,
                });
            } else {
                setFormData({ ...emptySession, date: new Date().toISOString() });
            }
        }
    }, [session, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type } = e.target;
        if (type === 'date') {
            // When the input is a date, the value is in YYYY-MM-DD format.
            // We need to convert it to an ISO string to match the data type.
            const newDate = new Date(value);
            // Adjust for timezone offset to prevent the date from changing
            const timezoneOffset = newDate.getTimezoneOffset() * 60000;
            const adjustedDate = new Date(newDate.getTime() + timezoneOffset);
            setFormData(prev => ({...prev, date: adjustedDate.toISOString()}));
        } else {
            setFormData(prev => ({...prev, [id]: value}));
        }
    };

    const handleSelectChange = (value: SkillLevel) => {
        setFormData(prev => ({ ...prev, level: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...(session || { id: '', players: [], waitlist: [] }),
            ...formData,
        });
    }
    
    // The date from formData is an ISO string. We need to format it to YYYY-MM-DD for the input.
    const dateForInput = formData.date ? formData.date.split('T')[0] : '';


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
                    <Input id="date" type="date" value={dateForInput} onChange={handleChange} required />
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
