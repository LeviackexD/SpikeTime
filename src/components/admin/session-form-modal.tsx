
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
import { useLanguage } from '@/context/language-context';
import { getSafeDate, toYYYYMMDD } from '@/context/session-context';

// The data shape for the form, using a simple string for the date.
type SessionFormData = Omit<Session, 'id' | 'players' | 'waitlist' | 'messages' | 'date' | 'createdBy'> & { date: string };

// The shape for saving, which might include the ID for updates.
type SaveSessionData = SessionFormData | (SessionFormData & { id: string, players: User[], waitlist: User[] });


interface SessionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: any) => void;
  session: Session | null;
}

const getTodayString = () => toYYYYMMDD(new Date());

const emptySession: SessionFormData = {
  startTime: '',
  endTime: '',
  location: '',
  level: 'Intermediate',
  maxPlayers: 12,
  imageUrl: '',
  date: getTodayString(),
};

export default function SessionFormModal({ isOpen, onClose, onSave, session }: SessionFormModalProps) {
    const { t } = useLanguage();
    const [formData, setFormData] = React.useState<SessionFormData>(emptySession);
    
    React.useEffect(() => {
        if (isOpen) {
            if (session) {
                const sessionDate = getSafeDate(session.date);
                setFormData({
                    date: toYYYYMMDD(sessionDate),
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
        
        // IMPORTANT: Create a UTC date string to avoid timezone issues.
        // '2024-05-21' and '09:00' becomes '2024-05-21T09:00:00.000Z'
        const combinedDateTime = new Date(`${formData.date}T${formData.startTime}:00.000Z`);

        let dataToSave: any = { 
            ...formData,
            // Replace the simple date string with the full Date object in UTC
            date: combinedDateTime 
        };
        
        if (session) {
            // If editing, include the original session ID and other properties
            dataToSave.id = session.id;
            dataToSave.players = session.players;
            dataToSave.waitlist = session.waitlist;
        }
        
        onSave(dataToSave);
    }
    
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-paper">
        <DialogHeader>
          <DialogTitle className="handwriting text-2xl font-bold text-brown">{session ? t('modals.sessionForm.editTitle') : t('modals.sessionForm.createTitle')}</DialogTitle>
          <DialogDescription className="text-brown-light">
            {session ? t('modals.sessionForm.editDescription') : t('modals.sessionForm.createDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2 space-y-2">
                    <Label htmlFor="date" className="text-brown font-semibold">{t('modals.sessionForm.date')}</Label>
                    <Input id="date" type="date" value={formData.date} onChange={handleChange} required className="bg-cream border-brown-light focus:border-brown" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="startTime" className="text-brown font-semibold">{t('modals.sessionForm.startTime')}</Label>
                    <Input id="startTime" type="time" value={formData.startTime} onChange={handleChange} required className="bg-cream border-brown-light focus:border-brown"/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="endTime" className="text-brown font-semibold">{t('modals.sessionForm.endTime')}</Label>
                    <Input id="endTime" type="time" value={formData.endTime} onChange={handleChange} required className="bg-cream border-brown-light focus:border-brown"/>
                </div>
                <div className="col-span-2 space-y-2">
                    <Label htmlFor="location" className="text-brown font-semibold">{t('modals.sessionForm.location')}</Label>
                    <Input id="location" value={formData.location} onChange={handleChange} placeholder={t('modals.sessionForm.location')} required className="bg-cream border-brown-light focus:border-brown"/>
                </div>
                 <div className="col-span-2 space-y-2">
                    <Label htmlFor="imageUrl" className="text-brown font-semibold">{t('modals.sessionForm.coverImageUrl')}</Label>
                    <Input id="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://picsum.photos/seed/1/400/300" className="bg-cream border-brown-light focus:border-brown"/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="level" className="text-brown font-semibold">{t('modals.sessionForm.level')}</Label>
                    <Select value={formData.level} onValueChange={handleSelectChange}>
                        <SelectTrigger className="bg-cream border-brown-light focus:border-brown">
                            <SelectValue placeholder={t('modals.sessionForm.selectLevel')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Beginner">{t('skillLevels.Beginner')}</SelectItem>
                            <SelectItem value="Intermediate">{t('skillLevels.Intermediate')}</SelectItem>
                            <SelectItem value="Advanced">{t('skillLevels.Advanced')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="maxPlayers" className="text-brown font-semibold">{t('modals.sessionForm.maxPlayers')}</Label>
                    <Input id="maxPlayers" type="number" value={formData.maxPlayers} onChange={handleChange} required className="bg-cream border-brown-light focus:border-brown"/>
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} className="button-hover">{t('modals.cancel')}</Button>
                <Button type="submit" className="bg-brown text-cream button-hover">{t('modals.save')}</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
