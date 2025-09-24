
'use client';

import type { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';

interface PlayerAvatarProps {
    player: User;
    className?: string;
}

export default function PlayerAvatar({ player, className }: PlayerAvatarProps) {
    if (!player || !player.name) {
        return null; // Return null or a skeleton if player data is not yet available
    }

    return (
        <Avatar className={className}>
            <AvatarImage src={player.avatarUrl} alt={player.name} />
            <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
        </Avatar>
    )
}
