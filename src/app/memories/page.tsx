
/**
 * @fileoverview Displays a gallery of "moments" from past volleyball sessions
 * in a retro photo album style.
 */

'use client';

import * as React from 'react';
import type { NextPage } from 'next';
import { useSessions } from '@/context/session-context';
import { useLanguage } from '@/context/language-context';
import { Camera, Loader2, BookHeart } from 'lucide-react';
import type { Session } from '@/lib/types';
import Image from 'next/image';
import { getSafeDate, cn } from '@/lib/utils';

interface MemoriesByMonth {
  [monthYear: string]: Session[];
}

const PolaroidCard = ({ session, index, t, locale }: { session: Session; index: number; t: (key: string) => string; locale: 'en' | 'es' }) => {
    const rotationClass = `polaroid-${(index % 6) + 1}`;
    
    return (
        <div className={cn("polaroid", rotationClass)}>
            <div className="tape" style={{top: '-10px', left: `calc(50% - 48px)`, transform: `rotate(${(Math.random() - 0.5) * 20}deg)` }}></div>
            <div className="relative aspect-square w-full bg-gray-200">
                 <Image 
                    src={session.momentImageUrl!} 
                    alt={`Moment from ${session.level} session on ${getSafeDate(session.date).toLocaleDateString()}`}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    style={{ objectFit: 'cover' }}
                    className="group-hover:brightness-105 transition-all"
                />
            </div>
             <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="font-handwriting text-xl text-gray-700">{t(`skillLevels.${session.level}`)} @ {session.location}</p>
                 <p className="font-handwriting text-sm text-gray-500">{getSafeDate(session.date).toLocaleDateString(locale, {
                    month: 'long', day: 'numeric', year: 'numeric'
                 })}</p>
            </div>
        </div>
    )
}

const MemoriesPage: NextPage = () => {
  const { sessions, loading } = useSessions();
  const { t, locale } = useLanguage();

  const memoriesByMonth = React.useMemo(() => {
    const moments = sessions.filter(s => s.momentImageUrl);
    
    // Add a sample memory for styling if none exist
    if (moments.length === 0) {
        moments.push({
            id: 'sample-1',
            date: new Date().toISOString(),
            startTime: '18:00',
            endTime: '20:00',
            location: 'The Rec Hall',
            level: 'Intermediate',
            maxPlayers: 12,
            players: [],
            waitlist: [],
            messages: [],
            momentImageUrl: `https://picsum.photos/seed/101/600/600`
        })
    }


    const groupedByMonth = moments.reduce((acc: MemoriesByMonth, session) => {
      const date = getSafeDate(session.date);
      const monthYear = date.toLocaleDateString(locale, { year: 'numeric', month: 'long' });
      
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(session);
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

  const sortedMonths = Object.keys(memoriesByMonth).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const hasMemories = sortedMonths.length > 0;

  return (
    <div className="w-full min-h-full -m-8 p-8 photo-album-bg">
        <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center pt-8 pb-4">
                <h1 className="text-5xl font-bold font-handwriting text-white/90 flex items-center justify-center gap-4">
                    <BookHeart className="h-12 w-12 text-white/80" />
                    {t('memoriesPage.title')}
                </h1>
                <p className="text-white/60 mt-2 max-w-2xl mx-auto">
                    {t('memoriesPage.subtitle')}
                </p>
            </div>

            {hasMemories ? (
                <div className="space-y-16">
                    {sortedMonths.map(month => (
                        <div key={month} className="space-y-8">
                            <h2 className="font-handwriting text-4xl font-bold text-white/80 text-center">{month}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
                                {memoriesByMonth[month].map((session, index) => (
                                    <PolaroidCard
                                        key={session.id}
                                        session={session}
                                        index={index}
                                        t={t}
                                        locale={locale}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center p-16 rounded-lg bg-black/20 border border-dashed border-white/20 animate-fade-in mt-12">
                    <Camera className="h-16 w-16 text-white/40 mb-4" />
                    <p className="text-white/80 font-semibold text-lg">No memories captured yet.</p>
                    <p className="text-white/60 max-w-sm">After a session ends, players will have a chance to upload a unique moment. Check back later!</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default MemoriesPage;
