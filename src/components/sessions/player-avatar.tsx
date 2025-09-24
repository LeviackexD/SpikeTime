
/**
 * @fileoverview A component to display a user's avatar wrapped in a tooltip showing their name.
 */

'use client';

import type { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PlayerAvatarProps {
    player: User;
    className?: string;
}

export default function PlayerAvatar({ player, className }: PlayerAvatarProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Avatar className={className}>
                    <AvatarImage src={player.avatarUrl} alt={player.name} />
                    <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                </Avatar>
            </TooltipTrigger>
            <TooltipContent>
                <p>{player.name}</p>
            </TooltipContent>
        </Tooltip>
    )
}
