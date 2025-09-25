
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
import type { Session, SkillLevel } from '@/lib/types';
import { useLanguage } from '@/context/language-context';
import { getSafeDate, toYYYYMMDD, toHHMM } from '@/lib/utils';
import { zonedTimeToUtc } from 'date-fns-tz';

type FormData = {
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  level: SkillLevel;
  maxPlayers: number;
  imageUrl: string;
};

const getTodayString = () => toYYYYMMDD(new Date());

const emptyFormData: FormData = {
  date: getTodayString(),
  startTime: '18:00',
  endTime: '20:00',
  location: '',
  level: 'Intermediate',
  maxPlayers: 12,
  imageUrl: '',
};

interface SessionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: any) => void;
  session: Session | null;
}

export default function SessionFormModal({ isOpen, onClose, onSave, session }: SessionFormModalProps) {
    const { t } = useLanguage();
    const [formData, setFormData] = React.useState<FormData>(emptyFormData);
    
    React.useEffect(() => {
        if (isOpen) {
            if (session) {
                const startDate = getSafeDate(session.start_datetime);
                const endDate = getSafeDate(session.end_datetime);
                setFormData({
                    date: toYYYYMMDD(startDate),
                    startTime: toHHMM(startDate),
                    endTime: toHHMM(endDate),
                    location: session.location,
                    level: session.level,
                    maxPlayers: session.maxPlayers,
                    imageUrl: session.imageUrl || '',
                });
            } else {
                setFormData(emptyFormData);
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
        
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const startUTC = zonedTimeToUtc(`${formData.date}T${formData.startTime}`, userTimeZone);
        const endUTC = zonedTimeToUtc(`${formData.date}T${formData.endTime}`, userTimeZone);
        
        let dataToSave: any = { 
            location: formData.location,
            level: formData.level,
            maxPlayers: formData.maxPlayers,
            imageUrl: formData.imageUrl,
            start_datetime: startUTC.toISOString(),
            end_datetime: endUTC.toISOString(),
        };
        
        if (session) {
            dataToSave.id = session.id;
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
