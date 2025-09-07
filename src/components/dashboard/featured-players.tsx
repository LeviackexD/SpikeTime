
'use client';

import type { User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Award } from "lucide-react";

interface FeaturedPlayersProps {
    player: User;
}

export default function FeaturedPlayers({ player }: FeaturedPlayersProps) {
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 flex items-center gap-4">
                 <Avatar className="h-16 w-16 border-4 border-primary/50">
                    <AvatarImage src={player.avatarUrl} alt={player.name} />
                    <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                    <h3 className="font-bold text-lg font-headline">{player.name}</h3>
                    <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span>{player.stats.sessionsPlayed} sessions played</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
