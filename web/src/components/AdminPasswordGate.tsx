'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminInbox } from '@/components/AdminInbox';

export function AdminPasswordGate() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const expected = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    if (password === expected) {
      setError(null);
      setUnlocked(true);
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  }

  if (unlocked) {
    return <AdminInbox />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Admin Inbox</h1>

      <div>
        <Label htmlFor="admin-password">Password</Label>
        <Input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-describedby={error ? 'password-error' : undefined}
          aria-invalid={error ? true : undefined}
        />
        {error && (
          <p id="password-error" role="alert">
            {error}
          </p>
        )}
      </div>

      <Button type="submit">Unlock</Button>
    </form>
  );
}
