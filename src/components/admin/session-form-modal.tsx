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
  date: '',
  time: '',
  location: '',
  level: 'Beginner',
  maxPlayers: 12,
};


export default function SessionFormModal({ isOpen, onClose, onSave, session }: SessionFormModalProps) {
    const [formData, setFormData] = React.useState<Omit<Session, 'id' | 'players' | 'waitlist'>>(session || emptySession);

    React.useEffect(() => {
        if(session) {
            setFormData(session);
        } else {
            setFormData(emptySession);
        }
    }, [session, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value}));
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{session ? 'Edit Session' : 'Create Session'}</DialogTitle>
          <DialogDescription>
            {session ? 'Update the details for this session.' : 'Fill out the form to create a new session.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                    Date
                    </Label>
                    <Input id="date" type="date" value={formData.date} onChange={handleChange} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="time" className="text-right">
                    Time
                    </Label>
                    <Input id="time" value={formData.time} onChange={handleChange} placeholder="e.g., 18:00 - 20:00" className="col-span-3" required/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">
                    Location
                    </Label>
                    <Input id="location" value={formData.location} onChange={handleChange} placeholder="e.g., Beach Court 1" className="col-span-3" required/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="level" className="text-right">
                    Level
                    </Label>
                    <Select value={formData.level} onValueChange={handleSelectChange}>
                        <SelectTrigger className="col-span-3">
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
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="maxPlayers" className="text-right">
                    Max Players
                    </Label>
                    <Input id="maxPlayers" type="number" value={formData.maxPlayers} onChange={handleChange} className="col-span-3" required/>
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
