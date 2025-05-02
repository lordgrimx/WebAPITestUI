"use client";

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationsModal } from '@/components/modals/NotificationsModal';
import { Button } from '@/components/ui/button';

export default function NotificationBell({ darkMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2"
        onClick={() => setIsOpen(true)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      <NotificationsModal 
        open={isOpen} 
        setOpen={setIsOpen}
        darkMode={darkMode}
      />
    </>
  );
}