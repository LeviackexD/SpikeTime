
/**
 * @fileoverview A confirmation dialog for deleting a session.
 * Ensures the admin is sure before proceeding with the deletion, as it's a permanent action.
 */

'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/context/language-context';

interface DeleteSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteSessionDialog({
  isOpen,
  onClose,
  onConfirm,
}: DeleteSessionDialogProps) {
  const { t } = useLanguage();
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('modals.deleteDialog.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('modals.deleteDialog.sessionDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>{t('modals.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{t('modals.continue')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
