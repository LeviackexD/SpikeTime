'use client';

import type { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface PlayerAvatarProps {
    player: User;
}

export default function PlayerAvatar({ player }: PlayerAvatarProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <Avatar className="h-8 w-8 border-2 border-background">
                        <AvatarImage src={player.avatarUrl} alt={player.name} />
                        <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{player.name}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
