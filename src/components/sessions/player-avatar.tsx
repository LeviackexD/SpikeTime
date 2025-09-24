/**
 * @fileoverview A simple component to display a user's avatar.
 * It's intended to be wrapped by a Tooltip for showing the user's name.
 */

'use client';

import type { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface PlayerAvatarProps {
    player: User;
    className?: string;
}

export default function PlayerAvatar({ player, className }: PlayerAvatarProps) {
    return (
        <Avatar className={className}>
            <AvatarImage src={player.avatarUrl} alt={player.name} />
            <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
        </Avatar>
    )
}
