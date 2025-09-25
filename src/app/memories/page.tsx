
/**
 * @fileoverview Displays a gallery of "moments" from past volleyball sessions.
 * It groups photos by month and day, creating a chronological album of memories.
 */

'use client';

import * as React from 'react';
import type { NextPage } from 'next';
import { useSessions } from '@/context/session-context';
import { useLanguage } from '@/context/language-context';
import { Camera, Loader2 } from 'lucide-react';
import type { Session } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { getSafeDate } from '@/lib/utils';

interface MemoriesByMonth {
  [monthYear: string]: {
    [day: string]: Session[];
  };
}

const MemoriesPage: NextPage = () => {
  const { sessions, loading } = useSessions();
  const { t, locale } = useLanguage();

  const memories = React.useMemo(() => {
    const moments = sessions.filter(s => s.momentImageUrl);

    const groupedByMonth = moments.reduce((acc: MemoriesByMonth, session) => {
      const date = getSafeDate(session.date);
      const monthYear = date.toLocaleDateString(locale, { year: 'numeric', month: 'long' });
      const day = date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric' });

      if (!acc[monthYear]) {
        acc[monthYear] = {};
      }
      if (!acc[monthYear][day]) {
        acc[monthYear][day] = [];
      }
      acc[monthYear][day].push(session);
      return acc;
    }, {});
    
    return groupedByMonth;
  }, [sessions, locale]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const sortedMonths = Object.keys(memories).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const hasMemories = sortedMonths.length > 0;

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="text-center">
             <h1 className="text-4xl font-bold font-handwriting text-brown-dark flex items-center justify-center gap-3">
                <Camera className="h-10 w-10 text-brown" />
                {t('memoriesPage.title')}
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                {t('memoriesPage.subtitle')}
            </p>
        </div>

        {hasMemories ? (
            <div className="space-y-12">
                {sortedMonths.map(month => (
                    <div key={month} className="space-y-6">
                        <h2 className="font-headline text-2xl font-bold text-brown">{month}</h2>
                        <Separator />
                        <div className="space-y-8">
                            {Object.keys(memories[month]).map(day => (
                                <div key={day}>
                                    <h3 className="font-semibold text-lg text-muted-foreground mb-4">{day}</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {memories[month][day].map(session => (
                                            <div key={session.id} className="group relative aspect-square w-full rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105">
                                                <Image 
                                                    src={session.momentImageUrl!} 
                                                    alt={`Moment from ${session.level} session on ${getSafeDate(session.date).toLocaleDateString()}`}
                                                    fill
                                                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                                    style={{ objectFit: 'cover' }}
                                                    className="group-hover:brightness-75 transition-all"
                                                />
                                                 <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                                                    <p className="font-bold text-white text-sm">{t(`skillLevels.${session.level}`)}</p>
                                                    <p className="text-xs text-white/80">{session.location}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center text-center p-16 rounded-lg bg-muted/50 border border-dashed animate-fade-in mt-12">
                <Camera className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-brown-dark font-semibold text-lg">No memories captured yet.</p>
                <p className="text-muted-foreground max-w-sm">After a session ends, players will have a chance to upload a unique moment. Check back later!</p>
            </div>
        )}
    </div>
  );
};

export default MemoriesPage;
