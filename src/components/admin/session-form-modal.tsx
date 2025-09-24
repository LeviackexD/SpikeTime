
/**
 * @fileoverview A modal form for creating or editing volleyball sessions.
 * Collects all session details like date, time, location, and skill level.
 */

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
import type { Session, SkillLevel, User } from '@/lib/types';

// The data shape for the form, using a simple string for the date.
type SessionFormData = Omit<Session, 'id' | 'players' | 'waitlist' | 'messages' | 'date'> & { date: string };

// The shape for saving, which might include the ID for updates.
type SaveSessionData = SessionFormData | (SessionFormData & { id: string, players: User[], waitlist: User[] });


interface SessionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: SaveSessionData) => void;
  session: Session | null;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

const emptySession: SessionFormData = {
  date: getTodayString(),
  startTime: '',
  endTime: '',
  location: '',
  level: 'Intermediate',
  maxPlayers: 12,
  imageUrl: '',
};

export default function SessionFormModal({ isOpen, onClose, onSave, session }: SessionFormModalProps) {
    const [formData, setFormData] = React.useState<SessionFormData>(emptySession);
    
    React.useEffect(() => {
        if (isOpen) {
            if (session) {
                // When editing, get the 'YYYY-MM-DD' part from the ISO string
                const formattedDate = session.date.split('T')[0];
                setFormData({
                    date: formattedDate,
                    startTime: session.startTime,
                    endTime: session.endTime,
                    location: session.location,
                    level: session.level,
                    maxPlayers: session.maxPlayers,
                    imageUrl: session.imageUrl || '',
                });
            } else {
                // For new sessions, use today's date
                setFormData({ ...emptySession, date: getTodayString() });
            }
        }
    }, [session, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [id]: type === 'number' ? Number(value) : value 
        }));
    };

    const handleSelectChange = (value: SkillLevel) => {
        setFormData(prev => ({ ...prev, level: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let dataToSave: SaveSessionData = { ...formData };
        
        if (session) {
            // If editing, include the original session ID and player/waitlist data
            dataToSave = {
                ...session,
                ...formData,
            };
        }
        
        onSave(dataToSave);
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
                    <Input id="date" type="date" value={formData.date} onChange={handleChange} required />
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
                    <Input id="location" value={formData.location} onChange={handleChange} placeholder="e.g., Main Gym" required/>
                </div>
                 <div className="col-span-2 space-y-2">
                    <Label htmlFor="imageUrl">Cover Image URL</Label>
                    <Input id="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://picsum.photos/seed/1/400/300"/>
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

    