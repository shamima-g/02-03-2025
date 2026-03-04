'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { listContactMessages } from '@/lib/api/contact';
import type { ContactMessage } from '@/types/contact';

type FetchStatus = 'loading' | 'success' | 'error';

/**
 * Format the timestamp for display on a message card.
 * Shows month, day, and time without the year.
 * The year is displayed separately in a group header so it appears only once.
 */
function formatMessageDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Extract the year from a timestamp string.
 */
function getYear(iso: string): string {
  return String(new Date(iso).getFullYear());
}

/**
 * Group messages by year (preserving order within each group).
 */
function groupByYear(
  messages: ContactMessage[],
): { year: string; messages: ContactMessage[] }[] {
  const groups: Map<string, ContactMessage[]> = new Map();
  for (const msg of messages) {
    const year = getYear(msg.timestamp);
    if (!groups.has(year)) {
      groups.set(year, []);
    }
    groups.get(year)!.push(msg);
  }
  return Array.from(groups.entries()).map(([year, msgs]) => ({
    year,
    messages: msgs,
  }));
}

export function AdminInbox() {
  const [status, setStatus] = useState<FetchStatus>('loading');
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  const fetchMessages = useCallback((isCancelled: () => boolean) => {
    listContactMessages()
      .then((response) => {
        if (!isCancelled()) {
          setMessages(response.messages);
          setStatus('success');
        }
      })
      .catch(() => {
        if (!isCancelled()) {
          setStatus('error');
        }
      });
  }, []);

  const handleRetry = useCallback(() => {
    let cancelled = false;
    setStatus('loading');
    fetchMessages(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [fetchMessages]);

  useEffect(() => {
    let cancelled = false;
    fetchMessages(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [fetchMessages]);

  const yearGroups = useMemo(() => groupByYear(messages), [messages]);

  return (
    <section aria-label="Inbox">
      <h2>Inbox</h2>

      {status === 'loading' && (
        <div role="status" aria-live="polite">
          Loading messages...
        </div>
      )}

      {status === 'error' && (
        <div role="alert">
          <p>Failed to load messages. Please try again.</p>
          <Button type="button" onClick={handleRetry}>
            Retry
          </Button>
        </div>
      )}

      {status === 'success' && messages.length === 0 && <p>No messages yet.</p>}

      {status === 'success' && messages.length > 0 && (
        <div aria-label="Message list">
          {yearGroups.map(({ year, messages: yearMessages }) => (
            <div key={year}>
              <p>{year}</p>
              <ul aria-label={`Messages from ${year}`}>
                {yearMessages.map((message) => (
                  <li key={message.id}>
                    <Card>
                      <CardHeader>
                        <CardTitle>{message.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{message.email}</p>
                        <p>{message.subject}</p>
                        <p>{message.message}</p>
                        <time dateTime={message.timestamp}>
                          {formatMessageDate(message.timestamp)}
                        </time>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
