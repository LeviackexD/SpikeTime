
/**
 * @fileoverview Placeholder page for the Chat feature, indicating it's coming soon.
 */

'use client';

import * as React from 'react';
import type { NextPage } from 'next';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

const ChatPage: NextPage = () => {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)] text-center animate-fade-in">
            <MessageCircle className="h-20 w-20 text-muted-foreground/30 mb-6" />
            <h1 className="text-4xl font-bold font-headline text-brown-dark">{t('comingSoon.title')}</h1>
            <p className="text-muted-foreground mt-2 max-w-md">{t('comingSoon.subtitle')}</p>
        </div>
    );
}

export default ChatPage;
