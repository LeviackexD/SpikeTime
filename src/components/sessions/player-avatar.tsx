
'use client';

import type { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
  } from '@/components/ui/tooltip';
import { useLanguage } from '@/context/language-context';

interface PlayerAvatarProps {
    player: User;
    className?: string;
}

export default function PlayerAvatar({ player, className }: PlayerAvatarProps) {
    const { t } = useLanguage();
    if (!player || !player.name) {
        return <Avatar className={cn("bg-muted", className)}><AvatarFallback></AvatarFallback></Avatar>; 
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Avatar className={className}>
                    <AvatarImage src={player.avatarUrl} alt={player.name} />
                    <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                </Avatar>
            </TooltipTrigger>
            <TooltipContent>
                <p className='font-semibold'>{player.name}</p>
                <p className='text-muted-foreground'>{t(`skillLevels.${player.skillLevel}`)}</p>
            </TooltipContent>
        </Tooltip>
    )
}
