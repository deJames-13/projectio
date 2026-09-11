"use client";

import React, { useState } from 'react';
import { CheckCheck, ChevronRight, Inbox as InboxIcon } from 'lucide-react';
import type { NotificationItem } from '~/types';

interface InboxViewProps {
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onMarkNotificationRead: (id: string) => void;
  onSelectTask?: (taskId: string) => void;
  onSelectTaskById?: (taskId: string) => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  notifications,
  onMarkAllRead,
  onMarkNotificationRead,
  onSelectTask,
  onSelectTaskById
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const handleSelectTask = (taskId: string) => {
    if (onSelectTask) onSelectTask(taskId);
    if (onSelectTaskById) onSelectTaskById(taskId);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div id="inbox-view" className="p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Inbox & Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Stay updated on task assignments, comments, and sprint changes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white p-1 rounded-lg border border-slate-200 flex items-center shadow-2xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                filter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                filter === 'unread' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <CheckCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Mark all read</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200">
              <InboxIcon className="w-5 h-5 text-slate-400" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">Your inbox is clear</h4>
            <p className="text-xs text-slate-500 max-w-sm">
              You&apos;re caught up with all activity across your workspace and projects.
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                onMarkNotificationRead(n.id);
                if (n.taskId) {
                  handleSelectTask(n.taskId);
                }
              }}
              className={`p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group ${
                !n.read ? 'bg-blue-50/40' : ''
              }`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onMarkNotificationRead(n.id);
                  if (n.taskId) handleSelectTask(n.taskId);
                }
              }}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="relative mt-0.5">
                  <img 
                    src={n.user.avatar} 
                    alt={n.user.name}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white absolute -top-0.5 -right-0.5"></span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-800 leading-snug">
                    <span className="font-semibold text-slate-900">{n.user.name}</span>{' '}
                    {n.text}
                  </p>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {n.timeAgo}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-4">
                {n.taskId && (
                  <span className="text-xs font-medium text-blue-600 flex items-center gap-1 group-hover:underline">
                    <span>View Task</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
