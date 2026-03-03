'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function AdminInboxPlaceholder() {
  return (
    <section aria-label="Inbox">
      <h2>Inbox</h2>
    </section>
  );
}

export function AdminPasswordGate() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  function handleSubmit() {
    const expected = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    if (password === expected) {
      setError(null);
      setUnlocked(true);
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }

  if (unlocked) {
    return <AdminInboxPlaceholder />;
  }

  return (
    <div>
      <h1>Admin Inbox</h1>

      <div>
        <Label htmlFor="admin-password">Password</Label>
        <Input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-describedby={error ? 'password-error' : undefined}
          aria-invalid={error ? true : undefined}
        />
        {error && (
          <p id="password-error" role="alert">
            {error}
          </p>
        )}
      </div>

      <Button type="button" onClick={handleSubmit}>
        Unlock
      </Button>
    </div>
  );
}
